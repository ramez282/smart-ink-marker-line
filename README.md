# Smart Ink Marker Manufacturing Production Line Simulator

## Short Description

The **Smart Ink Marker Manufacturing Production Line Simulator** is an Applied Mechatronics project that simulates an automated production line for assembling ink markers. The system includes a Python FastAPI backend, a modern React HMI dashboard, InfluxDB time-series storage, Grafana visualization, Docker Compose deployment, quality control logic, SCADA-style event logging, and simple CMMS-style maintenance recommendations.

The project is designed to be professional enough for a university submission while remaining simple enough to explain clearly during a viva.

## Assignment Requirement Mapping

| Requirement | Implementation |
| --- | --- |
| Backend in Python | FastAPI simulation logic |
| Frontend HMI | React control dashboard |
| Database | InfluxDB stores production metrics |
| Dashboard | Grafana visualizes temperature, state, parts produced |
| Defective product logic | Rule-based quality checks |
| Start/Stop/Reset | HMI buttons and backend APIs |
| Four production stages | Tip feeding, ink filling, body assembly, cap fitting and final QC |
| Docker support | Docker Compose runs backend, frontend, InfluxDB, and Grafana |
| AI tools explanation | Included in declaration section |
| Hosting preparation | Frontend and backend are separated for future deployment |

## Features

- Four-stage marker manufacturing simulation.
- Start, Stop, and Reset machine controls.
- Modern dark industrial HMI dashboard.
- Live machine state, production stage, temperature, quality score, and counters.
- Rule-based defect detection with clear failure reasons.
- Quality Control module with pass rate, defect reason counts, and failed product explanations.
- Recent products table with product ID, stage, quality score, ink volume, status, and defect reason.
- SCADA-style event log for machine events, quality failures, and warnings.
- CMMS-style maintenance recommendations for cooling, quality inspection, and machine faults.
- InfluxDB integration for production metrics.
- Grafana dashboard provisioning.
- Docker Compose setup for repeatable execution.
- Basic backend tests using pytest.

## System Architecture

```text
React + Vite HMI
      |
      | REST API + WebSocket
      v
Python FastAPI Backend
      |
      | Simulation, QC, Events, Maintenance Logic
      v
InfluxDB 2.x  <---- Grafana Dashboard
```

The backend acts like a simplified PLC/controller. It advances products through production stages, evaluates quality, updates counters, records events, and writes metrics to InfluxDB. The frontend acts as the HMI, allowing the operator to control and monitor the line. Grafana reads InfluxDB metrics for time-series visualization.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Backend | Python, FastAPI, Pydantic |
| Frontend | React, Vite, TypeScript |
| Styling | CSS |
| Database | InfluxDB 2.x |
| Dashboard | Grafana |
| Containerization | Docker Compose |
| Testing | pytest, httpx |

## Production Line Stages

1. **Tip Feeding and Placement**  
   Simulates feeding the marker tip and checking whether it is seated correctly.

2. **Ink Container Filling**  
   Simulates ink filling with a target volume of approximately 5.0 ml.

3. **Body Assembly**  
   Simulates joining and aligning the marker body components.

4. **Cap Fitting and Final Quality Check**  
   Simulates cap fitting force and performs final quality evaluation.

## Defect Detection Rules

A product is marked as failed when the quality score is below 80 or when a major defect exists.

Major defect examples:

- Tip missing or not seated.
- Ink volume below 4.7 ml.
- Ink volume above 5.3 ml.
- Body halves misaligned.
- Cap fitting force below 15 N.
- Cap fitting force above 21 N.

Quality score is calculated from:

- Tip placement status.
- Ink volume accuracy.
- Body alignment.
- Cap fitting force.

The HMI displays failed products with a clear explanation, such as ink underfill, cap force too high, or body misalignment.

