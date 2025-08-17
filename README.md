# TVS Credit Saathi Smart Assistant

## Overview
The **Saathi Smart Assistant** is an advanced, agentic AI-powered customer service platform designed for TVS Credit's rural Indian customer base. It provides multilingual, context-aware support to enhance customer experience and address the unique challenges faced by Tier 3 and Tier 4 customers.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start Guide](#quick-start-guide)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Demo Scenarios](#demo-scenarios)
- [Testing](#testing)
- [Deployment](#deployment)
- [Business Impact](#business-impact)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features
- **Multilingual Support**: 22+ Indian languages for voice and text.
- **Voice-First Interface**: Voice commands for low digital literacy users.
- **Agentic Intelligence**: Specialized AI agents for onboarding, payment, grievance, and more.
- **24/7 Availability**: Automated assistance at all times.
- **Context-Aware Personalization**: Tracks customer journeys and anticipates needs.

---

## Architecture

```
Frontend (Next.js, React, Tailwind)
        |
        v
API Routes (Next.js Edge Functions)
        |
        v
Gemini API (AI/LLM Processing)
        |
        v
Context/State Management (Onboarding, Payments, etc.)
```

- **Frontend**: Interactive UI with voice and text input.
- **API Layer**: Handles chat streaming and user queries ([src/app/api/chat/stream/route.ts](src/app/api/chat/stream/route.ts)).
- **AI Logic**: Agent selection, onboarding flows, and query processing ([src/lib/gemini-wrapper.ts](src/lib/gemini-wrapper.ts)).
- **Service Worker**: Offline support ([public/sw.js](public/sw.js)).

---

## Tech Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Gemini API (Google Generative AI)
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel or any preferred cloud service

---

## Quick Start Guide

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/tvs-saathi-assistant.git
   cd tvs-saathi-assistant
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env.local` file in the root directory:
   ```
   API_KEY=your_api_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   Open your browser at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable   | Description                |
|------------|----------------------------|
| API_KEY    | Gemini API key (required)  |

---

## Project Structure

```
.
├── public/                  # Static assets, icons, service worker
├── src/
│   ├── app/                 # Next.js app directory (pages, components)
│   ├── lib/                 # Core logic (AI agent wrappers, utilities)
│   ├── styles/              # Tailwind and global CSS
│   ├── types/               # TypeScript types
│   └── ...                  # Other feature folders
├── __tests__/               # Unit and integration tests
├── .env.local               # Environment variables
├── package.json             # Scripts and dependencies
├── tailwind.config.js       # Tailwind CSS config
└── README.md                # Project documentation
```

---

## Demo Scenarios

1. **Customer Onboarding**: Guided loan application via voice.
2. **Payment Queries**: EMI status and payment via voice/text.
3. **Grievance Handling**: Log and track complaints.

---

## Testing

- **Run all tests**
  ```bash
  npm test
  ```
- Tests are located in the [`__tests__/`](__tests/) directory, e.g., [`__tests__/components/VoiceInput.test.tsx`](__tests__/components/VoiceInput.test.tsx).

---

## Deployment

- **Vercel**: Push to your GitHub repo and import into Vercel.
- **Custom**: Use `npm run build` and `npm start` for production.

---

## Business Impact

- **Improved Customer Satisfaction**: Target CSAT > 85%.
- **Cost Reduction**: 30-50% decrease in operational costs.
- **Increased Engagement**: 5.4x increase via proactive support.

---

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgments

- TVS Credit for the opportunity to innovate in customer service.
- The open-source community for their invaluable resources and support.