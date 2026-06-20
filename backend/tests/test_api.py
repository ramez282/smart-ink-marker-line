from fastapi.testclient import TestClient

from app.main import app


def test_status_endpoint_returns_machine_state_and_metrics():
    with TestClient(app) as client:
        client.post("/api/machine/reset")

        response = client.get("/api/machine/status")

        assert response.status_code == 200
        data = response.json()
        assert "machine_state" in data
        assert "temperature_c" in data
        assert "total_processed" in data
        assert "parts_produced" in data
        assert "defective_count" in data
        assert "quality_score" in data
        assert "ink_volume_ml" in data


def test_machine_control_endpoints():
    with TestClient(app) as client:
        start_response = client.post("/api/machine/start")
        assert start_response.status_code == 200
        assert start_response.json()["status"]["machine_state"] == "RUNNING"

        stop_response = client.post("/api/machine/stop")
        assert stop_response.status_code == 200
        assert stop_response.json()["status"]["machine_state"] == "STOPPED"

        reset_response = client.post("/api/machine/reset")
        assert reset_response.status_code == 200
        reset_status = reset_response.json()["status"]
        assert reset_status["machine_state"] == "STOPPED"
        assert reset_status["total_processed"] == 0
