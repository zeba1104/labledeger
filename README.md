# LabLedger — Research Sample Tracking & Digital Logbook

A modern, responsive, clinical digital logbook designed for small research teams, biobanks, and scientific labs. Built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js) with Tailwind CSS, Lucide icons, and clinical animations.

---

## 🔬 Key PDF Specifications & Features Implemented

| Feature | Specification | Implementation in LabLedger |
| :--- | :--- | :--- |
| **Sample IDs** | Unique auto-generated identifier (e.g. `LAB-2026-0001`) | Auto-sequence engine per year with custom prefix configuration in Lab Settings |
| **QR Labels** | Printable QR label stuck on tubes/boxes; phone scanning opens page | High-density 2D QR generator, printable cryotube sheet view, and interactive optical scanner with laser reticle |
| **Storage Map** | Visual physical layout drilled down level by level (`Room → Freezer → Shelf → Rack → Box → Position`) | Interactive 5-level hierarchy breadcrumb + 9x9 / 8x12 interactive cryogenic grid matrix with hover tooltips and slot booking |
| **Transfer Log** | Unbroken record of moves between locations or people (*"Sample 0001 moved from Freezer 1 to Freezer 2 by Anita..."*) | Full chain of custody ledger with origin, destination, custodian, reason, and PI approval |
| **Experiment Notes** | Notes about experiments linked to samples used (*"Used samples 0001 and 0002 for PCR test..."*) | Multi-sample assay linkage, protocol tags (`PCR`, `Sequencing`), observations, and outcome logs |
| **Audit History** | Automatic, unalterable record of who did what and when across the whole system | Append-only forensic audit trail, value delta tracking, and one-click regulatory CSV export |
| **Role-Based Access** | 4 distinct roles with strict permission boundaries | Admin (PI), Researcher (Scientist), Technician (Staff), Viewer (Auditor) + 1-click role switcher |

---

## 👥 Pre-Configured Test Accounts (One-Click Testing)

You can sign in with any of these pre-seeded lab accounts (password for all: `password123`) or click any **1-Click Demo** button:

1. **Primary PI Director**:
   - Email: `zeba.zaveri57@gmail.com`
   - Password: `password123` (or `12345`)
   - Permissions: Unrestricted authority. Storage builder, user role management, transfer approvals, registry.
2. **Admin (Lab Director)**:
   - Email: `admin@yopmail.com`
   - Permissions: Full administrative laboratory authority.
3. **Researcher (Senior Molecular Biologist)**:
   - Email: `researcher@yopmail.com`
   - Permissions: Specimen registration, transfer creation, experiment notes & assay logs, QR label printing.
4. **Technician (Specimen Technician)**:
   - Email: `tech@yopmail.com`
   - Permissions: QR scanning, receiving specimens, updating quantities/aliquots & status, recording moves.
5. **Viewer / Auditor (Compliance Auditor)**:
   - Email: `auditor@yopmail.com`
   - Permissions: Strictly read-only inspection of specimens, storage maps, transfer chains, and exportable regulatory audit logs.

---

## 🎨 Theme & User Experience

- **Color Palette**: Laboratory Crimson (`#DC2626`, `#B91C1C`, `#991B1B`), Pure Sterile White (`#FFFFFF`), Soft Rose Tints (`#FFF1F2`), Slate text (`#0F172A`).
- **Animations**: Laser reticle sweep on QR scanner, subtle bio-float particles, pulse status badges, confetti burst on sample registration.
- **Onboarding Flow**: Classy welcome product tour before login highlighting the sample life cycle chain with instant persona launchpads.
- **Responsive**: Fully optimized for Desktop, Laptop, Tablet, and Mobile.

---

## 🗄️ MongoDB Atlas Setup

The connection string provided:
```
mongodb+srv://zebazaveri57_db_user:<db_password>@cluster0.gir6czu.mongodb.net/
```
In `server/.env`, replace `<db_password>` with your database password:
```env
MONGODB_URI=mongodb+srv://zebazaveri57_db_user:YOUR_ACTUAL_PASSWORD@cluster0.gir6czu.mongodb.net/labledger?retryWrites=true&w=majority
```
*Note: If `<db_password>` is not yet configured, the system automatically runs with its resilient local persistent storage engine (`server/data/labledger_db.json`), ensuring zero crashes, instant data persistence, and full functionality.*

---

## 🚀 Running the Project

### 1. Start Backend API (`npm run dev`):
```powershell
cd server
npm run dev
```
Backend API will start in hot-reload mode on **`http://localhost:5000`**

### 2. Start Frontend Client (`npm start`):
```powershell
cd client
npm start
```
Frontend Web Application will launch on **`http://localhost:3000`**

*(Note: You can also run `npm run dev` and `npm start` directly from the root `LabLedger` folder!)*
