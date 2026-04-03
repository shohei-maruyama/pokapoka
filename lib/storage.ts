// ══════════════════════════════════════════════════════
// lib/storage.ts  — 永続化レイヤー
//
// 現在: localStorage
// Firebase移行時: このファイルだけ差し替える
// インターフェースは変えない
// ══════════════════════════════════════════════════════

import type { RecordItem, Baby, Milestone, GrowthRecord, Vaccine } from "@/types";

const FAMILY_ID = "default"; // Firebase移行後は認証から取得

function key(name: string) {
  return `pokapoka_${name}_${FAMILY_ID}`;
}

function load<T>(name: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key(name));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (e) {
    console.warn(`[storage] load failed: ${name}`, e);
    return fallback;
  }
}

function save<T>(name: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
  } catch (e) {
    console.error(`[storage] save failed: ${name}`, e);
  }
}

// ── records ──────────────────────────────────────────
export function loadRecords(): RecordItem[] {
  return load<RecordItem[]>("records", []);
}
export function saveRecords(records: RecordItem[]): void {
  save("records", records);
}
export function addRecord(record: RecordItem): void {
  const records = loadRecords();
  save("records", [...records, record]);
}
export function deleteRecord(id: string): void {
  const records = loadRecords().filter((r) => r.id !== id);
  save("records", records);
}

// ── babies ───────────────────────────────────────────
export function loadBabies(): Baby[] {
  return load<Baby[]>("babies", [
    { id: "1", name: "赤ちゃん", icon: "🍀", color: "#FF8FAB", birthDate: "", familyId: FAMILY_ID },
  ]);
}
export function saveBabies(babies: Baby[]): void {
  save("babies", babies);
}

// ── milestones ───────────────────────────────────────
export function loadMilestones(): Milestone[] {
  return load<Milestone[]>("milestones", []);
}
export function saveMilestones(milestones: Milestone[]): void {
  save("milestones", milestones);
}

// ── growths ──────────────────────────────────────────
export function loadGrowths(): GrowthRecord[] {
  return load<GrowthRecord[]>("growths", []);
}
export function saveGrowths(growths: GrowthRecord[]): void {
  save("growths", growths);
}

// ── vaccines ─────────────────────────────────────────
export function loadVaccines(): Vaccine[] {
  return load<Vaccine[]>("vaccines", [
    { id: "v1", babyId: "1", name: "BCG", date: "2025-03-15", done: false, hospital: "〇〇小児科" },
    { id: "v2", babyId: "1", name: "ロタウイルス", date: "2025-04-10", done: false },
  ]);
}
export function saveVaccines(vaccines: Vaccine[]): void {
  save("vaccines", vaccines);
}

// ── selected baby ────────────────────────────────────
export function loadSelectedBabyId(): string {
  return load<string>("selBabyId", "1");
}
export function saveSelectedBabyId(id: string): void {
  save("selBabyId", id);
}

// ── backup / clear ───────────────────────────────────
export function exportBackup(): string {
  return JSON.stringify({
    records:    loadRecords(),
    babies:     loadBabies(),
    milestones: loadMilestones(),
    growths:    loadGrowths(),
    vaccines:   loadVaccines(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}
export function clearAll(): void {
  ["records", "babies", "milestones", "growths", "vaccines", "selBabyId"].forEach((n) => {
    if (typeof window !== "undefined") localStorage.removeItem(key(n));
  });
}
