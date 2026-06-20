# Smart Ink Marker Manufacturing Production Line Simulator

## Aim

This project simulates an automated production line for assembling ink markers. It demonstrates mechatronics concepts such as sequential operation, HMI control, process monitoring, quality inspection, defect logging, database metrics, and dashboard visualization.

## Production Stages

1. Tip feeding and placement
2. Ink container filling
3. Body assembly
4. Cap fitting and final quality check

## Defect Logic

Each marker is inspected after the four stages. A product is marked defective when one or more process conditions fail:

- Tip is missing or not seated.
- Ink fill is below 4.7 ml or above 5.3 ml.
- Body halves are misaligned.
- Cap fitting force is below 15 N or above 21 N.

The HMI displays the serial number and exact defect reason for each failed marker.

## Software Stack

- Python FastAPI backend for production-line logic and REST APIs.
- React, Vite, and TypeScript frontend for the HMI.
- InfluxDB 2.x for time-series metrics including machine temperature, machine state code, product totals, defect totals, stage code, quality score, and ink volume.
- Grafana for dashboard visualization.
- Docker Compose for local deployment.

## Git, GitHub, Docker, and AI Tool Usage

Git can be used to track project changes using commits. GitHub can host the repository, support collaboration, and later connect to deployment platforms. Docker packages the backend, frontend, InfluxDB, and Grafana into reproducible containers. AI tools can support code generation, debugging, documentation drafting, and viva preparation, but the student should understand the control flow, defect rules, and metric pipeline.

## Hosting Preparation

The frontend is separated from the backend and can later be hosted as a static website. The backend exposes REST APIs and can be deployed independently. Environment variables are kept in `.env.example` so production secrets can be configured without changing code.
