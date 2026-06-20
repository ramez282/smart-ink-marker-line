import type { RecentProduct } from "../types/production";
import { formatStage } from "../services/formatters";

export function RecentProductsTable({ products }: { products: RecentProduct[] }) {
  return (
    <section className="panel product-table-panel">
      <div className="panel-heading table-heading">
        <span>Inspection Records</span>
        <strong>Recent Products</strong>
      </div>
      <div className="table-shell">
        <table className="hmi-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Stage</th>
              <th>Quality</th>
              <th>Ink Volume</th>
              <th>Status</th>
              <th>Defect Reason</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6}>No products completed yet.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.product_id}>
                  <td>#{product.product_id}</td>
                  <td>{formatStage(product.stage)}</td>
                  <td>{product.quality_score.toFixed(0)}%</td>
                  <td>{product.ink_volume_ml.toFixed(2)} ml</td>
                  <td>
                    <span className={`badge ${product.status === "PASS" ? "good" : "bad"}`}>{product.status}</span>
                  </td>
                  <td>{product.defect_reason ?? "None"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
