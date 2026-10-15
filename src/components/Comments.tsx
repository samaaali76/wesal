import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { api_request, get_user_id } from "../lib/api";
import { extract_list } from "../lib/helpers";

type Author = { _id?: string; name?: string; photo?: string };

type CommentData = {
  _id: string;
  content?: string;
  createdAt?: string;
  user?: Author;
  commentCreator?: Author;
  likes?: unknown[];
  likesCount?: number;
};

function Avatar({ author }: { author?: Author }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-lime-400 text-sm font-bold text-neutral-950">
      {author?.photo ? (
        <img src={author.photo} alt="" className="h-full w-full object-cover" />
      ) : (
        (author?.name?.[0] ?? "?").toUpperCase()
      )}
    </div>
  );
}

function Replies({ post_id, comment_id }: { post_id: string; comment_id: string }) {
  const [replies, set_replies] = useState<CommentData[]>([]);
  const [is_open, set_is_open] = useState(false);
  const [is_sending, set_is_sending] = useState(false);
  const [error_msg, set_error_msg] = useState("");

  const load_replies = useCallback(async () => {
    try {
      const data = await api_request<unknown>(
        `/posts/${post_id}/comments/${comment_id}/replies?page=1&limit=10`
      );
      console.log("replies data:", JSON.stringify(data, null, 2));
      set_replies(extract_list<CommentData>(data, ["replies"]));
    } catch (err) {
      set_error_msg((err as Error).message);
    }
  }, [post_id, comment_id]);

  function toggle_replies() {
    if (!is_open) load_replies();
    set_is_open(!is_open);
  }

  async function handle_submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const form_data = new FormData(form);
    if (!String(form_data.get("content") ?? "").trim()) return;

    set_is_sending(true);
    set_error_msg("");

    try {
      await api_request(`/posts/${post_id}/comments/${comment_id}/replies`, {
        method: "POST",
        body: form_data,
      });
      form.reset();
      await load_replies();
    } catch (err) {
      set_error_msg((err as Error).message);
    } finally {
      set_is_sending(false);
    }
  }

  return (
    <div className="mt-1 ml-1">
      <button onClick={toggle_replies} className="text-xs text-neutral-500 hover:text-lime-400">
        {is_open ? "Hide replies" : "Replies"}
      </button>

      {is_open && (
        <div className="mt-2 grid gap-2 border-l border-neutral-800 pl-3">
          {replies.map((reply) => {
            const author = reply.user ?? reply.commentCreator;
            return (
              <div key={reply._id} className="flex gap-2">
                <Avatar author={author} />
                <div className="rounded-2xl bg-neutral-800 px-3 py-2">
                  <p className="text-xs font-semibold">{author?.name ?? "Unknown"}</p>
                  <p className="whitespace-pre-wrap text-sm">{reply.content}</p>
                </div>
              </div>
            );
          })}

          <form onSubmit={handle_submit} className="flex gap-2">
            <input
              name="content"
              type="text"
              placeholder="Write a reply..."
              className="flex-1 rounded-xl bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-lime-400"
            />
            <button
              type="submit"
              disabled={is_sending}
              className="rounded-xl bg-lime-400 px-3 py-2 text-sm font-semibold text-neutral-950 disabled:opacity-60"
            >
              {is_sending ? "..." : "Reply"}
            </button>
          </form>

          {error_msg && <p className="text-xs text-red-400">{error_msg}</p>}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  post_id,
  comment,
  on_delete,
}: {
  post_id: string;
  comment: CommentData;
  on_delete: (comment_id: string) => void;
}) {
  const author = comment.user ?? comment.commentCreator;
  const is_mine = !!author?._id && author._id === get_user_id();

  const [is_liked, set_is_liked] = useState(() => {
    const user_id = get_user_id();
    return (comment.likes ?? []).some((like) => {
      const like_id = typeof like === "string" ? like : (like as { _id?: string })._id;
      return like_id === user_id;
    });
  });
  const [likes_count, set_likes_count] = useState(comment.likesCount ?? comment.likes?.length ?? 0);
  const [content_text, set_content_text] = useState(comment.content ?? "");
  const [edit_text, set_edit_text] = useState(comment.content ?? "");
  const [is_editing, set_is_editing] = useState(false);
  const [is_saving, set_is_saving] = useState(false);
  const [error_msg, set_error_msg] = useState("");

  async function handle_like() {
    const prev_liked = is_liked;
    const prev_count = likes_count;

    set_is_liked(!prev_liked);
    set_likes_count(prev_liked ? prev_count - 1 : prev_count + 1);

    try {
      await api_request(`/posts/${post_id}/comments/${comment._id}/like`, { method: "PUT" });
    } catch {
      set_is_liked(prev_liked);
      set_likes_count(prev_count);
    }
  }

  async function handle_save() {
    if (!edit_text.trim()) return;

    set_is_saving(true);
    set_error_msg("");

    const form_data = new FormData();
    form_data.append("content", edit_text);

    try {
      await api_request(`/posts/${post_id}/comments/${comment._id}`, {
        method: "PUT",
        body: form_data,
      });
      set_content_text(edit_text);
      set_is_editing(false);
    } catch (err) {
      set_error_msg((err as Error).message);
    } finally {
      set_is_saving(false);
    }
  }

  return (
       <div className="flex animate-fade-in gap-3">
      <Avatar author={author} />

      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-neutral-800 px-4 py-2">
          <p className="text-sm font-semibold">{author?.name ?? "Unknown"}</p>

          {is_editing ? (
            <div className="mt-1 flex gap-2">
              <input
                value={edit_text}
                onChange={(e) => set_edit_text(e.target.value)}
                className="flex-1 rounded-lg bg-neutral-900 px-3 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-lime-400"
              />
              <button
                onClick={handle_save}
                disabled={is_saving}
                className="rounded-lg bg-lime-400 px-3 py-1 text-sm font-semibold text-neutral-950 disabled:opacity-60"
              >
                {is_saving ? "..." : "Save"}
              </button>
              <button
                onClick={() => set_is_editing(false)}
                className="rounded-lg border border-neutral-700 px-3 py-1 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm">{content_text}</p>
          )}
        </div>

        <div className="mt-1 flex items-center gap-4 text-xs text-neutral-500">
          <button
            onClick={handle_like}
            className={`flex items-center gap-1 ${is_liked ? "text-lime-400" : "hover:text-white"}`}
          >
            <Heart size={14} fill={is_liked ? "currentColor" : "none"} />
            {likes_count}
          </button>

          {is_mine && (
            <>
              <button onClick={() => set_is_editing(!is_editing)} className="hover:text-lime-400">
                Edit
              </button>
              <button onClick={() => on_delete(comment._id)} className="hover:text-red-400">
                Delete
              </button>
            </>
          )}
        </div>

        {error_msg && <p className="mt-1 text-xs text-red-400">{error_msg}</p>}

        <Replies post_id={post_id} comment_id={comment._id} />
      </div>
    </div>
  );
}

export default function Comments({ post_id }: { post_id: string }) {
  const [comments, set_comments] = useState<CommentData[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [is_sending, set_is_sending] = useState(false);
  const [error_msg, set_error_msg] = useState("");

  const load_comments = useCallback(async () => {
    try {
      const data = await api_request<unknown>(`/posts/${post_id}/comments?page=1&limit=10`);
      console.log("comments data:", JSON.stringify(data, null, 2));
      set_comments(extract_list<CommentData>(data, ["comments"]));
    } catch (err) {
      set_error_msg((err as Error).message);
    } finally {
      set_is_loading(false);
    }
  }, [post_id]);

  useEffect(() => {
    load_comments();
  }, [load_comments]);

  async function handle_submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const form_data = new FormData(form);
    if (!String(form_data.get("content") ?? "").trim()) return;

    set_is_sending(true);
    set_error_msg("");

    try {
      await api_request(`/posts/${post_id}/comments`, { method: "POST", body: form_data });
      form.reset();
      await load_comments();
    } catch (err) {
      set_error_msg((err as Error).message);
    } finally {
      set_is_sending(false);
    }
  }

  async function handle_delete(comment_id: string) {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await api_request(`/posts/${post_id}/comments/${comment_id}`, { method: "DELETE" });
      await load_comments();
    } catch (err) {
      set_error_msg((err as Error).message);
    }
  }

  return (
        <div className="mt-4 grid animate-fade-up gap-3 border-t border-neutral-800 pt-4">
      {is_loading && <p className="text-sm text-neutral-500">Loading comments...</p>}

      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          post_id={post_id}
          comment={comment}
          on_delete={handle_delete}
        />
      ))}

      <form onSubmit={handle_submit} className="flex gap-2">
        <input
          name="content"
          type="text"
          placeholder="Write a comment..."
          className="flex-1 rounded-xl bg-neutral-800 px-4 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-lime-400"
        />
        <button
          type="submit"
          disabled={is_sending}
          className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-neutral-950 disabled:opacity-60"
        >
          {is_sending ? "..." : "Send"}
        </button>
      </form>

      {error_msg && <p className="text-sm text-red-400">{error_msg}</p>}
    </div>
  );
}