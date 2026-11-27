"use strict";

(() => {
  const GAME_URL = "";
  const LOCAL_PREVIEW_URL = "https://kaledalkazaalh-create.github.io/amsik-al-khayt/play.html";
  const params = new URLSearchParams(location.search);
  const display = document.body.classList.contains("booth") && params.get("display") === "1";
  document.body.classList.toggle("display", display);
  const labels = {...ThreadData.copy, title:ThreadData.title, institution:ThreadData.institution};
  document.querySelectorAll("[data-text]").forEach(el => el.textContent = labels[el.dataset.text]);
  const status = document.querySelector("#qr-status");
  const canvas = document.querySelector("#qr");
  const link = document.querySelector(".game-url");
  const local = ["localhost","127.0.0.1","[::1]"].includes(location.hostname) || location.protocol === "file:";
  let game;
  try {
    game = new URL(GAME_URL || (local ? LOCAL_PREVIEW_URL : "play.html"), location.href);
    if (!["https:","http:"].includes(game.protocol)) throw new Error("Unsupported game URL");
    link.href = game.href;
    link.textContent = game.href;
    link.hidden = false;
    const qr = qrcode(0, "Q");
    qr.addData(game.href);
    qr.make();
    const size = qr.getModuleCount();
    const margin = 4;
    const pixel = Math.floor(1200 / (size + 2 * margin));
    canvas.width = canvas.height = (size + 2 * margin) * pixel;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#000";
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (qr.isDark(row,col)) ctx.fillRect((col+margin)*pixel,(row+margin)*pixel,pixel,pixel);
      }
    }
    canvas.setAttribute("aria-label",labels.qrAlt);
    canvas.hidden = false;
  } catch {
    status.textContent = "تعذّر عرض الرمز. افتح اللعبة من الرابط.";
    status.hidden = false;
  }

  if (display) {
    let idle;
    const revealCursor = () => {
      document.body.classList.remove("cursor-idle");
      clearTimeout(idle);
      idle = setTimeout(() => document.body.classList.add("cursor-idle"), 2000);
    };
    addEventListener("pointermove",revealCursor,{passive:true});
    revealCursor();
  }
})();

