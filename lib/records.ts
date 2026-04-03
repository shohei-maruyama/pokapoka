import type { RecordItem, RecordType } from "@/types";
import { addRecord as persistAdd } from "@/lib/storage";

const FAMILY_ID = "default";

export function createRecord(
  type: RecordType,
  childId: string,
  payload: Partial<RecordItem>
): RecordItem {
  const now = new Date().toISOString();
  const record: RecordItem = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    familyId: FAMILY_ID,
    childId,
    datetime: now,
    createdAt: now,
    ...payload,
  };
  persistAdd(record);
  return record;
}
