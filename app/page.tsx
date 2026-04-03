"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAppState } from "@/hooks/useAppState";
import { Toast } from "@/components/ui";
import { NfcQuickModal } from "@/components/records/NfcModal";
import { BabyBar }      from "@/components/records/BabyBar";
import { TodayView }    from "@/components/records/TodayView";
import { FeedingView, DiaperView, SleepView, MealView } from "@/components/records/RecordViews";
import { HealthView, HistoryView, GrowthView, NfcView } from "@/components/records/OtherViews";

function getTabsForAge(ageMonths: number) {
  const tabs = [
    { id: "today",   label: "ホーム",  icon: "🏠" },
    { id: "feeding", label: "授乳",    icon: "🍼" },
    { id: "diaper",  label: "おむつ",  icon: "👶" },
    { id: "sleep",   label: "睡眠",    icon: "🌙" },
  ];
  if (ageMonths >= 4) tabs.splice(2, 0, { id: "meal", label: "離乳食", icon: "🥣" });
  tabs.push(
    { id: "health",  label: "体調",   icon: "🌡️" },
    { id: "history", label: "記録",   icon: "📋" },
    { id: "growth",  label: "成長",   icon: "🌱" },
    { id: "nfc",     label: "NFC",    icon: "📡" },
  );
  return tabs;
}

