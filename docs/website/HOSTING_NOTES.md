# Website Hosting Notes

The project is already split into a static frontend and API backend.

## Frontend

The React app builds to static files:

```bash
cd frontend
npm install
npm run build
```

The generated `dist/` folder can be hosted on services such as Vercel, Netlify, GitHub Pages, or an Nginx server.

## Backend

The FastAPI backend can be hosted on a Python server or container platform. In production, set:

- `INFLUXDB_URL`
- `INFLUXDB_TOKEN`
- `INFLUXDB_ORG`
- `INFLUXDB_BUCKET`
- `CORS_ORIGINS`

## Grafana and InfluxDB

For a public hosted version, keep InfluxDB and Grafana behind authentication. Never commit real tokens to GitHub.
