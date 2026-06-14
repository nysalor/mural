(async function () {
  const root = document.documentElement;
  const bg   = document.getElementById("bg");

  // --- 設定読み込み ---
  async function loadConfig() {
    try {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("config fetch failed");
      return await res.json();
    } catch {
      // サーバーが使えない場合のデフォルト
      return {
        interval_seconds: 300,
        display: {
          font_family:     "sans-serif",
          font_url:        "",
          clock_color:     "#ffffff",
          date_color:      "#eeeeee",
          clock_font_size: "20vw",
          date_font_size:  "3.5vw",
          clock_shadow:    "0 2px 20px rgba(0,0,0,0.8)",
          show_seconds:    true,
          position_x:     "center",
          position_y:     "center",
        }
      };
    }
  }

  const POSITION_X = { left: "flex-start", center: "center", right: "flex-end" };
  const POSITION_Y = { top: "flex-start", center: "center", bottom: "flex-end" };

  function applyConfig(config) {
    const d = config.display;
    root.style.setProperty("--font-family",      d.font_family);
    root.style.setProperty("--clock-color",      d.clock_color);
    root.style.setProperty("--date-color",       d.date_color);
    root.style.setProperty("--clock-font-size",  d.clock_font_size);
    root.style.setProperty("--date-font-size",   d.date_font_size);
    root.style.setProperty("--clock-shadow",     d.clock_shadow);
    root.style.setProperty("--align-items",      POSITION_X[d.position_x]  || "center");
    root.style.setProperty("--justify-content",  POSITION_Y[d.position_y]  || "center");

    if (d.font_url) {
      document.getElementById("google-font").href = d.font_url;
    }

    return { intervalSeconds: config.interval_seconds, showSeconds: d.show_seconds };
  }

  // --- 時計 ---
  function startClock(showSeconds) {
    const clockEl = document.getElementById("clock");
    const dateEl  = document.getElementById("date");

    const timeOpts = showSeconds
      ? { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }
      : { hour: "2-digit", minute: "2-digit", hour12: false };

    const dateOpts = { year: "numeric", month: "long", day: "numeric", weekday: "long" };

    function tick() {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString("ja-JP", timeOpts);
      dateEl.textContent  = now.toLocaleDateString("ja-JP", dateOpts);
    }

    tick();
    setInterval(tick, 1000);
  }

  // --- 背景画像 ---
  async function fetchNextImage() {
    try {
      const res = await fetch("/api/images/next");
      if (!res.ok) throw new Error("image fetch failed");
      const { url } = await res.json();
      return url;
    } catch {
      return null;
    }
  }

  function changeBackground(url) {
    if (!url) return;

    const next = new Image();
    next.onload = () => {
      bg.style.backgroundImage = `url('${url}')`;
    };
    next.src = url;
  }

  function startImageRotation(intervalSeconds) {
    fetchNextImage().then(changeBackground);
    setInterval(() => fetchNextImage().then(changeBackground), intervalSeconds * 1000);
  }

  // --- 起動 ---
  const config = await loadConfig();
  const { intervalSeconds, showSeconds } = applyConfig(config);
  startClock(showSeconds);
  startImageRotation(intervalSeconds);
})();
