import Link from "next/link";
import { requirePilotPage, checkDatabaseError } from "@/app/lib/pilot/auth";
import type { LearningItem } from "@/app/lib/pilot/types";
import { CreateItemForm } from "@/app/components/pilot/CreateItemForm";
import { Status } from "@/app/components/pilot/Records";
export default async function ContentPage() {
  const { client, employee } = await requirePilotPage(["ADMIN", "MANAGER"]);
  const { data, error } = await client
    .from("learning_items")
    .select("*")
    .order("updated_at", { ascending: false });
  checkDatabaseError(error);
  return (
    <>
      <p className="eyebrow">Content library</p>
      <h1>Training & SOPs</h1>
      <p>Training records completion. SOPs provide reference material.</p>
      <section className="pilot-panel">
        <div className="pilot-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Status</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {(data as LearningItem[]).map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link
                      href={
                        employee.app_role === "ADMIN"
                          ? `/pilot/admin/content/${item.id}`
                          : `/pilot/items/${item.id}`
                      }
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td>{item.kind === "SOP" ? "SOP" : "Training"}</td>
                  <td>{item.category}</td>
                  <td>
                    <Status value={item.status} />
                  </td>
                  <td>
                    {item.restricted ? "Selected kitchen roles" : "General"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.length === 0 && <p>No content yet. Create a draft below.</p>}
      </section>
      {employee.app_role === "ADMIN" && (
        <section className="pilot-panel">
          <h2>Create content</h2>
          <CreateItemForm />
        </section>
      )}
    </>
  );
}
