import { describe, it, expect } from "vitest";
import { freeSlots } from "../src/lib/availability.js";
import type { Booking } from "../src/store.js";

const bk = (id: string, startsAt: string, endsAt: string): Booking => ({
  id,
  roomId: "salle-a",
  who: "test",
  people: 1,
  startsAt,
  endsAt,
  price: 0
});

describe("freeSlots", () => {
  it("renvoie toute la journee quand la salle est libre", () => {
    expect(freeSlots("2026-10-05", [])).toEqual([
      { startsAt: "2026-10-05T09:00:00Z", endsAt: "2026-10-05T18:00:00Z" }
    ]);
  });

  it("decoupe la journee autour d'une reservation", () => {
    expect(
      freeSlots("2026-10-05", [bk("b1", "2026-10-05T11:00:00Z", "2026-10-05T12:00:00Z")])
    ).toEqual([
      { startsAt: "2026-10-05T09:00:00Z", endsAt: "2026-10-05T11:00:00Z" },
      { startsAt: "2026-10-05T12:00:00Z", endsAt: "2026-10-05T18:00:00Z" }
    ]);
  });

  it("trie des reservations desordonnees", () => {
    expect(
      freeSlots("2026-10-05", [
        bk("b2", "2026-10-05T14:00:00Z", "2026-10-05T15:00:00Z"),
        bk("b1", "2026-10-05T10:00:00Z", "2026-10-05T11:00:00Z")
      ])
    ).toEqual([
      { startsAt: "2026-10-05T09:00:00Z", endsAt: "2026-10-05T10:00:00Z" },
      { startsAt: "2026-10-05T11:00:00Z", endsAt: "2026-10-05T14:00:00Z" },
      { startsAt: "2026-10-05T15:00:00Z", endsAt: "2026-10-05T18:00:00Z" }
    ]);
  });

  it("fusionne deux reservations qui se touchent", () => {
    expect(
      freeSlots("2026-10-05", [
        bk("b1", "2026-10-05T11:00:00Z", "2026-10-05T12:00:00Z"),
        bk("b2", "2026-10-05T12:00:00Z", "2026-10-05T13:00:00Z")
      ])
    ).toEqual([
      { startsAt: "2026-10-05T09:00:00Z", endsAt: "2026-10-05T11:00:00Z" },
      { startsAt: "2026-10-05T13:00:00Z", endsAt: "2026-10-05T18:00:00Z" }
    ]);
  });

  it("tronque une reservation qui deborde de la fenetre", () => {
    expect(
      freeSlots("2026-10-05", [bk("b1", "2026-10-05T08:00:00Z", "2026-10-05T10:00:00Z")])
    ).toEqual([{ startsAt: "2026-10-05T10:00:00Z", endsAt: "2026-10-05T18:00:00Z" }]);
  });

  it("ignore une reservation hors de la journee", () => {
    expect(
      freeSlots("2026-10-05", [bk("b1", "2026-10-06T10:00:00Z", "2026-10-06T11:00:00Z")])
    ).toEqual([{ startsAt: "2026-10-05T09:00:00Z", endsAt: "2026-10-05T18:00:00Z" }]);
  });
});
