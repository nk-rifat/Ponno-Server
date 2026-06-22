const PDFDocument = require("pdfkit");

function generateReceiptPDF(order) {
  return new Promise((resolve, reject) => {
    const { delivery, items, subtotal, deliveryCharge, total } = order;

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const green = "#047857";
    const gray = "#6b7280";
    const dark = "#111827";
    const lightGray = "#f3f4f6";
    const pageWidth = doc.page.width - 80;

    // ── HEADER ──────────────────────────────────────────────
    doc
      .fontSize(22)
      .fillColor(green)
      .font("Helvetica-Bold")
      .text("Ponno", 40, 40);
    doc
      .fontSize(11)
      .fillColor(gray)
      .font("Helvetica")
      .text("Order Receipt", 40, 66);

    const orderId = order._id.toString().slice(-8).toUpperCase();
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-GB");
    const status = order.status.toUpperCase();

    doc
      .fontSize(11)
      .fillColor(dark)
      .font("Helvetica-Bold")
      .text(`Order #${orderId}`, 40, 40, { align: "right" });
    doc
      .fontSize(10)
      .fillColor(gray)
      .font("Helvetica")
      .text(orderDate, 40, 56, { align: "right" });

    doc.roundedRect(doc.page.width - 120, 70, 80, 18, 9).fill("#d1fae5");
    doc
      .fontSize(9)
      .fillColor(green)
      .font("Helvetica-Bold")
      .text(status, doc.page.width - 120, 74, { width: 80, align: "center" });

    doc
      .moveTo(40, 100)
      .lineTo(doc.page.width - 40, 100)
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .stroke();

    // ── DELIVERY INFO ────────────────────────────────────────
    doc.moveDown(1.5);
    doc
      .fontSize(10)
      .fillColor(gray)
      .font("Helvetica-Bold")
      .text("DELIVERY INFORMATION", 40);

    doc.moveDown(0.4);
    const boxTop = doc.y;
    doc
      .roundedRect(40, boxTop, pageWidth, delivery.note ? 80 : 65, 8)
      .fill(lightGray);

    doc
      .fontSize(11)
      .fillColor(dark)
      .font("Helvetica-Bold")
      .text(`${delivery.name}  ·  ${delivery.phone}`, 55, boxTop + 12);

    const addressParts = [
      delivery.address,
      delivery.upazila,
      delivery.zila,
      delivery.division,
    ]
      .filter(Boolean)
      .join(", ");

    doc
      .fontSize(10)
      .fillColor("#374151")
      .font("Helvetica")
      .text(addressParts, 55, boxTop + 28, { width: pageWidth - 30 });

    if (delivery.note) {
      doc
        .fontSize(10)
        .fillColor(gray)
        .text(`Note: ${delivery.note}`, 55, boxTop + 48, {
          width: pageWidth - 30,
        });
    }

    // ── ITEMS TABLE ──────────────────────────────────────────
    doc.y = boxTop + (delivery.note ? 95 : 80);
    doc.moveDown(0.8);

    doc.fontSize(10).fillColor(gray).font("Helvetica-Bold").text("ITEMS", 40);
    doc.moveDown(0.4);

    const tableTop = doc.y;
    doc.fontSize(9).fillColor(gray).font("Helvetica-Bold");
    doc.text("ITEM", 40, tableTop);
    doc.text("QTY", 320, tableTop, { width: 60, align: "center" });
    doc.text("PRICE", 380, tableTop, { width: 70, align: "right" });
    doc.text("TOTAL", 450, tableTop, { width: 90, align: "right" });

    doc.moveDown(0.3);
    doc
      .moveTo(40, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .stroke();

    items.forEach((item) => {
      doc.moveDown(0.4);
      const rowY = doc.y;

      doc
        .fontSize(10)
        .fillColor(dark)
        .font("Helvetica")
        .text(item.name, 40, rowY, { width: 270 });
      doc.text(String(item.quantity), 320, rowY, {
        width: 60,
        align: "center",
      });
      doc.text(`Tk ${item.price}`, 380, rowY, { width: 70, align: "right" });
      doc
        .font("Helvetica-Bold")
        .text(`Tk ${item.price * item.quantity}`, 450, rowY, {
          width: 90,
          align: "right",
        });

      doc.moveDown(0.4);
      doc
        .moveTo(40, doc.y)
        .lineTo(doc.page.width - 40, doc.y)
        .strokeColor(lightGray)
        .lineWidth(0.5)
        .stroke();
    });

    // ── TOTALS ───────────────────────────────────────────────
    doc.moveDown(1);
    const totalsX = 350;
    const totalsWidth = 190;

    doc.fontSize(10).fillColor("#4b5563").font("Helvetica");
    doc.text("Subtotal", totalsX, doc.y, { width: totalsWidth / 2 });
    doc.text(
      `Tk ${subtotal}`,
      totalsX + totalsWidth / 2,
      doc.y - doc.currentLineHeight(),
      {
        width: totalsWidth / 2,
        align: "right",
      },
    );

    doc.moveDown(0.5);
    doc.text("Delivery Charge", totalsX, doc.y, { width: totalsWidth / 2 });
    doc.text(
      `Tk ${deliveryCharge}`,
      totalsX + totalsWidth / 2,
      doc.y - doc.currentLineHeight(),
      {
        width: totalsWidth / 2,
        align: "right",
      },
    );

    doc.moveDown(0.5);
    doc
      .moveTo(totalsX, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .strokeColor(dark)
      .lineWidth(1.5)
      .stroke();
    doc.moveDown(0.5);

    doc.fontSize(13).fillColor(dark).font("Helvetica-Bold");
    doc.text("Total", totalsX, doc.y, { width: totalsWidth / 2 });
    doc.text(
      `Tk ${total}`,
      totalsX + totalsWidth / 2,
      doc.y - doc.currentLineHeight(),
      {
        width: totalsWidth / 2,
        align: "right",
      },
    );

    // ── FOOTER ───────────────────────────────────────────────
    doc
      .fontSize(10)
      .fillColor(gray)
      .font("Helvetica")
      .text("Thank you for shopping with us!", 40, doc.page.height - 60, {
        align: "center",
        width: pageWidth,
      });

    doc.end();
  });
}

module.exports = generateReceiptPDF;
