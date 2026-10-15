import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api_request } from "../lib/api";

const input_class =
  "w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-white outline-none focus:border-lime-400";

export default function SignUp() {
  const navigate = useNavigate();
  const [is_loading, set_is_loading] = useState(false);
  const [error_msg, set_error_msg] = useState("");

  async function handle_submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    set_is_loading(true);
    set_error_msg("");

    const form_data = new FormData(e.currentTarget);

    try {
      await api_request("/users/signup", {
        method: "POST",
        body: JSON.stringify({
          name: form_data.get("name"),
          email: form_data.get("email"),
          password: form_data.get("password"),
          rePassword: form_data.get("rePassword"),
          dateOfBirth: form_data.get("dateOfBirth"),
          gender: form_data.get("gender"),
        }),
      });
      navigate("/signin");
    } catch (err) {
      set_error_msg((err as Error).message);
    } finally {
      set_is_loading(false);
    }
  }

  return (
    <form onSubmit={handle_submit} className="grid gap-4">
      <h2 className="text-xl font-semibold text-white text-center">Create your account</h2>

      <input name="name" type="text" placeholder="Full name" className={input_class} required />
      <input name="email" type="email" placeholder="Email" className={input_class} required />
      <input name="password" type="password" placeholder="Password" className={input_class} required />
      <input name="rePassword" type="password" placeholder="Confirm password" className={input_class} required />
      <input name="dateOfBirth" type="date" className={input_class} required />
      <select name="gender" className={input_class} required defaultValue="">
        <option value="" disabled>Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <button
        type="submit"
        disabled={is_loading}
        className="rounded-xl bg-lime-400 py-3 font-semibold text-neutral-950 hover:bg-lime-300 disabled:opacity-60"
      >
        {is_loading ? "Creating..." : "Sign Up"}
      </button>

      {error_msg && <p className="text-center text-sm text-red-400">{error_msg}</p>}

      <p className="text-center text-sm text-neutral-400">
        Already have an account? <Link to="/signin" className="text-lime-400">Sign in</Link>
      </p>
    </form>
  );
}