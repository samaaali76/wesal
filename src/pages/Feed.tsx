import { useCallback, useEffect, useState } from "react";
import { api_request } from "../lib/api";
import { extract_list } from "../lib/helpers";
import CreatePost from "../components/CreatePost";
import Suggestions from "../components/Suggestions";
import Post, { type PostData } from "../components/Post";
import PostSkeleton from "../components/PostSkeleton";

type FeedTab = "all" | "following";

const page_size = 10;

const tab_paths: Record<FeedTab, string> = {
  all: "/posts",
  following: "/posts/feed?only=following",
};

export default function Feed() {
  const [tab, set_tab] = useState<FeedTab>("all");
  const [posts, set_posts] = useState<PostData[]>([]);
  const [page, set_page] = useState(1);
  const [has_more, set_has_more] = useState(true);
  const [is_loading, set_is_loading] = useState(true);
  const [is_loading_more, set_is_loading_more] = useState(false);
  const [error_msg, set_error_msg] = useState("");

  const load_page = useCallback(
    async (current_tab: FeedTab, page_number: number, replace: boolean) => {
      try {
        const base_path = tab_paths[current_tab];
        const separator = base_path.includes("?") ? "&" : "?";
        const data = await api_request<unknown>(
          `${base_path}${separator}page=${page_number}&limit=${page_size}`
        );
        const list = extract_list<PostData>(data, ["posts"]);

        set_posts((prev) => (replace ? list : [...prev, ...list]));
        set_has_more(list.length === page_size);
        set_page(page_number);
      } catch (err) {
        set_error_msg((err as Error).message);
      } finally {
        set_is_loading(false);
        set_is_loading_more(false);
      }
    },
    []
  );

    useEffect(() => {
    set_is_loading(true);
    set_error_msg("");
    set_posts([]);
    load_page(tab, 1, true);
  }, [tab, load_page]);

  useEffect(() => {
    function handle_changed() {
      load_page(tab, 1, true);
    }

    window.addEventListener("wesal:posts-changed", handle_changed);
    return () => window.removeEventListener("wesal:posts-changed", handle_changed);
  }, [tab, load_page]);

  
  function handle_load_more() {
    set_is_loading_more(true);
    load_page(tab, page + 1, false);
  }

  function tab_class(tab_name: FeedTab) {
    return `rounded-xl px-5 py-2 text-sm font-semibold ${
      tab === tab_name
        ? "bg-lime-400 text-neutral-950"
        : "border border-neutral-700 text-neutral-300 hover:border-lime-400"
    }`;
  }

  return (
    <div className="grid gap-5">
      <CreatePost on_created={() => load_page(tab, 1, true)} />
      <Suggestions />

      <div className="flex gap-2">
        <button onClick={() => set_tab("all")} className={tab_class("all")}>
          All posts
        </button>
        <button onClick={() => set_tab("following")} className={tab_class("following")}>
          Following
        </button>
      </div>

      {is_loading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}
            {error_msg && <p className="text-red-400">{error_msg}</p>}

      {!is_loading && posts.length === 0 && !error_msg && (
        <p className="text-neutral-500">
          {tab === "following"
            ? "Follow people to see their posts here."
            : "No posts yet. Be the first to post!"}
        </p>
      )}

      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}

      {has_more && !is_loading && posts.length > 0 && (
        <button
          onClick={handle_load_more}
          disabled={is_loading_more}
          className="mx-auto rounded-xl border border-neutral-700 px-6 py-2 text-sm hover:border-lime-400 hover:text-lime-400 disabled:opacity-60"
        >
          {is_loading_more ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}