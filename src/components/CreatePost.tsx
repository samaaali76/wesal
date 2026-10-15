import { useState } from "react";
import { api_request } from "../lib/api";

export default function CreatePost({ on_created }: { on_created: () => void }) {
  const [is_loading, set_is_loading] = useState(false);
  const [error_msg, set_error_msg] = useState("");

  async function handle_submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const form_data = new FormData(form);

    const image = form_data.get("image") as File;
    if (!image || image.size === 0) form_data.delete("image");

    set_is_loading(true);
    set_error_msg("");

    try {
      await api_request("/posts", { method: "POST", body: form_data });
      form.reset();
      on_created();
    } catch (err) {
      set_error_msg((err as Error).message);
    } finally {
      set_is_loading(false);
    }
  }

  return (
    <form
      onSubmit={handle_submit}
      className="grid gap-3 rounded-3xl border border-neutral-800 bg-neutral-900 p-5"
    >
      <textarea
        name="body"
        rows={3}
        placeholder="What's on your mind?"
        className="w-full resize-none rounded-2xl bg-neutral-800 p-4 text-white outline-none focus:ring-1 focus:ring-lime-400"
      />

      <div className="flex items-center justify-between gap-3">
        <input
          name="image"
          type="file"
          accept="image/*"
          className="text-sm text-neutral-400 file:mr-3 file:rounded-xl file:border-0 file:bg-neutral-800 file:px-4 file:py-2 file:text-white"
        />
        <button
          type="submit"
          disabled={is_loading}
          className="rounded-xl bg-lime-400 px-6 py-2 font-semibold text-neutral-950 hover:bg-lime-300 disabled:opacity-60"
        >
          {is_loading ? "Posting..." : "Post"}
        </button>
      </div>

      {error_msg && <p className="text-sm text-red-400">{error_msg}</p>}
    </form>
  );
}