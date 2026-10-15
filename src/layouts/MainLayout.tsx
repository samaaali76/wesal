import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, Bookmark, Home, User, LogOut } from "lucide-react";
import { api_request, remove_token, set_user_id } from "../lib/api";
import ServerStatus from "../components/ServerStatus";
import ThemeToggle from "../components/ThemeToggle";

type UserData = { _id?: string; name?: string; email?: string; photo?: string };

const nav_items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/bookmarks", label: "Saved", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: User },
];
function side_link_class({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
    isActive
      ? "bg-lime-400 font-semibold text-neutral-950"
      : "text-neutral-400 hover:bg-neutral-800"
  }`;
}
function read_count(data: unknown): number {
  if (typeof data === "number") return data;
  const obj = data as Record<string, unknown> | null;
  return Number(obj?.unreadCount ?? obj?.count ?? obj?.unread ?? 0) || 0;
}
function bottom_link_class({ isActive }: { isActive: boolean }) {
  return `relative flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
    isActive ? "text-lime-400" : "text-neutral-500"
  }`;
}

export default function MainLayout() {
  const navigate = useNavigate();
  const [user, set_user] = useState<UserData | null>(null);

    const location = useLocation();
  const [unread_count, set_unread_count] = useState(0);

  useEffect(() => {
    api_request<unknown>("/notifications/unread-count")
      .then((data) => set_unread_count(read_count(data)))
      .catch(() => set_unread_count(0));
  }, [location.pathname]);

  useEffect(() => {
    api_request<{ user: UserData }>("/users/profile-data")
            .then((data) => {
        if (data.user._id) set_user_id(data.user._id);
        set_user(data.user);
      })
      .catch(() => {
        remove_token();
        navigate("/signin");
      });
  }, [navigate]);

  function handle_logout() {
    remove_token();
    navigate("/signin");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-neutral-800 p-5 md:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
  <img src="/wesal-logo.png" alt="Wesal" className="h-10 w-10" />
  <h1 className="text-xl font-bold">Wesal</h1>
</div>

        <nav className="grid gap-2">
          {nav_items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={side_link_class}>
              <Icon size={20} />
              {label}
                            {to === "/notifications" && unread_count > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 text-xs text-white">
                  {unread_count}
                </span>
              )}

            </NavLink>
          ))}
        </nav>

        <div className="mt-auto grid gap-3">
                              <ServerStatus />
          <ThemeToggle show_label />

          <div className="flex items-center gap-3 rounded-2xl bg-neutral-900 p-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-lime-400 font-bold text-neutral-950">
              {user?.photo ? (
                <img src={user.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() ?? "?"
              )}
            </div>
            <p className="truncate text-sm">{user?.name ?? "..."}</p>
          </div>

          <button
            onClick={handle_logout}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-neutral-400 hover:bg-neutral-800"
          >
            <LogOut size={20} />
            Log out
          </button>
        </div>
      </aside>

      {/* Bottom bar - mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-neutral-800 bg-neutral-950 md:hidden">
        {nav_items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"} className={bottom_link_class}>
            <Icon size={22} />
                        {to === "/notifications" && unread_count > 0 && (
              <span className="absolute top-1 ml-5 rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                {unread_count}
              </span>
            )}
            {label}
          </NavLink>
        ))}
        <button onClick={handle_logout} className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-neutral-500">
          <LogOut size={22} />
          Log out
        </button>
      </nav>
            <div className="fixed right-3 top-3 z-10 md:hidden">
        <ThemeToggle />
      </div>

                <main className="mx-auto max-w-2xl p-4 pt-16 pb-24 md:ml-64 md:max-w-none md:px-10 md:pt-10 md:pb-10">
        <div className="mx-auto max-w-2xl">
                 {user ? (
            <div key={location.pathname} className="animate-fade-in">
              <Outlet />
            </div>
          ) : (
            <p className="text-neutral-500">Loading...</p>
          )}
        </div>
      </main>
    </div>
  );
}