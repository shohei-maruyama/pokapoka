"use client";
import { useState } from "react";
import type { RecordItem, Baby, Vaccine } from "@/types";
import { Card, Btn } from "@/components/ui";
import { ElapsedCard } from "./ElapsedCard";
import { filterRecords, isToday, formatMs } from "@/lib/utils";

interface Props {
  records: RecordItem[];
  baby: Baby | undefined;
  ageMonths: number;
  vaccines: Vaccine[];
  onTabChange: (t: string) => void;
}

export function TodayView({ records, baby, ageMonths, vaccines, onTabChange }: Props) {
  const bid    = baby?.id ?? "1";
  const bFeed  = filterRecords(records, "feeding",     bid);
  const bDiap  = filterRecords(records, "diaper",      bid);
  const bSleep = filterRecords(records, "sleep",       bid);
  const bTemp  = filterRecords(records, "temperature", bid);
  const bMeal  = filterRecords(records, "meal",        bid);

  const tFeed    = bFeed.filter(f => isToday(f.datetime));
  const tDiap    = bDiap.filter(d => isToday(d.datetime));
  const tSleepMs = bSleep
    .filter(s => isToday(s.datetime) && s.startTime && s.endTime)
    .reduce((a, s) => a + (new Date(s.endTime!).getTime() - new Date(s.startTime!).getTime()), 0);

  const lastF = bFeed[bFeed.length - 1];
  const lastD = bDiap[bDiap.length - 1];
  const lastS = bSleep[bSleep.length - 1];
  const lastT = bTemp[bTemp.length - 1];
  const lastM = bMeal[bMeal.length - 1];

  const upcomingVax = vaccines.filter(v => v.babyId === bid && !v.done).slice(0, 2);

  const homeItems = ageMonths <= 3
    ? ["feeding","diaper","sleep","temperature"]
    : ageMonths <= 6
    ? ["feeding","diaper","sleep","meal","temperature"]
    : ageMonths <= 9
    ? ["meal","feeding","sleep","diaper","temperature"]
    : ["meal","sleep","feeding","temperature"];

  const [routines, setRoutines] = useState([
    { id: "bath",  label: "お風呂",   icon: "🛁", done: false },
    { id: "walk",  label: "お散歩",   icon: "🌸", done: false },
    { id: "check", label: "体重測定", icon: "⚖️", done: false },
  ]);

  return (
    <>
      {/* 今日のサマリー */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: "🍼", label: "授乳",   val: `${tFeed.length}回`,                        bg: "#FFD6E0" },
          { icon: "👶", label: "おむつ", val: `${tDiap.length}回`,                        bg: "#FFF0C4" },
          { icon: "🌙", label: "睡眠",   val: tSleepMs > 0 ? formatMs(tSleepMs) : "—",   bg: "#EDE0F7" },
        ].map(x => (
          <div key={x.label} className="rounded-2xl p-3 text-center" style={{ background: x.bg }}>
            <div className="text-lg">{x.icon}</div>
            <div className="text-base font-bold mt-0.5">{x.val}</div>
            <div className="text-[10px] text-muted">{x.label}</div>
          </div>
        ))}
      </div>

      {/* 経過時間カード（月齢別） */}
      {homeItems.includes("feeding") && (
        <ElapsedCard icon="🍼" label={ageMonths <= 3 ? "授乳・ミルク" : "授乳"}
          lastDatetime={lastF?.datetime}
          color={baby?.color ?? "#FF8FAB"} colorL={(baby?.color ?? "#FF8FAB") + "22"}
          onClick={() => onTabChange("feeding")}
          sub={lastF ? (lastF.method === "milk" ? `ミルク${lastF.amount ? ` ${lastF.amount}ml` : ""}` : "母乳") : undefined} />
      )}
      {homeItems.includes("diaper") && (
        <ElapsedCard icon="👶" label="おむつ交換"
          lastDatetime={lastD?.datetime}
          color="#FFCB77" colorL="#FFF0C4"
          onClick={() => onTabChange("diaper")}
          sub={lastD?.diaperType === "pee" ? "おしっこ" : lastD?.diaperType === "poo" ? "うんち" : lastD?.diaperType === "both" ? "両方" : undefined} />
      )}
      {homeItems.includes("sleep") && (
        <ElapsedCard icon="🌙" label="睡眠"
          lastDatetime={lastS?.datetime}
          color="#C9A8E8" colorL="#EDE0F7"
          onClick={() => onTabChange("sleep")}
          sub={tSleepMs > 0 ? `今日 ${formatMs(tSleepMs)}` : undefined} />
      )}
      {homeItems.includes("temperature") && (
        <ElapsedCard icon="🌡️" label="体温"
          lastDatetime={lastT?.datetime}
          color="#FF9A5C" colorL="#FFE8D6"
          onClick={() => onTabChange("health")}
          sub={lastT?.value ? `${lastT.value}℃` : undefined} />
      )}
      {homeItems.includes("meal") && (
        <ElapsedCard icon="🥣" label="離乳食"
          lastDatetime={lastM?.datetime}
          color="#84C9A0" colorL="#D4F0E0"
          onClick={() => onTabChange("meal")} />
      )}

      {/* ルーティン */}
      <Card icon="📋" title={`ルーティン (${routines.filter(r => r.done).length}/${routines.length})`} bg="#D4F0E0">
        <div className="flex flex-wrap gap-2 mt-1">
          {routines.map(r => (
            <button key={r.id}
              onClick={() => setRoutines(routines.map(x => x.id === r.id ? { ...x, done: !x.done } : x))}
              className="px-3 py-1.5 rounded-full text-sm cursor-pointer font-sans transition-all border-none"
              style={{ background: r.done ? "#84C9A0" : "white", color: r.done ? "white" : "#4A3F3F", fontWeight: r.done ? 700 : 400, boxShadow: r.done ? "none" : "0 2px 6px rgba(0,0,0,0.08)" }}>
              {r.icon} {r.label} {r.done ? "✓" : ""}
            </button>
          ))}
        </div>
      </Card>

      {/* 次の予防接種 */}
      {upcomingVax.length > 0 && (
        <Card icon="💉" title="次の予防接種" bg="#D6EEF7">
          {upcomingVax.map(v => (
            <div key={v.id} className="flex justify-between py-2 border-b border-border last:border-0">
              <div>
                <div className="font-bold text-sm">{v.name}</div>
                <div className="text-[11px] text-muted">{v.date}{v.hospital ? ` • ${v.hospital}` : ""}</div>
              </div>
              <span className="text-lg">📅</span>
            </div>
          ))}
        </Card>
      )}

      {/* NFCバナー */}
      <div className="rounded-2xl p-3.5 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)" }}>
        <div>
          <div className="text-white font-bold text-sm">📡 NFCタグで記録</div>
          <div className="text-white/60 text-[11px] mt-0.5">かざすだけで自動記録</div>
        </div>
        <Btn label="設定 →" onClick={() => onTabChange("nfc")} color="#C9A8E8" className="mt-0 py-1.5 px-3.5" />
      </div>
    </>
  );
}
