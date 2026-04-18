import PDFDocument from "pdfkit";

export const generateAdmissionFormPDF = (data, stream) => {
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(stream);
    doc.fontSize(20).text("ADMISSION FORM", { align: "center" });
    doc.end();
};
