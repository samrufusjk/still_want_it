Implementation Plan

  The current repo is still a Firebase starter, not the product in prompts/master_prompt.md.
  App.tsx is centered on auth/debug flows, and src/services/notifications.ts only handles FCM
  registration and inbound message hooks. The implementation should replace that starter surface
  with a small, single-purpose impulse-delay app.

  1. Define MVP architecture first
      - Keep React Native + Firestore + FCM.
      - Make auth optional in practice: start with anonymous auth or device-scoped usage, so item
        capture stays fast.
      - Treat the app as 4 surfaces only: Home, Add Item Sheet, Decision, Stats.
      - Keep navigation minimal. A lightweight stack + modal flow is enough.
  2. Design the data model
      - Create an items collection with fields like:
        name, price, note, delayPreset, createdAt, decisionAt, remindAt, status, userId.
      - Use status enum: pending | bought | skipped.
      - Add derived stats either:
          - computed client-side from skipped items for MVP, or
          - cached in a small user_stats document later if reads become expensive.
      - Decide now whether prices are stored as decimal strings or integer cents. Recommend
        integer cents.
  3. Replace the starter app shell
      - Remove the auth/debug dashboard in App.tsx.
      - Introduce feature folders such as:
        src/screens, src/components, src/hooks, src/services, src/types.
      - Add navigation and app state bootstrapping.
      - Keep the first-run path extremely short: app opens directly to the items list.
  4. Build the core item flow
      - Home Screen
          - show pending items first
          - card UI with name, optional price, time remaining
          - FAB to open add flow
      - Add Item Bottom Sheet
          - fields: required name, optional price, optional note
          - delay presets: 12h, 24h, 48h, 7d
          - primary CTA: Add & Wait
          - target: submission in under 5 seconds for a typical entry
      - Decision Screen
          - opened from notification tap or item tap after reminder time
          - centered item details
          - two primary actions: Yes, Buy and Skip it
      - Stats Screen
          - money saved from skipped items
          - items skipped
          - no graphs or dashboards
  5. Implement Firestore access layer
      - Add an items service with functions for:
        createItem, listenToItems, markBought, markSkipped, getStats.
      - Centralize timestamp handling and status transitions.
      - Enforce valid transitions:
        pending -> bought
        pending -> skipped
      - Add simple query ordering:
        pending first, then most recent resolved items.
  6. Implement reminder delivery
      - This is the main technical decision.
      - Recommended approach: use Firestore + a backend trigger/scheduler that sends FCM when
        remindAt is reached.
      - Practical options:
          - Best fit: Firebase Cloud Functions with scheduled polling or task-based scheduling.
          - Simpler but less reliable: local notifications on device.
      - Since the prompt explicitly calls for FCM, plan for backend scheduling rather than relying
        only on the client.
      - Notification payload should include item ID so tapping opens the decision screen directly.
  7. Upgrade notification handling
      - Extend src/services/notifications.ts from registration-only behavior into app routing
        behavior.
      - Handle:
          - foreground receipt
          - background open
          - cold start open
      - Normalize notification data contract, for example:
        type=decision_reminder, itemId=<id>.
      - On tap, navigate to the correct decision screen.
  8. Apply the visual system from the prompt
      - Calm, minimal palette: one strong primary + neutrals.
      - Large typography, generous spacing, rounded cards, soft elevation.
      - Use motion sparingly: sheet entrance, card fade/slide, decision CTA press states.
      - Avoid analytics-looking UI, money app tropes, or icon-heavy chrome.
      - Build a small token file for spacing, colors, radius, typography so the UI stays coherent.
  9. Track product analytics lightly
      - Log only the key behaviors:
        item_created, reminder_opened, item_bought, item_skipped, delay_selected.
      - This matches the product goal: measure how often users skip after waiting.
      - Do not add heavy instrumentation in the MVP UI.
  10. Add validation and edge-case handling

  - Require non-empty item name.
  - Price optional; if present, validate format.
  - Handle missing notification permission gracefully.
  - Allow decision screen access even if the item is opened manually without a push.
  - Handle stale notifications where the item was already resolved.

  - Unit tests for:
      - item status transitions
      - stats calculation
      - time-remaining formatting
  - Integration tests for:
      - add item flow
      - decision action updates
      - background/cold-start notification opens

  Recommended delivery order

  1. Replace starter UI with app navigation and empty screens.
  2. Implement Firestore item model and home/add/decision/stats flows without notifications.
  3. Add stats computation.
  4. Add push routing in-app.
  5. Add backend reminder scheduling and FCM delivery.
  data model may need rework.