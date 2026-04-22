Build a mobile application called **“Still Want It?”**, a minimal, behavior-driven app that helps users avoid impulse purchases by introducing a delay before buying.

## 🎯 Core Concept

The app allows users to add items they want to buy, wait for a set duration (default 24 hours), and then prompts them with a simple question: **“Still want it?”** to encourage mindful decision-making.

---

## 🧩 Core Features (MVP Only)

1. **Add Item**

* Input fields:

  * Item name (required)
  * Price (optional)
  * Note (optional: why the user wants it)
* Interaction must be extremely fast (under 5 seconds)

2. **Delay System**

* Default delay: 24 hours
* Optional presets: 12h, 48h, 7 days
* Store timestamp and trigger a reminder

3. **Notification Trigger**

* After delay, send push notification:
  → “Still want it?”
* On tap, open decision screen

4. **Decision Screen**

* Show item details
* Two primary actions:

  * ✅ “Yes, Buy”
  * ❌ “No, Skip”

5. **Item States**

* Pending
* Bought
* Skipped

6. **Stats (Minimal)**

* Total money saved (from skipped items)
* Number of items avoided

---

## 🧠 UX Principles

* Frictionless input (fast capture of impulse)
* Calm and distraction-free interface
* No financial guilt or aggressive messaging
* Focus on reflection, not restriction
* The app should feel like a quiet companion, not a finance tool

---

## 🎨 UI / Visual Design Direction

Design the app inspired by:

* **Uber** → clean layouts, strong hierarchy, high readability
* **Cash App** → bold minimalism, smooth transitions, confident typography
* **Bumble** → friendly spacing, soft interactions, approachable UI

### Visual Guidelines:

* Use a **minimal color palette** (1 primary + neutrals)
* Prefer **large typography and whitespace**
* Rounded cards and soft shadows
* Subtle micro-interactions (fade, slide, scale)
* Avoid clutter, avoid too many icons

### Layout Style:

* Card-based UI for items
* Bottom sheet for adding items
* Full-screen focus for decision moment
* Smooth transitions between states

---

## 📱 Screens to Design

1. **Home Screen**

* List of items (Pending first)
* Clean cards with:

  * Name
  * Price
  * Time remaining
* Floating Action Button (Add Item)

2. **Add Item Screen (Bottom Sheet / Modal)**

* Minimal inputs
* Primary CTA: “Add & Wait”

3. **Decision Screen**

* Full-screen focus
* Item details centered
* Two large buttons:

  * “Still want it”
  * “Skip it”

4. **Stats Screen**

* Minimal insights:

  * Money saved
  * Items skipped
* Clean, non-analytical

---

## ⚙️ Tech Stack

* Frontend: React Native
* Backend: Firebase (Firestore, Auth optional)
* Notifications: Firebase Cloud Messaging

---

## 🚫 Do NOT include

* Budget tracking
* Expense categories
* Bank integrations
* Social features
* Complex dashboards

---

## 💡 Product Goal

The app should reduce impulse purchases by creating a pause between desire and action.
Success is measured by how often users choose “Skip” after waiting.

---

## Tone of the App

Calm, neutral, reflective.
Never judgmental.
Feels like a quiet nudge, not a strict tool.

---
