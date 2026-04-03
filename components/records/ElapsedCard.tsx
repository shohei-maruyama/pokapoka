"use client";
import { useState, useEffect } from "react";
import { formatTime } from "@/lib/utils";

export function ElapsedCard({ icon, label, lastDatetime, color, colorL, onClick, sub }: {
  icon: string;
  label: string;
  lastDatetime?: string;
  color: string;
  colorL: string;
  onClick: () => void;
  sub?: string;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const min  = lastDatetime ? Math.floor((now - new Date(lastDatetime).getTime()) / 60000) : null;
  const h    = min !== null ? Math.floor(min / 60) : null;
  const m    = min !== null ? min % 60 : null;
  const warn = min !== null && min > 180;

  return (
    <button onClick={onClick}
      className="rounded-2xl p-4 w-full text-left cursor-pointer transition-all"
      style={{
        background: warn ? "#FFE0E0" : colorL,
        border: `2px solid ${warn ? "#FF6B6B" : color}22`,
        boxShadow: `0 4px 16px ${color}22`,
      }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-bold text-[#4A3F3F]">{label}</span>
        </div>
        {warn && (
          <span className="text-[10px] bg-[#FF6B6B] text-white px-2 py-0.5 rounded-lg font-bold">要確認</span>
        )}
      </div>
      {lastDatetime ? (
        <>
          <div className="text-[32px] font-extrabold leading-none mb-1"
            style={{ color: warn ? "#FF6B6B" : color }}>
            {h && h > 0 ? `${h}時間` : ""}{m}分
            <span className="text-base font-medium">前</span>
          </div>
          <div className="text-[11px] text-muted">
            {formatTime(lastDatetime)} 記録{sub ? ` • ${sub}` : ""}
          </div>
        </>
      ) : (
        <>
          <div className="text-xl font-bold text-muted mb-1">未記録</div>
          <div className="text-[11px] text-muted">タップして記録</div>
        </>
      )}
    </button>
  );
}
