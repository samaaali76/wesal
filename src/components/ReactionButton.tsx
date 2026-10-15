import { useEffect, useRef, useState } from "react";
import { ThumbsUp } from "lucide-react";
import { get_user_id } from "../lib/api";

type ReactionKey = "like" | "love" | "haha" | "wow" | "sad" | "angry";

const reactions: { key: ReactionKey; emoji: string; label: string; color: string }[] = [
  { key: "like", emoji: "👍", label: "Like", color: "text-lime-400" },
  { key: "love", emoji: "❤️", label: "Love", color: "text-red-500" },
  { key: "haha", emoji: "😂", label: "Haha", color: "text-amber-500" },
  { key: "wow", emoji: "😮", label: "Wow", color: "text-amber-500" },
  { key: "sad", emoji: "😢", label: "Sad", color: "text-amber-500" },
  { key: "angry", emoji: "😡", label: "Angry", color: "text-orange-600" },
];

function storage_key() {
  return `wesal_reactions_${get_user_id() ?? "guest"}`;
}

function read_all(): Record<string, ReactionKey> {
  try {
    return JSON.parse(localStorage.getItem(storage_key()) ?? "{}");
  } catch {
    return {};
  }
}

function save_reaction(post_id: string, key: ReactionKey | null) {
  const all = read_all();
  if (key) all[post_id] = key;
  else delete all[post_id];
  localStorage.setItem(storage_key(), JSON.stringify(all));
}

export default function ReactionButton({
  post_id,
  is_liked,
  likes_count,
  on_toggle_like,
  on_open_likes,
}: {
  post_id: string;
  is_liked: boolean;
  likes_count: number;
  on_toggle_like: () => void;
  on_open_likes: () => void;
}) {
  const [local_reaction, set_local_reaction] = useState<ReactionKey | null>(
    () => read_all()[post_id] ?? null
  );
  const [is_open, set_is_open] = useState(false);
  const [is_popping, set_is_popping] = useState(false);

  const wrapper_ref = useRef<HTMLDivElement>(null);
  const press_timer = useRef<number | undefined>(undefined);
  const was_long_press = useRef(false);

  const current_key: ReactionKey | null = is_liked ? "like" : local_reaction;
  const current = reactions.find((reaction) => reaction.key === current_key);

  useEffect(() => {
    if (!is_open) return;

    function handle_outside(e: PointerEvent) {
      if (!wrapper_ref.current?.contains(e.target as Node)) set_is_open(false);
    }

    document.addEventListener("pointerdown", handle_outside);
    return () => document.removeEventListener("pointerdown", handle_outside);
  }, [is_open]);

  function pop() {
    set_is_popping(true);
    window.setTimeout(() => set_is_popping(false), 400);
  }

  function clear_local() {
    if (!local_reaction) return;
    save_reaction(post_id, null);
    set_local_reaction(null);
  }

  function pick(key: ReactionKey) {
    set_is_open(false);

    if (key === "like") {
      clear_local();
      if (!is_liked) on_toggle_like();
    } else {
      save_reaction(post_id, key);
      set_local_reaction(key);
      if (is_liked) on_toggle_like();
    }

    pop();
  }

  function handle_click() {
    if (was_long_press.current) {
      was_long_press.current = false;
      return;
    }

    if (current_key) {
      if (is_liked) on_toggle_like();
      clear_local();
    } else {
      pick("like");
    }
  }

  function handle_touch_start() {
    was_long_press.current = false;
    press_timer.current = window.setTimeout(() => {
      was_long_press.current = true;
      set_is_open(true);
    }, 450);
  }

  function cancel_press() {
    window.clearTimeout(press_timer.current);
  }

  return (
    <div
      ref={wrapper_ref}
      className="relative flex items-center gap-2"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") set_is_open(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") set_is_open(false);
      }}
    >
      {is_open && (
        <div className="absolute bottom-full left-0 z-20 pb-2">
          <div className="flex animate-modal-in gap-1 rounded-full border border-neutral-800 bg-neutral-900 px-2 py-1 shadow-lg">
            {reactions.map((reaction) => (
              <button
                key={reaction.key}
                onClick={() => pick(reaction.key)}
                title={reaction.label}
                className="text-2xl transition-transform hover:-translate-y-1 hover:scale-125"
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handle_click}
        onTouchStart={handle_touch_start}
        onTouchEnd={cancel_press}
        onTouchMove={cancel_press}
        onContextMenu={(e) => e.preventDefault()}
        className={`flex select-none items-center gap-2 ${
          current ? current.color : "hover:text-white"
        }`}
      >
        {current && current.key !== "like" ? (
          <span className={`text-xl leading-none ${is_popping ? "animate-pop" : ""}`}>
            {current.emoji}
          </span>
        ) : (
          <ThumbsUp
            size={20}
            fill={is_liked ? "currentColor" : "none"}
            className={is_popping ? "animate-pop" : ""}
          />
        )}
        <span className="text-sm font-medium">{current ? current.label : "Like"}</span>
      </button>

      <button onClick={on_open_likes} className="text-sm hover:underline">
        {likes_count}
      </button>
    </div>
  );
}