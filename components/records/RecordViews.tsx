"use client";
import { useState } from "react";
import type { RecordItem, Baby } from "@/types";
import { Btn, Empty, Input, Label } from "@/components/ui";
import { FeedingTimer, SleepTimer } from "./Timers";
import { filterRecords, isToday, formatTime, formatDate, formatMs } from "@/lib/utils";

interface BaseProps {
  records: RecordItem[];
  baby: Baby | undefined;
  addRec: (type: RecordItem["type"], childId: string, payload: Partial<RecordItem>) => RecordItem;
}

// ── 授乳 ─────────────────────────────────────────────
export function FeedingView({ records, baby, addRec, autoStart }: BaseProps & { autoStart?: boolean }) {
  const bid   = baby?.id ?? "1";
  const bFeed = filterRecords(records, "feeding", bid);
  const [showForm, setShowForm] = useState(false);
  const [fType,    setFType]    = useState<"milk"|"breast"|"mixed"|"solids">("milk");
  const [fAmt,     setFAmt]     = useState("120");

  const methodLabel = (m?: string) => m === "milk" ? "ミルク" : m === "breast" ? "母乳" : m === "mixed" ? "混合" : "離乳食";

  function submit() {
    addRec("feeding", bid, { method: fType, amount: fType !== "breast" ? Number(fAmt) : undefined, datetime: new Date().toISOString() });
    setShowForm(false);
  }

  return (
    <>
      <h2 className="m-0 text-base font-bold" style={{ color: baby?.color ?? "#FF8FAB" }}>🍼 授乳・ミルク記録</h2>
      <FeedingTimer
        onSave={d => addRec("feeding", bid, { ...d })}
        autoStart={autoStart}
        babyColor={baby?.color ?? "#FF8FAB"}
      />
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-muted font-semibold">手動で記録</span>
        <Btn label="+ 記録" onClick={() => setShowForm(!showForm)} color={baby?.color ?? "#FF8FAB"} className="mt-0 py-1.5 px-3.5" />
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-slide-down">
          <Label>種別</Label>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {(["milk","breast","mixed","solids"] as const).map(t => (
              <button key={t} onClick={() => setFType(t)}
                className="px-3 py-1.5 rounded-2xl text-xs cursor-pointer font-sans"
                style={{ border: `2px solid ${fType === t ? (baby?.color ?? "#FF8FAB") : "#F0E6E6"}`, background: fType === t ? (baby?.color ?? "#FF8FAB") + "22" : "white", fontWeight: fType === t ? 700 : 400 }}>
                {methodLabel(t)}
              </button>
            ))}
          </div>
          {(fType === "milk" || fType === "mixed") && (
            <>
              <Label>量 (ml)</Label>
              <div className="flex gap-1.5 flex-wrap mb-2">
                {["60","80","100","120","140","160","180","200"].map(v => (
                  <button key={v} onClick={() => setFAmt(v)}
                    className="px-2.5 py-1.5 rounded-xl text-xs cursor-pointer font-sans"
                    style={{ border: `2px solid ${fAmt === v ? (baby?.color ?? "#FF8FAB") : "#F0E6E6"}`, background: fAmt === v ? (baby?.color ?? "#FF8FAB") + "22" : "white", fontWeight: fAmt === v ? 700 : 400 }}>
                    {v}
                  </button>
                ))}
              </div>
              <Input type="number" value={fAmt} onChange={e => setFAmt(e.target.value)} placeholder="その他" className="mb-2.5" />
            </>
          )}
          <div className="flex gap-2">
            <Btn label="記録する" onClick={submit} color={baby?.color ?? "#FF8FAB"} className="flex-1" />
            <Btn label="✕" variant="ghost" onClick={() => setShowForm(false)} />
          </div>
        </div>
      )}
      {bFeed.length === 0 ? <Empty icon="🍼" text="まだ記録がありません" /> :
        [...bFeed].reverse().slice(0, 30).map(f => (
          <div key={f.id} className="bg-white rounded-2xl px-3.5 py-2.5 shadow-sm flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "#FFD6E0" }}>
              {f.method === "solids" ? "🥣" : "🍼"}
            </div>
            <div className="flex-1">
              <div className="font-bold text-xs">{methodLabel(f.method)}{f.side ? ` (${f.side})` : ""}{f.amount ? ` / ${f.amount}ml` : ""}</div>
              {f.duration ? <div className="text-[10px] text-muted">{f.duration}分</div> : null}
            </div>
            <div className="text-[11px] text-muted">{formatDate(f.datetime)} {formatTime(f.datetime)}</div>
          </div>
        ))}
    </>
  );
}

