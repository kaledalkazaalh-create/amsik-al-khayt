"use strict";

(() => {
  const {fields, answers, title, institution, cardInstitution, cardUrl, copy} = ThreadData;
  const {items, byId, order, validOrder, validRating, score} = ThreadScoring;
  const game = document.querySelector("#game");
  const announcement = document.querySelector("#announcement");
  const numbers = new Intl.NumberFormat("ar-JO", {maximumFractionDigits:1});
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const key = "amsik-al-khayt:fields:v2";
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
    actions.append(start,node("p","duration",copy.duration));
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
    const completed = session.ids.slice(0,index).map(id => byId.get(id)).filter(item => !item.checkOf);
    fields.forEach((field,i) => {
      const segment = node("span","segment");
      segment.setAttribute("aria-hidden","true");
      const filled = node("i");
      const count = completed.filter(item => item.field === field.id).length;
      filled.style.setProperty("--filled",Math.min(1,count/4)*100+"%");
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
    const heading = node("h1","request-heading");
    heading.append(
      node("span","request-speaker",activity.speaker+":"),
      " ",
      node("span","request-task","«"+activity.text+"»")
    );
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
      else if (copy.milestones[session.index]) milestoneScreen();
      else quiz();
    },motionOn() ? 560 : 0);
  }

  function milestoneScreen() {
    const part = session.index / 10;
    const screen = node("section","milestone-screen");
    const art = threads("milestone-threads");
    const heading = node("h1","",copy.milestones[session.index]);
    const description = node("p","",`${numbers.format(session.index)} من ${numbers.format(items.length)} نشاطًا خلفك. أكمل الجزء ${numbers.format(part+1)}.`);
    const next = button(copy.continue,"button button-wine",() => quiz());
    screen.append(art,heading,description,next);
    show(screen,heading);
    announcement.textContent = heading.textContent;
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
    setTimeout(showResult,2200);
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
    const work = node("section","work-example");
    work.append(node("h3","",copy.work),node("p","",field.example));
    detail.append(work);
    if (field.reasons.length) {
      const reason = node("div","field-reason");
      reason.append(node("h3","",copy.reasonHeading));
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
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    const font = '"IBM Plex Sans Arabic", Tahoma, Arial, sans-serif';
    const cream = "#fff2dc";
    const gold = "#ffda98";
    const plum = "#120f08";
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
      rect(48,y,984,660,30,cream);
      rect(68,y+18,944,98,22,field.tint);
      oval(125,y+67,34,34,cream);
      fieldIcon(field,104,y+46);
      line(label,970,y+47,24,field.color,"bold",720);
      line(field.name,970,y+91,39,field.color,"bold",720);
      wrap(field.why,970,y+157,850,28,plum,"bold",37);
      wrap(field.example,970,y+198,850,26,plum,"normal",35);

      line(copy.jobs,970,y+258,34,field.color,"bold");
      field.jobs.slice(0,6).forEach((job,i) => {
        const column=i%2;
        const row=Math.floor(i/2);
        const right=column ? 530 : 970;
        const yy=y+306+row*46;
        oval(right-6,yy-9,5,5,field.color,null);
        line(job,right-22,yy,38,plum,"normal",400);
      });
      path([[88,y+440],[992,y+440]],"#d7b799",2);
      line(copy.skills,970,y+482,34,field.color,"bold");
      field.skills.forEach((skill,i) => {
        const column=i%2;
        const row=Math.floor(i/2);
        const left=column ? 88 : 550;
        const top=y+496+row*45;
        rect(left,top,442,40,10,field.tint,null);
        line(skill,left+420,top+29,32,field.color,"bold",400);
      });
      rect(88,y+594,904,54,13,"#f4dfb9",null);
      wrap(field.tinyStep,970,y+627,850,31,wine,"bold",34);
    }

    const fill=ctx.createLinearGradient(0,0,0,1920);
    fill.addColorStop(0,"#48020c"); fill.addColorStop(1,"#261015");
    rect(0,0,1080,1920,0,fill);
    rect(28,28,1024,1864,34,"#ffffff00","#a78268");
    ctx.save();
    ctx.globalAlpha=.68;
    ctx.lineWidth=3;
    fields.forEach((strand,i)=>{
      ctx.beginPath();
      ctx.moveTo(74,63+i*9);
      ctx.bezierCurveTo(115,34+i*7,151,139-i*5,183,94+i*3);
      ctx.strokeStyle=strand.tint;
      ctx.stroke();
    });
    ctx.restore();
    oval(126,104,10,10,gold,cream);
    line(title,982,112,64,cream,"bold",820);
    const headline=report.status ? copy.result : report.suggestions[0].headline;
    line(headline,982,176,38,gold,"bold",820);
    path([[82,206],[998,206]],"#af8066",2);

    report.suggestions.forEach((field,i) => {
      const label = report.status ? copy.compare : i===0 ? copy.primary : copy.secondary;
      career(field,230+i*672,label);
    });

    wrap(copy.notes,982,1605,900,23,cream,"normal",31);
    if (report.inconsistent) wrap(copy.inconsistent,982,1658,900,22,gold,"normal",28);
    line(cardUrl,982,1702,20,cream,"normal",900);
    path([[82,1740],[998,1740]],"#ad8066",2);
    line(cardInstitution,982,1802,34,gold,"bold",900);
    line(copy.disclaimer,982,1854,20,cream,"normal",900);
    return canvas;
  }



  function sharing(report) {
    const section = node("section","sharing");
    section.id = "share-result";
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
      if (first.reasons.length) header.append(node("p","result-evidence",`${copy.reason}: ${first.reasons[0].short}.`));
    }
    if (report.inconsistent) header.append(node("p","result-context inconsistent-note",copy.inconsistent));
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
    screen.append(header,cards,chart(report.scores),sharing(report),foot);
    show(screen,heading);
    announcement.textContent = report.inconsistent ? `${copy.resultLabel}. ${copy.inconsistent}` : copy.resultLabel;
  }

  welcome();
})();

