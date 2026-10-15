import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api_request, set_token } from "../lib/api";

const input_class =
  "w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-white outline-none focus:border-lime-400";

export default function SignIn() {
  const navigate = useNavigate();
  const [is_loading, set_is_loading] = useState(false);
  const [error_msg, set_error_msg] = useState("");

  async function handle_submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    set_is_loading(true);
    set_error_msg("");

    const form_data = new FormData(e.currentTarget);

    try {
      const data = await api_request<{ token: string }>("/users/signin", {
        method: "POST",
        body: JSON.stringify({
          email: form_data.get("email"),
          password: form_data.get("password"),
        }),
      });
      set_token(data.token);
      navigate("/");
    } catch (err) {
      set_error_msg((err as Error).message);
    } finally {
      set_is_loading(false);
    }
  }

  return (
    <form onSubmit={handle_submit} className="grid gap-4">
      <h2 className="text-xl font-semibold text-white text-center">Welcome back</h2>

      <input name="email" type="email" placeholder="Email" className={input_class} required />
      <input name="password" type="password" placeholder="Password" className={input_class} required />

      <button
        type="submit"
        disabled={is_loading}
        className="rounded-xl bg-lime-400 py-3 font-semibold text-neutral-950 hover:bg-lime-300 disabled:opacity-60"
      >
        {is_loading ? "Signing in..." : "Sign In"}
      </button>

      {error_msg && <p className="text-center text-sm text-red-400">{error_msg}</p>}

      <p className="text-center text-sm text-neutral-400">
        New here? <Link to="/signup" className="text-lime-400">Create account</Link>
      </p>
    </form>
  );
}