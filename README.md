# 🎓 CIMS Backend - Computer Institute Management System

A robust, scalable, and modular backend for managing computer institutes. Built with **Node.js, Express, and MongoDB**, it features real-time notifications, automated PDF reports, and payment gateway integration.

---

## 🚀 Features

- **🔐 Advanced Auth**: Role-based access control (Admin, Staff, Student) with JWT & Bearer Tokens.
- **💼 Admission System**: Enquiry-to-enrollment lifecycle with document uploads to Cloudinary.
- **💰 Fee Management**: Track payments, generate PDF receipts, and integrate with Razorpay.
- **📊 Interactive Dashboard**: Role-specific statistics and live activity feeds.
- **📅 Attendance & Batches**: Batch scheduling and daily attendance tracking with summaries.
- **📝 Exams & Results**: Automated grading, pass/fail logic, and performance reports.
- **📧 Communication**: Premium HTML email notifications using EJS templates.
- **📜 Library (Books)**: Track book stock and physical/digital availability.
- **📄 Professional Reports**: Automated generation of Admission Forms and Invoices in PDF.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Cloud Storage**: Cloudinary (Image & Doc uploads)
- **Payment Gateway**: Razorpay
- **PDF Generation**: PDFKit
- **Emailing**: Nodemailer + EJS Templates
- **Excel Support**: ExcelJS
- **Security**: Helmet, CORS, BCryptJS

---

## 📂 Folder Structure

```
backend/
├── controllers/    # Business logic for all modules
├── models/         # Mongoose Schemas & Database Models
├── routers/        # API Endpoints & Route Definitions
├── middlewares/    # Auth, Error handling, and Security
├── services/       # External integrations (Email, etc.)
├── reports/        # Specialized PDF & Excel layout logic
│   ├── pdf/        # PDF Forms, Receipts, Invoices
│   └── excel/      # Spreadsheet export logic
├── utils/          # Reusable helpers (Cloudinary, sendResponse, etc.)
├── db/             # Database connection setup
└── app.js          # Express app initialization
```

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js installed
- MongoDB (Local or Atlas)
- Cloudinary Account
- Razorpay Account (Test Mode)

### 2. Clone and Install
```bash
cd CIMS/backend
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add the following keys:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLIENT_NAME=your_name
CLOUDINARY_CLIENT_API=your_key
CLOUDINARY_CLIENT_SECRET=your_secret

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Payment
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Run the Project
```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## 📡 API Documentation (Overview)

| Module | Base Route | Key Features |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | Login, Register, Profile, Forgot Password |
| **Admission** | `/api/v1/admissions` | Enquiry, Approval, Enrollment |
| **Fees** | `/api/v1/fees` | Payment Records, Collection Stats |
| **Attendance**| `/api/v1/attendance`| Mark Daily, Summary Reports |
| **Exams** | `/api/v1/exams` | Schedule, Upload Marks, Grading |
| **Dashboard** | `/api/v1/dashboard` | Admin, Staff & Student Widgets |
| **Reports** | `/api/v1/reports` | Download PDF Receipts, Export Excel |

---

## 🛡️ Security & Errors
- **Global Error Handling**: Centralized middleware using `ErrorHandler` class.
- **Async Wrapper**: No `try-catch` mess in controllers using `catchAsyncErrors`.
- **RBAC**: Strict role validation before sensitive operations.

---

## 👨‍💻 Developed By
**CIMS Development Team**
*"Building the future of Education Management"*
