"use client";
import { useState } from "react";
import type { Baby } from "@/types";
import { Btn, Input, Label } from "@/components/ui";

const BABY_COLORS = ["#FF8FAB","#A8D8EA","#84C9A0","#C9A8E8","#FFCB77"];
const BABY_ICONS  = ["🍀","🌸","⭐","🌙","🎀"];

interface Props {
  babies: Baby[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: (baby: Baby) => void;
}

export function BabyBar({ babies, selectedId, onSelect, onAdd }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🍀");
  const [birthDate, setBirthDate] = useState("");

  function handleAdd() {
    if (!newName.trim()) return;
    onAdd({
      id: Date.now().toString(),
      name: newName.trim(),
      icon: newIcon,
      color: BABY_COLORS[babies.length % BABY_COLORS.length],
      birthDate,
      familyId: "default",
    });
    setNewName(""); setBirthDate(""); setShowAdd(false);
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1 items-center">
        {babies.map(b => {
          const active = b.id === selectedId;
          return (
            <button key={b.id} onClick={() => onSelect(b.id)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sans cursor-pointer"
              style={{ border: `2px solid ${active ? b.color : "#F0E6E6"}`, background: active ? b.color : "white", color: active ? "white" : "#4A3F3F", fontWeight: active ? 700 : 400 }}>
              <span className="text-sm">{b.icon}</span>{b.name}
            </button>
          );
        })}
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs text-muted cursor-pointer bg-white font-sans"
          style={{ border: "2px dashed #F0E6E6" }}>＋</button>
      </div>
      {showAdd && (
        <div className="mt-2 bg-white/95 rounded-2xl p-3.5 shadow-lg animate-slide-down">
          <div className="flex gap-1.5 mb-2">
            {BABY_ICONS.map(ic => (
              <button key={ic} onClick={() => setNewIcon(ic)}
                className="text-xl p-1.5 rounded-lg cursor-pointer"
                style={{ border: `2px solid ${newIcon === ic ? "#FF8FAB" : "#F0E6E6"}`, background: newIcon === ic ? "#FFD6E0" : "white" }}>{ic}</button>
            ))}
          </div>
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="名前（例: はなちゃん）" className="mb-2" />
          <Label>生年月日（月齢別UIに使います）</Label>
          <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="mb-2.5" />
          <div className="flex gap-2">
            <Btn label="追加" onClick={handleAdd} color="#FF8FAB" className="flex-1" />
            <Btn label="✕" variant="ghost" onClick={() => setShowAdd(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
