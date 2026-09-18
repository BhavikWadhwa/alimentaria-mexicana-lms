import type { ContentBlock } from "@/app/lib/pilot/types";
import { safeVideoUrl } from "@/app/lib/pilot/validation";

export function ContentViewer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="pilot-content">
      {blocks.map((block) => {
        const fileUrl = `/api/pilot/files?path=${encodeURIComponent(block.body)}`;
        if (block.type === "heading")
          return <h2 key={block.id}>{block.body}</h2>;
        if (block.type === "text") return <p key={block.id}>{block.body}</p>;
        if (block.type === "callout")
          return (
            <aside key={block.id} className="pilot-callout">
              {block.body}
            </aside>
          );
        // Private endpoint URLs are request-authorized. No HTML from authors is injected.
        // Next's image optimizer would cache private bytes and does not forward the
        // viewer's session. Keep these requests on the authenticated file endpoint.
        if (block.type === "image")
          return (
            <figure key={block.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fileUrl} alt="Training content" />
            </figure>
          );
        if (block.type === "document")
          return (
            <a
              key={block.id}
              className="btn"
              target="_blank"
              rel="noopener noreferrer"
              href={fileUrl}
            >
              Read PDF document ↗
            </a>
          );
        if (!block.body.startsWith("https://"))
          return (
            <video
              key={block.id}
              controls
              controlsList="nodownload"
              preload="metadata"
              src={fileUrl}
            >
              Your browser does not support video playback.
            </video>
          );
        const embed = safeVideoUrl(block.body);
        return embed ? (
          <iframe
            key={block.id}
            src={embed}
            title="Training video"
            allowFullScreen
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        ) : (
          <p key={block.id}>
            This video link is unavailable. Contact management.
          </p>
        );
      })}
    </div>
  );
}
