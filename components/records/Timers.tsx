"use client";
import { useState, useEffect, useRef } from "react";
import { Btn } from "@/components/ui";
import { formatDuration, formatTime } from "@/lib/utils";

// ── 授乳タイマー ──────────────────────────────────────
export function FeedingTimer({ onSave, autoStart, babyColor }: {
  onSave: (d: { method: "breast"; side: string; duration: number; datetime: string; startTime: string }) => void;
  autoStart?: boolean;
  babyColor: string;
}) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [side,    setSide]    = useState("左");
  const [startTs, setStartTs] = useState<number | null>(null);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (autoStart) { setStartTs(Date.now()); setRunning(true); }
  }, [autoStart]);

  useEffect(() => {
    if (running) { ref.current = setInterval(() => setElapsed(e => e + 1), 1000); }
    else { if (ref.current) clearInterval(ref.current); }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  function save() {
    const now = new Date().toISOString();
    onSave({ method: "breast", side, duration: Math.floor(elapsed / 60), datetime: now, startTime: new Date(startTs!).toISOString() });
    setElapsed(0); setRunning(false); setStartTs(null);
  }
  const prog = Math.min((elapsed / 1200) * 100, 100);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-1.5 mb-3">
        <span>⏱️</span>
        <span className="font-bold text-sm" style={{ color: babyColor }}>授乳タイマー</span>
        {autoStart && running && (
          <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold" style={{ background: babyColor + "22", color: babyColor }}>NFC自動開始</span>
        )}
      </div>
      <div className="flex gap-2 justify-center mb-3">
        {["左","右","両方"].map(s => (
          <button key={s} onClick={() => setSide(s)}
            className="px-3 py-1.5 rounded-2xl text-sm cursor-pointer font-sans"
            style={{ border: `2px solid ${side === s ? babyColor : "#F0E6E6"}`, background: side === s ? babyColor + "22" : "white", color: side === s ? babyColor : "#9E8E8E", fontWeight: side === s ? 700 : 400 }}>
            {s}
          </button>
        ))}
      </div>
      <div className="text-center mb-3">
        <div className="text-5xl font-bold tracking-widest transition-colors" style={{ color: running ? babyColor : "#9E8E8E" }}>
          {formatDuration(elapsed)}
        </div>
        <div className="h-1 bg-border rounded-full mx-4 my-2 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${prog}%`, background: `linear-gradient(90deg,${babyColor},#FFCB77)` }} />
        </div>
        <div className="text-[10px] text-muted">目安: 10〜20分</div>
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        {!running && elapsed === 0 && <Btn label="▶ 開始" onClick={() => { setStartTs(Date.now()); setRunning(true); }} color={babyColor} />}
        {running  && <Btn label="⏸ 停止" onClick={() => setRunning(false)} color="#FFCB77" />}
        {!running && elapsed > 0 && (
          <>
            <Btn label="✓ 記録" onClick={save} color="#84C9A0" />
            <Btn label="▶ 再開" onClick={() => { setStartTs(Date.now()); setRunning(true); }}
              color={babyColor + "22"} style={{ color: babyColor, boxShadow: "none" }} />
            <Btn label="↺" variant="ghost" onClick={() => { setElapsed(0); setRunning(false); setStartTs(null); }} />
          </>
        )}
      </div>
    </div>
  );
}

// ── 睡眠タイマー ──────────────────────────────────────
export function SleepTimer({ onSave, autoStart }: {
  onSave: (d: { startTime: string; endTime: string; datetime: string }) => void;
  autoStart?: "start" | null;
}) {
  const [sleeping, setSleeping] = useState(false);
  const [startTs,  setStartTs]  = useState<number | null>(null);
  const [elapsed,  setElapsed]  = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (autoStart === "start") { setStartTs(Date.now()); setSleeping(true); setElapsed(0); }
  }, [autoStart]);

  useEffect(() => {
    if (sleeping) { ref.current = setInterval(() => setElapsed(e => e + 1), 1000); }
    else { if (ref.current) clearInterval(ref.current); }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [sleeping]);

  function wake() {
    setSleeping(false);
    const endTs = new Date().toISOString();
    onSave({ startTime: new Date(startTs!).toISOString(), endTime: endTs, datetime: endTs });
    setStartTs(null); setElapsed(0);
  }

  return (
    <div className="rounded-2xl p-4 transition-all duration-500"
      style={{ background: sleeping ? "linear-gradient(135deg,#1E1240,#3D2060)" : "white", boxShadow: sleeping ? "0 4px 24px rgba(60,20,120,0.3)" : "0 4px 16px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span>{sleeping ? "🌙" : "☀️"}</span>
        <span className="font-bold text-sm" style={{ color: sleeping ? "#DDD0FF" : "#C9A8E8" }}>
          {sleeping ? "おやすみ中..." : "睡眠タイマー"}
        </span>
      </div>
      {sleeping && (
        <div className="text-center mb-3">
          <div className="text-[11px] mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            {startTs ? formatTime(new Date(startTs).toISOString()) : ""} から
          </div>
          <div className="text-5xl font-bold tracking-widest" style={{ color: "#DDD0FF" }}>{formatDuration(elapsed)}</div>
        </div>
      )}
      <div className="text-center">
        {!sleeping
          ? <Btn label="🌙 寝かしつけ開始" onClick={() => { setStartTs(Date.now()); setSleeping(true); setElapsed(0); }} color="#C9A8E8" />
          : <button onClick={wake}
              className="px-6 py-2.5 rounded-3xl text-sm font-bold cursor-pointer font-sans"
              style={{ border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "white" }}>
              ☀️ 起きた！
            </button>
        }
      </div>
    </div>
  );
}
