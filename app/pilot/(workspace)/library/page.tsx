import { requirePilotPage, checkDatabaseError } from "@/app/lib/pilot/auth";
import type { LearningItem } from "@/app/lib/pilot/types";
import { ItemCard } from "@/app/components/pilot/Records";
export default async function LibraryPage() {
  const { client } = await requirePilotPage();
  const { data, error } = await client
    .from("learning_items")
    .select("*")
    .eq("kind", "SOP")
    .eq("status", "PUBLISHED")
    .order("category");
  checkDatabaseError(error);
  return (
    <>
      <p className="eyebrow">At your fingertips</p>
      <h1>SOP library</h1>
      <p>Reference procedures for your role. No completion required.</p>
      <div className="pilot-grid">
        {(data as LearningItem[]).map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      {data?.length === 0 && (
        <p className="pilot-empty">No SOPs are available for your role yet.</p>
      )}
    </>
  );
}
