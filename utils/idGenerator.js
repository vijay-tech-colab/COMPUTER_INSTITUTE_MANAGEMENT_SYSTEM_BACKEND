import Student from "../models/student.model.js";
import Branch from "../models/branch.model.js";

/**
 * Generates a unique, professional registration number for a student
 * Format: CIMS-[BRANCH_CODE]-[YEAR]-[SEQUENTIAL_ID]
 * Example: CIMS-DL-2024-0015
 */
export const generateRegistrationNo = async (branchId) => {
    try {
        const branch = await Branch.findById(branchId);
        if (!branch) throw new Error("Branch not found");

        const year = new Date().getFullYear();
        const branchCode = branch.code.toUpperCase();

        // Find the number of students already registered in this branch for this year
        // We look for registration numbers starting with this year's prefix
        const prefix = `CIMS-${branchCode}-${year}-`;
        
        const lastStudent = await Student.findOne({
            registrationNo: { $regex: `^${prefix}` }
        }).sort({ registrationNo: -1 });

        let sequence = 1;
        if (lastStudent) {
            const lastNoStr = lastStudent.registrationNo.split("-").pop();
            sequence = parseInt(lastNoStr) + 1;
        }

        // Format sequence with leading zeros (e.g., 0001)
        const paddedSequence = sequence.toString().padStart(4, '0');

        return `${prefix}${paddedSequence}`;
    } catch (error) {
        console.error("Error generating registration number:", error);
        // Fallback to something unique if logic fails
        return `STU-${Date.now()}`;
    }
};