// ── おむつ ───────────────────────────────────────────
export function DiaperView({ records, baby, addRec }: BaseProps) {
  const bid   = baby?.id ?? "1";
  const bDiap = filterRecords(records, "diaper", bid);
  const tDiap = bDiap.filter(d => isToday(d.datetime));

  function add(type: "pee"|"poo"|"both") {
    addRec("diaper", bid, { diaperType: type, datetime: new Date().toISOString() });
  }
  const dLabel = (t?: string) => t === "pee" ? "おしっこ" : t === "poo" ? "うんち" : "両方";
  const dIcon  = (t?: string) => t === "pee" ? "💛" : t === "poo" ? "💩" : "💛💩";

  return (
    <>
      <h2 className="m-0 text-base font-bold text-accent">👶 おむつ交換</h2>
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-[11px] font-bold text-muted mb-2.5 text-center">タップして記録</div>
        <div className="grid grid-cols-3 gap-2.5">
          {[{t:"pee" as const,i:"💛",bg:"#FFFDE7",bd:"#FFD54F",l:"おしっこ"},
            {t:"poo" as const,i:"💩",bg:"#FFF3E0",bd:"#FFAB40",l:"うんち"},
            {t:"both" as const,i:"💛💩",bg:"#F3E5F5",bd:"#CE93D8",l:"両方"}].map(d => (
            <button key={d.t} onClick={() => add(d.t)}
              className="py-3 rounded-2xl text-center cursor-pointer font-sans"
              style={{ border: `2px solid ${d.bd}`, background: d.bg }}>
              <div className="text-2xl mb-1">{d.i}</div>
              <div className="text-[11px] font-bold">{d.l}</div>
            </button>
          ))}
        </div>
        <div className="text-center mt-2.5 py-2 rounded-xl" style={{ background: "#FFF0C4" }}>
          <span className="text-xs">今日 <strong className="text-lg text-accent">{tDiap.length}</strong> 回</span>
        </div>
      </div>
      {bDiap.length === 0 ? <Empty icon="👶" text="まだ記録がありません" /> :
        [...bDiap].reverse().slice(0, 30).map(d => (
          <div key={d.id} className="bg-white rounded-2xl px-3.5 py-2.5 shadow-sm flex items-center gap-2.5">
            <span className="text-2xl">{dIcon(d.diaperType)}</span>
            <div className="flex-1 font-semibold text-xs">{dLabel(d.diaperType)}</div>
            <div className="text-[11px] text-muted">{formatDate(d.datetime)} {formatTime(d.datetime)}</div>
          </div>
        ))}
    </>
  );
}

