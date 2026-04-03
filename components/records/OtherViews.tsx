"use client";
import { useState, useMemo } from "react";
import type { RecordItem, Baby, Milestone, GrowthRecord, Vaccine } from "@/types";
import { Btn, Card, Empty, Input, Label } from "@/components/ui";
import { filterRecords, isToday, formatTime, formatDate, formatMs, dateKey } from "@/lib/utils";
import { exportBackup } from "@/lib/storage";

// ── 体調 ─────────────────────────────────────────────
export function HealthView({ records, baby, addRec }: {
  records: RecordItem[]; baby: Baby | undefined;
  addRec: (type: RecordItem["type"], childId: string, payload: Partial<RecordItem>) => RecordItem;
}) {
  const bid     = baby?.id ?? "1";
  const bTemp   = filterRecords(records, "temperature", bid);
  const bMed    = filterRecords(records, "medicine",    bid);
  const bHosp   = filterRecords(records, "hospital",    bid);
  const allHealth = [...bTemp, ...bMed, ...bHosp].sort((a,b)=>new Date(b.datetime).getTime()-new Date(a.datetime).getTime());
  const lastTemp  = bTemp[bTemp.length - 1];

  const [mode,     setMode]     = useState<"temperature"|"medicine"|"hospital"|null>(null);
  const [temp,     setTemp]     = useState("37.0");
  const [medName,  setMedName]  = useState("");
  const [medMemo,  setMedMemo]  = useState("");
  const [hospName, setHospName] = useState("");
  const [hospMemo, setHospMemo] = useState("");
  const [memo,     setMemo]     = useState("");

  function submit() {
    const now = new Date().toISOString();
    if (mode === "temperature") addRec("temperature", bid, { value: Number(temp), memo, datetime: now });
    if (mode === "medicine")   addRec("medicine",    bid, { name: medName, memo: medMemo, datetime: now });
    if (mode === "hospital")   addRec("hospital",    bid, { hospital: hospName, memo: hospMemo, datetime: now });
    setMode(null); setTemp("37.0"); setMedName(""); setMedMemo(""); setHospName(""); setHospMemo(""); setMemo("");
  }

  const tv = lastTemp?.value ? parseFloat(String(lastTemp.value)) : null;

  return (
    <>
      <h2 className="m-0 text-base font-bold text-orange">🌡️ 体調・医療記録</h2>
      {lastTemp && tv !== null && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: tv>=38?"#FFE0E0":tv>=37.5?"#FFE8D6":"#D4F0E0", border:`2px solid ${tv>=38?"#FF6B6B":tv>=37.5?"#FF9A5C":"#84C9A0"}` }}>
          <span className="text-3xl">🌡️</span>
          <div>
            <div className="text-[11px] text-muted">最新の体温</div>
            <div className="text-3xl font-extrabold" style={{ color: tv>=38?"#FF6B6B":tv>=37.5?"#FF9A5C":"#84C9A0" }}>{lastTemp.value}℃</div>
            <div className="text-[11px] text-muted">{formatDate(lastTemp.datetime)} {formatTime(lastTemp.datetime)}{tv>=38?" ⚠️ 発熱の可能性":""}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {[{t:"temperature" as const,i:"🌡️",l:"体温",c:"#FF9A5C",cl:"#FFE8D6"},
          {t:"medicine"    as const,i:"💊",l:"薬",  c:"#A8D8EA",cl:"#D6EEF7"},
          {t:"hospital"   as const,i:"🏥",l:"通院",c:"#FF6B6B",cl:"#FFE0E0"}].map(x => (
          <button key={x.t} onClick={() => setMode(mode===x.t?null:x.t)}
            className="py-3 rounded-2xl text-center cursor-pointer font-sans"
            style={{ border:`2px solid ${mode===x.t?x.c:"#eee"}`, background:mode===x.t?x.cl:"white" }}>
            <div className="text-2xl mb-1">{x.i}</div>
            <div className="text-xs font-bold" style={{ color:mode===x.t?x.c:"#4A3F3F" }}>{x.l}</div>
          </button>
        ))}
      </div>

      {mode==="temperature"&&(
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-slide-down">
          <Label>体温 (℃)</Label>
          <div className="flex gap-1.5 flex-wrap mb-2">
            {["36.5","36.8","37.0","37.2","37.5","38.0","38.5","39.0"].map(v=>{
              const hot=parseFloat(v)>=38,sel=temp===v;
              return <button key={v} onClick={()=>setTemp(v)}
                className="px-2.5 py-1.5 rounded-xl text-sm cursor-pointer font-sans"
                style={{ border:`2px solid ${sel?(hot?"#FF6B6B":"#FF9A5C"):"#F0E6E6"}`, background:sel?(hot?"#FFE0E0":"#FFE8D6"):"white", fontWeight:sel?700:400 }}>{v}</button>;
            })}
          </div>
          <Input type="number" step="0.1" value={temp} onChange={e=>setTemp(e.target.value)} className="mb-2"/>
          <Label>メモ</Label>
          <Input value={memo} onChange={e=>setMemo(e.target.value)} placeholder="例: 機嫌良し" className="mb-2.5"/>
          <div className="flex gap-2"><Btn label="記録する" onClick={submit} color="#FF9A5C" className="flex-1"/><Btn label="閉じる" variant="ghost" onClick={()=>setMode(null)}/></div>
        </div>
      )}
      {mode==="medicine"&&(
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-slide-down">
          <Label>薬の名前</Label><Input value={medName} onChange={e=>setMedName(e.target.value)} placeholder="例: カロナール" className="mb-2"/>
          <Label>メモ</Label><Input value={medMemo} onChange={e=>setMedMemo(e.target.value)} placeholder="例: 0.5ml、食後" className="mb-2.5"/>
          <div className="flex gap-2"><Btn label="記録する" onClick={submit} color="#A8D8EA" className="flex-1"/><Btn label="閉じる" variant="ghost" onClick={()=>setMode(null)}/></div>
        </div>
      )}
      {mode==="hospital"&&(
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-slide-down">
          <Label>病院名</Label><Input value={hospName} onChange={e=>setHospName(e.target.value)} placeholder="例: 〇〇小児科" className="mb-2"/>
          <Label>メモ（診断・処置など）</Label><Input value={hospMemo} onChange={e=>setHospMemo(e.target.value)} placeholder="例: RSウイルス" className="mb-2.5"/>
          <div className="flex gap-2"><Btn label="記録する" onClick={submit} color="#FF6B6B" className="flex-1"/><Btn label="閉じる" variant="ghost" onClick={()=>setMode(null)}/></div>
        </div>
      )}

      {allHealth.length===0?<Empty icon="🌡️" text="体温・薬・通院を記録できます"/>:
        allHealth.slice(0,30).map(h=>{
          const isT=h.type==="temperature",isM=h.type==="medicine";
          const hIcon=isT?"🌡️":isM?"💊":"🏥";
          const hBg=isT?"#FFE8D6":isM?"#D6EEF7":"#FFE0E0";
          const hMain=isT?`${h.value}℃`:isM?`薬: ${h.name??""}`:(h.hospital??"通院");
          const warn=isT&&Number(h.value)>=38;
          return(
            <div key={h.id} className="bg-white rounded-2xl px-3.5 py-2.5 shadow-sm flex items-center gap-2.5"
              style={{ borderLeft:`4px solid ${warn?"#FF6B6B":isM?"#A8D8EA":isT?"#FF9A5C":"#FF6B6B"}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background:hBg }}>{hIcon}</div>
              <div className="flex-1">
                <div className="font-bold text-xs" style={{ color:warn?"#FF6B6B":undefined }}>{hMain}{warn?" ⚠️":""}</div>
                {h.memo&&<div className="text-[10px] text-muted">{h.memo}</div>}
              </div>
              <div className="text-[10px] text-muted text-right">{formatDate(h.datetime)}<br/>{formatTime(h.datetime)}</div>
            </div>
          );
        })}
    </>
  );
}

// ── 振り返り ──────────────────────────────────────────
export function HistoryView({ records, baby }: { records: RecordItem[]; baby: Baby | undefined }) {
  const bid = baby?.id ?? "1";
  const [sel, setSel] = useState(new Date().toLocaleDateString("ja-JP"));

  const last7 = useMemo(()=>Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-i); return d.toLocaleDateString("ja-JP");
  }),[]);

  function dayLabel(s:string){
    const t=new Date().toLocaleDateString("ja-JP"),y=new Date(Date.now()-86400000).toLocaleDateString("ja-JP");
    if(s===t)return"今日"; if(s===y)return"昨日";
    return s.replace(/\d+年\d+月/,"").replace("日","");
  }

  const stats=useMemo(()=>last7.map(day=>({
    day,
    df:records.filter(r=>r.type==="feeding"&&r.childId===bid&&dateKey(r.datetime)===day),
    dd:records.filter(r=>r.type==="diaper"&&r.childId===bid&&dateKey(r.datetime)===day),
    ds:records.filter(r=>r.type==="sleep"&&r.childId===bid&&dateKey(r.datetime)===day),
    dh:records.filter(r=>["temperature","medicine","hospital"].includes(r.type)&&r.childId===bid&&dateKey(r.datetime)===day),
  })),[records,bid,last7]);

  const st=stats.find(s=>s.day===sel)??{df:[],dd:[],ds:[],dh:[]};
  const sleepMs=st.ds.reduce((a,s)=>a+(s.startTime&&s.endTime?new Date(s.endTime).getTime()-new Date(s.startTime).getTime():0),0);
  const milkTotal=st.df.filter(f=>f.method==="milk"||f.method==="mixed").reduce((a,f)=>a+(f.amount??0),0);

  const allEvents=[
    ...st.df.map(f=>({ts:f.datetime,type:"feeding",data:f})),
    ...st.dd.map(d=>({ts:d.datetime,type:"diaper",data:d})),
    ...st.ds.map(s=>({ts:s.datetime,type:"sleep",data:s})),
    ...st.dh.map(h=>({ts:h.datetime,type:"health",data:h})),
  ].sort((a,b)=>new Date(b.ts).getTime()-new Date(a.ts).getTime());

  return(
    <>
      <h2 className="m-0 text-base font-bold">📋 記録一覧</h2>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {last7.map(day=>{
          const s=stats.find(d=>d.day===day); const active=day===sel;
          return(
            <button key={day} onClick={()=>setSel(day)}
              className="flex-shrink-0 px-2.5 py-1.5 rounded-xl text-center cursor-pointer font-sans min-w-[48px]"
              style={{ border:`2px solid ${active?"#FF8FAB":"#F0E6E6"}`, background:active?"#FFD6E0":"white" }}>
              <div className="text-[11px] font-bold" style={{ color:active?"#FF8FAB":"#4A3F3F" }}>{dayLabel(day)}</div>
              <div className="text-[10px]" style={{ color:active?"#FF8FAB":"#9E8E8E" }}>{s?.df.length??0}回</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[{icon:"🍼",label:"授乳",val:`${st.df.length}回`,sub:milkTotal>0?`${milkTotal}ml`:"",bg:"#FFD6E0"},
          {icon:"👶",label:"おむつ",val:`${st.dd.length}回`,sub:"",bg:"#FFF0C4"},
          {icon:"🌙",label:"睡眠",val:sleepMs>0?formatMs(sleepMs):"—",sub:"",bg:"#EDE0F7"}].map(x=>(
          <div key={x.label} className="rounded-xl p-2.5 text-center" style={{ background:x.bg }}>
            <div className="text-lg">{x.icon}</div>
            <div className="text-sm font-bold mt-0.5">{x.val}</div>
            {x.sub&&<div className="text-[9px] text-muted">{x.sub}</div>}
            <div className="text-[9px] text-muted">{x.label}</div>
          </div>
        ))}
      </div>

      {allEvents.length===0?<Empty icon="📋" text="この日の記録はありません"/>:(
        <div className="bg-white rounded-2xl p-3.5 shadow-sm">
          <div className="font-bold text-sm mb-2.5">タイムライン</div>
          {allEvents.map((ev,i)=>{
            let icon2="",bg2="",main="",sub2="";
            const d=ev.data as RecordItem;
            if(ev.type==="feeding"){icon2=d.method==="solids"?"🥣":"🍼";bg2="#FFD6E0";main=(d.method==="milk"?"ミルク":d.method==="breast"?"母乳":"混合")+(d.amount?` ${d.amount}ml`:""+(d.duration?` ${d.duration}分`:""));}
            else if(ev.type==="diaper"){icon2=d.diaperType==="pee"?"💛":d.diaperType==="poo"?"💩":"💛💩";bg2="#FFF0C4";main=`おむつ（${d.diaperType==="pee"?"おしっこ":d.diaperType==="poo"?"うんち":"両方"}）`;}
            else if(ev.type==="sleep"){icon2="🌙";bg2="#EDE0F7";main="睡眠";sub2=d.startTime&&d.endTime?`${formatTime(d.startTime)}〜${formatTime(d.endTime)} ${formatMs(new Date(d.endTime).getTime()-new Date(d.startTime).getTime())}`:"記録中";}
            else if(ev.type==="health"){icon2=d.type==="temperature"?"🌡️":d.type==="medicine"?"💊":"🏥";bg2=d.type==="temperature"?"#FFE8D6":d.type==="medicine"?"#D6EEF7":"#FFE0E0";main=d.type==="temperature"?`体温 ${d.value}℃`:d.type==="medicine"?`薬: ${d.name??""}`:`通院: ${d.hospital??""}`;sub2=d.memo??"";}
            return(
              <div key={i} className="flex items-start gap-2.5 pb-2.5 mb-2.5 border-b border-border last:border-0 last:mb-0 last:pb-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background:bg2 }}>{icon2}</div>
                <div className="flex-1 min-w-0"><div className="font-semibold text-xs">{main}</div>{sub2&&<div className="text-[10px] text-muted mt-0.5">{sub2}</div>}</div>
                <div className="text-[10px] text-muted flex-shrink-0">{formatTime(ev.ts)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ミルクグラフ */}
      {stats.some(d=>d.df.filter(f=>f.method==="milk"||f.method==="mixed").reduce((a,f)=>a+(f.amount??0),0)>0)&&(
        <div className="bg-white rounded-2xl p-3.5 shadow-sm">
          <div className="font-bold text-sm mb-2.5">🍼 ミルク量推移 (ml)</div>
          <MiniBar data={[...stats].reverse().map(d=>({label:dayLabel(d.day),val:d.df.filter(f=>f.method==="milk"||f.method==="mixed").reduce((a,f)=>a+(f.amount??0),0)}))} color="#FF8FAB"/>
        </div>
      )}
      {stats.some(d=>d.ds.reduce((a,s)=>a+(s.startTime&&s.endTime?new Date(s.endTime).getTime()-new Date(s.startTime).getTime():0),0)>0)&&(
        <div className="bg-white rounded-2xl p-3.5 shadow-sm">
          <div className="font-bold text-sm mb-2.5">🌙 睡眠時間推移</div>
          <MiniBar data={[...stats].reverse().map(d=>({label:dayLabel(d.day),val:d.ds.reduce((a,s)=>a+(s.startTime&&s.endTime?new Date(s.endTime).getTime()-new Date(s.startTime).getTime():0),0)/3600000}))} color="#C9A8E8" fmt={v=>v.toFixed(1)} unit="h"/>
        </div>
      )}
    </>
  );
}

function MiniBar({data,color,unit="",fmt=(v:number)=>String(Math.round(v))}:{data:{label:string;val:number}[];color:string;unit?:string;fmt?:(v:number)=>string}){
  const max=Math.max(...data.map(d=>d.val),1);
  return(
    <div className="flex items-end gap-1 h-16">
      {data.map((d,i)=>{
        const h=Math.max((d.val/max)*52,d.val>0?3:0);
        return(
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="text-[8px] text-muted h-3 flex items-end">{d.val>0?fmt(d.val)+unit:""}</div>
            <div className="w-full rounded-t-sm" style={{ height:`${h}px`, background:color, opacity:d.val>0?1:0.15 }}/>
            <div className="text-[8px] text-muted">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── 成長記録 ──────────────────────────────────────────
export function GrowthView({ milestones, growths, setMilestones, setGrowths, baby }: {
  milestones: Milestone[]; growths: GrowthRecord[];
  setMilestones: (v: Milestone[]) => void;
  setGrowths: (v: GrowthRecord[]) => void;
  baby: Baby | undefined;
}) {
  const bid    = baby?.id ?? "1";
  const [showForm, setShowForm] = useState(false);
  const [newG,     setNewG]     = useState({ weight:"", height:"", date:"" });
  const bGrowths = growths.filter(g => g.babyId === bid);

  function addGrowth() {
    if (!newG.weight && !newG.height) return;
    setGrowths([...growths, { id: Date.now().toString(), babyId: bid, ...newG, date: newG.date || new Date().toLocaleDateString("ja-JP") }]);
    setNewG({ weight:"", height:"", date:"" }); setShowForm(false);
  }

  return(
    <>
      <h2 className="m-0 text-base font-bold text-green">🌱 発達・成長記録</h2>
      <Card icon="✨" title="できるようになったこと" bg="#D4F0E0">
        <div className="flex flex-col gap-1.5 mt-1">
          {milestones.map(m=>(
            <div key={m.name}
              onClick={()=>setMilestones(milestones.map(x=>x.name===m.name&&x.babyId===bid?{...x,achieved:!x.achieved,date:!x.achieved?new Date().toLocaleDateString("ja-JP"):null}:x))}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all"
              style={{ background:m.achieved?"#D4F0E0":"white", border:`1px solid ${m.achieved?"#84C9A0":"#F0E6E6"}` }}>
              <span className="text-base">{m.achieved?"✅":"⬜"}</span>
              <span className="text-xs flex-1" style={{ fontWeight:m.achieved?700:400 }}>{m.name}</span>
              {m.achieved&&m.date&&<span className="text-[10px] text-green">{m.date}</span>}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="m-0 text-sm font-bold">📊 体重・身長</h3>
        <Btn label="+ 記録" onClick={()=>setShowForm(!showForm)} color="#84C9A0" className="mt-0 py-1.5 px-3.5"/>
      </div>
      {showForm&&(
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-slide-down">
          <div className="flex gap-2.5 mb-2.5">
            <div className="flex-1"><Label>体重 (kg)</Label><Input type="number" step="0.01" value={newG.weight} onChange={e=>setNewG({...newG,weight:e.target.value})} placeholder="3.5"/></div>
            <div className="flex-1"><Label>身長 (cm)</Label><Input type="number" step="0.1" value={newG.height} onChange={e=>setNewG({...newG,height:e.target.value})} placeholder="50.2"/></div>
          </div>
          <div className="mb-2.5"><Label>日付</Label><Input type="date" value={newG.date} onChange={e=>setNewG({...newG,date:e.target.value})}/></div>
          <div className="flex gap-2"><Btn label="記録する" onClick={addGrowth} color="#84C9A0" className="flex-1"/><Btn label="✕" variant="ghost" onClick={()=>setShowForm(false)}/></div>
        </div>
      )}
      {bGrowths.length===0?<Empty icon="📏" text="体重・身長を記録しましょう"/>:
        [...bGrowths].reverse().map(g=>(
          <div key={g.id} className="bg-white rounded-2xl px-3.5 py-2.5 shadow-sm flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background:"#D4F0E0" }}>📏</div>
            <div className="flex-1">
              <div className="font-bold text-xs">{g.weight&&`${g.weight} kg`}{g.weight&&g.height&&" / "}{g.height&&`${g.height} cm`}</div>
              <div className="text-[10px] text-muted">{g.date}</div>
            </div>
          </div>
        ))}
    </>
  );
}

// ── NFC設定 ───────────────────────────────────────────
export function NfcView({ babies }: { babies: Baby[] }) {
  const [copied,  setCopied]  = useState<string|null>(null);
  const [selBaby, setSelBaby] = useState(babies[0]?.id ?? "");
  const base = typeof window!=="undefined" ? window.location.href.split("?")[0].split("#")[0] : "";

  const actions=[
    {action:"diaper",         label:"おむつ（種類を選ぶ）", icon:"👶",border:"#FFAB40"},
    {action:"feeding_milk",   label:"ミルク（量を確認）",   icon:"🍼",border:"#FF8FAB"},
    {action:"feeding_breast", label:"授乳タイマー開始",      icon:"⏱️",border:"#FF8FAB"},
    {action:"sleep_start",    label:"寝かしつけ開始",        icon:"🌙",border:"#C9A8E8"},
    {action:"sleep_end",      label:"起床記録",              icon:"☀️",border:"#FFCB77"},
    {action:"temperature",    label:"体温記録",              icon:"🌡️",border:"#FF9A5C"},
  ];

  function copy(url:string,action:string){
    navigator.clipboard.writeText(url).then(()=>{ setCopied(action); setTimeout(()=>setCopied(null),2000); });
  }
  function doExport(){
    const blob=new Blob([exportBackup()],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download=`pokapoka_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
  }
  function doClear(){
    if(!window.confirm("全記録を削除しますか？この操作は元に戻せません。"))return;
    ["records","babies","milestones","growths","vaccines","selBabyId"].forEach(n=>localStorage.removeItem(`pokapoka_${n}_default`));
    window.location.reload();
  }

  return(
    <>
      <div className="rounded-2xl p-4 text-white" style={{ background:"linear-gradient(135deg,#1a1a2e,#16213e)" }}>
        <div className="flex items-center gap-2 mb-2"><span className="text-lg">📡</span><span className="text-sm font-bold">NFCタグ設定</span></div>
        <div className="text-xs leading-relaxed" style={{ color:"rgba(255,255,255,0.7)" }}>タグをかざすと確認画面が出て、ミルク量や体温を入力してから記録できます。</div>
      </div>

      {babies.length>1&&(
        <div className="bg-white rounded-2xl p-3 shadow-sm">
          <div className="text-[11px] text-muted font-semibold mb-1.5">URLに含める赤ちゃん</div>
          <div className="flex gap-2 flex-wrap">
            {babies.map(b=>(
              <button key={b.id} onClick={()=>setSelBaby(b.id)}
                className="px-3 py-1.5 rounded-2xl text-xs cursor-pointer font-sans"
                style={{ border:`2px solid ${selBaby===b.id?b.color:"#F0E6E6"}`, background:selBaby===b.id?b.color+"22":"white", fontWeight:selBaby===b.id?700:400 }}>
                {b.icon} {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {actions.map(a=>{
        const url=`${base}?action=${a.action}${selBaby?`&baby=${selBaby}`:""}`;
        const done=copied===a.action;
        return(
          <div key={a.action} className="bg-white rounded-2xl px-3.5 py-3 shadow-sm" style={{ borderLeft:`4px solid ${a.border}` }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2"><span className="text-lg">{a.icon}</span><div className="font-bold text-xs">{a.label}</div></div>
              <button onClick={()=>copy(url,a.action)}
                className="px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer font-sans transition-all border-none"
                style={{ background:done?"#84C9A0":"#D6EEF7", color:done?"white":"#A8D8EA" }}>
                {done?"✓ 済":"コピー"}
              </button>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg px-2.5 py-1.5 text-[10px] text-muted break-all font-mono">{url}</div>
          </div>
        );
      })}

      <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ borderTop:"3px solid #F0E6E6" }}>
        <div className="font-bold text-sm mb-1.5">🗄️ データ管理</div>
        <div className="text-[11px] text-muted mb-3 leading-relaxed">記録はこのブラウザの localStorage に保存されています。<br/>Safariを閉じても消えません。</div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={doExport} className="px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer font-sans" style={{ border:"1.5px solid #A8D8EA",background:"#D6EEF7",color:"#A8D8EA" }}>📥 バックアップ</button>
          <button onClick={doClear} className="px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer font-sans" style={{ border:"1.5px solid #FF6B6B",background:"#FFE0E0",color:"#FF6B6B" }}>🗑️ 全データ削除</button>
        </div>
      </div>
    </>
  );
}
