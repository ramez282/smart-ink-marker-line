# Smart Ink Marker Manufacturing Production Line Simulator

## Title Page

**Project Title:** Smart Ink Marker Manufacturing Production Line Simulator  
**Module:** Applied Mechatronics  
**Student Name:** _Add student name here_  
**Student ID:** _Add student ID here_  
**Instructor:** _Add instructor name here_  
**University:** _Add university name here_  
**Submission Date:** _Add submission date here_

---

## 1. Introduction

### Product Selected

The selected product for this project is an **ink marker**. An ink marker is a suitable product for an Applied Mechatronics simulation because it contains multiple small components, requires controlled assembly, and has measurable quality conditions such as ink volume, tip placement, body alignment, and cap fitting force.

The project simulates a smart production line that manufactures ink markers and checks whether each product passes or fails quality control. The simulation is not connected to real sensors or actuators, but it represents the logic that could be used in an automated production system.

### Ink Marker Components

The simulated ink marker consists of the following main components:

- Marker tip
- Ink container or ink reservoir
- Marker body
- Cap

Each component is handled at a different stage of the production line. If a component is missing, incorrectly placed, or outside the accepted tolerance, the product can be marked as defective.

### Production Line Concept

The production line is designed as a four-stage automated process:

1. Tip feeding and placement
2. Ink container filling
3. Body assembly
4. Cap fitting and final quality check

The main idea is to simulate how a product moves through each station, how production data is recorded, and how an HMI can be used to control and monitor the machine. The project also includes optional industrial features such as a SCADA-style event log and CMMS-style maintenance recommendations.

---

## 2. System Design and Architecture

The system uses a modern full-stack architecture. The backend controls the production simulation, the frontend acts as the HMI, InfluxDB stores production metrics, and Grafana displays selected metrics in dashboard form.

```text
React + Vite HMI
      |
      | REST API and WebSocket
      v
Python FastAPI Backend
      |
      | Production simulation and metrics
      v
InfluxDB 2.x  ---->  Grafana Dashboard
```

### Backend

The backend is written in Python using FastAPI. It contains the production line simulation logic, machine control APIs, quality control rules, event logging, and maintenance recommendation logic.

The backend provides endpoints for:

- Starting the machine
- Stopping the machine
- Resetting the machine
- Reading machine status
- Reading recent product records
- Reading quality reports
- Reading event logs
- Reading maintenance recommendations

The backend also provides a WebSocket endpoint for live status updates.

### Frontend HMI

The frontend is built using React, Vite, and TypeScript. It acts as a Human Machine Interface (HMI). The HMI includes:

- Machine status card
- Start, Stop, and Reset buttons
- Production stage stepper
- Production metric cards
- Recent product table
- Error alert panel
- Quality control section
- Event log panel
- Maintenance recommendation panel

The design uses a dark industrial dashboard style to make the interface look similar to a modern control panel.

### InfluxDB

InfluxDB is used as the time-series database. The backend writes production metrics to InfluxDB, including:

- Machine temperature
- Machine state code
- Total products
- Good products
- Defective products
- Current production stage code
- Quality score
- Ink volume

InfluxDB is suitable for this type of data because production metrics change over time and can be visualized as trends.

### Grafana

Grafana is used to visualize the metrics stored in InfluxDB. The project includes Grafana provisioning files for the datasource and dashboard. Grafana can display trends such as temperature, machine state, good products, and defective products.

### Docker

Docker Compose is used to run the complete system. The compose setup includes:

- Backend container
- Frontend container
- InfluxDB container
- Grafana container

This makes the project easier to run and demonstrate because all required services can be started using one command:

```bash
docker compose up --build
```

---

## 3. Program Implementation

### Production Stages

The simulation includes four main production stages.

**Stage 1: Tip Feeding and Placement**  
The system simulates whether the marker tip is placed correctly. If the tip is missing or not seated, the product is treated as a major defect.

**Stage 2: Ink Container Filling**  
The system simulates ink filling. The target fill volume is approximately 5.0 ml. If the fill volume is below 4.7 ml or above 5.3 ml, the product fails quality control.

**Stage 3: Body Assembly**  
The marker body is assembled and checked for alignment. If the body halves are misaligned, the product is marked as defective.

**Stage 4: Cap Fitting and Final Quality Check**  
The cap fitting force is simulated. If the force is below 15 N or above 21 N, the product fails quality control.

### Machine States

The backend uses simple machine states:

- `STOPPED`
- `RUNNING`
- `ERROR`

When the machine is running, the simulator produces products at a regular interval. When the machine is stopped, production does not continue. If a machine fault occurs, the machine enters the error state.

### Defect Detection Logic

The product is checked using rule-based logic. A product can fail because of:

- Missing or incorrectly seated tip
- Ink underfill
- Ink overfill
- Body misalignment
- Cap fitting force too low
- Cap fitting force too high
- Quality score below the pass threshold

The program clearly records why a product failed. This is shown in the HMI and in the recent product table.

### Quality Control

The Quality Control module calculates a quality score from four checks:

