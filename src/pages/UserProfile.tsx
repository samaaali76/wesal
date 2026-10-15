import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api_request } from "../lib/api";
import { extract_list } from "../lib/helpers";
import Post, { type PostData } from "../components/Post";

type ProfileUser = {
  _id?: string;
  name?: string;
  username?: string;
  photo?: string;
  isFollowing?: boolean;
  followersCount?: number;
  followingCount?: number;
  followers?: unknown[];
  following?: unknown[];
};

export default function UserProfile() {
  const { id } = useParams();
  const [profile_user, set_profile_user] = useState<ProfileUser | null>(null);
  const [posts, set_posts] = useState<PostData[]>([]);
  const [is_following, set_is_following] = useState(false);
  const [error_msg, set_error_msg] = useState("");

  useEffect(() => {
    if (!id) return;
    set_error_msg("");

    api_request<Record<string, unknown>>(`/users/${id}/profile`)
      .then((data) => {
        console.log("user profile data:", JSON.stringify(data, null, 2));
        const found_user = (data.user ?? data) as ProfileUser;
        set_profile_user(found_user);
        set_is_following(found_user.isFollowing ?? (data.isFollowing as boolean | undefined) ?? false);
      })
      .catch((err) => set_error_msg((err as Error).message));

    api_request<unknown>(`/users/${id}/posts`)
      .then((data) => set_posts(extract_list<PostData>(data, ["posts"])))
      .catch(() => set_posts([]));
  }, [id]);

  async function handle_follow() {
    const was_following = is_following;
    set_is_following(!was_following);

    try {
      await api_request(`/users/${id}/follow`, { method: "PUT" });
    } catch {
      set_is_following(was_following);
    }
  }

  const followers_count = profile_user?.followersCount ?? profile_user?.followers?.length;
  const following_count = profile_user?.followingCount ?? profile_user?.following?.length;

  return (
    <div className="grid gap-5">
      {error_msg && <p className="text-red-400">{error_msg}</p>}

      <section className="flex items-center gap-5 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-lime-400 text-3xl font-bold text-neutral-950">
          {profile_user?.photo ? (
            <img src={profile_user.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            (profile_user?.name?.[0] ?? "?").toUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-bold">{profile_user?.name ?? "..."}</h2>
          {profile_user?.username && <p className="text-neutral-400">@{profile_user.username}</p>}
          <p className="mt-1 text-sm text-neutral-500">
            {followers_count !== undefined && `${followers_count} followers`}
            {followers_count !== undefined && following_count !== undefined && " · "}
            {following_count !== undefined && `${following_count} following`}
          </p>
        </div>

        <button
          onClick={handle_follow}
          className={`rounded-xl px-5 py-2 font-semibold ${
            is_following
              ? "border border-neutral-700 text-neutral-300"
              : "bg-lime-400 text-neutral-950"
          }`}
        >
          {is_following ? "Following" : "Follow"}
        </button>
      </section>

      <h3 className="text-lg font-semibold">Posts</h3>
      {posts.length === 0 && <p className="text-neutral-500">No posts yet.</p>}
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
}