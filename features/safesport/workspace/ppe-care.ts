import type { State } from "./store";
/** Fingerprint care evidence so a later specialist update invalidates an earlier review. */
export function careSnapshot(state: State, athleteId: string) {
  return JSON.stringify(
    ["referrals", "plans", "reviews"].map((collection) => {
      const records = state.records[
        collection as "referrals" | "plans" | "reviews"
      ].filter((r) => r.athleteId === athleteId);
      return records
        .map((r) => ({
          id: r.id,
          status: r.status,
          outcome: r.outcome,
          progress: r.progress,
          notes: r.notes,
          assigned: r.assigned,
        }))
        .sort((a, b) => a.id.localeCompare(b.id));
    }),
  );
}
export function hasCare(state: State, athleteId: string) {
  return [
    state.records.referrals,
    state.records.plans,
    state.records.reviews,
  ].some((records) => records.some((r) => r.athleteId === athleteId));
}
