// Preact Countdown Timer Widget
// This file gets compiled and served as a static asset

(function () {
  const SHOP = window.countdownTimerShop || "";
  const API_BASE = window.countdownTimerAPI || "";

  if (!SHOP || !API_BASE) {
    console.warn("[CountdownTimer] Missing shop or API base URL");
    return;
  }

  // Inject CSS styles
  const style = document.createElement("style");
  style.textContent = `
    #countdown-timer-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 16px 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .ct-banner {
      padding: 16px 20px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
    }

    .ct-banner.ct-top {
      border-top: 4px solid var(--ct-color, #ff0000);
    }

    .ct-banner.ct-bottom {
      border-bottom: 4px solid var(--ct-color, #ff0000);
    }

    .ct-title {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #333;
      margin: 0 0 8px 0;
      text-align: center;
    }

    .ct-timer {
      display: flex;
      justify-content: center;
      gap: 8px;
      align-items: center;
    }

    .ct-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 50px;
    }

    .ct-number {
      font-size: 28px;
      font-weight: 700;
      color: var(--ct-color, #ff0000);
      line-height: 1;
    }

    .ct-label {
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .ct-separator {
      font-size: 24px;
      font-weight: 700;
      color: var(--ct-color, #ff0000);
      margin-bottom: 12px;
    }

    .ct-description {
      text-align: center;
      font-size: 13px;
      color: #555;
      margin-top: 8px;
    }

    /* Size variants */
    .ct-size-small .ct-number { font-size: 20px; }
    .ct-size-small .ct-block { min-width: 36px; }
    .ct-size-large .ct-number { font-size: 36px; }
    .ct-size-large .ct-block { min-width: 64px; }

    /* Urgency pulse animation */
    @keyframes ct-pulse {
      0%   { background-color: #fff3cd; }
      50%  { background-color: #ffe0e0; }
      100% { background-color: #fff3cd; }
    }

    .ct-urgent-pulse {
      animation: ct-pulse 1s infinite;
    }

    /* Urgency banner */
    .ct-urgent-banner {
      background: #ff4444;
      color: white;
      text-align: center;
      padding: 6px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 4px;
      margin-bottom: 8px;
    }
  `;
  document.head.appendChild(style);

  // Format time units with leading zeros
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  // Calculate time remaining
  function getTimeLeft(endDate) {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const totalMinutes = Math.floor(diff / (1000 * 60));
    return { days, hours, minutes, seconds, totalMinutes };
  }

  // Render the timer widget
  function renderTimer(container, timer) {
    const color = timer.display?.color || "#ff0000";
    const position = timer.display?.position || "top";
    const size = timer.display?.size || "medium";
    const urgencyType = timer.urgency?.type || "pulse";
    const urgencyMinutes = timer.urgency?.triggerMinutes || 5;

    container.style.setProperty("--ct-color", color);

    function update() {
      const left = getTimeLeft(timer.endDate);

      if (!left) {
        container.innerHTML = "";
        return;
      }

      const isUrgent = left.totalMinutes <= urgencyMinutes;

      let urgencyHTML = "";
      if (isUrgent && urgencyType === "banner") {
        urgencyHTML = `<div class="ct-urgent-banner">⚡ Hurry! Offer ending very soon!</div>`;
      }

      container.innerHTML = `
        <div class="ct-banner ct-${position} ct-size-${size} ${isUrgent && urgencyType === "pulse" ? "ct-urgent-pulse" : ""}">
          ${urgencyHTML}
          <div class="ct-title">YOUR SPECIAL OFFER ENDS IN</div>
          <div class="ct-timer">
            ${left.days > 0 ? `
              <div class="ct-block">
                <span class="ct-number">${pad(left.days)}</span>
                <span class="ct-label">Days</span>
              </div>
              <span class="ct-separator">:</span>
            ` : ""}
            <div class="ct-block">
              <span class="ct-number">${pad(left.hours)}</span>
              <span class="ct-label">Hours</span>
            </div>
            <span class="ct-separator">:</span>
            <div class="ct-block">
              <span class="ct-number">${pad(left.minutes)}</span>
              <span class="ct-label">Mins</span>
            </div>
            <span class="ct-separator">:</span>
            <div class="ct-block">
              <span class="ct-number">${pad(left.seconds)}</span>
              <span class="ct-label">Secs</span>
            </div>
          </div>
          ${timer.description ? `<div class="ct-description">${timer.description}</div>` : ""}
        </div>
      `;
    }

    update();
    const interval = setInterval(update, 1000);

    // Cleanup when removed from DOM
    const observer = new MutationObserver(() => {
      if (!document.contains(container)) {
        clearInterval(interval);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Fetch timers and inject widget
  async function init() {
    try {
      const res = await fetch(`${API_BASE}/api/timers/public/${encodeURIComponent(SHOP)}`);
      const timers = await res.json();

      if (!timers || timers.length === 0) return;

      const timer = timers[0]; // Use first active timer

      const container = document.getElementById("countdown-timer-widget");
      if (container) {
        renderTimer(container, timer);
      }
    } catch (err) {
      console.error("[CountdownTimer] Failed to load timer:", err);
    }
  }

  // Wait for DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();