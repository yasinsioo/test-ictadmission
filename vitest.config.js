import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run tests in a single worker thread so all modules share
    // the same Node.js module cache (critical for the better-sqlite3 singleton)
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
