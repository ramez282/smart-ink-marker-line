export type MachineState = "STOPPED" | "RUNNING" | "ERROR";
export type ProductionStage =
  | "IDLE"
  | "TIP_FEEDING"
  | "INK_FILLING"
  | "BODY_ASSEMBLY"
  | "CAP_FITTING_QC";

export interface ProductResult {
  serial_number: number;
  defective: boolean;
  defect_reason: string | null;
  cycle_time_seconds: number;
  tip_placed: boolean;
  fill_volume_ml: number;
  body_aligned: boolean;
  cap_force_n: number;
  final_stage?: ProductionStage;
  quality_score?: number;
  quality_status?: "PASS" | "FAIL";
  major_defect?: boolean;
  failure_explanation?: string | null;
}

export interface ProductionStatus {
  machine_state: MachineState;
  production_state: ProductionStage;
  errors: string[];
  current_product_serial: number | null;
  parts_produced: number;
  total_processed: number;
  defective_count: number;
  defective_products: ProductResult[];
  last_product: ProductResult | null;
  temperature_c: number;
  uptime_seconds: number;
  current_stage_code: number;
  quality_score: number;
  ink_volume_ml: number;
}

export interface ControlResponse {
  message: string;
  status: ProductionStatus;
}

export interface RecentProduct {
  product_id: number;
  stage: ProductionStage;
  quality_score: number;
  ink_volume_ml: number;
  status: "PASS" | "FAIL";
  defect_reason: string | null;
  failure_explanation: string | null;
}

export interface MetricsSummary {
  total_products: number;
  good_products: number;
  defective_products: number;
  yield_percent: number;
  average_quality_score: number;
  average_ink_volume_ml: number;
  machine_temperature: number;
}

export interface QualityReport {
  pass_rate_percentage: number;
  total_passed: number;
  total_failed: number;
  defect_reason_counts: Record<string, number>;
  recent_failed_products: RecentProduct[];
  failure_explanations: string[];
}

export interface EventLogEntry {
  timestamp: string;
  event_type: string;
  message: string;
  severity: "INFO" | "WARNING" | "ERROR";
  related_product_id: number | null;
}

export interface MaintenanceRecommendation {
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "ERROR";
}
