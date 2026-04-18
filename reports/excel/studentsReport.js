import ExcelJS from "exceljs";

export const generateStudentsExcel = async (data, stream) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");
    // Excel logic...
    await workbook.xlsx.write(stream);
};
