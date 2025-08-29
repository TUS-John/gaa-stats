import React, { useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;

  shareUrl: string;
  onRefreshShare: () => void;

  onSaveSnapshot: () => void;
  onImportSnapshot: (file: File) => void;
  onClearSave: () => void;
  onNewMatch: () => void;
};

export default function MoreModal({
  open,
  onClose,
  shareUrl,
  onRefreshShare,
  onSaveSnapshot,
  onImportSnapshot,
  onClearSave,
  onNewMatch,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const selectShare = () => {
    if (!inputRef.current) return;
    inputRef.current.focus();
    inputRef.current.select();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">More</h2>
          <button className="text-sm px-2 py-1" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Share section */}
        <div className="space-y-2">
          <div className="font-semibold">Share live stats</div>
          <div className="grid grid-cols-1 gap-2">
            <input
              ref={inputRef}
              className="w-full border rounded-xl p-2 font-mono text-xs"
              readOnly
              value={shareUrl}
              placeholder="Generate a link…"
            />
            <div className="grid grid-cols-3 gap-2">
              <button
                className="py-2 rounded-xl bg-white border"
                onClick={onRefreshShare}
              >
                Refresh Link
              </button>
              <button
                className="py-2 rounded-xl bg-gray-900 text-white"
                onClick={selectShare}
              >
                Select Link
              </button>
              <a
                className="py-2 rounded-xl bg-blue-600 text-white text-center"
                href={shareUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open
              </a>
            </div>
          </div>
        </div>

        <div className="h-4" />

        {/* Snapshot actions */}
        <div className="space-y-2">
          <div className="font-semibold">Snapshots</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              className="py-2 rounded-xl bg-white border"
              onClick={onSaveSnapshot}
            >
              Save Snapshot
            </button>
            <button
              className="py-2 rounded-xl bg-white border"
              onClick={() => fileRef.current?.click()}
            >
              Import
            </button>
            <button
              className="py-2 rounded-xl bg-white border"
              onClick={onClearSave}
            >
              Clear Save
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportSnapshot(f);
              e.currentTarget.value = "";
            }}
          />
        </div>

        <div className="h-4" />

        {/* Match actions */}
        <div className="space-y-2">
          <div className="font-semibold">Match</div>
          <button
            className="w-full py-2 rounded-xl bg-black text-white"
            onClick={onNewMatch}
          >
            New Match
          </button>
        </div>
      </div>
    </div>
  );
}
