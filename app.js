"use strict";

(() => {
  const {fields, answers, title, institution, cardInstitution, copy} = ThreadData;
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
  let motionPref;
  const motionOn = () => motionPref ?? !reduced.matches;

  document.querySelector("[data-name]").textContent = title;
  document.querySelector("[data-institution]").textContent = institution;
  const motionButton = button("", "motion-button", () => {
    motionPref = !motionOn();
    syncMotion();
  });
  document.querySelector(".game-header").append(motionButton);
  reduced.addEventListener("change",syncMotion);

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
    syncMotion();
    scrollTo(0,0);
    if (focus) {
      heading.tabIndex = -1;
      heading.focus({preventScroll:true});
    }
  }

  function syncMotion() {
    const enabled = motionOn();
    motionButton.textContent = enabled ? copy.motionOff : copy.motionOn;
    document.body.classList.toggle("motion-paused",!enabled);
    game.querySelectorAll("canvas.hero-art, canvas.quiz-art, canvas.result-art").forEach(canvas => ThreadArt.play(canvas,enabled));
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
    const hero = ThreadArt.scene("welcome");
    visual.append(hero);
    const actions = node("div","welcome-actions");
    let action = copy.start;
    if (session?.index === items.length) action = copy.reopen;
    else if (session?.ratings.length) action = copy.resume;
    const start = button(action,"button button-light start-button",() => {
      if (!session) {
        session = {ids:order(),ratings:[],index:0};
        persist();
      }
      if (session.index === items.length) showResult();
      else quiz();
    });
    const arrow = node("span","start-arrow","←");
    arrow.setAttribute("aria-hidden","true");
    start.append(arrow);
    actions.append(start,node("p","duration",`${numbers.format(items.length)} نشاطًا قصيرًا`));
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
    const activity = byId.get(ids[index]);
    const heading = node("h1","",activity.text);
    heading.id = "activity-title";
    heading.setAttribute("aria-describedby","activity-prompt");
    const prompt = node("p","question-prompt",copy.prompt);
    prompt.id = "activity-prompt";
    const vignette = ThreadArt.scene("question",index);
    const stage = node("div","question-stage");
    stage.append(prompt,vignette);
    panel.append(heading,stage);
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
      const choice = button(text,"answer",() => select(i+1,choices,back,vignette));
      choice.setAttribute("aria-pressed",String(ratings[index] === i+1));
      const dots = node("span","answer-dots");
      dots.setAttribute("aria-hidden","true");
      for (let n=0;n<answers.length;n++) dots.append(node("i",n<=i ? "dot filled" : "dot"));
      const tick = node("span","answer-check","✓");
      tick.setAttribute("aria-hidden","true");
      choice.append(dots,tick);
      choices.append(choice);
    });
    moving.append(panel,choices);
    screen.append(progress(index),meta,moving,back);
    show(screen,heading);
    announcement.textContent = milestone ? `${count}. ${milestone}` : count;
  }

  function select(value, choices, back, vignette) {
    if (advancing) return;
    advancing = true;
    choices.classList.add("answer-locked");
    [...choices.children].forEach((child,i) => {
      child.setAttribute("aria-pressed",String(i+1 === value));
      child.disabled = true;
    });
    ThreadArt.react(vignette);
    back.disabled = true;
    session.ratings[session.index] = value;
    session.index++;
    persist();
    setTimeout(() => {
      advancing = false;
      if (session.index === items.length) reveal();
      else quiz();
    },motionOn() ? 560 : 0);
  }

  function reveal() {
    if (!motionOn()) {
      showResult();
      return;
    }
    const screen = node("section","reveal");
    const heading = node("h1","",copy.reveal);
    screen.append(threads("reveal-threads"),heading);
    show(screen,heading);
    setTimeout(showResult,1290);
  }

  function card(field) {
    const article = node("article","field-card");
    article.id = `field-${field.id}`;
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
      field.reasons.forEach(item => list.append(node("li","",item.short)));
      reason.append(list);
      detail.append(reason);
    }
    const step = node("section","week-step");
    step.id = `step-${field.id}`;
    step.append(node("h3","",copy.step),node("p","",field.step));
    const career = node("section","career-detail");
    const jobs = node("ul","career-jobs");
    field.jobs.forEach(job => jobs.append(node("li","",job)));
    const skills = node("ul","career-skills");
    field.skills.forEach(skill => skills.append(node("li","",skill)));
    career.append(node("h3","",copy.jobs),node("p","career-hint",copy.jobsHint),jobs,
      node("h3","skills-heading",copy.skills),skills);
    detail.append(career,step);
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

  function shareCard(report) {
    const canvas = document.createElement("canvas");
    canvas.width = 1440;
    canvas.height = 2560;
    const ctx = canvas.getContext("2d");
    const font = '"IBM Plex Sans Arabic", Tahoma, Arial, sans-serif';
    const cream = "#fff2dc";
    const gold = "#ffda98";
    const plum = "#4b1728";
    const wine = "#6a2639";
    const {rect,oval,path} = ThreadMascots(ctx);

    function line(value,x,y,size,color,weight="normal",width=1160) {
      ctx.direction = "rtl";
      ctx.textAlign = "right";
      ctx.font = `${weight} ${size}px ${font}`;
      ctx.fillStyle = color;
      ctx.fillText(value,x,y,width);
    }

    function wrap(value,x,y,width,size,color,weight,leading) {
      ctx.font = `${weight} ${size}px ${font}`;
      let current = "";
      for (const word of value.split(" ")) {
        const candidate = current ? current+" "+word : word;
        if (current && ctx.measureText(candidate).width > width) {
          line(current,x,y,size,color,weight,width);
          y += leading;
          current = word;
        } else {
          current = candidate;
        }
      }
      line(current,x,y,size,color,weight,width);
    }

    function fieldIcon(field,x,y) {
      ctx.save();
      ctx.translate(x,y);
      ctx.scale(2.1,2.1);
      ctx.strokeStyle = field.color;
      ctx.lineWidth = 1.85;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(new Path2D(field.icon));
      ctx.restore();
    }

    function career(field,y,label) {
      rect(76,y,1288,914,42,cream);
      rect(107,y+31,1226,166,31,field.tint);
      oval(201,y+114,61,61,cream);
      fieldIcon(field,163,y+76);
      line(label,1284,y+79,33,field.color,"bold");
      line(field.name,1284,y+146,58,field.color,"bold",963);

      line(copy.jobs,1284,y+262,45,plum,"bold");
      field.jobs.forEach((job,i) => {
        const column = i%2;
        const row = Math.floor(i/2);
        const right = column ? 687 : 1284;
        const yy = y+330+row*61;
        oval(right-8,yy-11,6,6,field.color);
        line(job,right-31,yy,39,plum,"normal",506);
      });
      path([[125,y+486],[1308,y+486]],"#d7b799",2);
      line(copy.skills,1284,y+552,45,plum,"bold");
      field.skills.forEach((skill,i) => {
        const column = i%2;
        const row = Math.floor(i/2);
        const left = column ? 127 : 722;
        const top = y+577+row*67;
        rect(left,top,586,54,13,field.tint);
        line(skill,left+562,top+37,35,field.color,"bold",535);
      });

      rect(126,y+725,1188,153,22,"#f4dfb9");
      line(copy.step,1286,y+773,35,wine,"bold");
      wrap(field.tinyStep,1286,y+820,1109,41,plum,"bold",45);
    }

    const fill = ctx.createLinearGradient(0,0,1440,2560);
    fill.addColorStop(0,"#351020");
    fill.addColorStop(.62,plum);
    fill.addColorStop(1,"#34111f");
    rect(0,0,1440,2560,0,fill);
    rect(39,39,1362,2482,50,"#ffffff00","#a78268");
    ctx.save();
    ctx.translate(50,47);
    ctx.scale(.68,.72);
    ThreadArt.illustration(ctx,report.suggestions[1].tint,report.suggestions);
    ctx.restore();
    line(title,1325,165,115,cream,"bold",900);
    const headline = report.status ? "مجالان لتجربتهما" : report.suggestions[0].headline;
    line(headline,1325,264,66,gold,"bold",865);
    path([[107,317],[1333,317]],"#af8066",2.5);

    report.suggestions.forEach((field,i) => {
      const label = report.status ? copy.compare : i===0 ? copy.primary : copy.secondary;
      career(field,360+i*954,label);
    });

    line(copy.jobsHint,1328,2311,37,cream);
    line(copy.notes,1328,2370,36,cream);
    path([[109,2411],[1333,2411]],"#ad8066",2.5);
    line(cardInstitution,1328,2475,46,gold,"bold");
    ThreadArt.sparkle(ctx,166,2453,18,gold);
    return canvas;
  }



  function sharing(report) {
    const section = node("section","sharing");
    section.id = "share-result";
    const heading = node("h2","",copy.shareHeading);
    const image = node("img","share-image");
    image.alt = `${title} · ${report.suggestions.map(item => item.name).join("، ")}`;
    image.width = 1440;
    image.height = 2560;
    image.hidden = true;
    const actions = node("div","share-actions");
    const feedback = node("p","muted");
    feedback.setAttribute("role","status");
    section.append(heading,image,actions,feedback);
    async function make() {
      await document.fonts?.ready;
      if (!section.isConnected) return;
      shareCard(report).toBlob(blob => {
        if (!blob || !section.isConnected) return;
        shareUrl = URL.createObjectURL(blob);
        image.src = shareUrl;
        image.hidden = false;
        const file = new File([blob],"amsik-al-khayt.png",{type:"image/png"});
        const download = node("a","button button-wine",copy.save);
        download.href = shareUrl;
        download.download = file.name;
        actions.append(download);
        const full = node("a","button button-outline",copy.fullCard);
        full.href = shareUrl;
        full.target = "_blank";
        full.rel = "noopener";
        actions.append(full);
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

  function quickLink(text,target,cls="") {
    const link = node("a",cls,text);
    link.href = "#"+target;
    return link;
  }

  function showResult() {
    const report = score(Object.fromEntries(session.ids.map((id,i) => [id,session.ratings[i]])));
    const screen = node("div","result");
    const header = node("header","result-header");
    const [first, second] = report.suggestions;
    const heading = node("h1","",report.status ? copy.result : first.headline);
    header.style.setProperty("--first-tint",first.tint);
    header.style.setProperty("--second-tint",second.tint);
    const mark = node("span","result-loop");
    mark.setAttribute("aria-hidden","true");
    mark.append(threads("result-threads"));
    const topper = node("div","result-topper");
    topper.append(node("p","result-label",copy.resultLabel),ThreadArt.scene("result",0,report.suggestions));
    header.append(topper,heading,mark);
    if (report.status) header.append(node("p","result-context",copy[report.status]));
    else {
      header.append(node("p","result-context",first.tagline+" · "+first.why));
      if (first.reasons.length) header.append(node("p","result-evidence",copy.reason+" "+first.reasons[0].short+"."));
    }
    const summary = node("div","result-pair");
    report.suggestions.forEach((field,i) => {
      const item = quickLink("",`field-${field.id}`,"result-ticket");
      item.style.setProperty("--ticket-color",field.color);
      item.style.setProperty("--ticket-tint",field.tint);
      const label = node("span","result-ticket-label",report.status ? copy.compare : i === 0 ? copy.primary : copy.secondary);
      const text = node("span","ticket-copy");
      text.append(label,node("strong","",field.name));
      item.append(text,ink(field));
      summary.append(item);
    });
    const actions = node("div","result-actions");
    actions.append(quickLink(copy.firstStep,`step-${first.id}`,"button button-light"),
      quickLink(copy.cardOpen,"share-result","button result-share-link"));
    header.append(summary,actions);
    const cards = node("div","field-grid");
    report.suggestions.forEach(field => cards.append(card(field)));
    const foot = node("footer","result-footer");
    foot.append(node("p","muted",copy.note),button(copy.restart,"button button-outline",reset));
    screen.append(header,cards,sharing(report),chart(report.scores),foot);
    show(screen,heading);
    announcement.textContent = copy.resultLabel;
  }

  welcome();
})();

