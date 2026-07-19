# 🏟️ Crowd Dynamics Engine: Predictive Fan Flow Simulator

![Crowd Dynamics Hero](https://via.placeholder.com/1200x400?text=Crowd+Dynamics+Engine)

> **Next-Generation, AI-Powered Digital Twin & Predictive Analytics Sandbox for Large-Scale Events (Targeting FIFA World Cup 2026)**

The **Crowd Dynamics Engine** is a state-of-the-art, hyper-scalable, real-time web-based simulation platform. Engineered to revolutionize stadium management, it leverages cutting-edge **Generative AI**, **Deterministic Physics-Based Modeling**, and **Predictive Analytics** to optimize fan flow, mitigate crowd crush risks, and supercharge operational intelligence.

By seamlessly bridging the gap between proactive venue management and real-time fan experience, this platform serves as the ultimate command center for modern stadium orchestration.

---

## 🚀 Vision & Architecture

At its core, the Crowd Dynamics Engine operates as a high-fidelity **Digital Twin** of a stadium environment. It ingests simulated real-world telemetry—including live weather data, match phase progression, and transit metrics—and processes it through a highly performant **Deterministic Simulation Engine**. 

Coupled with **Google Gemini 2.5 Flash**, the system provides unparalleled **Context-Aware Insights**, dynamically adapting to shifting crowd densities and environmental variables to deliver ultra-low latency, highly targeted routing and alerts.

## ✨ Synergistic Core Features

### 1. 🤖 GenAI Stadium Assistant (Fan-Centric View)
Empowering attendees with a highly personalized, multilingual intelligent assistant.
- **Context-Aware Dynamic Routing**: Harnesses Gemini AI to analyze the current match minute, ongoing scorelines, and real-time zone capacities to map out safe, low-density pathways dynamically.
- **Inclusive Accessibility Mapping**: Automatically computes step-free, barrierless routes and recommends accessible transit transfers for mobility-impaired attendees, ensuring ADA/WCAG compliance.
- **Seamless i18n (Multilingual Support)**: Frictionless transitions between English, Spanish, and French to cater to a global demographic.

### 2. 🚨 Operational Command Center (Staff Intelligence)
A panoramic, mission-critical dashboard engineered for venue orchestrators.
- **Live Match Telemetry Polling**: Synchronizes with match phases (pre-match, halftime, full-time) to intelligently adjust underlying crowd behavior algorithms.
- **Meteorological Integration**: Cross-references live weather anomalies (e.g., flash rain, heatwaves) to proactively modulate fan arrival curves and throughput latencies.
- **Asynchronous AI Alert Stream**: Maintains a persistent Server-Sent Events (SSE) pipeline, continuously pushing severity-graded, actionable, GenAI-synthesized alerts to operators the millisecond crowd crush heuristics are triggered.

### 3. 👥 Volunteer Engagement Portal (Mobile-Optimized)
A highly responsive, focused interface for boots-on-the-ground venue staff.
- **Targeted Zone Telemetry**: Utilizes granular data scoping so volunteers only consume capacity and flow metrics pertinent to their geofenced assignment.
- **Access Control Mockup**: A robust, simulated digital turnstile scanner for validating encrypted tickets and credentials.
- **Streamlined Alert Filtering**: Hyper-localized notification delivery to prevent alert fatigue.

### 4. 🧮 Deterministic Simulation & Sustainability Engine
The robust computational backend powering the visual interface.
- **Physics-Based Crowd Modeling**: Orchestrates the movement of thousands of autonomous agents (fans) navigating through complex chokepoints and egress routes.
- **Carbon Footprint Optimization**: Real-time sustainability tracking that computes CO₂ emissions mitigated by incentivizing mass transit adoption over private vehicular transport.

---

## 🛠️ Technology Stack & Ecosystem

Built with a relentless focus on performance, type-safety, and developer experience.

* **Frontend Framework**: Next.js 16 (App Router paradigm) & React 19
* **Type System**: TypeScript (Strict Mode)
* **Styling & UI**: Tailwind CSS v4, Shadcn UI, Base UI
* **State Management**: Zustand (Atomic, scalable state)
* **Artificial Intelligence**: Google Gemini 2.5 Flash (via `@google/genai`)
* **Data Visualization & 3D**: D3.js, Three.js, React Three Fiber, `@react-three/drei`
* **Motion & Micro-interactions**: GSAP, Anime.js, React Kino
* **Schema Validation**: Zod
* **Testing Infrastructure**: Vitest, React Testing Library, jsdom (240+ passing assertions)

---

## ⚙️ Quickstart & Local Development

Get the simulation running locally in under 60 seconds.

### Prerequisites
- Node.js (v20+ recommended)
- `pnpm` (Fast, disk space efficient package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/predictive-fan-flow-simulator.git
   cd predictive-fan-flow-simulator
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY and other required secrets
   ```

4. **Initialize the Development Server**
   ```bash
   pnpm dev
   ```

Navigate your browser to [http://localhost:3000](http://localhost:3000) to access the command center.

---

## 🧪 Testing

Run the comprehensive test suite utilizing Vitest:

```bash
# Run all tests
pnpm test

# Run critical path smoke tests
pnpm test:smoke
```

---

## 📂 Architectural Structure

```text
├── src/
│   ├── app/           # Next.js App Router (Dashboard, Volunteer, Simulation Views, API Routes)
│   ├── components/    # Modular, highly reusable UI components (Atomic design methodology)
│   ├── hooks/         # Custom React hooks encapsulating complex reactive logic (SSE, polling)
│   ├── lib/           # Utility functions, API wrappers, and GenAI abstractions
│   ├── simulation/    # Core deterministic physics engine and invariant boundary checks
│   └── stores/        # Zustand slices orchestrating global client-side state
├── tests/             # Extensive unit, integration, and UI testing suites
├── docs/              # Comprehensive architectural decision records (ADRs) and documentation
└── public/            # Static assets and manifest files
```

---

## 🤝 Contributing

We welcome contributions from the community to help harden our simulation logic and refine the user experience!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Optimized for seamless orchestration. Built for the future of live events.*
