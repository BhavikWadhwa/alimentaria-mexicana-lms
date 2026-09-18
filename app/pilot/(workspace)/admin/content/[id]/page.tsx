import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePilotPage, checkDatabaseError } from "@/app/lib/pilot/auth";
import type {
  ItemDraft,
  JobRole,
  LearningItem,
  ContentBlock,
  QuizQuestion,
} from "@/app/lib/pilot/types";
import { uuid } from "@/app/lib/pilot/validation";
import { ModuleEditor } from "@/app/components/pilot/ModuleEditor";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { client } = await requirePilotPage(["ADMIN"]);
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const [itemResult, roles, blocks, questions, access, answers] =
    await Promise.all([
      client.from("learning_items").select("*").eq("id", id).maybeSingle(),
      client.from("job_roles").select("*").order("name"),
      client
        .from("content_blocks")
        .select("*")
        .eq("item_id", id)
        .order("sort_order"),
      client
        .from("quiz_questions")
        .select("*")
        .eq("item_id", id)
        .order("sort_order"),
      client.from("item_role_access").select("role_id").eq("item_id", id),
      client.rpc("editor_answers", { target: id }),
    ]);
  [itemResult, roles, blocks, questions, access, answers].forEach((result) =>
    checkDatabaseError(result.error),
  );
  if (!itemResult.data) notFound();
  const item = itemResult.data as LearningItem;
  const answerMap = answers.data as Record<string, number>;
  const initial: ItemDraft = {
    ...item,
    role_ids: access.data!.map((row) => row.role_id),
    blocks: (blocks.data as ContentBlock[]).map(({ type, body }) => ({
      type,
      body,
    })),
    questions: (questions.data as QuizQuestion[]).map((q) => ({
      prompt: q.prompt,
      options: q.options,
      correct_index: answerMap[q.id],
    })),
  };
  return (
    <>
      <Link href="/pilot/admin/content">← Training & SOPs</Link>
      <h1>{item.kind === "SOP" ? "Edit SOP" : "Edit training"}</h1>
      <section className="pilot-panel">
        <ModuleEditor
          item={item}
          initial={initial}
          roles={roles.data as JobRole[]}
        />
      </section>
    </>
  );
}
