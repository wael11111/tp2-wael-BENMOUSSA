import { Router } from "express";
import { rooms, findRoom, bookingsForRoom } from "../store.js";
import { freeSlots } from "../lib/availability.js";

export const roomsRouter = Router();

roomsRouter.get("/", (_req, res) => {
  res.json({ rooms });
});

roomsRouter.get("/:id/availability", (req, res) => {
  const room = findRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: "salle inconnue" });
    return;
  }
  const date = req.query.date;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    res.status(400).json({ error: "date invalide : attendu YYYY-MM-DD" });
    return;
  }
  res.json({ roomId: room.id, date, slots: freeSlots(date, bookingsForRoom(room.id)) });
});

roomsRouter.get("/:id", (req, res) => {
  const room = findRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: "salle inconnue" });
    return;
  }
  res.json({ room, bookings: bookingsForRoom(room.id) });
});
