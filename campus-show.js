"use strict";

(() => {
  const canvas = document.querySelector("#campus-canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const toggle = document.querySelector(".show-toggle");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const {ink,rect,oval,path,shape,hero,rival,driver,face,student} = ThreadMascots(ctx);
  const width = canvas.width;
  const height = canvas.height;
  const pixelRatio = Math.max(1.5,Math.min(devicePixelRatio,2));
  canvas.width = Math.round(width*pixelRatio);
  canvas.height = Math.round(height*pixelRatio);
  ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  const loop = 22;
  const still = 19.2;
  let position = reduced.matches ? still : 0;
  let previous;
  let request;
  let playing = false;

  function star(x,y,r,color) {
    ctx.beginPath();
    for (let i=0;i<12;i++) {
      const a = i*Math.PI/6;
      const length = i%2 ? r*.34 : r;
      const px = x+Math.cos(a)*length;
      const py = y+Math.sin(a)*length;
      if (i) ctx.lineTo(px,py);
      else ctx.moveTo(px,py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function lodge(x,y,w,h,roof) {
    rect(x,y,w,h,12,"#dfa876");
    shape(p => {
      p.moveTo(x-12,y+15);
      p.bezierCurveTo(x-30,y-7,x+3,y-55,x+w*.48,y-65);
      p.bezierCurveTo(x+w*.88,y-67,x+w+29,y-7,x+w+11,y+14);
      p.quadraticCurveTo(x+w*.52,y+25,x-12,y+15);
    },roof,"#7f5150",1.7);
    oval(x+w*.32,y-38,w*.13,8,"#f3b290");
    oval(x+w*.68,y-26,w*.11,6,"#f3b290");
    rect(x+w*.2,y+35,w*.22,28,9,"#faecc7","#9f7156");
    path([[x+w*.31,y+39],[x+w*.31,y+59]],"#b1805a",1.5);
    rect(x+w*.58,y+h-41,w*.24,41,[13,13,0,0],"#a56659");
    oval(x+w*.75,y+h-15,2,2,"#f6cf82");
  }

  function background() {
    const sky = ctx.createLinearGradient(0,0,0,245);
    sky.addColorStop(0,"#f5d9a9");
    sky.addColorStop(1,"#fff2d6");
    rect(0,0,width,height,0,sky);
    oval(618,63,49,49,"#f2be63");
    oval(618,63,59,59,"#ebad552b");
    [[141,64],[376,45],[684,102]].forEach(([x,y]) => {
      oval(x,y,32,8,"#fff6de");
      oval(x-8,y-4,17,11,"#fff6de");
      oval(x+14,y-6,14,12,"#fff6de");
    });
    shape(p => {
      p.moveTo(0,213); p.quadraticCurveTo(127,125,265,203);
      p.quadraticCurveTo(382,234,506,179); p.quadraticCurveTo(658,143,760,193);
      p.lineTo(760,278); p.lineTo(0,278);
    },"#bdba85",null);
    lodge(35,166,117,88,"#b56866");
    lodge(591,157,121,97,"#a85667");
    lodge(668,190,71,67,"#c17969");
    rect(0,251,width,51,0,"#e9c995");
    path([[0,297],[760,297]],"#fff0bf",2);
    rect(0,302,width,118,0,"#874a54");
    path([[0,309],[760,309]],"#c77e74",2);
    path([[0,411],[760,411]],"#b66d72",2);
    for (let x=19;x<width;x+=112) path([[x,396],[x+47,396]],"#e6b878",3.5);
    for (let i=0;i<13;i++) {
      const x=17+i*59;
      path([[x,273],[x+4,267],[x+8,273]],"#bd965d",1.55);
    }
    rect(21,232,115,41,[12,12,6,6],"#713d52");
    ctx.font = "bold 23px Tahoma, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff6e7";
    ctx.fillText("أمسك الخيط",79,259);
    path([[32,273],[32,285]],"#713d52",4);
    path([[124,273],[124,285]],"#713d52",4);
  }

  function ball(x,y,angle) {
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    oval(0,0,13,13,"#fcf1dc",ink);
    oval(0,0,4.5,4.5,"#b34f63");
    path([[0,-13],[0,-4],[10,7],[7,12]],ink,1.5);
    path([[-11,7],[-3,3]],ink,1.5);
    ctx.restore();
  }

  function wheel(x,y,rotation) {
    oval(x,y,24,24,ink);
    oval(x,y,13,13,"#ecdfce");
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rotation);
    path([[-8,0],[8,0]],"#9e757d",2);
    path([[0,-8],[0,8]],"#9e757d",2);
    ctx.restore();
  }

  function car(x,rotation,arriving) {
    ctx.save();
    ctx.translate(x,367);
    oval(0,21,133,12,"#5b2837");
    if (arriving) {
      path([[126,-26],[199,-26]],"#f4d49c",3);
      path([[140,-12],[220,-12]],"#f4d49c",3);
    }
    rect(-87,-94,130,61,[42,32,4,4],"#e99850",ink);
    rect(-70,-86,98,51,[30,26,3,3],"#f8e9ca",ink);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-70,-86,98,51,[30,26,3,3]);
    ctx.clip();
    ctx.translate(-27,-27);
    ctx.scale(.61,.61);
    face(driver,"happy");
    ctx.restore();
    path([[7,-85],[7,-42]],ink,3);
    rect(-129,-50,252,59,[27,21,12,12],"#ecc16a",ink);
    path([[-103,-16],[100,-16]],"#c68149",3);
    rect(-120,-37,19,14,6,"#fff2cc",ink);
    rect(102,-36,14,10,4,"#b64d63");
    path([[-19,-40],[-2,-40]],ink,2.7);
    wheel(-77,7,rotation);
    wheel(76,7,rotation);
    ctx.restore();
  }

  function puff(x,y,scale) {
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(scale,scale);
    oval(-10,0,12,7,"#f7ead5");
    oval(4,-4,11,12,"#f7ead5");
    oval(14,3,8,6,"#f7ead5");
    ctx.restore();
  }

  function signal(x,y,pulse) {
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(pulse,pulse);
    rect(-41,-20,82,40,14,"#f9edcf",ink);
    path([[23,0],[-22,0]],ink,4);
    path([[-10,-9],[-22,0],[-10,9]],ink,4);
    ctx.restore();
  }

  function kite(x,y,handX,handY,t,alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(handX,handY);
    ctx.quadraticCurveTo((handX+x)/2-21,(handY+y)/2-13,x,y+23);
    ctx.strokeStyle = "#785963";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    const tailSwing = Math.sin(t*5)*9;
    path([[x,y+23],[x+15+tailSwing,y+40],[x+4+tailSwing,y+62]],"#9c5774",2);
    [[15+tailSwing,39],[5+tailSwing,58]].forEach(([dx,dy]) => {
      path([[x+dx-5,y+dy-2],[x+dx+5,y+dy+3]],"#ae4965",4);
    });
    ctx.translate(x,y);
    ctx.rotate(Math.sin(t*2.7)*.19);
    shape(p => {
      p.moveTo(0,-25); p.lineTo(19,-2); p.lineTo(0,25); p.lineTo(-19,-2);
    },"#e88d68");
    shape(p => {
      p.moveTo(0,-25); p.lineTo(19,-2); p.lineTo(0,0);
    },"#ffe198",null);
    shape(p => {
      p.moveTo(0,0); p.lineTo(0,25); p.lineTo(-19,-2);
    },"#c45b68",null);
    path([[0,-24],[0,24]],"#854a69",1.5);
    path([[-18,-2],[19,-2]],"#854a69",1.5);
    ctx.restore();
  }

  function camera(x,y,glint,alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x,y);
    path([[0,-38],[-13,0]],ink,4);
    path([[0,-38],[12,0]],ink,4);
    path([[0,-38],[0,-6]],ink,3);
    rect(-23,-61,46,29,6,"#465a74",ink);
    rect(-10,-67,15,7,3,"#cda274",ink);
    oval(-7,-47,9,9,"#9dd4ed",ink);
    oval(-8,-49,3.5,2,"#eaf9f9");
    oval(13,-53,3,2.5,"#ffd588");
    if (glint>0) {
      ctx.globalAlpha = glint;
      star(-21,-73,19,"#fff7d0");
      star(19,-76,9,"#fff2b2");
    }
    ctx.restore();
  }

  const clamp = x => Math.max(0,Math.min(1,x));
  const ease = x => 1-(1-clamp(x))**3;
  const mix = (a,b,f) => a+(b-a)*f;
  const backdrop = document.createElement("canvas");
  backdrop.width = canvas.width;
  backdrop.height = canvas.height;
  background();
  backdrop.getContext("2d").drawImage(canvas,0,0);

  function frame(t) {
    ctx.drawImage(backdrop,0,0,width,height);
    const game = t<4;
    const squabble = t>=4 && t<7.65;
    const arrival = t>=7.65 && t<10.25;
    const pointing = t>=18.4 && t<21.3;
    const firstWalk = ease(t/3.6);
    const spread = ease((t-10.55)/1.5);
    const lineUp = ease((t-14.25)/1.2);
    const reset = ease((t-20.65)/1.35);
    const x1 = mix(mix(mix(mix(167,306,firstWalk),250,spread),330,lineUp),167,reset);
    const x2 = mix(mix(mix(mix(573,461,firstWalk),420,spread),417,lineUp),573,reset);
    const forward = game ? t*8 : 0;
    const bounce = game ? -Math.abs(Math.sin(t*4.6))*12 : Math.sin(t*3)*1.5;
    const grapple = ease((t-4)/.42)*(1-ease((t-7.23)/.42));
    const jostle = squabble ? Math.sin((t-4)*17)*5 : 0;
    const fly = ease((t-10.7)/.9)*(1-ease((t-14.1)/.65));
    const portrait = ease((t-14.75)/.6)*(1-ease((t-18.15)/.38));
    const photoFlash = Math.max(0,1-Math.abs(t-17.15)*7);
    const wave = Math.sin(t*9)*5;
    const arm1 = pointing?26+wave:squabble?17+jostle:fly>0?32:game?6:10;

    if (fly>0) {
      kite(360+Math.sin(t*2.5)*29,88+Math.cos(t*2.3)*22,x1+37,269-1.13*(34+arm1),t,fly);
    }
    if (t>1 && t<4) {
      puff(x1-45,267,.5);
      puff(x2+42,268,.48);
    }
    const blink1 = (t+.18)%3.6>.3 && (t+.18)%3.6<.41;
    const blink2 = (t+1.03)%3.95>.4 && (t+1.03)%3.95<.53;
    student(hero,x1+29*grapple+jostle,269,{
      bob:bounce,run:forward,flip:pointing?-1:1,arm:arm1,blink:blink1,
      tilt:-.07*grapple,emotion:squabble?"cross":arrival?"wow":"happy"
    });
    student(rival,x2-34*grapple-jostle,269,{
      bob:bounce*.7,run:game?forward+2:0,flip:portrait>.2?1:-1,blink:blink2,
      arm:squabble?17-jostle:arrival?21:portrait>0?12+wave:8,
      tilt:-.07*grapple,emotion:squabble?"cross":arrival?"wow":"happy"
    });
    ball(mix(mix(214,383,ease(t/3.75)),214,reset),262-(game?Math.abs(Math.sin(t*4))*25:0),game?t*5:0);
    if (squabble) {
      const wobble = Math.sin(t*11)*4;
      puff(386+wobble,250,.66);
      star(370,130+wobble,13,"#ad536b");
      star(411,113-wobble,10,"#c27652");
      path([[383,142],[396,126],[393,143],[406,133]],"#8a4569",3.6);
    }
    if (t>=7.65 && t<12.2) {
      const settle = ease((t-7.65)/1.75);
      const leave = clamp((t-10.1)/2.1)**2;
      const carX = mix(965,508,settle)-680*leave;
      car(carX,(carX-965)/24,settle<.96);
      if (settle>.75 && settle<.98) star(346,328,12,"#f7dc8e");
    }
    if (t>=11.3 && t<21.3) {
      const enter = ease((t-11.3)/.68);
      ctx.save();
      ctx.globalAlpha = enter*(1-ease((t-20.65)/.65));
      student(driver,mix(mix(665,537,enter),508,lineUp),270,{
        scale:.99,flip:portrait>.2?1:-1,bob:-Math.sin(enter*Math.PI)*14,
        run:enter<1?t*8:0,arm:portrait>.2?20+wave:pointing?14:5,blink:(t%3.1)<.11
      });
      ctx.restore();
    }
    if (portrait>0) camera(624,283,photoFlash,portrait);
    if (pointing) {
      signal(84,153,1+Math.sin((t-18.4)*7)*.045);
      star(141,139,8,"#bb7859");
    }
  }

  function tick(now) {
    if (previous !== undefined) position = (position + Math.min((now-previous)/1000,.1)) % loop;
    previous = now;
    frame(position);
    request = requestAnimationFrame(tick);
  }

  function setPlaying(active) {
    if (active === playing) return;
    playing = active;
    previous = undefined;
    if (active) request = requestAnimationFrame(tick);
    else cancelAnimationFrame(request);
    toggle.textContent = active ? "أوقف الحركة" : "شغّل الحركة";
  }

  toggle.hidden = false;
  toggle.textContent = "شغّل الحركة";
  toggle.addEventListener("click",() => setPlaying(!playing));
  reduced.addEventListener("change",event => {
    if (event.matches) {
      setPlaying(false);
      position = still;
      frame(position);
    }
  });
  frame(position);
  setPlaying(!reduced.matches && !document.body.classList.contains("display"));
})();
