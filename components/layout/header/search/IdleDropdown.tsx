import Image from "next/image";
import { memo } from "react";
import { MdClose, MdDeleteSweep, MdHistory, MdTrendingUp } from "react-icons/md";
import { TrendingKeyword } from "../type";

interface IdleDropdownProps {
  history: string[];
  trending: TrendingKeyword[];
  onSelectHistory: (term: string) => void;
  onRemoveHistory: (term: string) => void;
  onClearHistory: () => void;
  onSelectTrending: (kw: TrendingKeyword) => void;
}

export const IdleDropdown = memo(function IdleDropdown({ history, trending, onSelectHistory, onRemoveHistory, onClearHistory, onSelectTrending }: IdleDropdownProps) {
  const hasHistory = history.length > 0;
  const hasTrending = trending.length > 0;

  if (!hasHistory && !hasTrending) return null;

  return (
    <div className="py-2">
      {/* Lịch sử tìm kiếm */}
      {hasHistory && (
        <section>
          <div className="flex items-center justify-between px-4 py-1.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-darker uppercase tracking-wide">
              <MdHistory className="w-4 h-4 text-neutral-dark" />
              Lịch sử tìm kiếm
            </span>
            <button onClick={onClearHistory} className="flex items-center gap-1 text-xs text-neutral-dark hover:text-promotion transition-colors">
              <MdDeleteSweep className="w-3.5 h-3.5" />
              Xóa tất cả
            </button>
          </div>

          <ul>
            {history.map((term) => (
              <li key={term} className="flex items-center gap-2 px-4 py-2 hover:bg-neutral transition-colors group">
                <button onClick={() => onSelectHistory(term)} className="flex-1 flex items-center gap-2.5 text-left min-w-0">
                  <MdHistory className="w-4 h-4 text-neutral-dark shrink-0" />
                  <span className="text-sm text-primary truncate">{term}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveHistory(term);
                  }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-neutral-active"
                  aria-label={`Xóa "${term}"`}
                >
                  <MdClose className="w-3.5 h-3.5 text-neutral-dark" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Divider */}
      {hasHistory && hasTrending && <div className="my-1.5 border-t border-neutral" />}

      {/* Xu hướng tìm kiếm */}
      {hasTrending && (
        <section>
          <div className="px-4 py-1.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-darker uppercase tracking-wide">
              <MdTrendingUp className="w-4 h-4 text-accent" />
              Xu hướng tìm kiếm
            </span>
          </div>

          <ul>
            {trending.slice(0, 6).map((kw) => (
              <li key={kw.id}>
                <button onClick={() => onSelectTrending(kw)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-neutral transition-colors group text-left">
                  <div className="shrink-0 w-9 h-9 rounded-lg overflow-hidden border border-neutral bg-white flex items-center justify-center">
                    {kw.thumbnail ? (
                      <Image src={kw.thumbnail} alt={kw.name} width={36} height={36} className="w-full h-full object-contain" />
                    ) : (
                      <MdTrendingUp className="w-4 h-4 text-neutral-dark opacity-40" />
                    )}
                  </div>

                  <span className="text-sm text-primary truncate group-hover:text-accent-hover transition-colors flex-1 min-w-0">{kw.name}</span>

                  <span className="shrink-0 text-[10px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">Hot</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
});

IdleDropdown.displayName = "IdleDropdown";
