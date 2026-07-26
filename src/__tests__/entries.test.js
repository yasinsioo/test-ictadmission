import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { randomUUID } from "crypto";
import { join } from "path";
import { rmSync } from "fs";

const TEST_DB = join(process.cwd(), `test-${randomUUID()}.db`);
process.env.DB_PATH = TEST_DB;
process.env.NODE_ENV = "test";

const { default: db } = await import("../db.js");
const { default: app } = await import("../server.js");

beforeAll(() => {
  db.prepare(
    "INSERT INTO entries (title, body, lat, lon, isoTime) VALUES (?, ?, ?, ?, ?)",
  ).run(
    "Night perimeter check",
    "All clear.",
    60.15,
    25.02,
    new Date().toISOString(),
  );
});

afterAll(() => {
  db.close();
  try {
    rmSync(TEST_DB);
  } catch {}
});

// ── Health
describe("GET /health", () => {
  it("returns 200 OK", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.text).toBe("OK");
  });
});

// ── List
describe("GET /api/entries", () => {
  it("returns an array of entries", async () => {
    const res = await request(app).get("/api/entries");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

// ── Single entry
describe("GET /api/entries/:id", () => {
  it("returns the seeded entry", async () => {
    const res = await request(app).get("/api/entries/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.title).toBe("Night perimeter check");
  });

  it("returns 404 for a missing id", async () => {
    const res = await request(app).get("/api/entries/9999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

// ── Create
describe("POST /api/entries", () => {
  it("creates an entry with coordinates", async () => {
    const res = await request(app).post("/api/entries").send({
      title: "Morning patrol",
      body: "Sector cleared",
      lat: 61.4978,
      lon: 23.761,
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe("Morning patrol");
    expect(res.body.lat).toBe(61.4978);
    expect(res.body.isoTime).toBeDefined();
  });

  it("creates an entry without coordinates", async () => {
    const res = await request(app).post("/api/entries").send({
      title: "Radio check",
      body: "All comms nominal.",
    });
    expect(res.status).toBe(201);
    expect(res.body.lat).toBeNull();
    expect(res.body.lon).toBeNull();
  });

  it("returns 400 when title is missing", async () => {
    const res = await request(app)
      .post("/api/entries")
      .send({ body: "No title here" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("title is required");
  });

  it("returns 400 when body is missing", async () => {
    const res = await request(app)
      .post("/api/entries")
      .send({ title: "No body" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("body is required");
  });

  it("returns 400 when title exceeds 120 chars", async () => {
    const res = await request(app)
      .post("/api/entries")
      .send({
        title: "x".repeat(121),
        body: "ok",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/120/);
  });

  it("returns 400 when lat is not a number", async () => {
    const res = await request(app).post("/api/entries").send({
      title: "Bad coords",
      body: "ok",
      lat: "north",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("lat must be a number");
  });
});

// ── Delete
describe("DELETE /api/entries/:id", () => {
  it("deletes an entry and returns 204", async () => {
    const created = await request(app).post("/api/entries").send({
      title: "To be deleted",
      body: "Temporary.",
    });
    const id = created.body.id;

    const del = await request(app).delete(`/api/entries/${id}`);
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/entries/${id}`);
    expect(get.status).toBe(404);
  });

  it("returns 404 when entry does not exist", async () => {
    const res = await request(app).delete("/api/entries/9999");
    expect(res.status).toBe(404);
  });
});
