const base_url = import.meta.env.VITE_API_BASE_URL;
const token_key = "wesal_token";
const user_id_key = "wesal_user_id";

export function get_token() {
  return localStorage.getItem(token_key);
}

export function set_token(token: string) {
  localStorage.setItem(token_key, token);
}

export function remove_token() {
  localStorage.removeItem(token_key);
}

export function get_user_id() {
  return localStorage.getItem(user_id_key);
}

export function set_user_id(id: string) {
  localStorage.setItem(user_id_key, id);
}

function strip_default_photos(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(strip_default_photos);

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(value)) {
      const is_default_photo =
        key === "photo" && typeof val === "string" && val.includes("default-profile");
      if (is_default_photo) continue;

      result[key] = strip_default_photos(val);
    }
    return result;
  }

  return value;
}

export async function api_request<T>(path: string, options: RequestInit = {}) {
  const token = get_token();
  const is_form_data = options.body instanceof FormData;

  const res = await fetch(`${base_url}${path}`, {
    ...options,
    headers: {
      ...(is_form_data ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new Error(json.errors?.[0] ?? json.message ?? "Something went wrong");
  }

  return strip_default_photos(json.data) as T;
}