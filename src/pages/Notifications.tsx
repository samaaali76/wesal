import { useCallback, useEffect, useState } from "react";
import { api_request } from "../lib/api";

type Sender = { name?: string; photo?: string };

type NotificationData = {
  _id: string;
  type?: string;
  message?: string;
  content?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
  sender?: Sender;
  actor?: Sender;
  from?: Sender;
};

function extract_notifications(data: unknown): NotificationData[] {
  if (Array.isArray(data)) return data;
  const obj = data as { notifications?: NotificationData[] } | null;
  return obj?.notifications ?? [];
}

export default function Notifications() {
  const [items, set_items] = useState<NotificationData[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [error_msg, set_error_msg] = useState("");

  const load_notifications = useCallback(async () => {
    try {
      const data = await api_request<unknown>("/notifications?unread=false&page=1&limit=20");
      console.log("notifications data:", JSON.stringify(data, null, 2));
      set_items(extract_notifications(data));
    } catch (err) {
      set_error_msg((err as Error).message);
    } finally {
      set_is_loading(false);
    }
  }, []);

  useEffect(() => {
    load_notifications();
  }, [load_notifications]);

  async function handle_mark_one(id: string) {
    try {
      await api_request(`/notifications/${id}/read`, { method: "PATCH" });
      await load_notifications();
    } catch (err) {
      set_error_msg((err as Error).message);
    }
  }

  async function handle_mark_all() {
    try {
      await api_request("/notifications/read-all", { method: "PATCH" });
      await load_notifications();
    } catch (err) {
      set_error_msg((err as Error).message);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <button
          onClick={handle_mark_all}
          className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:border-lime-400 hover:text-lime-400"
        >
          Mark all as read
        </button>
      </div>

      {is_loading && <p className="text-neutral-500">Loading...</p>}
      {error_msg && <p className="text-red-400">{error_msg}</p>}
      {!is_loading && items.length === 0 && !error_msg && (
        <p className="text-neutral-500">No notifications yet.</p>
      )}

      {items.map((item) => {
        const sender = item.sender ?? item.actor ?? item.from;
        const is_read = item.isRead ?? item.read ?? false;

        return (
          <button
            key={item._id}
            onClick={() => handle_mark_one(item._id)}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${
              is_read
                ? "border-neutral-800 bg-neutral-900"
                : "border-lime-400/50 bg-neutral-800"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-lime-400 font-bold text-neutral-950">
              {sender?.photo ? (
                <img src={sender.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                (sender?.name?.[0] ?? "?").toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm">
                <span className="font-semibold">{sender?.name ?? ""}</span>{" "}
                {item.message ?? item.content ?? item.type}
              </p>
              {item.createdAt && (
                <p className="text-xs text-neutral-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}