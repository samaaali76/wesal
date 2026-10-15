import { useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

function get_theme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export default function ThemeToggle({ show_label = false }: { show_label?: boolean }) {
  const [theme, set_theme] = useState<Theme>(get_theme);

  function handle_toggle() {
    const next_theme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next_theme);

    try {
      localStorage.setItem("wesal_theme", next_theme);
    } catch {
      
    }

    set_theme(next_theme);
  }

  const next_label = theme === "dark" ? "Light mode" : "Dark mode";
  const Icon = theme === "dark" ? Sun : Moon;

  if (show_label) {
    return (
      <button
        onClick={handle_toggle}
        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-neutral-400 hover:bg-neutral-800"
      >
        <Icon size={20} />
        {next_label}
      </button>
    );
  }

  return (
    <button
      onClick={handle_toggle}
      aria-label={next_label}
      title={next_label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-lime-400"
    >
      <Icon size={18} />
    </button>
  );
}