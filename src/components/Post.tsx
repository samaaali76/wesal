import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, MessageCircle, Pencil, Share2, Trash2 } from "lucide-react";
import { api_request, get_user_id } from "../lib/api";
import Comments from "./Comments";
import LikesModal from "./LikesModal";
import ReactionButton from "./ReactionButton";
import ShareModal from "./ShareModal";

type Author = { _id?: string; name?: string; photo?: string };

type SharedPostData = {
  _id?: string;
  body?: string;
  image?: string;
  createdAt?: string;
  user?: Author;
};

export type PostData = {
  _id: string;
  body?: string;
  image?: string;
  createdAt?: string;
  user?: Author;
  likesCount?: number;
  likes?: unknown[];
  bookmarked?: boolean;
  commentsCount?: number;
  sharesCount?: number;
  isShare?: boolean;
  sharedPost?: SharedPostData | null;
};

function Avatar({ author, size_class }: { author?: Author; size_class: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-lime-400 font-bold text-neutral-950 ${size_class}`}
    >
      {author?.photo ? (
        <img src={author.photo} alt="" className="h-full w-full object-cover" />
      ) : (
        (author?.name?.[0] ?? "?").toUpperCase()
      )}
    </div>
  );
}

function user_link(author?: Author) {
  if (!author?._id) return null;
  return author._id === get_user_id() ? "/profile" : `/users/${author._id}`;
}

export default function Post({ post }: { post: PostData }) {
  const author_name = post.user?.name ?? "Unknown";
  const is_owner = !!post.user?._id && post.user._id === get_user_id();
  const shared = typeof post.sharedPost === "object" ? post.sharedPost : null;

  if (shared) console.log("shared post:", JSON.stringify(shared, null, 2));

  const [is_liked, set_is_liked] = useState(() => {
    const user_id = get_user_id();
    return (post.likes ?? []).some((like) => {
      const like_id = typeof like === "string" ? like : (like as { _id?: string })._id;
      return like_id === user_id;
    });
  });
  const [likes_count, set_likes_count] = useState(post.likesCount ?? post.likes?.length ?? 0);
  const [shares_count, set_shares_count] = useState(post.sharesCount ?? 0);
  const [is_bookmarked, set_is_bookmarked] = useState(post.bookmarked ?? false);
  const [show_comments, set_show_comments] = useState(false);
  const [show_likes, set_show_likes] = useState(false);
  const [show_share, set_show_share] = useState(false);

  const [is_deleted, set_is_deleted] = useState(false);
  const [is_editing, set_is_editing] = useState(false);
  const [is_saving, set_is_saving] = useState(false);
  const [body_text, set_body_text] = useState(post.body ?? "");
  const [error_msg, set_error_msg] = useState("");

  if (is_deleted) return null;

  async function handle_like() {
    const prev_liked = is_liked;
    const prev_count = likes_count;

    set_is_liked(!prev_liked);
    set_likes_count(prev_liked ? prev_count - 1 : prev_count + 1);

    try {
      await api_request(`/posts/${post._id}/like`, { method: "PUT" });
    } catch {
      set_is_liked(prev_liked);
      set_likes_count(prev_count);
    }
  }

  async function handle_bookmark() {
    const prev_bookmarked = is_bookmarked;
    set_is_bookmarked(!prev_bookmarked);

    try {
      await api_request(`/posts/${post._id}/bookmark`, { method: "PUT" });
    } catch {
      set_is_bookmarked(prev_bookmarked);
    }
  }

  function handle_shared() {
    set_shares_count(shares_count + 1);
    window.dispatchEvent(new Event("wesal:posts-changed"));
  }

  async function handle_delete() {
    if (!window.confirm("Delete this post?")) return;

    try {
      await api_request(`/posts/${post._id}`, { method: "DELETE" });
      set_is_deleted(true);
    } catch (err) {
      set_error_msg((err as Error).message);
    }
  }

  async function handle_save_edit() {
    set_is_saving(true);
    set_error_msg("");

    const form_data = new FormData();
    form_data.append("body", body_text);

    try {
      await api_request(`/posts/${post._id}`, { method: "PUT", body: form_data });
      set_is_editing(false);
    } catch (err) {
      set_error_msg((err as Error).message);
    } finally {
      set_is_saving(false);
    }
  }

  const owner_link = user_link(post.user);
  const shared_link = user_link(shared?.user);

  return (
    <article className="animate-fade-up rounded-3xl border border-neutral-800 bg-neutral-900 p-5 transition-colors hover:border-neutral-700">
      <header className="mb-3 flex items-center gap-3">
        <Avatar author={post.user} size_class="h-10 w-10" />

        <div>
          {owner_link ? (
            <Link to={owner_link} className="font-semibold hover:text-lime-400">
              {author_name}
            </Link>
          ) : (
            <p className="font-semibold">{author_name}</p>
          )}

          <div className="flex items-center gap-2 text-xs text-neutral-500">
            {shared && <span>shared a post</span>}
            {post.createdAt && (
              <Link to={`/posts/${post._id}`} className="hover:text-lime-400">
                {new Date(post.createdAt).toLocaleString()}
              </Link>
            )}
          </div>
        </div>

        {is_owner && (
          <div className="ml-auto flex items-center gap-3 text-neutral-500">
            <button onClick={() => set_is_editing(!is_editing)} className="hover:text-lime-400">
              <Pencil size={18} />
            </button>
            <button onClick={handle_delete} className="hover:text-red-400">
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </header>

      {is_editing ? (
        <div className="mb-3 grid gap-2">
          <textarea
            value={body_text}
            onChange={(e) => set_body_text(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl bg-neutral-800 p-4 text-white outline-none focus:ring-1 focus:ring-lime-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handle_save_edit}
              disabled={is_saving}
              className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-neutral-950 disabled:opacity-60"
            >
              {is_saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => set_is_editing(false)}
              className="rounded-xl border border-neutral-700 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        body_text && <p className="mb-3 whitespace-pre-wrap">{body_text}</p>
      )}

      {shared && (
        <div className="mb-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Avatar author={shared.user} size_class="h-8 w-8 text-sm" />
            <div className="min-w-0">
              {shared_link ? (
                <Link to={shared_link} className="text-sm font-semibold hover:text-lime-400">
                  {shared.user?.name ?? "Unknown"}
                </Link>
              ) : (
                <p className="text-sm font-semibold">{shared.user?.name ?? "Unknown"}</p>
              )}
              {shared.createdAt && shared._id && (
                <Link
                  to={`/posts/${shared._id}`}
                  className="block text-xs text-neutral-500 hover:text-lime-400"
                >
                  {new Date(shared.createdAt).toLocaleString()}
                </Link>
              )}
            </div>
          </div>

          {shared.body && <p className="mb-2 whitespace-pre-wrap text-sm">{shared.body}</p>}
          {shared.image && (
            <img src={shared.image} alt="" className="max-h-72 w-full rounded-xl object-cover" />
          )}
        </div>
      )}

      {post.image && (
        <img src={post.image} alt="" className="max-h-96 w-full rounded-2xl object-cover" />
      )}

      {error_msg && <p className="mt-2 text-sm text-red-400">{error_msg}</p>}

      <footer className="mt-4 flex items-center gap-5 text-neutral-400">
        <ReactionButton
          post_id={post._id}
          is_liked={is_liked}
          likes_count={likes_count}
          on_toggle_like={handle_like}
          on_open_likes={() => set_show_likes(true)}
        />

        <button
          onClick={() => set_show_comments(!show_comments)}
          className={`flex items-center gap-2 ${show_comments ? "text-lime-400" : "hover:text-white"}`}
        >
          <MessageCircle size={20} />
          {post.commentsCount ?? ""}
        </button>

        <button
          onClick={() => set_show_share(true)}
          className="flex items-center gap-2 hover:text-white"
        >
          <Share2 size={20} />
          {shares_count || ""}
        </button>

        <button
          onClick={handle_bookmark}
          className={`ml-auto ${is_bookmarked ? "text-lime-400" : "hover:text-white"}`}
        >
          <Bookmark size={20} fill={is_bookmarked ? "currentColor" : "none"} />
        </button>
      </footer>

      {show_comments && <Comments post_id={post._id} />}
      {show_likes && <LikesModal post_id={post._id} on_close={() => set_show_likes(false)} />}
      {show_share && (
        <ShareModal
          post_id={post._id}
          author_name={author_name}
          preview_text={post.body ?? shared?.body ?? ""}
          on_close={() => set_show_share(false)}
          on_shared={handle_shared}
        />
      )}
    </article>
  );
}