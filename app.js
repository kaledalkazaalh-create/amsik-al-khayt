"use strict";

(() => {
  const {copy, title, hashtag, institution, items, types, answers, settings, palette, links} = GameData;
  const scoring = GameScoring;
  const itemById = new Map(items.map(item => [item.id, item]));
  const app = document.querySelector("#app");
  const announcement = document.querySelector("#announcement");
  const numerals = new Intl.NumberFormat("ar-JO");
  const percentage = new Intl.NumberFormat("ar-JO", {style:"percent", maximumFractionDigits:0});
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const storageKey = "amsik-al-khayt:v1";
  let state = restore();
  let pending = false;
  let cardUrl;

  document.title = title;
  document.querySelector("[data-title]").textContent = title;
  document.querySelector("[data-institution]").textContent = institution;

  function element(tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  }

  function button(label, className, activate) {
    const el = element("button", className, label);
    el.type = "button";
    el.addEventListener("click", activate);
    return el;
  }

  function external(label, url) {
    const el = element("a", "", label);
    el.href = url;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    return el;
  }

  function focus(el) {
    el.tabIndex = -1;
    el.focus({preventScroll:true});
  }

  function show(screen, heading) {
    app.replaceChildren(screen);
    window.scrollTo(0, 0);
    if (heading) focus(heading);
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || !scoring.validOrder(saved.order) || !Array.isArray(saved.responses)) return null;
      if (saved.responses.length > items.length || !saved.responses.every(scoring.validResponse)) return null;
      if (!Number.isInteger(saved.cursor) || saved.cursor < 0 || saved.cursor > saved.responses.length) return null;
      return saved;
    } catch {
      return null;
    }
  }

  function save() {
    try {
      if (state) localStorage.setItem(storageKey, JSON.stringify(state));
      else localStorage.removeItem(storageKey);
    } catch {
      // A storage restriction only affects resuming after reload.
    }
  }

  function welcome() {
    const screen = element("section", "welcome enter");
    const intro = element("div", "hero-copy");
    intro.append(element("p", "eyebrow", copy.welcomeTag), element("h1", "", title),
      element("h2", "", copy.welcomeLead), element("p", "", copy.welcomeBody));
    const actions = element("div", "hero-actions");
    const completed = state?.cursor === items.length;
    const actionLabel = completed ? copy.pastResult : state?.responses.length ? copy.resume : copy.start;
    actions.append(button(actionLabel, "action", () => {
      if (!state) {
        state = {order: scoring.makeOrder(), cursor: 0, responses: []};
        save();
      }
      if (state.cursor === items.length) result();
      else question();
    }), element("p", "duration", copy.duration));
    screen.append(intro, actions);
    show(screen);
  }

  function question() {
    const {cursor, order, responses} = state;
    const item = itemById.get(order[cursor]);
    const screen = element("section", "quiz enter");
    const meta = element("div", "quiz-meta");
    const count = numerals.format(cursor + 1);
    const max = numerals.format(items.length);
    meta.append(element("span", "", `${copy.activity} ${count} / ${max}`));
    const progress = element("div", "progress");
    progress.setAttribute("role","progressbar");
    progress.setAttribute("aria-label",copy.progress);
    progress.setAttribute("aria-valuemin","0");
    progress.setAttribute("aria-valuemax",String(items.length));
    progress.setAttribute("aria-valuenow",String(cursor));
    const unit = items.length / types.length;
    types.forEach(({color}, i) => {
      const segment = element("span");
      segment.setAttribute("aria-hidden", "true");
      const fill = Math.max(0, Math.min(1, (cursor - i * unit) / unit));
      segment.style.setProperty("--fill", `${100 * fill}%`);
      segment.style.setProperty("--segment", color);
      segment.append(element("i"));
      progress.append(segment);
    });
    const hintText = settings.encouragement[cursor] ?? "";
    const hint = element("p", "hint", hintText);
    const panel = element("div", "question-panel");
    const heading = element("h1", "", item.text);
    heading.id = "activity-title";
    const prompt = element("p", "", copy.question);
    prompt.id = "activity-prompt";
    heading.setAttribute("aria-describedby", prompt.id);
    panel.append(heading, prompt);

    const options = element("div", "answers");
    options.setAttribute("role", "group");
    options.setAttribute("aria-labelledby", heading.id);
    answers.forEach((label, index) => {
      const value = index + 1;
      const choice = button(label, "answer", () => choose(value, choice, options, back));
      choice.setAttribute("aria-pressed", String(responses[cursor] === value));
      const marker = element("span", "answer-marker");
      marker.setAttribute("aria-hidden","true");
      for (let i = 0; i < answers.length; i++) marker.append(element("i", i < value ? "filled" : ""));
      choice.append(marker);
      options.append(choice);
    });
    const back = button(copy.back, "back", () => {
      if (pending) return;
      if (state.cursor === 0) {
        welcome();
        return;
      }
      state.cursor--;
      save();
      question();
    });
    screen.append(meta, progress, hint, panel, options, back);
    show(screen, heading);
    announcement.textContent = `${copy.activity} ${count} / ${max}. ${hintText}`;
  }

  function choose(value, choice, options, back) {
    if (pending) return;
    pending = true;
    for (const option of options.children) {
      option.setAttribute("aria-pressed", String(option === choice));
      option.disabled = true;
    }
    back.disabled = true;
    state.responses[state.cursor] = value;
    state.cursor++;
    save();
    window.setTimeout(() => {
      pending = false;
      if (state.cursor === items.length) {
        const reveal = element("div", "reveal enter", copy.reveal);
        reveal.setAttribute("role", "status");
        show(reveal);
        window.setTimeout(result, motion.matches ? 0 : 440);
        return;
      }
      question();
    }, motion.matches ? 0 : 145);
  }

  function list(tag, values) {
    const el = element(tag);
    for (const value of values) {
      const li = element("li");
      li.append(value);
      el.append(li);
    }
    return el;
  }

  function trackCard(track, {showPercent = false, feature = false, label = ""} = {}) {
    const card = element("article", feature ? "track featured" : "track");
    const title = element("h2", "", track.title);
    if (showPercent) {
      const ratio = element("bdi", "track-match", percentage.format(track.percent / 100));
      title.append(" · ", ratio);
    }
    if (label) card.append(element("p", "track-label", label));
    card.append(title, element("p", "", track.description));

    const firstSteps = list("ol", track.steps.map(([text, url]) => url ? external(text, url) : text));
    const details = element("details");
    if (feature) {
      card.append(element("h3", "step-heading", copy.steps), firstSteps);
      details.append(element("summary", "", copy.workDetails));
    } else {
      details.append(element("summary", "", copy.steps), firstSteps);
    }
    details.append(element("h3", "", copy.tasks), list("ul", track.tasks),
      element("h3", "", copy.skills), element("p", "", track.skills.join("، ")));
    card.append(details);
    return card;
  }

  function chart(profile) {
    const size = 480;
    const canvas = element("canvas", "chart");
    canvas.width = size;
    canvas.height = 455;
    const context = canvas.getContext("2d");
    canvas.setAttribute("role", "img");
    const scores = profile.map(type => `${type.title} ${numerals.format(type.total)}`);
    canvas.setAttribute("aria-label", `${copy.chart}. ${scores.join("، ")}. ${copy.chartScale}.`);
    const cx = size / 2;
    const cy = canvas.height / 2;
    const radius = 164;
    const angle = index => index * (Math.PI / 3) - Math.PI / 2;
    const x = (scale, index) => cx + radius * scale * Math.cos(angle(index));
    const y = (scale, index) => cy + radius * scale * Math.sin(angle(index));
    function polygon(scales) {
      context.beginPath();
      scales.forEach((scale, index) => {
        if (index === 0) context.moveTo(x(scale,index),y(scale,index));
        else context.lineTo(x(scale,index),y(scale,index));
      });
      context.closePath();
    }
    context.strokeStyle = "#8c7368";
    context.lineWidth = 2;
    for (const ring of [.25,.5,.75,1]) {
      polygon(profile.map(() => ring));
      context.stroke();
    }
    profile.forEach((type, index) => {
      context.beginPath();
      context.moveTo(cx, cy);
      context.lineTo(x(1,index),y(1,index));
      context.stroke();
      context.font = "bold 30px Georgia";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = type.color;
      context.fillText(type.key, x(1.19,index), y(1.19,index));
    });
    const scales = profile.map(type => (type.total - scoring.lower) / (scoring.upper - scoring.lower));
    polygon(scales);
    context.fillStyle = "#48020c39";
    context.fill();
    context.strokeStyle = palette.wine;
    context.lineWidth = 5;
    context.stroke();
    scales.forEach((scale,index) => {
      context.beginPath();
      context.arc(x(scale,index), y(scale,index), 6, 0, 2*Math.PI);
      context.fillStyle = profile[index].color;
      context.fill();
    });
    return canvas;
  }

  function profileBoard(report) {
    const section = element("section", "result-section");
    section.append(element("h2", "", copy.chart));
    const board = element("div", "profile-board");
    const info = element("div");
    const code = element("bdi", "code", report.code);
    info.append(element("p", "small", copy.early), code);
    if (report.tied) info.append(element("p", "small", copy.tie));
    info.append(list("ul", report.top.map(type => {
      const content = element("span");
      const key = element("bdi", "type-id", type.key);
      key.style.setProperty("--type", type.color);
      content.append(key, element("strong", "", type.title), " · ", type.description);
      return content;
    })));
    const side = element("div");
    const keyList = element("dl", "chart-key");
    report.profile.forEach(type => {
      const entry = element("div");
      const name = element("dt", "", type.title);
      const key = element("bdi", "type-id", type.key);
      key.style.setProperty("--type", type.color);
      name.prepend(key);
      entry.append(name, element("dd", "", numerals.format(type.total)));
      keyList.append(entry);
    });
    side.append(chart(report.profile), element("p", "small", copy.chartScale), keyList);
    board.append(info, side);
    section.append(board);
    return section;
  }

  function cardCanvas(report) {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = palette.wine;
    ctx.fillRect(0,0,720,1280);
    ctx.strokeStyle = "#b48578";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(555 + 20*i, 1115 - 25*i, 390, 94, -.47, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = palette.paper;
    ctx.font = '27px "IBM Plex Sans Arabic", Tahoma, Arial, sans-serif';
    ctx.fillText(institution, 656, 117);
    ctx.font = 'bold 78px "IBM Plex Sans Arabic", Tahoma, Arial, sans-serif';
    ctx.fillText(title, 656, 250, 590);
    ctx.fillStyle = palette.vanilla;
    ctx.fillRect(58,326,604,556);
    ctx.fillStyle = palette.wine;
    ctx.font = '28px "IBM Plex Sans Arabic", Tahoma, Arial, sans-serif';
    ctx.fillText(copy.early, 614, 403);
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.font = "bold 112px Georgia, serif";
    ctx.fillText(report.code, 104, 526, 505);
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.font = '28px "IBM Plex Sans Arabic", Tahoma, Arial, sans-serif';
    ctx.fillText(report.reason ? copy.try : report.close ? copy.closeHeading : copy.best, 614, 628);
    ctx.font = 'bold 39px "IBM Plex Sans Arabic", Tahoma, Arial, sans-serif';
    const tracks = report.reason || report.close ? report.suggestions : report.ranking.slice(0, 1);
    let lineY = 690;
    tracks.forEach(track => {
      const title = track.title;
      let line = "";
      for (const word of title.split(" ")) {
        const next = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(next).width > 515) {
          ctx.fillText(line, 614, lineY);
          lineY += 49;
          line = word;
        } else line = next;
      }
      ctx.fillText(line, 614, lineY);
      lineY += 58;
    });
    ctx.font = 'bold 35px "IBM Plex Sans Arabic", Tahoma, Arial, sans-serif';
    const tagWidth = Math.min(590, ctx.measureText(hashtag).width);
    ctx.fillStyle = palette.wine;
    ctx.fillRect(640 - tagWidth, 1145, tagWidth + 33, 52);
    ctx.fillStyle = palette.paper;
    ctx.fillText(hashtag, 656, 1178, 590);
    return canvas;
  }

  function shareSection(report) {
    const section = element("section", "result-section share-area");
    const heading = element("h2", "", copy.share);
    const image = element("img", "share-card");
    image.hidden = true;
    image.alt = copy.cardAlt;
    image.width = 720;
    image.height = 1280;
    const controls = element("div", "share-buttons");
    const feedback = element("p", "small");
    feedback.setAttribute("role","status");
    section.append(heading, image, controls, feedback);
    function setError() {
      image.hidden = true;
      feedback.textContent = copy.cardError;
    }
    async function makeImage() {
      await document.fonts?.ready;
      if (!section.isConnected) return;
      try {
        cardCanvas(report).toBlob(blob => {
          if (!section.isConnected) return;
          if (!blob) {
            setError();
            return;
          }
          cardUrl = URL.createObjectURL(blob);
          image.src = cardUrl;
          image.hidden = false;
          const file = new File([blob], "amsik-al-khayt.png", {type:"image/png"});
          if (navigator.canShare?.({files:[file]})) {
            controls.append(button(copy.shareAction, "action", async () => {
              try {
                await navigator.share({files:[file], title});
              } catch (error) {
                if (error.name !== "AbortError") feedback.textContent = copy.shareError;
              }
            }));
          }
          const download = element("a", "action secondary", copy.download);
          download.href = cardUrl;
          download.download = file.name;
          controls.append(download);
          feedback.textContent = copy.saveHint;
        }, "image/png");
      } catch {
        setError();
      }
    }
    queueMicrotask(makeImage);
    return section;
  }

  function sourceSection() {
    const details = element("details", "sources");
    details.append(element("summary", "", copy.sources),
      list("ul", [external(copy.database, links.database), external(copy.license, links.license), external(copy.model, links.model)]));
    return details;
  }

  function result() {
    const responses = Object.fromEntries(state.order.map((id, index) => [id, state.responses[index]]));
    const report = scoring.scoreProfile(responses);
    const screen = element("div", "result enter");
    const header = element("header", "result-header");
    const heading = element("h1", "", copy.result);
    const headline = element("div", "result-headline");
    const codePreview = element("bdi", "code-preview", report.code);
    codePreview.setAttribute("aria-label", `${copy.early}: ${report.code}`);
    headline.append(heading, codePreview);
    header.append(headline, element("p", "small", copy.honesty));
    const summary = element("section", "result-summary");
    if (report.reason) {
      summary.append(element("p", "", copy[report.reason]), element("h2", "", copy.try));
      report.suggestions.forEach(track => summary.append(trackCard(track)));
    } else {
      const [best, second, third] = report.ranking;
      if (report.close) summary.append(element("p", "", copy.close));
      const bridge = element("p", "small");
      bridge.append(element("strong", "", copy.outsideMajor), " · ", best.bridge);
      summary.append(trackCard(best, {showPercent:true, label:report.close ? copy.closeHeading : copy.best, feature:true}),
        bridge, element("h2", "", copy.others),
        trackCard(second, {showPercent:true}), trackCard(third, {showPercent:true}),
        element("p", "small", copy.percentInfo));
    }
    const restart = button(copy.restart, "action secondary", () => {
      if (!window.confirm(copy.confirmRestart)) return;
      if (cardUrl) URL.revokeObjectURL(cardUrl);
      cardUrl = undefined;
      state = null;
      save();
      welcome();
      app.querySelector("button")?.focus();
    });
    screen.append(header, summary, profileBoard(report), shareSection(report),
      element("p", "result-section small", copy.attribution), sourceSection(), element("p", "booth-end", copy.boothCTA), restart);
    show(screen, heading);
    announcement.textContent = copy.result;
  }

  welcome();
})();

