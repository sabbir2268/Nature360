import { FileText, ImageIcon, Video } from "lucide-react";
import { formatDateTime } from "../../utils/format";

function fileUrl(item) {
  return item?.url || item?.data || "";
}

export default function EvidenceGallery({ items = [], emptyText = "No evidence attached." }) {
  const evidence = items.filter((item) => fileUrl(item));

  if (evidence.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-forest-900/15 bg-white/40 px-3 py-4 text-center text-[10px] text-slate-400">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {evidence.map((item, index) => {
        const url = fileUrl(item);
        const isImage = item.mimeType?.startsWith("image/");
        const isVideo = item.mimeType?.startsWith("video/");

        return (
          <div
            key={`${item.name}-${index}`}
            className="overflow-hidden rounded-xl border border-forest-900/[0.08] bg-white/70"
          >
            {isImage && (
              <a href={url} target="_blank" rel="noreferrer">
                <img
                  src={url}
                  alt={item.name || "Complaint evidence"}
                  className="h-32 w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                  loading="lazy"
                />
              </a>
            )}
            {isVideo && (
              <video src={url} controls className="h-36 w-full bg-forest-950 object-contain" />
            )}
            {!isImage && !isVideo && (
              <div className="grid h-24 place-items-center bg-forest-900/[0.04] text-emerald-700">
                <FileText className="h-7 w-7" />
              </div>
            )}

            <div className="flex items-start gap-2 p-2.5">
              <span className="mt-0.5 text-slate-400">
                {isImage ? (
                  <ImageIcon className="h-3.5 w-3.5" />
                ) : isVideo ? (
                  <Video className="h-3.5 w-3.5" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold text-forest-950">{item.name}</p>
                <p className="mt-0.5 text-[9px] text-slate-400">
                  {item.uploadedAt ? formatDateTime(item.uploadedAt) : "Evidence file"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
