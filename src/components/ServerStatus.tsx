import { useEffect, useState } from "react";

const base_url = import.meta.env.VITE_API_BASE_URL;

export default function ServerStatus() {
  const [is_online, set_is_online] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${base_url}/`)
      .then((res) => set_is_online(res.ok))
      .catch(() => set_is_online(false));
  }, []);

  const color = is_online === null ? "bg-neutral-600" : is_online ? "bg-green-400" : "bg-red-500";
  const label = is_online === null ? "Checking..." : is_online ? "Server online" : "Server offline";

  return (
    <div className="flex items-center gap-2 px-4 text-xs text-neutral-500">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}