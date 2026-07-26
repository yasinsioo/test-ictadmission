'use strict';

const path = require('path');
const db = require('./db'); // also creates table via CREATE TABLE IF NOT EXISTS

const { count } = db.prepare('SELECT COUNT(*) AS count FROM entries').get();

if (count === 0) {
  const samples = require(path.join(__dirname, '..', 'sample-data', 'data.json'));

  const insert = db.prepare(
    'INSERT INTO entries (title, body, lat, lon, isoTime) VALUES (@title, @body, @lat, @lon, @isoTime)'
  );

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insert.run({ ...row, lat: row.lat ?? null, lon: row.lon ?? null, isoTime: new Date().toISOString() });
    }
  });

  insertMany(samples);
  console.log(`Seeded ${samples.length} entries.`);
} else {
  console.log(`DB already has ${count} entries.`);
}

console.log('Done.');
