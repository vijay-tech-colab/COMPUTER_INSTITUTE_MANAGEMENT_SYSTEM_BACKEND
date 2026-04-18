import PDFDocument from "pdfkit";

export const generateInvoicePDF = (data, stream) => {
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(stream);
    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.end();
};