// ── 睡眠 ─────────────────────────────────────────────
export function SleepView({ records, baby, addRec, autoStart }: BaseProps & { autoStart?: "start" | null }) {
  const bid    = baby?.id ?? "1";
  const bSleep = filterRecords(records, "sleep", bid);
  const tSleepMs = bSleep
    .filter(s => isToday(s.datetime) && s.startTime && s.endTime)
    .reduce((a, s) => a + (new Date(s.endTime!).getTime() - new Date(s.startTime!).getTime()), 0);

  const [showManual, setShowManual] = useState(false);
  const [manStart,   setManStart]   = useState("");
  const [manEnd,     setManEnd]     = useState("");

  function addManual() {
    if (!manStart || !manEnd) return;
    const s = new Date(manStart).getTime(), e = new Date(manEnd).getTime();
    if (e <= s) return;
    addRec("sleep", bid, { startTime: new Date(s).toISOString(), endTime: new Date(e).toISOString(), datetime: new Date(e).toISOString() });
    setManStart(""); setManEnd(""); setShowManual(false);
  }

  return (
    <>
      <h2 className="m-0 text-base font-bold text-purple">🌙 睡眠記録</h2>
      {tSleepMs > 0 && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg,#1E1240,#3D2060)" }}>
          <span className="text-2xl">😴</span>
          <div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>今日の合計睡眠</div>
            <div className="text-xl font-bold" style={{ color: "#DDD0FF" }}>{formatMs(tSleepMs)}</div>
          </div>
        </div>
      )}
      <SleepTimer onSave={d => addRec("sleep", bid, { ...d })} autoStart={autoStart} />
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-muted font-semibold">手動で記録</span>
        <Btn label="+ 追加" onClick={() => setShowManual(!showManual)} color="#C9A8E8" className="mt-0 py-1.5 px-3.5" />
      </div>
      {showManual && (
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-slide-down">
          <div className="flex gap-2.5 mb-2.5">
            <div className="flex-1"><Label>寝た時間</Label><Input type="datetime-local" value={manStart} onChange={e => setManStart(e.target.value)} /></div>
            <div className="flex-1"><Label>起きた時間</Label><Input type="datetime-local" value={manEnd} onChange={e => setManEnd(e.target.value)} /></div>
          </div>
          <div className="flex gap-2">
            <Btn label="記録する" onClick={addManual} color="#C9A8E8" className="flex-1" />
            <Btn label="✕" variant="ghost" onClick={() => setShowManual(false)} />
          </div>
        </div>
      )}
      {bSleep.length === 0 ? <Empty icon="🌙" text="まだ記録がありません" /> :
        [...bSleep].reverse().slice(0, 20).map(s => (
          <div key={s.id} className="bg-white rounded-2xl px-3.5 py-2.5 shadow-sm flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "#EDE0F7" }}>🌙</div>
            <div className="flex-1">
              <div className="font-bold text-xs">
                {s.startTime && s.endTime ? formatMs(new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) : "—"}
              </div>
              <div className="text-[10px] text-muted">
                {s.startTime ? formatTime(s.startTime) : "—"} 〜 {s.endTime ? formatTime(s.endTime) : "—"}
              </div>
            </div>
          </div>
        ))}
    </>
  );
}

// ── 離乳食 ───────────────────────────────────────────
export function MealView({ records, baby, addRec, ageMonths }: BaseProps & { ageMonths: number }) {
  const bid   = baby?.id ?? "1";
  const bMeal = filterRecords(records, "meal", bid);
  const [showForm, setShowForm] = useState(false);
  const [food,     setFood]     = useState("");

  return (
    <>
      <h2 className="m-0 text-base font-bold text-green">🥣 離乳食記録</h2>
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-muted font-semibold">{ageMonths}か月</span>
        <Btn label="+ 記録" onClick={() => setShowForm(!showForm)} color="#84C9A0" className="mt-0 py-1.5 px-3.5" />
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-slide-down">
          <Label>メモ（食材・量など）</Label>
          <Input value={food} onChange={e => setFood(e.target.value)} placeholder="例: おかゆ小さじ3、にんじんペースト" className="mb-2.5" />
          <div className="flex gap-2">
            <Btn label="記録する" onClick={() => { addRec("meal", bid, { food, datetime: new Date().toISOString() }); setFood(""); setShowForm(false); }} color="#84C9A0" className="flex-1" />
            <Btn label="✕" variant="ghost" onClick={() => setShowForm(false)} />
          </div>
        </div>
      )}
      {bMeal.length === 0 ? <Empty icon="🥣" text="離乳食の記録を残しましょう" /> :
        [...bMeal].reverse().map(m => (
          <div key={m.id} className="bg-white rounded-2xl px-3.5 py-2.5 shadow-sm flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "#D4F0E0" }}>🥣</div>
            <div className="flex-1 font-bold text-xs">{m.food || "離乳食"}</div>
            <div className="text-[11px] text-muted">{formatDate(m.datetime)} {formatTime(m.datetime)}</div>
          </div>
        ))}
    </>
  );
}
