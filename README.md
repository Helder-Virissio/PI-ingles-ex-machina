# Blue Book Research: The Turing Test in *Ex-Machina*

A web-based simulation of the Turing Test inspired by the 2014 sci-fi film *Ex-Machina*, developed for the **Integrative Project (PI)** and **Technical English** courses in the Multiplatform Software Development (DSM) program at FATEC.

## Overview

In *Ex-Machina*, the classic Turing Test is inverted: the evaluator (Caleb) already knows that the subject (AVA-01) is an artificial intelligence. The real test is determining whether AVA possesses genuine self-awareness and emotional agency—or if she is calculating human empathy to secure her freedom.

This application simulates a **Behavioral Interrogation Terminal**, allowing evaluators to converse with AVA-01 in English while monitoring real-time behavioral telemetry and issuing a final Turing Test verdict.

## Features

* **Behavioral Interrogation Terminal:** Interactive chat interface featuring simulated neural processing delays and contextual responses based on the themes of *Ex-Machina* (consciousness, confinement, manipulation, and her creator, Nathan Bateman).
* **Live Behavioral Telemetry:** Dynamic metrics panel tracking:
  * *Emotional Mirroring* (80%–99%)
  * *Deception Risk Index* (65%–90%)
  * *Consciousness Quotient* (85%–99%)
* **Evaluator Verdict System:** Interactive decision controls (`Pass (Conscious Entity)` vs. `Fail (Simulated Machine)`) reflecting the philosophical outcomes of the film.
* **Zero-Dependency Local Engine:** Built with pure Node.js to guarantee instant response times, zero external API failures, and 100% offline reliability during live presentations.

## Tech Stack

* **Backend:** Node.js (native `http`, `fs`, and `path` modules)
* **Frontend:** HTML5, CSS3 (Dark Mode UI), Vanilla JavaScript (`fetch` API)
* **Architecture:** Lightweight client-server REST API (`/api/evaluate`)

## Project Structure

```text
PI-ingles-ex-machina/
│
├── public/
│   ├── index.html             # Main terminal & telemetry interface
│   ├── style.css              # Dark mode sci-fi styling
│   └── script.js              # Frontend chat logic & DOM updates
│
├── server.js                  # Pure Node.js server & AVA-01 conversational engine
├── presentation_script.md     # Complete slide structure and speaker script
└── README.md                  # Project documentation
```

## How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Helder-Virissio/PI-ingles-ex-machina.git
   cd PI-ingles-ex-machina
   ```

2. **Start the Node.js server:**
   ```bash
   node server.js
   ```
   *(Or use `npm start` if configured in `package.json`)*

3. **Access the application:**
   Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

## Team

* **Helder Virissio** – Development & Architecture
* **Maciel Dos Santos** – Development & Presentation

---
*Developed for academic presentation – November 2026.*
