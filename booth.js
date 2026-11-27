"use strict";

const {title, copy, institution} = GameData;
document.title = title;
document.querySelector("[data-institution]").textContent = institution;
document.querySelector("[data-title]").textContent = title;
document.querySelectorAll("[data-copy]").forEach(node => {
  node.textContent = copy[node.dataset.copy];
});
document.querySelector("#print-button").addEventListener("click", () => window.print());

const canvas = document.querySelector("#qr");
const status = document.querySelector("#qr-status");
const link = document.querySelector("#game-link");
const requiresConfiguredUrl = location.protocol === "file:" || ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
const target = new URL("play.html", location.href);
let hasPublicUrl = !requiresConfiguredUrl;
if (GAME_URL.trim()) {
  try {
    const config = new URL(GAME_URL.trim());
    if (!["https:", "http:"].includes(config.protocol)) throw new Error("Invalid URL protocol");
    target.href = config.href;
    hasPublicUrl = true;
  } catch {
    status.textContent = copy.qrError;
    status.hidden = false;
  }
}
link.href = target.href;
if (hasPublicUrl) {
  link.textContent = target.href;
  try {
    const qr = qrcode(0, "M");
    qr.addData(target.href);
    qr.make();
    const modules = qr.getModuleCount();
    const quiet = 4;
    const scale = Math.floor(720 / (modules + 2 * quiet));
    canvas.width = canvas.height = (modules + 2 * quiet) * scale;
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000";
    for (let row = 0; row < modules; row++) {
      for (let column = 0; column < modules; column++) {
        if (qr.isDark(row, column)) {
          context.fillRect((column + quiet) * scale, (row + quiet) * scale, scale, scale);
        }
      }
    }
    canvas.setAttribute("aria-label", copy.qrAlt);
    canvas.hidden = false;
  } catch {
    status.textContent = copy.qrError;
    status.hidden = false;
  }
} else if (status.hidden) {
  status.textContent = copy.boothLocal;
  status.hidden = false;
}

