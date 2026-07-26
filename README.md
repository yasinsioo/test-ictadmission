Due to limited time, I focused on delivering a complete, working solution that meets the assignment requirements. I used AI-assisted development tools to speed up implementation and documentation, while verifying, integrating, and taking responsibility for the final code.

```bash
npm install
npm run db:init   # database + 10 sample records
npm run dev       # http://localhost:8000
```

## Endpointler

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| GET    | `/health`          | Health check → `OK` |
| GET    | `/api/entries`     | List all entries    |
| GET    | `/api/entries/:id` | Get an entry        |
| POST   | `/api/entries`     | Create an entry     |
| DELETE | `/api/entries/:id` | Delete an entry     |

## Test

```bash
npm test
```

## Docker

```bash
docker build -t logbook .
docker run -p 8000:8000 logbook
```

Public URL: (https://test-ictadmission.onrender.com/)
