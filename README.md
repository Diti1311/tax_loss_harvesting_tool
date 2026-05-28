# Tax Loss Harvesting Tool

A responsive React + TypeScript application for simulating crypto tax loss harvesting with dynamic capital gains calculations.

## Features

- Responsive UI matching the provided Figma design
- Pre-Harvesting and After-Harvesting capital gain calculations
- Dynamic holdings table with:
  - Row selection
  - Select all functionality
  - Sorting for every column
  - View All toggle
- Tax savings calculation
- Real-time updates on asset selection
- Expandable disclaimer section
- Tooltip support
- Mock API integration
- Loading states
- Built using:
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn UI

---

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Vite

---

## Folder Structure

```txt
src/
│
├── components/
│   ├── TaxHarvesting.tsx
│
├── services/
│   ├── api.ts
│
├── styles/
│   ├── TaxHarvesting.css
│
├── App.tsx
├── index.tsx
└── index.css
```

---

## Functionalities Implemented

### Capital Gains Cards

- Pre-Harvesting section
- After-Harvesting section
- Real-time updates based on selected holdings
- Taxable capital gains reduction calculation

### Holdings Table

- Displays holdings data
- Checkbox row selection
- Select/Deselect all
- Column-wise sorting
- Amount to sell auto-populated
- View All functionality

### Disclaimer Section

- Expand/collapse functionality
- Hover tooltip support

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/tax-loss-harvesting-tool.git
```

### 2. Navigate Into Project

```bash
cd tax-loss-harvesting-tool
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

---

## Build for Production

```bash
npm run build
```

---

## Deployment



---

## Screenshots

Screen Recording and screenshots are added in the folder /../screenshots/

---

## Assumptions

- Mock APIs are used instead of real backend APIs.
- Capital gain calculations are frontend-driven.
- Currency formatting is simplified.
- Holdings data is static mock data.
- Tax harvesting logic follows assignment requirements only.

---

## Future Improvements

- Backend integration
- Authentication
- Real CoinGecko APIs
- Persistent user selections
- Advanced analytics

---

## Author

Diti Solanki