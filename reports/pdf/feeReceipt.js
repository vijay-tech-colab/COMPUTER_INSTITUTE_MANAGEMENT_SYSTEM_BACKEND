import PDFDocument from "pdfkit";

export const generateFeeReceiptPDF = (data, stream) => {
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(stream);
    doc.fontSize(20).text("FEE RECEIPT", { align: "center" });
    doc.end();
};
