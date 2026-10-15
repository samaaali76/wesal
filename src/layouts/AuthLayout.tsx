import { Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
        <div className="mb-6 flex flex-col items-center gap-2">
          <img src="/wesal-logo.png" alt="Wesal" className="h-20 w-20" />
          <h1 className="text-2xl font-bold">
            Wesal <span className="text-gold">| وصال</span>
          </h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
}