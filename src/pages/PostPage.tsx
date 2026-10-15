import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api_request } from "../lib/api";
import Post, { type PostData } from "../components/Post";

export default function PostPage() {
  const { id } = useParams();
  const [post, set_post] = useState<PostData | null>(null);
  const [error_msg, set_error_msg] = useState("");

  useEffect(() => {
    if (!id) return;
    set_post(null);
    set_error_msg("");

    api_request<Record<string, unknown>>(`/posts/${id}`)
      .then((data) => {
        console.log("single post data:", JSON.stringify(data, null, 2));
        set_post((data.post ?? data) as PostData);
      })
      .catch((err) => set_error_msg((err as Error).message));
  }, [id]);

  return (
    <div className="grid gap-5">
      <Link to="/" className="text-sm text-neutral-400 hover:text-lime-400">
        ← Back to feed
      </Link>

      {error_msg && <p className="text-red-400">{error_msg}</p>}
      {!post && !error_msg && <p className="text-neutral-500">Loading...</p>}
      {post && <Post key={post._id} post={post} />}
    </div>
  );
}