/** Format a date to a readable string */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  }).format(new Date(date));
}

/** Format relative time (e.g. "3 days ago") */
export function formatRelative(date: Date | string): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diff = (new Date(date).getTime() - Date.now()) / 1000;

  if (Math.abs(diff) < 60)        return rtf.format(Math.round(diff),        "second");
  if (Math.abs(diff) < 3600)      return rtf.format(Math.round(diff / 60),   "minute");
  if (Math.abs(diff) < 86400)     return rtf.format(Math.round(diff / 3600), "hour");
  if (Math.abs(diff) < 2592000)   return rtf.format(Math.round(diff / 86400),"day");
  return formatDate(date);
}

/** Capitalise first letter */
export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Format temperature */
export function formatTemp(celsius: number, unit: "C" | "F" = "C"): string {
  if (unit === "F") return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  return `${Math.round(celsius)}°C`;
}

/** Truncate text */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "…";
}

/** Format file size */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k    = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i    = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
