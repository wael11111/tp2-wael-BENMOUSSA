import { describe, it, expect } from "vitest";
import { createApp } from "../src/app.js";

async function call(path: string, init?: RequestInit) {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address() as { port: number };
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, init);
    const body = (await res.json()) as Record<string, any>;
    return { status: res.status, body };
  } finally {
    server.close();
  }
}

describe("GET /rooms/:id/availability", () => {
  it("refuse une salle inconnue", async () => {
    const res = await call("/rooms/cave/availability?date=2026-10-05");
    expect(res.status).toBe(404);
  });

  it("refuse une date manquante", async () => {
    const res = await call("/rooms/salle-a/availability");
    expect(res.status).toBe(400);
  });

  it("refuse une date mal formee", async () => {
    const res = await call("/rooms/salle-a/availability?date=demain");
    expect(res.status).toBe(400);
  });

  it("renvoie les creneaux libres autour des reservations", async () => {
    const res = await call("/rooms/salle-a/availability?date=2026-10-05");
    expect(res.status).toBe(200);
    expect(res.body.roomId).toBe("salle-a");
    expect(res.body.date).toBe("2026-10-05");
    expect(res.body.slots).toEqual([
      { startsAt: "2026-10-05T11:00:00Z", endsAt: "2026-10-05T18:00:00Z" }
    ]);
  });

  it("renvoie toute la journee pour une salle libre", async () => {
    const res = await call("/rooms/labo/availability?date=2026-10-05");
    expect(res.status).toBe(200);
    expect(res.body.slots).toEqual([
      { startsAt: "2026-10-05T09:00:00Z", endsAt: "2026-10-05T18:00:00Z" }
    ]);
  });
});
