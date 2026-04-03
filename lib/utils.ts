import type { RecordItem } from "@/types";

export function calcAgeMonths(birthDate: string): number {
  if (!birthDate) return 0;
  const b = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

export function formatElapsed(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}日${h % 24}時間前`;
  if (h > 0) return `${h}時間${m % 60}分前`;
  if (m > 0) return `${m}分前`;
  return "たった今";
}

export function elapsedMinutes(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

export function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function dateKey(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP");
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatMs(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}時間${m}分` : `${m}分`;
}

// 月齢に応じたホーム表示項目
export function getHomeItems(ageMonths: number): string[] {
  if (ageMonths <= 3)  return ["feeding", "diaper", "sleep", "temperature"];
  if (ageMonths <= 6)  return ["feeding", "diaper", "sleep", "meal", "temperature"];
  if (ageMonths <= 9)  return ["meal", "feeding", "sleep", "diaper", "temperature"];
  return ["meal", "sleep", "feeding", "temperature"];
}

// 直近N件のrecordをtype・babyIdでフィルタ
export function filterRecords(
  records: RecordItem[],
  type: RecordItem["type"],
  babyId: string
): RecordItem[] {
  return records.filter((r) => r.type === type && r.childId === babyId);
}