## Backend API List

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Backend health check |
| GET | `/api/machine/status` | Current machine and production status |
| POST | `/api/machine/start` | Start production line |
| POST | `/api/machine/stop` | Stop production line |
| POST | `/api/machine/reset` | Reset counters, alarms, and product data |
| GET | `/api/products/recent` | Recent product inspection records |
| GET | `/api/metrics/summary` | Production summary metrics |
| GET | `/api/quality/report` | Quality Control report |
| GET | `/api/events` | SCADA-style event log |
| GET | `/api/maintenance/recommendations` | CMMS-style maintenance recommendations |
| WS | `/ws/live` | Live machine status stream |

## InfluxDB and Grafana Explanation

InfluxDB is used as the time-series database for production metrics. The backend writes metrics such as:

- `machine_temperature`
- `machine_state`
- `total_products`
- `good_products`
- `defective_products`
- `current_stage_code`
- `quality_score`
- `ink_volume_ml`

Grafana connects to InfluxDB using provisioning files and displays the production data in dashboard panels. This allows trends such as machine temperature, machine state, good products, and defective products to be monitored over time.

## Docker Setup Instructions

The complete project can be started with Docker Compose.

Optional environment setup:

```bash
cp .env.example .env
```

Start all services:

```bash
docker compose up --build
```

Open the services:

| Service | URL |
| --- | --- |
| HMI Frontend | http://localhost:5173 |
| Backend API Docs | http://localhost:8000/docs |
| InfluxDB | http://localhost:8086 |
| Grafana | http://localhost:3000 |

Default Grafana login:

- Username: `admin`
- Password: `admin`

Default InfluxDB values:

- Organization: `university`
- Bucket: `production_line`
- Token: configured in `.env.example`

## Local Setup Instructions

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend tests:

```bash
cd backend
pytest
```

## Screenshots

Add screenshots to `docs/screenshots/` before submission.

Suggested screenshots:

| Screenshot | Placeholder |
| --- | --- |
| HMI dashboard | `docs/screenshots/hmi-dashboard.png` |
| Running machine state | `docs/screenshots/running-state.png` |
| Defective product record | `docs/screenshots/defective-product.png` |
| Quality Control section | `docs/screenshots/quality-control.png` |
| Event log and maintenance panel | `docs/screenshots/events-maintenance.png` |
| Grafana dashboard | `docs/screenshots/grafana-dashboard.png` |

## Static Website and GitHub Pages

A simple static project website is included in `docs/website/`.

Files:

- `docs/website/index.html`
- `docs/website/style.css`
- `docs/website/script.js`

To host using GitHub Pages:

1. Push this repository to GitHub.
2. In the GitHub repository, open **Settings**.
3. Go to **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the main branch and choose the `/docs` folder.
6. Save the Pages settings.
7. Open the generated Pages URL and add `/website/` at the end.

Example:

```text
https://username.github.io/repository-name/website/
```

The static website is separate from the React HMI. It is intended as a public project summary page for submission evidence.

## AI Tools Declaration

AI tools were used as development support for code generation, documentation drafting, debugging assistance, and project structuring. The final project logic, architecture, and explanations should be reviewed and understood by the student before submission.

The student should be able to explain:

- How the production simulation works.
- How Start, Stop, and Reset affect machine state.
- How defect rules are applied.
- How quality score is calculated.
- How metrics are written to InfluxDB.
- How Grafana visualizes production data.
- How Docker Compose starts the complete system.

## Future Improvements

- Add user authentication for operator and supervisor roles.
- Store event logs and product records permanently in a database.
- Add manual mode for operating each station independently.
- Add adjustable process parameters from the HMI.
- Add alarm acknowledgement workflow.
- Add exportable production reports.
- Add more advanced Grafana panels and alert rules.
- Deploy the frontend and backend to a cloud hosting platform.

## Author Details

| Field | Details |
| --- | --- |
| Student Name | Ramez ismail |
| Student ID | 100007500 |
| Course | Programming 2 |
| Module | Applied Mechatronics |
| Instructor | Esteban Pozo |
| University | Srh university |
| Submission Date | 20 june 2026 |
