"use strict";

const express = require("express");
const entriesRouter = require("./routes/entries");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.send("OK"));

// Entries API
app.use("/api/entries", entriesRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: "not found" }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}

module.exports = app;
