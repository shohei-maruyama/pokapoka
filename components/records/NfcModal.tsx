"use client";
import { useState } from "react";
import type { Baby } from "@/types";
import { Btn, Input, Label } from "@/components/ui";

interface Props {
  action: string;
  babyId: string;
  babies: Baby[];
  onConfirm: (v: { babyId: string; milkAmt?: string; diaperType?: string; temp?: string }) => void;
  onCancel: () => void;
}

export function NfcQuickModal({ action, babyId, babies, onConfirm, onCancel }: Props) {
  const [milkAmt,      setMilkAmt]      = useState("120");
  const [diaperType,   setDiaperType]   = useState("おしっこ");
  const [temp,         setTemp]         = useState("37.0");
  const [selectedBaby, setSelectedBaby] = useState(babyId || babies[0]?.id);
  const baby = babies.find(b => b.id === selectedBaby) ?? babies[0];

  const isMillk  = action === "feeding_milk";
  const isDiaper = action === "diaper";
  const isTemp   = action === "temperature";
  const isSleepS = action === "sleep_start";
  const isSleepE = action === "sleep_end";
  const isBreast = action === "feeding_breast";

  const icon  = isMillk ? "🍼" : isDiaper ? "👶" : isTemp ? "🌡️" : isSleepS ? "🌙" : isSleepE ? "☀️" : "⏱️";
  const title = isMillk ? "ミルク量を確認" : isDiaper ? "おむつの種類を確認"
    : isTemp ? "体温を入力" : isSleepS ? "寝かしつけ開始" : isSleepE ? "起床を記録" : "授乳タイマー開始";

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-end justify-center">
      <div className="bg-white rounded-t-3xl px-4 pt-5 pb-9 w-full max-w-xl animate-slide-up">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-3xl">{icon}</span>
          <div>
            <div className="font-bold text-base">{title}</div>
            <div className="text-[11px] text-muted">📡 NFCタグから起動</div>
          </div>
        </div>

        {/* 赤ちゃん選択 */}
        {babies.length > 1 && (
          <div className="mb-3">
            <Label>赤ちゃん</Label>
            <div className="flex gap-2 flex-wrap">
              {babies.map(b => (
                <button key={b.id} onClick={() => setSelectedBaby(b.id)}
                  className="px-3 py-1.5 rounded-2xl text-sm cursor-pointer font-sans"
                  style={{ border: `2px solid ${selectedBaby === b.id ? b.color : "#F0E6E6"}`, background: selectedBaby === b.id ? b.color + "22" : "white", color: selectedBaby === b.id ? b.color : "#4A3F3F", fontWeight: selectedBaby === b.id ? 700 : 400 }}>
                  {b.icon} {b.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ミルク量 */}
        {isMillk && (
          <div className="mb-3">
            <Label>量 (ml)</Label>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {["60","80","100","120","140","160","180","200"].map(v => (
                <button key={v} onClick={() => setMilkAmt(v)}
                  className="px-3 py-1.5 rounded-xl text-sm cursor-pointer font-sans"
                  style={{ border: `2px solid ${milkAmt === v ? (baby?.color ?? "#FF8FAB") : "#F0E6E6"}`, background: milkAmt === v ? (baby?.color ?? "#FF8FAB") + "22" : "white", fontWeight: milkAmt === v ? 700 : 400 }}>
                  {v}
                </button>
              ))}
            </div>
            <Input type="number" value={milkAmt} onChange={e => setMilkAmt(e.target.value)} placeholder="その他の量" />
          </div>
        )}

        {/* おむつ種類 */}
        {isDiaper && (
          <div className="mb-3">
            <Label>種類</Label>
            <div className="grid grid-cols-3 gap-2">
              {[{ t: "おしっこ", i: "💛", bg: "#FFFDE7", bd: "#FFD54F" },
                { t: "うんち",   i: "💩", bg: "#FFF3E0", bd: "#FFAB40" },
                { t: "両方",     i: "💛💩", bg: "#F3E5F5", bd: "#CE93D8" }].map(d => (
                <button key={d.t} onClick={() => setDiaperType(d.t)}
                  className="py-3 rounded-2xl text-center cursor-pointer font-sans"
                  style={{ border: `2px solid ${diaperType === d.t ? d.bd : "#eee"}`, background: diaperType === d.t ? d.bg : "white" }}>
                  <div className="text-2xl mb-1">{d.i}</div>
                  <div className="text-[11px] font-bold">{d.t}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 体温 */}
        {isTemp && (
          <div className="mb-3">
            <Label>体温 (℃)</Label>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {["36.5","36.8","37.0","37.2","37.5","38.0","38.5","39.0"].map(v => {
                const hot = parseFloat(v) >= 38, sel = temp === v;
                return (
                  <button key={v} onClick={() => setTemp(v)}
                    className="px-2.5 py-1.5 rounded-xl text-sm cursor-pointer font-sans"
                    style={{ border: `2px solid ${sel ? (hot ? "#FF6B6B" : "#FF9A5C") : "#F0E6E6"}`, background: sel ? (hot ? "#FFE0E0" : "#FFE8D6") : "white", fontWeight: sel ? 700 : 400 }}>
                    {v}
                  </button>
                );
              })}
            </div>
            <Input type="number" step="0.1" value={temp} onChange={e => setTemp(e.target.value)} />
          </div>
        )}

        {/* 睡眠・授乳の説明 */}
        {(isSleepS || isSleepE || isBreast) && (
          <div className="bg-purpleL rounded-xl px-3.5 py-3 mb-3 text-sm text-[#3D2060]">
            {isSleepS && "🌙 タイマーが自動でスタートします"}
            {isSleepE && "☀️ 現在時刻で起床を記録します"}
            {isBreast  && "⏱️ 授乳タイマーが自動でスタートします"}
          </div>
        )}

        <div className="flex gap-2.5">
          <Btn label="✓ 記録する"
            onClick={() => onConfirm({ babyId: selectedBaby, milkAmt, diaperType, temp })}
            color={baby?.color ?? "#FF8FAB"} className="flex-1 py-3" />
          <Btn label="キャンセル" variant="ghost" onClick={onCancel} className="py-3 px-4" />
        </div>
      </div>
    </div>
  );
}
