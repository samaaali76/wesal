import { useEffect, useState } from "react";
import { api_request } from "../lib/api";
import { extract_list } from "../lib/helpers";
import Post, { type PostData } from "../components/Post";

export default function Bookmarks() {
  const [posts, set_posts] = useState<PostData[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [error_msg, set_error_msg] = useState("");

  useEffect(() => {
    api_request<unknown>("/users/bookmarks")
      .then((data) => {
        console.log("bookmarks data:", JSON.stringify(data, null, 2));
        const list = extract_list<PostData>(data, ["bookmarks", "posts"]);
        set_posts(list.map((post) => ({ ...post, bookmarked: true })));
      })
      .catch((err) => set_error_msg((err as Error).message))
      .finally(() => set_is_loading(false));
  }, []);

  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-bold">Saved posts</h2>

      {is_loading && <p className="text-neutral-500">Loading...</p>}
      {error_msg && <p className="text-red-400">{error_msg}</p>}
      {!is_loading && posts.length === 0 && !error_msg && (
        <p className="text-neutral-500">You haven't saved any posts yet.</p>
      )}

      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
}
