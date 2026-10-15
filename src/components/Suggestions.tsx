import { useEffect, useState } from "react";
import { api_request } from "../lib/api";
import { extract_list } from "../lib/helpers";

type SuggestedUser = {
  _id: string;
  name?: string;
  username?: string;
  photo?: string;
};

export default function Suggestions() {
  const [users, set_users] = useState<SuggestedUser[]>([]);
  const [followed_ids, set_followed_ids] = useState<string[]>([]);

  useEffect(() => {
    api_request<unknown>("/users/suggestions?page=1&limit=5")
      .then((data) => {
        console.log("suggestions data:", JSON.stringify(data, null, 2));
        set_users(extract_list<SuggestedUser>(data, ["suggestions", "users"]));
      })
      .catch(() => set_users([]));
  }, []);

  async function handle_follow(user_id: string) {
    const was_followed = followed_ids.includes(user_id);

    set_followed_ids(
      was_followed ? followed_ids.filter((id) => id !== user_id) : [...followed_ids, user_id]
    );

    try {
      await api_request(`/users/${user_id}/follow`, { method: "PUT" });
    } catch {
      set_followed_ids(followed_ids);
    }
  }

  if (users.length === 0) return null;

  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
      <h3 className="mb-3 font-semibold">People you may know</h3>

      <div className="grid gap-3">
        {users.map((user) => {
          const is_followed = followed_ids.includes(user._id);

          return (
            <div key={user._id} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-lime-400 font-bold text-neutral-950">
                {user.photo ? (
                  <img src={user.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user.name?.[0] ?? "?").toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.name ?? "Unknown"}</p>
                {user.username && (
                  <p className="truncate text-xs text-neutral-500">@{user.username}</p>
                )}
              </div>

              <button
                onClick={() => handle_follow(user._id)}
                className={`rounded-xl px-4 py-1.5 text-sm font-semibold ${
                  is_followed
                    ? "border border-neutral-700 text-neutral-300"
                    : "bg-lime-400 text-neutral-950"
                }`}
              >
                {is_followed ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}