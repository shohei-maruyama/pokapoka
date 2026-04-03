// ══════════════════════════════════════════════════════
// ぽかぽかノート 型定義
// Firebase移行時もこのファイルは変わらない
// ══════════════════════════════════════════════════════

export type RecordType =
  | "feeding"
  | "diaper"
  | "sleep"
  | "temperature"
  | "medicine"
  | "hospital"
  | "meal"
  | "growth_event"
  | "memo";

export interface RecordItem {
  id: string;
  familyId: string;
  childId: string;
  type: RecordType;
  datetime: string;   // ISO8601
  createdAt: string;  // ISO8601
  createdBy?: string;
  memo?: string;

  // feeding
  amount?: number;          // ml
  method?: "milk" | "breast" | "mixed" | "solids";
  side?: "left" | "right" | "both";
  duration?: number;        // 分

  // diaper
  diaperType?: "pee" | "poo" | "both";

  // sleep
  startTime?: string;       // ISO8601
  endTime?: string;         // ISO8601

  // temperature / medicine / hospital
  value?: number;           // ℃
  name?: string;            // 薬名
  hospital?: string;        // 病院名

  // meal
  food?: string;

  // growth_event
  eventType?: string;
}

export interface Baby {
  id: string;
  name: string;
  icon: string;
  color: string;
  birthDate: string;        // YYYY-MM-DD
  familyId: string;
}

export interface Family {
  id: string;
  name?: string;
  members?: string[];
}

export interface Milestone {
  name: string;
  achieved: boolean;
  date: string | null;
  babyId: string;
}

export interface GrowthRecord {
  id: string;
  babyId: string;
  date: string;
  weight?: string;
  height?: string;
}

export interface Vaccine {
  id: string;
  babyId: string;
  name: string;
  date: string;
  done: boolean;
  hospital?: string;
  memo?: string;
}
