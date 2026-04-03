"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { RecordItem, Baby, Milestone, GrowthRecord, Vaccine } from "@/types";
import {
  loadRecords, saveRecords,
  loadBabies, saveBabies,
  loadMilestones, saveMilestones,
  loadGrowths, saveGrowths,
  loadVaccines, saveVaccines,
  loadSelectedBabyId, saveSelectedBabyId,
} from "@/lib/storage";
import { createRecord } from "@/lib/records";
import { calcAgeMonths } from "@/lib/utils";

const MILESTONES_MASTER = [
  "はじめての笑顔","首がすわった","寝返り","お座り",
  "ハイハイ","つかまり立ち","はじめての言葉","一人歩き",
];

export function useAppState() {
  const [records,    setRecordsRaw]   = useState<RecordItem[]>([]);
  const [babies,     setBabiesRaw]    = useState<Baby[]>([]);
  const [milestones, setMSRaw]        = useState<Milestone[]>([]);
  const [growths,    setGrowthsRaw]   = useState<GrowthRecord[]>([]);
  const [vaccines,   setVaccinesRaw]  = useState<Vaccine[]>([]);
  const [selBabyId,  setSelBabyIdRaw] = useState<string>("1");
  const [hydrated,   setHydrated]     = useState(false);

  useEffect(() => {
    setRecordsRaw(loadRecords());
    setBabiesRaw(loadBabies());
    setMSRaw(loadMilestones());
    setGrowthsRaw(loadGrowths());
    setVaccinesRaw(loadVaccines());
    setSelBabyIdRaw(loadSelectedBabyId());
    setHydrated(true);
  }, []);

  const setRecords = useCallback((v: RecordItem[] | ((p: RecordItem[]) => RecordItem[])) => {
    setRecordsRaw(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      saveRecords(next);
      return next;
    });
  }, []);
  const setBabies     = useCallback((v: Baby[])         => { setBabiesRaw(v);   saveBabies(v);     }, []);
  const setMilestones = useCallback((v: Milestone[])    => { setMSRaw(v);       saveMilestones(v); }, []);
  const setGrowths    = useCallback((v: GrowthRecord[]) => { setGrowthsRaw(v);  saveGrowths(v);    }, []);
  const setVaccines   = useCallback((v: Vaccine[])      => { setVaccinesRaw(v); saveVaccines(v);   }, []);
  const setSelBabyId  = useCallback((id: string)        => { setSelBabyIdRaw(id); saveSelectedBabyId(id); }, []);

  const addRec = useCallback((type: RecordItem["type"], childId: string, payload: Partial<RecordItem>) => {
    const rec = createRecord(type, childId, payload);
    setRecords(prev => [...prev, rec]);
    return rec;
  }, [setRecords]);

  const addBaby = useCallback((baby: Baby) => {
    setBabies([...babies, baby]);
    setSelBabyId(baby.id);
    const newMS: Milestone[] = MILESTONES_MASTER.map(name => ({
      name, achieved: false, date: null, babyId: baby.id,
    }));
    setMilestones([...milestones, ...newMS]);
  }, [babies, milestones, setBabies, setMilestones, setSelBabyId]);

  const baby      = babies.find(b => b.id === selBabyId) ?? babies[0];
  const ageMonths = calcAgeMonths(baby?.birthDate ?? "");

  const babyMilestones = useMemo(() => {
    const existing = milestones.filter(m => m.babyId === baby?.id);
    if (existing.length > 0) return existing;
    return MILESTONES_MASTER.map(name => ({
      name, achieved: false, date: null, babyId: baby?.id ?? "1",
    }));
  }, [milestones, baby]);

  return {
    records, babies, milestones: babyMilestones, growths, vaccines,
    selBabyId, baby, ageMonths, hydrated,
    setRecords, setBabies, setMilestones, setGrowths, setVaccines,
    setSelBabyId, addBaby, addRec,
  };
}
