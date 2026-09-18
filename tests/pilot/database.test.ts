/** Real PostgreSQL execution, including roles and RLS. Only Supabase-owned Auth
 * and Storage schemas are stubbed; application migration/functions run unchanged. */
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

const ids = {
  admin: "10000000-0000-4000-8000-000000000001",
  manager: "10000000-0000-4000-8000-000000000002",
  prep: "10000000-0000-4000-8000-000000000003",
  line: "10000000-0000-4000-8000-000000000004",
  inactive: "10000000-0000-4000-8000-000000000005",
  unassigned: "10000000-0000-4000-8000-000000000006",
  module: "20000000-0000-4000-8000-000000000001",
  sop: "20000000-0000-4000-8000-000000000002",
  plain: "20000000-0000-4000-8000-000000000003",
  question: "30000000-0000-4000-8000-000000000001",
  assignment: "40000000-0000-4000-8000-000000000001",
  plainAssignment: "40000000-0000-4000-8000-000000000002",
};
let db: PGlite;
async function asUser(id: string) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,true)", [id]);
  await db.exec("set local role authenticated");
}
async function count(table: string) {
  return (
    await db.query<{ count: number }>(
      `select count(*)::int as count from ${table}`,
    )
  ).rows[0].count;
}
async function rejected(sql: string, params: unknown[] = []) {
  await db.exec("savepoint denial");
  await expect(db.query(sql, params)).rejects.toThrow();
  await db.exec("rollback to savepoint denial");
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
    create schema auth;create schema storage;
    create table auth.users(id uuid primary key,email text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
  await db.exec(
    await readFile(
      new URL(
        "../../supabase/migrations/202609090001_pilot.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  for (const [name, id] of Object.entries(ids).slice(0, 6))
    await db.query("insert into auth.users values($1,$2)", [
      id,
      `${name}@example.test`,
    ]);
  await db.exec(`update public.employees set active=true,first_name='Test',last_name='Employee',job_role_id=(select id from public.job_roles where name='Prep Cook');
    update public.employees set app_role='ADMIN' where id='${ids.admin}';
    update public.employees set app_role='MANAGER' where id='${ids.manager}';
    update public.employees set job_role_id=(select id from public.job_roles where name='Line Cook') where id='${ids.line}';
    update public.employees set active=false where id='${ids.inactive}';
    insert into public.learning_items(id,kind,title,status,restricted,created_by) values
      ('${ids.module}','TRAINING','Restricted prep training','PUBLISHED',true,'${ids.admin}'),
      ('${ids.sop}','SOP','Restricted recipe','PUBLISHED',true,'${ids.admin}'),
      ('${ids.plain}','TRAINING','Welcome','PUBLISHED',false,'${ids.admin}');
    insert into public.item_role_access select id,(select id from public.job_roles where name='Prep Cook') from public.learning_items where restricted;
    insert into public.content_blocks(item_id,type,body,sort_order) select id,'text','Private content',0 from public.learning_items;
    insert into public.quiz_questions values('${ids.question}','${ids.module}','Choose B','["A","B"]',0);
    insert into private.quiz_answers values('${ids.question}',1);
    insert into public.assignments(id,employee_id,module_id,module_title,assigned_by) values
      ('${ids.assignment}','${ids.prep}','${ids.module}','Restricted prep training','${ids.admin}'),
      ('${ids.plainAssignment}','${ids.prep}','${ids.plain}','Welcome','${ids.admin}');`);
});
beforeEach(async () => {
  await db.exec("begin");
});
afterEach(async () => {
  await db.exec("rollback");
});
afterAll(async () => {
  await db.close();
});

describe("database authorization", () => {
  it("allows assigned, authorized employees and only their own profile", async () => {
    await asUser(ids.prep);
    expect(await count("public.learning_items")).toBe(3);
    expect(await count("public.employees")).toBe(1);
    expect(await count("public.content_blocks")).toBe(3);
  });
  it("hides unassigned training while allowing role-authorized SOPs", async () => {
    await asUser(ids.unassigned);
    expect(
      (await db.query("select kind from public.learning_items")).rows,
    ).toEqual([{ kind: "SOP" }]);
  });
  it("denies restricted direct item, block, question, and role queries", async () => {
    await asUser(ids.line);
    expect(await count("public.learning_items")).toBe(0);
    expect(await count("public.content_blocks")).toBe(0);
    expect(await count("public.quiz_questions")).toBe(0);
    expect(await count("public.item_role_access")).toBe(0);
    expect(
      (
        await db.query("select * from public.learning_items where id=$1", [
          ids.sop,
        ])
      ).rows,
    ).toHaveLength(0);
  });
  it("rejects anonymous reads and RPCs", async () => {
    await db.exec("set local role anon");
    await rejected("select * from public.learning_items");
    await rejected("select public.create_item('SOP','Bad')");
  });
  it("blocks employee admin writes, role escalation, and forged results", async () => {
    await asUser(ids.prep);
    await rejected("update public.employees set app_role='ADMIN' where id=$1", [
      ids.prep,
    ]);
    await rejected(
      "select public.update_employee($1,'Bad','Actor','ADMIN',null,true,null)",
      [ids.prep],
    );
    await rejected("select public.create_item('SOP','Bad')");
    await rejected(
      "update public.assignments set status='COMPLETED',completed_at=now()",
    );
    await rejected(
      "insert into public.quiz_attempts(assignment_id,employee_id,score,passed,pass_mark,question_count) values($1,$2,100,true,80,1)",
      [ids.assignment, ids.prep],
    );
  });
  it("does not expose answer keys or administrative answer RPCs", async () => {
    await asUser(ids.prep);
    await rejected("select * from private.quiz_answers");
    await rejected("select public.editor_answers($1)", [ids.module]);
    expect(
      Object.keys(
        (
          await db.query<Record<string, unknown>>(
            "select * from public.quiz_questions",
          )
        ).rows[0],
      ),
    ).not.toContain("correct_index");
  });
  it("denies inactive users even with an otherwise valid identity", async () => {
    await asUser(ids.inactive);
    for (const table of [
      "employees",
      "learning_items",
      "content_blocks",
      "assignments",
      "quiz_attempts",
      "job_roles",
    ])
      expect(await count(`public.${table}`)).toBe(0);
    await rejected("select public.create_item('SOP','Bad')");
  });
  it("applies deactivation immediately without deleting history", async () => {
    await asUser(ids.prep);
    await db.query("select public.advance_training($1,true)", [
      ids.plainAssignment,
    ]);
    await asUser(ids.admin);
    await db.query(
      "select public.update_employee($1,'Test','Employee','EMPLOYEE',null,false,null)",
      [ids.prep],
    );
    await asUser(ids.prep);
    expect(await count("public.assignments")).toBe(0);
    expect(await count("public.learning_items")).toBe(0);
    await rejected("select public.advance_training($1,true)", [ids.assignment]);
    await asUser(ids.admin);
    expect(
      (
        await db.query("select status from public.assignments where id=$1", [
          ids.plainAssignment,
        ])
      ).rows,
    ).toEqual([{ status: "COMPLETED" }]);
  });
  it("retains role-restricted access for managers", async () => {
    await asUser(ids.admin);
    const role = (
      await db.query<{ id: string }>(
        "select id from public.job_roles where name='Line Cook'",
      )
    ).rows[0].id;
    await db.query(
      "select public.update_employee($1,'Test','Manager','MANAGER',$2,true,null)",
      [ids.manager, role],
    );
    await asUser(ids.manager);
    expect(
      (await db.query("select title from public.learning_items")).rows,
    ).toEqual([{ title: "Welcome" }]);
    expect(await count("public.employees")).toBe(6);
    await rejected("select public.create_item('SOP','No')");
    await rejected("select public.assign_training($1,$2)", [
      ids.line,
      ids.module,
    ]);
  });
  it("blocks removing the acting administrator's own access", async () => {
    await asUser(ids.admin);
    await rejected(
      "select public.update_employee($1,'Test','Admin','EMPLOYEE',null,false,null)",
      [ids.admin],
    );
  });
  it("keeps storage private and grants no client read path for signing URLs", async () => {
    const bucket = (
      await db.query<{ public: boolean }>(
        "select public from storage.buckets where id='pilot-content'",
      )
    ).rows[0];
    expect(bucket.public).toBe(false);
    expect(
      (await db.query("select * from pg_policies where schemaname='storage'"))
        .rows,
    ).toHaveLength(0);
  });
});

describe("assignments and trusted completion", () => {
  it("assigns idempotently and rejects unauthorized or inactive targets", async () => {
    await asUser(ids.manager);
    const first = await db.query("select public.assign_training($1,$2) as id", [
      ids.unassigned,
      ids.module,
    ]);
    const second = await db.query(
      "select public.assign_training($1,$2) as id",
      [ids.unassigned, ids.module],
    );
    expect(first.rows).toEqual(second.rows);
    await rejected("select public.assign_training($1,$2)", [
      ids.line,
      ids.module,
    ]);
    await rejected("select public.assign_training($1,$2)", [
      ids.inactive,
      ids.plain,
    ]);
    await rejected("select public.assign_training($1,$2)", [ids.prep, ids.sop]);
  });
  it("starts training then requires acknowledged content before quizzes", async () => {
    await asUser(ids.prep);
    await db.query("select public.advance_training($1,false)", [
      ids.assignment,
    ]);
    expect(
      (
        await db.query("select status from public.assignments where id=$1", [
          ids.assignment,
        ])
      ).rows,
    ).toEqual([{ status: "IN_PROGRESS" }]);
    await rejected("select public.submit_quiz($1,$2)", [
      ids.assignment,
      { [ids.question]: 1 },
    ]);
  });
  it("records failures, permits retry, and completes only on a passing result", async () => {
    await asUser(ids.prep);
    await db.query("select public.advance_training($1,true)", [ids.assignment]);
    const fail = await db.query("select public.submit_quiz($1,$2) as result", [
      ids.assignment,
      { [ids.question]: 0 },
    ]);
    expect(fail.rows).toEqual([{ result: { score: 0, passed: false } }]);
    expect(
      (
        await db.query("select status from public.assignments where id=$1", [
          ids.assignment,
        ])
      ).rows,
    ).toEqual([{ status: "IN_PROGRESS" }]);
    const pass = await db.query("select public.submit_quiz($1,$2) as result", [
      ids.assignment,
      { [ids.question]: 1 },
    ]);
    expect(pass.rows).toEqual([{ result: { score: 100, passed: true } }]);
    expect(await count("public.quiz_attempts")).toBe(2);
    const completed = await db.query<{ status: string; completed_at: string }>(
      "select status,completed_at from public.assignments where id=$1",
      [ids.assignment],
    );
    expect(completed.rows[0].status).toBe("COMPLETED");
    expect(completed.rows[0].completed_at).toBeTruthy();
    await rejected("select public.submit_quiz($1,$2)", [
      ids.assignment,
      { [ids.question]: 1 },
    ]);
  });
  it("rejects missing, extra, negative and invalid quiz answers", async () => {
    await asUser(ids.prep);
    await db.query("select public.advance_training($1,true)", [ids.assignment]);
    for (const answers of [
      {},
      { [ids.question]: 2 },
      { [ids.question]: -1 },
      { [ids.question]: 1, other: 0 },
      { [ids.question]: "1" },
    ])
      await rejected("select public.submit_quiz($1,$2)", [
        ids.assignment,
        answers,
      ]);
  });
  it("does not let another employee advance or answer an assignment", async () => {
    await asUser(ids.unassigned);
    await rejected("select public.advance_training($1,true)", [ids.assignment]);
    await rejected("select public.submit_quiz($1,$2)", [
      ids.assignment,
      { [ids.question]: 1 },
    ]);
  });
  it("completes content-only training and preserves completion on repeated calls", async () => {
    await asUser(ids.prep);
    await db.query("select public.advance_training($1,true)", [
      ids.plainAssignment,
    ]);
    const first = await db.query(
      "select * from public.assignments where id=$1",
      [ids.plainAssignment],
    );
    await db.query("select public.advance_training($1,false)", [
      ids.plainAssignment,
    ]);
    expect(
      (
        await db.query("select * from public.assignments where id=$1", [
          ids.plainAssignment,
        ])
      ).rows,
    ).toEqual(first.rows);
  });
  it("preserves results and assignment title after archive and rename", async () => {
    await asUser(ids.prep);
    await db.query("select public.advance_training($1,true)", [ids.assignment]);
    await db.query("select public.submit_quiz($1,$2)", [
      ids.assignment,
      { [ids.question]: 1 },
    ]);
    await asUser(ids.admin);
    await db.query("select public.set_item_status($1,'ARCHIVED')", [
      ids.module,
    ]);
    await asUser(ids.prep);
    expect(
      (
        await db.query("select * from public.learning_items where id=$1", [
          ids.module,
        ])
      ).rows,
    ).toHaveLength(0);
    expect(await count("public.quiz_attempts")).toBe(0);
    await asUser(ids.admin);
    expect(await count("public.quiz_attempts")).toBe(1);
    expect(
      (
        await db.query(
          "select module_title,status from public.assignments where id=$1",
          [ids.assignment],
        )
      ).rows,
    ).toEqual([
      { module_title: "Restricted prep training", status: "COMPLETED" },
    ]);
    await asUser(ids.admin);
    await rejected("delete from public.assignments");
    await rejected("delete from public.learning_items");
  });
});

describe("content authoring", () => {
  it("saves ordered blocks and answers atomically, publishes, and protects published edits", async () => {
    await asUser(ids.admin);
    const id = (
      await db.query<{ id: string }>(
        "select public.create_item('TRAINING','New training') as id",
      )
    ).rows[0].id;
    await rejected("select public.set_item_status($1,'PUBLISHED')", [id]);
    const draft = {
      id,
      title: "New training",
      description: "Practice",
      category: "General",
      restricted: false,
      duration_minutes: 10,
      pass_mark: 80,
      role_ids: [],
      blocks: [
        { type: "heading", body: "First" },
        { type: "text", body: "Second" },
      ],
      questions: [{ prompt: "Which?", options: ["A", "B"], correct_index: 1 }],
    };
    await db.query("select public.save_item($1)", [draft]);
    expect(
      (
        await db.query(
          "select body from public.content_blocks where item_id=$1 order by sort_order",
          [id],
        )
      ).rows,
    ).toEqual([{ body: "First" }, { body: "Second" }]);
    await rejected("select public.save_item($1)", [
      {
        ...draft,
        title: "Should roll back",
        questions: [{ prompt: "Bad", options: ["A", "B"], correct_index: 3 }],
      },
    ]);
    expect(
      (
        await db.query("select title from public.learning_items where id=$1", [
          id,
        ])
      ).rows,
    ).toEqual([{ title: "New training" }]);
    await db.query("select public.set_item_status($1,'PUBLISHED')", [id]);
    await rejected("select public.save_item($1)", [draft]);
  });
  it("disallows SOP quizzes and private-file cross-item references", async () => {
    await asUser(ids.admin);
    await db.query("select public.set_item_status($1,'DRAFT')", [ids.sop]);
    const draft = {
      id: ids.sop,
      title: "SOP",
      description: "",
      category: "General",
      restricted: false,
      duration_minutes: null,
      pass_mark: 80,
      role_ids: [],
      blocks: [{ type: "document", body: `${ids.module}/some-file` }],
      questions: [],
    };
    await rejected("select public.save_item($1)", [draft]);
    await rejected("select public.save_item($1)", [
      {
        ...draft,
        blocks: [],
        questions: [{ prompt: "No", options: ["A", "B"], correct_index: 0 }],
      },
    ]);
  });
});
