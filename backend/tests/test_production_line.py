import asyncio

from app.models import MachineState, ProductionStage
from app.production_line import ProductionLineSimulator


def run_async(coro):
    return asyncio.run(coro)


def test_machine_starts_correctly():
    line = ProductionLineSimulator()

    status = run_async(line.start())

    assert status.machine_state == MachineState.RUNNING
    assert status.production_state == ProductionStage.IDLE


def test_machine_stops_correctly():
    line = ProductionLineSimulator()
    run_async(line.start())

    status = run_async(line.stop())

    assert status.machine_state == MachineState.STOPPED
    assert status.production_state == ProductionStage.IDLE


def test_machine_resets_correctly():
    line = ProductionLineSimulator()
    run_async(line.start())
    run_async(line.tick())

    status = run_async(line.reset())

    assert status.machine_state == MachineState.STOPPED
    assert status.total_processed == 0
    assert status.parts_produced == 0
    assert status.defective_count == 0
    assert status.errors == []


def test_product_can_be_marked_defective():
    line = ProductionLineSimulator()

    quality_score, major_defect, reasons = line._quality_control_check(
        tip_placed=False,
        fill_volume_ml=5.0,
        body_aligned=True,
        cap_force_n=18.0,
    )
    quality_status = "PASS" if quality_score >= 80 and not major_defect else "FAIL"

    assert quality_status == "FAIL"
    assert major_defect is True


def test_defective_product_has_clear_reason():
    line = ProductionLineSimulator()

    _, _, reasons = line._quality_control_check(
        tip_placed=False,
        fill_volume_ml=4.5,
        body_aligned=False,
        cap_force_n=22.0,
    )

    assert reasons
    assert "tip missing or not seated" in reasons
    assert any("ink underfill" in reason for reason in reasons)
    assert "body halves misaligned" in reasons
    assert any("cap fitting force too high" in reason for reason in reasons)


def test_quality_score_is_calculated():
    line = ProductionLineSimulator()

    perfect_score, _, _ = line._quality_control_check(
        tip_placed=True,
        fill_volume_ml=5.0,
        body_aligned=True,
        cap_force_n=18.0,
    )
    poor_score, _, _ = line._quality_control_check(
        tip_placed=False,
        fill_volume_ml=4.4,
        body_aligned=False,
        cap_force_n=23.0,
    )

    assert perfect_score == 100.0
    assert 0 <= poor_score < 80
