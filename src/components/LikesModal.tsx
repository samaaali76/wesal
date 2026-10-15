import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { api_request, get_user_id } from "../lib/api";
import { extract_list } from "../lib/helpers";

type Liker = { _id: string; name?: string; username?: string; photo?: string };
type LikeItem = Liker & { user?: Liker };

export default function LikesModal({
  post_id,
  on_close,
}: {
  post_id: string;
  on_close: () => void;
}) {
  const [likers, set_likers] = useState<Liker[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [error_msg, set_error_msg] = useState("");

  useEffect(() => {
    api_request<unknown>(`/posts/${post_id}/likes?page=1&limit=20`)
      .then((data) => {
        console.log("likes data:", JSON.stringify(data, null, 2));
        const list = extract_list<LikeItem>(data, ["likes", "users"]);
        set_likers(list.map((item) => item.user ?? item));
      })
      .catch((err) => set_error_msg((err as Error).message))
      .finally(() => set_is_loading(false));
  }, [post_id]);

  return (
       <div
      onClick={on_close}
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/70 p-4"
    >
            <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[70vh] w-full max-w-sm animate-modal-in overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-900 p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Liked by</h3>
          <button onClick={on_close} className="text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {is_loading && <p className="text-sm text-neutral-500">Loading...</p>}
        {error_msg && <p className="text-sm text-red-400">{error_msg}</p>}
        {!is_loading && likers.length === 0 && !error_msg && (
          <p className="text-sm text-neutral-500">No likes yet.</p>
        )}

        <div className="grid gap-3">
          {likers.map((liker) => (
            <Link
              key={liker._id}
              to={liker._id === get_user_id() ? "/profile" : `/users/${liker._id}`}
              onClick={on_close}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-lime-400 text-sm font-bold text-neutral-950">
                {liker.photo ? (
                  <img src={liker.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  (liker.name?.[0] ?? "?").toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{liker.name ?? "Unknown"}</p>
                {liker.username && (
                  <p className="truncate text-xs text-neutral-500">@{liker.username}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}