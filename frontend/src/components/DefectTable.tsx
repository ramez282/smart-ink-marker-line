import type { ProductResult } from "../types/production";

interface DefectTableProps {
  defectiveProducts: ProductResult[];
  lastProduct: ProductResult | null;
}

export function DefectTable({ defectiveProducts, lastProduct }: DefectTableProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Quality Check</h2>
        {lastProduct && (
          <span className={lastProduct.defective ? "badge bad" : "badge good"}>
            Last #{lastProduct.serial_number}: {lastProduct.defective ? "Defective" : "Passed"}
          </span>
        )}
      </div>

      {lastProduct?.defective && <p className="defect-callout">Marked defective because {lastProduct.defect_reason}.</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Serial</th>
              <th>Reason</th>
              <th>Fill</th>
              <th>Cap Force</th>
            </tr>
          </thead>
          <tbody>
            {defectiveProducts.length === 0 ? (
              <tr>
                <td colSpan={4}>No defective markers recorded.</td>
              </tr>
            ) : (
              defectiveProducts.map((product) => (
                <tr key={product.serial_number}>
                  <td>#{product.serial_number}</td>
                  <td>{product.defect_reason}</td>
                  <td>{product.fill_volume_ml.toFixed(2)} ml</td>
                  <td>{product.cap_force_n.toFixed(2)} N</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
