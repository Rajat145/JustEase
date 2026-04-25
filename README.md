# ⚖️ JustEase — Legal-Tech Platform

A full-stack platform that digitizes and simplifies Indian judicial paperwork and basic legal processes.

## 🗂️ Project Structure

```
justease/
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API
└── README.md
```

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env      # Fill in your values
npm run dev               # Starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env      # Fill in your values
npm run dev               # Starts on http://localhost:5173
```

## 👥 Demo Credentials

| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | admin@justease.in   | Admin@123  |
| Judge | judge@justease.in   | Judge@123  |
| User  | user@justease.in    | User@123   |

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, jsPDF, React Hook Form
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Multer, Nodemailer
- **Storage**: Local (Multer) — swap with Cloudinary/S3 via config

## 📋 Features

- 🔐 JWT-based Auth with Role-Based Access (Admin / Judge / User)
- ✍️ Affidavit Generator with PDF export
- 📁 Case Filing & Tracking System
- ⚖️ Case Assignment (Admin → Judge)
- 📅 Hearing Scheduling + Email Notifications
- 💬 AI Legal Chat Assistant
- 📄 Document Upload & Management
- 📊 Admin Analytics Dashboard

## ⚠️ Legal Disclaimer

JustEase is a digital **assistance** platform, not an official government court system. All documents require official verification. Case filing is assisted/simulated unless integrated with real court systems.
