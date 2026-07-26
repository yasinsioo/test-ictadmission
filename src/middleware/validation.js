'use strict';

/**
 * Validates POST /api/entries body.
 * Rules:
 *   title  — required, max 120 chars
 *   body   — required
 *   lat    — optional, must be a number if provided
 *   lon    — optional, must be a number if provided
 */
function validateEntry(req, res, next) {
  const { title, body, lat, lon } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (title.trim().length > 120) {
    return res.status(400).json({ error: 'title must be 120 characters or fewer' });
  }
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return res.status(400).json({ error: 'body is required' });
  }
  if (lat !== undefined && lat !== null && typeof lat !== 'number') {
    return res.status(400).json({ error: 'lat must be a number' });
  }
  if (lon !== undefined && lon !== null && typeof lon !== 'number') {
    return res.status(400).json({ error: 'lon must be a number' });
  }

  next();
}

module.exports = { validateEntry };
