# 🔊 SoundScape: Interactive Noise Survey

### Survey Overview

SoundScape is an engaging, interactive web application designed to gather public perception of urban noise pollution. This isn't a typical boring survey; it's a fast, gamified experience built with a modern web stack. The goal is to build a "Noise Profile" of a community by asking users about their sound environment, habits, and preferences, culminating in a shareable "Noise Persona."

### ✨ Features

* **📊 Multi-Step Survey** – A clean, progress-bar-driven interface that guides the user step-by-step.
* **🎮 Interactive Components** – Custom-built controls to make data entry fun, including a **Compass Dial**, **Swipeable Cards**, and a **Draggable List** for ranking.
* **🎵 Audio-Driven Experience** – Enhances the survey with UI sound effects using **Tone.js** and plays sample noises (traffic, construction) using **HTML5 Audio**.
* **🎭 Dynamic Persona Results** – Generates a unique "Noise Persona" (e.g., "Light Sleeper," "Noise Veteran") for the user based on their answers.
* **👻 Prank Mode** – Uses `localStorage` to detect returning users and show them a "sus" page. Also features a fake loading screen and a rickroll on submission.
* **🔗 Share Functionality** – Encourages sharing with a built-in button using the **Web Share API** (with a clipboard fallback for desktop).
* **💾 Data Persistence** – Securely saves all survey results to a backend via a **Next.js API route**.

---

### 🕹️ User Experience

**Objective:**
Complete the interactive survey about your city's noise environment. Your answers will be used to generate a unique "Noise Persona" at the end.

**Survey Flow:**

* **Start:** Begin the survey with a single click.
* **Answer Questions:** Progress through a series of questions using interactive components.
* **Rank Features:** Drag and drop your most-wanted features into your preferred order.
* **Submit:** (Get pranked!) Your submission is sent to the backend.
* **Get Persona:** Receive your dynamic "Noise Persona" and an option to share your experience.

**Controls**

| Action | Control |
| :--- | :--- |
| **Select Option** | Click buttons |
| **Select Frequency/Level** | Click & drag the **Compass Dial** |
| **Answer Yes/No/Maybe** | **Swipe** the card (up/down/left/right) |
| **Prioritize Features** | **Drag & Drop** items in the list |

---

### 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | **Next.js** (App Router) |
| **Core Library** | **React** |
| **Language** | **TypeScript** |
| **Styling** | **Tailwind CSS** |
| **Animation** | **Framer Motion** |
| **Web Audio** | **Tone.js** & **HTML5 Audio** |
| **Backend** | **Next.js API Routes** |
| **Build & Package** | **Node.js + npm** |

---

### 🚀 Installation & Setup

1. **Clone the Repository**

   ```bash
   git clone [YOUR_REPOSITORY_URL]
   cd [YOUR_PROJECT_DIRECTORY]
