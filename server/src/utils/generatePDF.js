import PDFDocument from 'pdfkit';

export const generatePaymentSlip = (order, paymentDetails) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Payment Receipt', { align: 'center' });
      doc.moveDown();

      // Order Information
      doc.fontSize(14).text('Order Information', { underline: true });
      doc.fontSize(12);
      doc.text(`Order ID: ${order._id}`);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
      doc.text(`Payment ID: ${paymentDetails.paymentId}`);
      doc.moveDown();

      // Items
      doc.fontSize(14).text('Items', { underline: true });
      doc.fontSize(12);
      order.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.name} - Qty: ${item.quantity} - NRS ${item.price * item.quantity}`);
      });
      doc.moveDown();

      // Total
      doc.fontSize(14);
      doc.text(`Total Amount: NRS ${order.totalAmount}`, { align: 'right' });
      if (order.discountAmount > 0) {
        doc.text(`Discount: NRS ${order.discountAmount}`, { align: 'right' });
        doc.text(`Final Amount: NRS ${order.totalAmount - order.discountAmount}`, { align: 'right' });
      }
      doc.moveDown();

      // Footer
      doc.fontSize(10).text('Thank you for your purchase!', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

