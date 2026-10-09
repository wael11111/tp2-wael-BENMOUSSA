import { overlaps } from "./overlap.js";
import type { Booking } from "../store.js";

/** Un creneau libre, bornes ISO 8601 UTC semi-ouvertes [debut, fin[. */
export interface Slot {
  startsAt: string;
  endsAt: string;
}

const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;

function iso(ms: number): string {
  return new Date(ms).toISOString().replace(".000Z", "Z");
}

function atHour(day: string, hour: number): number {
  return Date.parse(`${day}T${String(hour).padStart(2, "0")}:00:00Z`);
}

/**
 * Calcule les creneaux libres d'une journee a partir des reservations existantes.
 *
 * La journee est ouverte de 09:00 a 18:00 UTC. Les reservations hors fenetre sont
 * ignorees, celles qui debordent sont tronquees.
 */
export function freeSlots(day: string, busy: Booking[]): Slot[] {
  const open = atHour(day, OPEN_HOUR);
  const close = atHour(day, CLOSE_HOUR);
  const openIso = iso(open);
  const closeIso = iso(close);

  const clipped = busy
    .filter((b) => overlaps(openIso, closeIso, b.startsAt, b.endsAt))
    .map((b) => ({
      start: Math.max(open, Date.parse(b.startsAt)),
      end: Math.min(close, Date.parse(b.endsAt))
    }))
    .sort((a, b) => a.start - b.start);

  const slots: Slot[] = [];
  let cursor = open;
  for (const interval of clipped) {
    if (interval.start > cursor) {
      slots.push({ startsAt: iso(cursor), endsAt: iso(interval.start) });
    }
    if (interval.end > cursor) {
      cursor = interval.end;
    }
  }
  if (cursor < close) {
    slots.push({ startsAt: iso(cursor), endsAt: iso(close) });
  }
  return slots;
}
