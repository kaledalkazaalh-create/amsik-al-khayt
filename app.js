"use strict";

(() => {
  const {fields, answers, title, institution, copy} = ThreadData;
  const {items, byId, order, validOrder, validRating, score} = ThreadScoring;
  const game = document.querySelector("#game");
  const announcement = document.querySelector("#announcement");
  const numbers = new Intl.NumberFormat("ar-JO", {maximumFractionDigits:1});
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const key = "amsik-al-khayt:fields:v1";
  const ns = "http://www.w3.org/2000/svg";
  let session = restore();
  let advancing = false;
  let shareUrl;

  document.querySelector("[data-name]").textContent = title;
  document.querySelector("[data-institution]").textContent = institution;

  function node(tag, cls, value) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = value;
    return el;
  }

  function button(text, cls, handler) {
    const el = node("button", cls, text);
    el.type = "button";
    el.addEventListener("click",handler);
    return el;
  }

  function svg(tag, props) {
    const el = document.createElementNS(ns, tag);
    Object.entries(props).forEach(([name,value]) => el.setAttribute(name,value));
    return el;
  }

  function ink(field) {
    const icon = svg("svg", {viewBox:"0 0 36 36",fill:"none","aria-hidden":"true"});
    icon.append(svg("path", {d:field.icon,stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}));
    return icon;
  }

  function threadPath(i) {
    const y = 40 + 30*i;
    return `M-18 ${y} C65 ${y-31} 127 ${y+42} 186 132 C235 87 253 ${238-i*28} 316 ${238-i*28} S389 ${220-i*28} 456 ${187-i*20}`;
  }

  function threads(cls) {
    const art = svg("svg", {viewBox:"0 0 440 270",class:cls,fill:"none","aria-hidden":"true"});
    art.append(svg("circle",{cx:186,cy:132,r:63,stroke:"currentColor","stroke-dasharray":"1 7",opacity:".28"}));
    art.append(svg("circle",{cx:186,cy:132,r:89,stroke:"currentColor","stroke-dasharray":"1 9",opacity:".18"}));
    fields.forEach((field, i) => {
      const path = svg("path", {d:threadPath(i),stroke:field.tint,"stroke-width":"2.1","stroke-linecap":"round",pathLength:"100"});
      path.style.setProperty("--strand",i);
      art.append(path);
    });
    art.append(svg("circle",{cx:186,cy:132,r:7,fill:"#f0e5d1",stroke:"#48020c","stroke-width":"2.7",class:"knot"}));
    return art;
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved && validOrder(saved.ids) && Array.isArray(saved.ratings) &&
          saved.ratings.length <= items.length && saved.ratings.every(validRating) &&
          Number.isInteger(saved.index) && saved.index >= 0 && saved.index <= saved.ratings.length) return saved;
    } catch {
      // The game remains usable in browsers that restrict local storage.
    }
    return null;
  }

  function persist() {
    try {
      if (session) localStorage.setItem(key,JSON.stringify(session));
      else localStorage.removeItem(key);
    } catch {
      // Resume is optional when storage is unavailable.
    }
  }

  function show(screen, heading, focus = true) {
    game.replaceChildren(screen);
    scrollTo(0,0);
    if (focus) {
      heading.tabIndex = -1;
      heading.focus({preventScroll:true});
    }
  }

  function reset() {
    if (!confirm(copy.confirm)) return;
    if (shareUrl) URL.revokeObjectURL(shareUrl);
    shareUrl = undefined;
    session = null;
    persist();
    welcome(true);
  }

  function welcome(focus = false) {
    const screen = node("section","welcome");
    const lead = node("div","welcome-lead");
    const heading = node("h1","",title);
    lead.append(heading,node("p","hook",copy.hook),node("p","welcome-body",copy.intro));
    const visual = node("div","welcome-visual");
    visual.append(threads("hero-threads"));
    const actions = node("div","welcome-actions");
    let action = copy.start;
    if (session?.index === items.length) action = copy.reopen;
    else if (session?.ratings.length) action = copy.resume;
    actions.append(button(action,"button button-light",() => {
      if (!session) {
        session = {ids:order(),ratings:[],index:0};
        persist();
      }
      if (session.index === items.length) showResult();
      else quiz();
    }));
    actions.append(node("p","duration",`${numbers.format(items.length)} نشاطًا قصيرًا`));
    if (session?.ratings.length) actions.append(button(copy.restart,"text-button light-link",reset));
    screen.append(lead,visual,actions);
    show(screen,heading,focus);
  }

  function progress(index) {
    const bar = node("div","progress");
    bar.setAttribute("role","progressbar");
    bar.setAttribute("aria-label",copy.progress);
    bar.setAttribute("aria-valuemin","0");
    bar.setAttribute("aria-valuemax",items.length);
    bar.setAttribute("aria-valuenow",index);
    const width = items.length / fields.length;
    fields.forEach((field,i) => {
      const segment = node("span","segment");
      const filled = node("i");
      filled.style.setProperty("--filled",Math.max(0,Math.min(1,(index-i*width)/width))*100+"%");
      filled.style.setProperty("--color",field.color);
      segment.append(filled);
      bar.append(segment);
    });
    return bar;
  }

  function quiz(backward = false) {
    const {index,ids,ratings} = session;
    const count = `${copy.activity} ${numbers.format(index+1)} من ${numbers.format(items.length)}`;
    const milestone = copy.milestones[index];
    const screen = node("section","quiz");
    const meta = node("div","quiz-meta");
    meta.append(node("p","",count));
    if (milestone) meta.append(node("p","milestone",milestone));
    const moving = node("div",backward ? "question move-back" : "question move-next");
    const panel = node("div","question-panel");
    const heading = node("h1","",byId.get(ids[index]).text);
    heading.id = "activity-title";
    heading.setAttribute("aria-describedby","activity-prompt");
    const prompt = node("p","",copy.prompt);
    prompt.id = "activity-prompt";
    panel.append(heading,prompt);
    const choices = node("div","choices");
    choices.setAttribute("role","group");
    choices.setAttribute("aria-labelledby",heading.id);
    const back = button(copy.back,"text-button back",() => {
      if (advancing) return;
      if (session.index === 0) {
        welcome(true);
        return;
      }
      session.index--;
      persist();
      quiz(true);
    });
    back.prepend(node("span","back-arrow","→"));
    back.firstChild.setAttribute("aria-hidden","true");
    answers.forEach((text,i) => {
      const choice = button(text,"answer",() => select(i+1,choices,back));
      choice.setAttribute("aria-pressed",String(ratings[index] === i+1));
      const dots = node("span","answer-dots");
      dots.setAttribute("aria-hidden","true");
      for (let n=0;n<answers.length;n++) dots.append(node("i",n<=i ? "dot filled" : "dot"));
      choice.append(dots);
      choices.append(choice);
    });
    moving.append(panel,choices);
    screen.append(progress(index),meta,moving,back);
    show(screen,heading);
    announcement.textContent = milestone ? `${count}. ${milestone}` : count;
  }

  function select(value, choices, back) {
    if (advancing) return;
    advancing = true;
    [...choices.children].forEach((child,i) => {
      child.setAttribute("aria-pressed",String(i+1 === value));
      child.disabled = true;
    });
    back.disabled = true;
    session.ratings[session.index] = value;
    session.index++;
    persist();
    setTimeout(() => {
      advancing = false;
      if (session.index === items.length) reveal();
      else quiz();
    },reduced.matches ? 0 : 135);
  }

  function reveal() {
    if (reduced.matches) {
      showResult();
      return;
    }
    const screen = node("section","reveal");
    const heading = node("h1","",copy.reveal);
    screen.append(threads("reveal-threads"),heading);
    show(screen,heading);
    setTimeout(showResult,1850);
  }

  function card(field) {
    const article = node("article","field-card");
    article.style.setProperty("--field",field.color);
    article.style.setProperty("--tint",field.tint);
    const banner = node("header","field-banner");
    const identity = node("div","field-identity");
    identity.append(node("h2","",field.name));
    const illustration = node("div","field-illustration");
    illustration.append(ink(field));
    banner.append(identity,illustration);
    const detail = node("div","field-detail");
    detail.append(node("p","field-why",field.why));
    if (field.reasons.length) {
      const reason = node("div","field-reason");
      reason.append(node("h3","",copy.reason));
      const list = node("ul");
      field.reasons.forEach(item => list.append(node("li","",item.text)));
      reason.append(list);
      detail.append(reason);
    }
    const step = node("section","week-step");
    step.append(node("h3","",copy.step),node("p","",field.step));
    const extra = node("details","field-extra");
    extra.append(node("summary","",copy.work),node("p","",field.example),node("h3","",copy.skills),node("p","",field.skills));
    detail.append(step,extra);
    article.append(banner,detail);
    return article;
  }

  function chart(scores) {
    const section = node("section","chart-section");
    section.append(node("h2","",copy.chart),node("p","muted",copy.chartHint));
    const list = node("ul","chart");
    scores.forEach(field => {
      const row = node("li","chart-row");
      row.style.setProperty("--field",field.color);
      row.style.setProperty("--tint",field.tint);
      const name = node("span","chart-name");
      name.append(ink(field),node("span","",field.name));
      const line = node("div","chart-line");
      line.setAttribute("aria-hidden","true");
      const value = node("i");
      value.style.setProperty("--filled",100*field.average/answers.length+"%");
      line.append(value);
      row.append(name,line,node("span","sr-only",`${numbers.format(field.average)} من ${numbers.format(answers.length)}`));
      list.append(row);
    });
    section.append(list);
    return section;
  }

  function shareCard(fields) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    const font = '"IBM Plex Sans Arabic", Tahoma, Arial, sans-serif';
    const paper = "#f3f2f0";
    const wine = "#48020c";
    ctx.fillStyle = wine;
    ctx.fillRect(0,0,1080,1920);
    ctx.save();
    ctx.translate(0,1115);
    ctx.scale(2.48,2.48);
    ThreadData.fields.forEach((field,i) => {
      ctx.strokeStyle = field.tint;
      ctx.globalAlpha = .63;
      ctx.lineWidth = 1.45;
      ctx.stroke(new Path2D(threadPath(i)));
    });
    ctx.restore();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = paper;
    ctx.font = `38px ${font}`;
    ctx.fillText(institution,980,126,860);
    ctx.font = `bold 118px ${font}`;
    ctx.fillText(title,980,292,875);
    ctx.font = `bold 47px ${font}`;
    ctx.fillText(copy.result,980,400,875);
    fields.forEach((field,i) => {
      const y = 490 + i*315;
      ctx.fillStyle = field.tint;
      ctx.fillRect(98,y,884,265);
      ctx.fillStyle = field.color;
      ctx.fillRect(955,y,27,265);
      ctx.fillRect(148,y+65,130,130);
      ctx.save();
      ctx.translate(166,y+83);
      ctx.scale(2.6,2.6);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(new Path2D(field.icon));
      ctx.restore();
      ctx.fillStyle = field.color;
      ctx.font = `bold 62px ${font}`;
      const words = field.name.split(" ");
      let line = "";
      let baseline = y+114;
      for (const word of words) {
        const next = line ? line+" "+word : word;
        if (line && ctx.measureText(next).width > 590) {
          ctx.fillText(line,903,baseline);
          baseline += 76;
          line = word;
        } else line = next;
      }
      ctx.fillText(line,903,baseline,590);
    });
    ctx.fillStyle = paper;
    ctx.font = `36px ${font}`;
    ctx.fillText(copy.note,980,1690,875);
    if (location.protocol === "https:" || location.protocol === "http:") {
      ctx.direction = "ltr";
      ctx.textAlign = "left";
      ctx.font = "27px Arial";
      ctx.fillText(new URL("play.html",location.href).href,98,1795,884);
    }
    return canvas;
  }

  function sharing(report) {
    const section = node("section","sharing");
    const heading = node("h2","",copy.shareHeading);
    const image = node("img","share-image");
    image.alt = `${title} · ${report.suggestions.map(item => item.name).join("، ")}`;
    image.width = 1080;
    image.height = 1920;
    image.hidden = true;
    const actions = node("div","share-actions");
    const feedback = node("p","muted");
    feedback.setAttribute("role","status");
    section.append(heading,image,actions,feedback);
    async function make() {
      await document.fonts?.ready;
      if (!section.isConnected) return;
      shareCard(report.suggestions).toBlob(blob => {
        if (!blob || !section.isConnected) return;
        shareUrl = URL.createObjectURL(blob);
        image.src = shareUrl;
        image.hidden = false;
        const file = new File([blob],"amsik-al-khayt.png",{type:"image/png"});
        const download = node("a","button button-wine",copy.save);
        download.href = shareUrl;
        download.download = file.name;
        actions.append(download);
        if (navigator.canShare?.({files:[file]})) {
          actions.append(button(copy.share,"button button-outline",async () => {
            try {
              await navigator.share({files:[file],title});
            } catch (error) {
              if (error.name !== "AbortError") feedback.textContent = copy.shareFailed;
            }
          }));
        }
        feedback.textContent = copy.downloadHint;
      },"image/png");
    }
    queueMicrotask(() => make().catch(() => {
      feedback.textContent = "تعذّر تجهيز صورة البطاقة في هذا المتصفّح.";
    }));
    return section;
  }

  function showResult() {
    const report = score(Object.fromEntries(session.ids.map((id,i) => [id,session.ratings[i]])));
    const screen = node("div","result");
    const header = node("header","result-header");
    const heading = node("h1","",copy.result);
    const mark = node("span","result-loop");
    mark.setAttribute("aria-hidden","true");
    mark.append(threads("result-threads"));
    header.append(node("p","result-label",copy.resultLabel),heading,mark);
    if (report.status) header.append(node("p","muted",copy[report.status]));
    const cards = node("div","field-grid");
    report.suggestions.forEach(field => cards.append(card(field)));
    const foot = node("footer","result-footer");
    foot.append(node("p","muted",copy.note),button(copy.restart,"button button-outline",reset));
    screen.append(header,cards,chart(report.scores),sharing(report),foot);
    show(screen,heading);
    announcement.textContent = copy.resultLabel;
  }

  welcome();
})();

