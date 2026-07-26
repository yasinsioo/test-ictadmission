'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db');
const { validateEntry } = require('../middleware/validation');

// GET /api/entries — list all
router.get('/', (req, res, next) => {
  try {
    const entries = db
      .prepare('SELECT id, title, body, lat, lon, isoTime FROM entries ORDER BY id ASC')
      .all();
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

// GET /api/entries/:id — single entry
router.get('/:id', (req, res, next) => {
  try {
    const entry = db
      .prepare('SELECT id, title, body, lat, lon, isoTime FROM entries WHERE id = ?')
      .get(Number(req.params.id));

    if (!entry) return res.status(404).json({ error: 'entry not found' });
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

// POST /api/entries — create
router.post('/', validateEntry, (req, res, next) => {
  try {
    const { title, body, lat = null, lon = null } = req.body;
    const isoTime = new Date().toISOString();

    const result = db
      .prepare('INSERT INTO entries (title, body, lat, lon, isoTime) VALUES (@title, @body, @lat, @lon, @isoTime)')
      .run({ title: title.trim(), body: body.trim(), lat: lat ?? null, lon: lon ?? null, isoTime });

    const created = db
      .prepare('SELECT id, title, body, lat, lon, isoTime FROM entries WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/entries/:id — delete
router.delete('/:id', (req, res, next) => {
  try {
    const result = db
      .prepare('DELETE FROM entries WHERE id = ?')
      .run(Number(req.params.id));

    if (result.changes === 0) return res.status(404).json({ error: 'entry not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
