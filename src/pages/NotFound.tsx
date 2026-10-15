import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-white">
      <p className="text-6xl font-bold text-lime-400">404</p>
      <p className="text-neutral-400">This page doesn't exist.</p>
      <Link to="/" className="rounded-xl bg-lime-400 px-6 py-2 font-semibold text-neutral-950">
        Back to home
      </Link>
    </div>
  );
}