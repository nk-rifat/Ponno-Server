function receiptTemplate(order) {
  const { delivery, items, subtotal, deliveryCharge, total } = order;

  const itemsRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; color: #374151;">${item.name}</td>
          <td style="padding: 10px 0; color: #374151; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 0; color: #374151; text-align: right;">Tk ${item.price}</td>
          <td style="padding: 10px 0; color: #111827; text-align: right; font-weight: 600;">Tk ${item.price * item.quantity}</td>
        </tr>
      `,
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: 'Helvetica', Arial, sans-serif;
          margin: 0;
          padding: 40px;
          color: #111827;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }
        .brand {
          font-size: 22px;
          font-weight: 700;
          color: #047857;
        }
        .subtitle {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }
        .meta {
          text-align: right;
          font-size: 12px;
          color: #374151;
          line-height: 1.6;
        }
        .status-badge {
          display: inline-block;
          background: #d1fae5;
          color: #047857;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .delivery-box {
          background: #f9fafb;
          border-radius: 10px;
          padding: 16px;
          font-size: 13px;
          color: #374151;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        thead th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        thead th:nth-child(2) { text-align: center; }
        thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
        tbody tr {
          border-bottom: 1px solid #f3f4f6;
        }
        .totals {
          width: 260px;
          margin-left: auto;
          font-size: 13px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          color: #4b5563;
        }
        .totals-row.grand {
          border-top: 2px solid #111827;
          margin-top: 8px;
          padding-top: 12px;
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }
        .footer {
          margin-top: 60px;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">Ponno</div>
          <div class="subtitle">Order Receipt</div>
        </div>
        <div class="meta">
          <div>Order #${order._id.toString().slice(-8).toUpperCase()}</div>
          <div>${new Date(order.createdAt).toLocaleDateString()}</div>
          <div style="margin-top: 4px;">
            <span class="status-badge">${order.status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div class="section-title">Delivery Information</div>
      <div class="delivery-box">
        <div><strong>${delivery.name}</strong> &middot; ${delivery.phone}</div>
        <div>
          ${delivery.address ? delivery.address + ", " : ""}${delivery.upazila ? delivery.upazila + ", " : ""}${delivery.zila}, ${delivery.division}
        </div>
        ${delivery.note ? `<div style="margin-top: 4px; color: #6b7280;">Note: ${delivery.note}</div>` : ""}
      </div>

      <div class="section-title">Items</div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>Tk ${subtotal}</span>
        </div>
        <div class="totals-row">
          <span>Delivery Charge</span>
          <span>Tk ${deliveryCharge}</span>
        </div>
        <div class="totals-row grand">
          <span>Total</span>
          <span>Tk ${total}</span>
        </div>
      </div>

      <div class="footer">Thank you for shopping with us!</div>
    </body>
  </html>
  `;
}

module.exports = receiptTemplate;
