import { useEffect, useState } from "react";
import { api_request, get_user_id, set_token } from "../lib/api";
import { extract_list } from "../lib/helpers";
import Post, { type PostData } from "../components/Post";

type UserData = {
  name?: string;
  username?: string;
  email?: string;
  photo?: string;
};

const input_class =
  "w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-white outline-none focus:border-lime-400";

export default function Profile() {
  const [user, set_user] = useState<UserData | null>(null);
  const [my_posts, set_my_posts] = useState<PostData[]>([]);
  const [photo_msg, set_photo_msg] = useState("");
  const [password_msg, set_password_msg] = useState("");
  const [is_uploading, set_is_uploading] = useState(false);
  const [is_changing, set_is_changing] = useState(false);

  async function load_user() {
    const data = await api_request<{ user: UserData }>("/users/profile-data");
    set_user(data.user);
  }

  useEffect(() => {
    load_user();
  }, []);

  useEffect(() => {
    const user_id = get_user_id();
    if (!user_id) return;

    api_request<unknown>(`/users/${user_id}/posts`)
      .then((data) => {
        console.log("my posts data:", JSON.stringify(data, null, 2));
        set_my_posts(extract_list<PostData>(data, ["posts"]));
      })
      .catch(() => set_my_posts([]));
  }, []);

  async function handle_photo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const form_data = new FormData(form);
    const photo = form_data.get("photo") as File;
    if (!photo || photo.size === 0) return;

    set_is_uploading(true);
    set_photo_msg("");

    try {
      await api_request("/users/upload-photo", { method: "PUT", body: form_data });
      form.reset();
      await load_user();
      set_photo_msg("Photo updated. Refresh the page to see it in the sidebar.");
    } catch (err) {
      set_photo_msg((err as Error).message);
    } finally {
      set_is_uploading(false);
    }
  }

  async function handle_password(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const form_data = new FormData(form);

    set_is_changing(true);
    set_password_msg("");

    try {
      const data = await api_request<{ token?: string }>("/users/change-password", {
        method: "PATCH",
        body: JSON.stringify({
          password: form_data.get("password"),
          newPassword: form_data.get("newPassword"),
        }),
      });
      if (data?.token) set_token(data.token);
      form.reset();
      set_password_msg("Password changed successfully.");
    } catch (err) {
      set_password_msg((err as Error).message);
    } finally {
      set_is_changing(false);
    }
  }

  return (
    <div className="grid gap-5">
      <section className="flex items-center gap-5 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-lime-400 text-3xl font-bold text-neutral-950">
          {user?.photo ? (
            <img src={user.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            (user?.name?.[0] ?? "?").toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-bold">{user?.name ?? "..."}</h2>
          {user?.username && <p className="text-neutral-400">@{user.username}</p>}
          {user?.email && <p className="truncate text-sm text-neutral-500">{user.email}</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
        <h3 className="mb-4 text-lg font-semibold">Change photo</h3>
        <form onSubmit={handle_photo} className="grid gap-3">
          <input
            name="photo"
            type="file"
            accept="image/*"
            className="text-sm text-neutral-400 file:mr-3 file:rounded-xl file:border-0 file:bg-neutral-800 file:px-4 file:py-2 file:text-white"
          />
          <button
            type="submit"
            disabled={is_uploading}
            className="w-fit rounded-xl bg-lime-400 px-6 py-2 font-semibold text-neutral-950 disabled:opacity-60"
          >
            {is_uploading ? "Uploading..." : "Upload"}
          </button>
          {photo_msg && <p className="text-sm text-neutral-300">{photo_msg}</p>}
        </form>
      </section>

      <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
        <h3 className="mb-4 text-lg font-semibold">Change password</h3>
        <form onSubmit={handle_password} className="grid gap-3">
          <input name="password" type="password" placeholder="Current password" className={input_class} required />
          <input name="newPassword" type="password" placeholder="New password" className={input_class} required />
          <button
            type="submit"
            disabled={is_changing}
            className="w-fit rounded-xl bg-lime-400 px-6 py-2 font-semibold text-neutral-950 disabled:opacity-60"
          >
            {is_changing ? "Saving..." : "Change password"}
          </button>
          {password_msg && <p className="text-sm text-neutral-300">{password_msg}</p>}
        </form>
      </section>

      <section className="grid gap-5">
        <h3 className="text-lg font-semibold">My posts</h3>
        {my_posts.length === 0 && <p className="text-neutral-500">You haven't posted yet.</p>}
        {my_posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </section>
    </div>
  );
}