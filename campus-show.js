"use strict";

(() => {
  const canvas = document.querySelector("#campus-canvas");
  const qr = document.querySelector(".campus-show #qr");
  if (!canvas || !qr || qr.hidden) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const toggle = document.querySelector(".show-toggle");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const {rect, oval, path, hero, rival, driver, student, ink} = ThreadMascots(ctx);
  const width = canvas.width;
  const height = canvas.height;
  // Matches the QR canvas placement in styles.css.
  const code = {x:120, y:112, size:480};
  const floor = 188;
  const duration = 22;
  const ratio = Math.max(1, Math.min(devicePixelRatio || 1, 2));
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  let time = 0;
  let lastTime;
  let request;
  let playing = false;

  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  const mix = (a, b, t) => a + (b - a) * t;
  const seed = (index, salt) => {
    const value = Math.sin(index * 41.37 + salt * 63.91) * 43758.5453;
    return value - Math.floor(value);
  };

  const buildings = Array.from({length:25}, (_, i) => ({
    x:i * 31 - 18, w:21 + seed(i, 1) * 42, h:40 + seed(i, 2) * 205
  }));
  const drops = Array.from({length:250}, (_, i) => ({
    x:seed(i, 3) * (width + 140), y:seed(i, 4) * (height + 100),
    speed:310 + seed(i, 5) * 690, length:8 + seed(i, 6) * 36, depth:seed(i, 7)
  }));
  const cast = [
    {person:hero, start:292, end:334, delay:0},
    {person:rival, start:346, end:389, delay:.35},
    {person:driver, start:400, end:446, delay:.7}
  ];

  function background(storm) {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#171326");
    sky.addColorStop(.65, "#803e50");
    sky.addColorStop(1, "#211d2a");
    rect(0, 0, width, height, 0, sky, null);

    const glow = ctx.createRadialGradient(530, 100, 9, 530, 100, 410);
    glow.addColorStop(0, "rgba(247,175,128,.44)");
    glow.addColorStop(1, "rgba(247,175,128,0)");
    rect(0, 0, width, height, 0, glow, null);
    oval(548, 70, 19, 19, "#f3d2aa", null);

    buildings.forEach(({x,w,h}, i) => {
      const y = 593 - h;
      rect(x, y, w, h, 0, i % 2 ? "#342839" : "#443143", null);
      for (let row = y + 13; row < 573; row += 22) {
        for (let col = x + 7; col < x + w - 5; col += 12) {
          const light = seed(col, row);
          if (light > .58) rect(col, row, 3, 4, 0, light > .9 ? "#ebac70" : "#79565a", null);
        }
      }
    });
    const street = ctx.createLinearGradient(0, 590, 0, height);
    street.addColorStop(0, "#564356");
    street.addColorStop(1, "#282233");
    rect(0, 592, width, height - 592, 0, street, null);
    if (storm) rect(0, 0, width, height, 0, `rgba(20,39,62,${storm * .61})`, null);
    rect(code.x - 5, code.y - 5, code.size + 10, code.size + 10, 3, "#dfc0a2", null);
    // The original, scannable QR is directly below this transparent opening.
    ctx.clearRect(code.x, code.y, code.size, code.size);
  }

  function rain(t, amount) {
    if (!amount) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.rect(code.x, code.y, code.size, code.size);
    ctx.clip("evenodd");
    for (const drop of drops) {
      const distance = t * drop.speed;
      const x = (drop.x + width + 140 - (distance * .25) % (width + 140)) % (width + 140);
      const y = (drop.y + distance) % (height + 100) - 50;
      const tail = ctx.createLinearGradient(x, y, x - drop.length * .25, y + drop.length);
      tail.addColorStop(0, "rgba(192,215,234,0)");
      tail.addColorStop(1, `rgba(226,240,251,${amount * (.16 + drop.depth * .49)})`);
      path([[x, y], [x - drop.length * .25, y + drop.length]], tail, .55 + drop.depth * 1.25);
    }
    for (let i = 0; i < 31; i++) {
      const phase = (t * 2.3 + seed(i, 8)) % 1;
      const x = seed(i, 9) * width;
      const y = 610 + seed(i, 10) * 36;
      ctx.globalAlpha = (1 - phase) * amount * .49;
      ctx.beginPath();
      ctx.ellipse(x, y, 1 + phase * 13, .5 + phase * 2.3, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#b2d7ec";
      ctx.lineWidth = .75;
      ctx.stroke();
    }
    ctx.restore();
  }

  function prop(x, y, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    rect(-15, -2, 22, 6, 2, "#3d4447", ink);
    rect(6, -1, 13, 3, 1, "#abb4b5", ink);
    rect(-9, 3, 5, 6, 1, "#3b4141", ink);
    ctx.restore();
  }

  function team(t) {
    const visibility = ease(t / .55) * (1 - ease((t - 16.6) / 1.0));
    if (!visibility) return;
    ctx.save();
    // Keep all finder patterns and the QR quiet zone at the sides clear.
    ctx.beginPath();
    ctx.rect(0, 0, width, code.y);
    ctx.rect(255, code.y, 235, 93);
    ctx.clip();
    ctx.globalAlpha = visibility;
    const walk = ease((t - 4) / 5.4);
    const fall = ease((t - 10.35) / .85);
    const gather = ease((t - 11.2) / 1.3);
    for (const [i, member] of cast.entries()) {
      const landed = ease((t - member.delay) / 2.65);
      const x = mix(member.start, member.end, walk) + (i === 0 ? 9 : i === 2 ? -10 : 7) * gather;
      const y = mix(-24, floor, landed) + (i === 1 ? 7 * fall : 4 * gather);
      if (landed < 1 && y > 31) path([[x, 0], [x, y - 31]], "#d2bea9", 1.8);
      student(member.person, x, y, {
        scale:.56, masked:true, tactical:true, arm:mix(17, -20, gather),
        flip:i === 2 && gather > .4 ? -1 : 1,
        bob:Math.sin(t * 9 + i) * 2.2 * Math.sin(Math.PI * walk),
        run:walk * 19, tilt:i === 1 ? fall * 1.4 : gather * (i === 0 ? .16 : -.16),
        emotion:fall > .8 ? "sad" : "happy"
      });
      if (gather < .7) prop(x + 17, y - 31, i === 1 ? fall : 0);
    }
    const flash = Math.max(0, 1 - Math.abs(t - 10.35) / .15);
    if (flash) oval(cast[1].end + 4, floor - 37, 8 * flash, 8 * flash, "#ffeab0", null);
    ctx.restore();
  }

  function frame(t) {
    const storm = ease((t - 11.1) / 2.1);
    background(storm);
    team(t);
    rain(t, storm * (1 - ease((t - 20.3) / 1.5)));
  }

  function tick(now) {
    if (lastTime !== undefined) time = (time + Math.min((now - lastTime) / 1000, .08)) % duration;
    lastTime = now;
    frame(time);
    request = requestAnimationFrame(tick);
  }

  function setPlaying(active) {
    cancelAnimationFrame(request);
    playing = active;
    lastTime = undefined;
    if (active) request = requestAnimationFrame(tick);
    else frame(0);
    toggle.textContent = active ? "ثبّت الرمز للمسح" : "شغّل المشهد";
  }

  toggle.hidden = false;
  toggle.addEventListener("click", () => setPlaying(!playing));
  reduced.addEventListener("change", event => setPlaying(!event.matches));
  frame(0);
  setPlaying(!reduced.matches);
})();
