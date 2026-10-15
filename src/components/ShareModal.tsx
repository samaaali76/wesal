import { useState } from "react";
import { X } from "lucide-react";
import { api_request } from "../lib/api";

export default function ShareModal({
  post_id,
  author_name,
  preview_text,
  on_close,
  on_shared,
}: {
  post_id: string;
  author_name: string;
  preview_text: string;
  on_close: () => void;
  on_shared: () => void;
}) {
  const [share_text, set_share_text] = useState("");
  const [is_sending, set_is_sending] = useState(false);
  const [error_msg, set_error_msg] = useState("");

  async function handle_submit() {
    set_is_sending(true);
    set_error_msg("");

    try {
      await api_request(`/posts/${post_id}/share`, {
        method: "POST",
        body: JSON.stringify({ body: share_text }),
      });
      on_shared();
      on_close();
    } catch (err) {
      set_error_msg((err as Error).message);
    } finally {
      set_is_sending(false);
    }
  }

  return (
    <div
      onClick={on_close}
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/70 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-modal-in rounded-3xl border border-neutral-800 bg-neutral-900 p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Share this post</h3>
          <button onClick={on_close} className="text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <textarea
          value={share_text}
          onChange={(e) => set_share_text(e.target.value)}
          rows={3}
          placeholder="Say something about this..."
          className="mb-3 w-full resize-none rounded-2xl bg-neutral-800 p-4 text-white outline-none focus:ring-1 focus:ring-lime-400"
        />

        <div className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
          <p className="text-sm font-semibold">{author_name}</p>
          {preview_text && (
            <p className="line-clamp-3 whitespace-pre-wrap text-sm text-neutral-400">
              {preview_text}
            </p>
          )}
        </div>

        {error_msg && <p className="mb-3 text-sm text-red-400">{error_msg}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={on_close}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handle_submit}
            disabled={is_sending}
            className="rounded-xl bg-lime-400 px-5 py-2 text-sm font-semibold text-neutral-950 disabled:opacity-60"
          >
            {is_sending ? "Sharing..." : "Share now"}
          </button>
        </div>
      </div>
    </div>
  );
}