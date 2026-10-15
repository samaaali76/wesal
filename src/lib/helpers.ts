export function extract_list<T>(data: unknown, keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  const obj = (data ?? {}) as Record<string, unknown>;

  for (const key of keys) {
    if (Array.isArray(obj[key])) return obj[key] as T[];
  }

  const first_array = Object.values(obj).find((value) => Array.isArray(value));
  return (first_array as T[]) ?? [];
}