- Tip placement
- Ink volume accuracy
- Body alignment
- Cap fitting

Each product receives a quality score. A product passes if:

- The quality score is at least 80
- No major defect exists

A product fails if:

- The quality score is below 80
- A major defect exists

The frontend displays the pass rate, failed products, defect reason counts, and clear explanations of why products failed.

---

## 4. Tool Usage

### Git and GitHub

Git can be used to track all code changes during development. A GitHub repository can be used to store the project online, share the code, and provide evidence of version control. The project structure is suitable for uploading to GitHub.

[Insert Screenshot 6: GitHub repository]

### Docker

Docker is used to package and run the backend, frontend, InfluxDB, and Grafana services. Docker Compose makes it possible to start the whole system with one command. This is useful for demonstration because the project does not require each service to be manually installed and configured.

[Insert Screenshot 5: Docker containers running]

### InfluxDB

InfluxDB stores the production metrics generated by the backend. These metrics are time-based, so InfluxDB is appropriate for storing and querying them.

[Insert Screenshot 3: InfluxDB bucket]

### Grafana

Grafana connects to InfluxDB and displays production metrics in dashboard form. This makes it easier to observe trends and machine performance.

[Insert Screenshot 4: Grafana dashboard]

### AI Tools Such as Codex/ChatGPT

AI tools such as Codex or ChatGPT may be used to support development, documentation, debugging, and explanation. The student should still understand the final code and be able to explain the design choices during the viva.

AI support was used as an assistant for generating starter code, improving structure, preparing documentation, and identifying errors. The final project should be reviewed by the student before submission.

---

## 5. Results and Testing

### Screenshots Placeholders

[Insert Screenshot 1: HMI dashboard running]

[Insert Screenshot 2: Backend terminal logs]

[Insert Screenshot 3: InfluxDB bucket]

[Insert Screenshot 4: Grafana dashboard]

[Insert Screenshot 5: Docker containers running]

[Insert Screenshot 6: GitHub repository]

### Example Machine States

The HMI shows the current machine state. Example states include:

- `STOPPED`: the machine is idle and not producing markers.
- `RUNNING`: the machine is producing markers.
- `ERROR`: the machine has entered a fault condition.

The HMI also shows the current production stage, such as tip feeding, ink filling, body assembly, or cap fitting and final quality check.

### Example Defective Products

The recent products table displays whether each product passed or failed. Failed products include a clear reason, for example:

- Tip missing or not seated
- Ink underfill
- Ink overfill
- Body halves misaligned
- Cap fitting force too high

The Quality Control section also explains why recent failed products did not pass.

### Grafana Dashboard Result

Grafana is configured to read production metrics from InfluxDB. The dashboard can show values such as machine temperature, machine state, good products, and defective products. This helps demonstrate how industrial production data can be monitored over time.

### Backend Tests

Basic backend tests were added using pytest. The tests check:

- Machine start logic
- Machine stop logic
- Machine reset logic
- Defective product logic
- Defect reason output
- Quality score calculation
- Status API response

The tests can be run with:

```bash
cd backend
pytest
```

---

## 6. Conclusion

### Strengths

This project successfully demonstrates a smart manufacturing line simulation for an ink marker. It includes machine control, production stages, defect detection, quality scoring, an HMI dashboard, metrics storage, Grafana visualization, Docker deployment, event logging, and maintenance recommendations.

The project is modular and easy to explain. The backend handles the simulation and logic, while the frontend focuses on operator interaction and visualization.

### Weaknesses

The system is a simulation and is not connected to real sensors, actuators, PLC hardware, or physical production equipment. Product data and event logs are stored in memory, so they are not permanently saved after a backend restart. The quality rules are simplified compared with a real manufacturing inspection system.

### Future Development

Future improvements could include:

- Connecting the simulator to real PLC or microcontroller hardware.
- Storing product records and event logs permanently.
- Adding operator login and user roles.
- Adding alarm acknowledgement.
- Adding manual station control.
- Adding more detailed Grafana dashboards.
- Exporting production reports.
- Hosting the frontend and backend online.

---

## 7. Appendix

### AI Prompts Used

Example prompts used during development:

- Build a FastAPI backend for a smart ink marker production line simulator.
- Create a React and Vite HMI dashboard for an industrial production line.
- Add InfluxDB and Grafana integration.
- Add Docker Compose setup.
- Add quality control and defect detection logic.
- Add SCADA-style event log and maintenance recommendations.
- Add pytest backend tests.
- Rewrite the README for a university submission.

### AI Outputs Summary

AI assistance was used to generate and improve:

- Backend starter files
- Frontend HMI components
- Docker Compose configuration
- Grafana provisioning files
- Quality Control logic
- Documentation drafts
- Test file structure

### Errors Corrected Manually

Examples of corrections made during development:

- Fixed TypeScript build issues.
- Updated API paths to match frontend requirements.
- Added missing backend dependencies for testing.
- Added test configuration so pytest could import the backend app.
- Improved InfluxDB environment variable names.
- Ensured the backend continues running if InfluxDB is unavailable.

---

**End of Report**