function AppContent() {
  const sp         = useSearchParams();
  const nfcAction  = sp.get("action");
  const nfcBabyId  = sp.get("baby");
  const state      = useAppState();
  const { baby, ageMonths, babies, addBaby, setSelBabyId, addRec, hydrated,
          milestones, setMilestones, growths, setGrowths, vaccines, setVaccines } = state;

  const [tab,            setTab]           = useState("today");
  const [toast,          setToast]         = useState<{ msg: string; icon: string } | null>(null);
  const [nfcModal,       setNfcModal]      = useState<{ action: string; babyId: string } | null>(null);
  const [nfcAutoFeeding, setNfcAutoFeeding]= useState(false);
  const [nfcAutoSleep,   setNfcAutoSleep]  = useState<"start" | null>(null);

  // NFC入口（既存データをリセットしない）
  useEffect(() => {
    if (!nfcAction || !hydrated) return;
    window.history.replaceState({}, "", window.location.pathname);
    const targetBaby = nfcBabyId ?? babies[0]?.id ?? "1";
    setTimeout(() => {
      setNfcModal({ action: nfcAction, babyId: targetBaby });
      if (nfcBabyId) setSelBabyId(nfcBabyId);
    }, 300);
  }, [hydrated]); // eslint-disable-line

  function handleNfcConfirm({ babyId, milkAmt, diaperType, temp }: {
    babyId: string; milkAmt?: string; diaperType?: string; temp?: string;
  }) {
    const act = nfcModal?.action;
    setNfcModal(null);
    if (babyId) setSelBabyId(babyId);
    const now = new Date().toISOString();
    if (act === "feeding_milk") {
      addRec("feeding", babyId, { method: "milk", amount: Number(milkAmt), datetime: now });
      setTab("feeding"); showToast(`ミルク ${milkAmt}ml を記録`, "🍼");
    } else if (act === "feeding_breast") {
      setNfcAutoFeeding(true); setTab("feeding"); showToast("授乳タイマー開始", "⏱️");
    } else if (act === "diaper") {
      const dt = diaperType === "おしっこ" ? "pee" : diaperType === "うんち" ? "poo" : "both";
      addRec("diaper", babyId, { diaperType: dt as "pee"|"poo"|"both", datetime: now });
      setTab("diaper"); showToast(`${diaperType}を記録`, diaperType === "おしっこ" ? "💛" : "💩");
    } else if (act === "sleep_start") {
      setNfcAutoSleep("start"); setTab("sleep"); showToast("寝かしつけ開始", "🌙");
    } else if (act === "sleep_end") {
      setTab("sleep"); showToast("起床を記録", "☀️");
    } else if (act === "temperature") {
      addRec("temperature", babyId, { value: Number(temp), datetime: now });
      setTab("health"); showToast(`体温 ${temp}℃ を記録`, "🌡️");
    }
  }

  function showToast(msg: string, icon: string) { setToast({ msg, icon }); }

  const TABS     = getTabsForAge(ageMonths);
  const todayStr = new Date().toLocaleDateString("ja-JP", { year:"numeric", month:"long", day:"numeric", weekday:"long" });
  const ageLabel = baby?.birthDate ? (ageMonths === 0 ? "生後0か月" : `生後${ageMonths}か月`) : "";

  if (!hydrated) {
    return <div className="flex items-center justify-center min-h-screen text-muted text-sm">読み込み中...</div>;
  }

  return (
    <div className="bg-surface min-h-screen">
      {toast     && <Toast msg={toast.msg} icon={toast.icon} onDone={() => setToast(null)} />}
      {nfcModal  && <NfcQuickModal action={nfcModal.action} babyId={nfcModal.babyId} babies={babies} onConfirm={handleNfcConfirm} onCancel={() => setNfcModal(null)} />}

      {/* ヘッダー */}
      <div className="px-4 pt-3 pb-2 shadow-md"
        style={{ background: `linear-gradient(135deg,${baby?.color ?? "#FF8FAB"}dd,#FFCB7799)` }}>
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍀</span>
              <span className="text-white text-base font-bold tracking-wide">ぽかぽかノート</span>
            </div>
            {ageLabel && (
              <span className="text-[11px] bg-white/25 text-white px-2.5 py-0.5 rounded-xl font-bold">{ageLabel}</span>
            )}
          </div>
          <BabyBar babies={babies} selectedId={baby?.id ?? "1"}
            onSelect={id => { setSelBabyId(id); setTab("today"); }}
            onAdd={addBaby} />
          <div className="text-white/70 text-[10px] mt-1">{todayStr}</div>
        </div>
      </div>

      {/* タブナビ */}
      <div className="bg-white shadow-sm sticky top-0 z-10 overflow-x-auto">
        <div className="flex min-w-max max-w-xl mx-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 border-none bg-transparent cursor-pointer whitespace-nowrap text-[10px] font-sans"
              style={{
                borderBottom: tab === t.id ? `3px solid ${baby?.color ?? "#FF8FAB"}` : "3px solid transparent",
                color: tab === t.id ? (baby?.color ?? "#FF8FAB") : "#9E8E8E",
                fontWeight: tab === t.id ? 700 : 400,
              }}>
              <span className="text-sm">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-xl mx-auto px-3 pt-3 pb-24 flex flex-col gap-3">
        {tab==="today"   && <TodayView   records={state.records} baby={baby} ageMonths={ageMonths} vaccines={vaccines} onTabChange={setTab}/>}
        {tab==="feeding" && <FeedingView records={state.records} baby={baby} addRec={addRec} autoStart={nfcAutoFeeding}/>}
        {tab==="diaper"  && <DiaperView  records={state.records} baby={baby} addRec={addRec}/>}
        {tab==="sleep"   && <SleepView   records={state.records} baby={baby} addRec={addRec} autoStart={nfcAutoSleep}/>}
        {tab==="meal"    && <MealView    records={state.records} baby={baby} addRec={addRec} ageMonths={ageMonths}/>}
        {tab==="health"  && <HealthView  records={state.records} baby={baby} addRec={addRec}/>}
        {tab==="history" && <HistoryView records={state.records} baby={baby}/>}
        {tab==="growth"  && <GrowthView  milestones={milestones} growths={growths} setMilestones={setMilestones} setGrowths={setGrowths} baby={baby}/>}
        {tab==="nfc"     && <NfcView babies={babies}/>}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted text-sm">読み込み中...</div>}>
      <AppContent />
    </Suspense>
  );
}
