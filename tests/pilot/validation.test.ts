import { describe, expect, it } from "vitest";
import { draftSchema, safeVideoUrl } from "../../app/lib/pilot/validation";
describe("pilot input boundaries", () => {
  it("rejects scripts and arbitrary embed hosts", () => {
    for (const link of [
      "javascript:alert(1)",
      "https://evil.example/watch?v=abcdefghijk",
      "http://youtu.be/abcdefghijk",
      "https://www.youtube.com.evil.example/watch?v=abcdefghijk",
    ])
      expect(safeVideoUrl(link)).toBeNull();
    expect(safeVideoUrl("https://youtu.be/abcdefghijk")).toBe(
      "https://www.youtube-nocookie.com/embed/abcdefghijk",
    );
    expect(safeVideoUrl("https://vimeo.com/12345")).toBe(
      "https://player.vimeo.com/video/12345",
    );
  });
  it("rejects restricted content without roles and out-of-range answers", () => {
    const draft = {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Training",
      description: "",
      category: "General",
      restricted: false,
      duration_minutes: null,
      pass_mark: 80,
      role_ids: [],
      blocks: [],
      questions: [],
    };
    expect(draftSchema.safeParse(draft).success).toBe(true);
    expect(draftSchema.safeParse({ ...draft, restricted: true }).success).toBe(
      false,
    );
    expect(
      draftSchema.safeParse({
        ...draft,
        questions: [
          { prompt: "Question", options: ["A", "B"], correct_index: 2 },
        ],
      }).success,
    ).toBe(false);
  });
});
