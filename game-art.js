"use strict";

globalThis.ThreadArt = (() => {
  const gold = "#ffd58a";
  const cream = "#f9edd4";
  const scenes = ["plane","ball","paint","camera","kite","notebook","megaphone"];
  const ink = "#2f304b";
  const violet = "#e3c2d9";
  const lime = "#dfe3b4";
  const sky = "#b4d7ec";
  const animation = new WeakMap();
  const resultProps = {
    analytics:"chart", search:"lens", content:"notebook", creative:"paint",
    ux:"phone", community:"megaphone", strategy:"compass"
  };

  function stroke(ctx,x,y,color,shape) {
    ctx.save();
    ctx.translate(x,y);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    shape(ctx);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = ink;
    ctx.stroke();
    ctx.restore();
  }

  function sparkle(ctx,x,y,size,color) {
    ctx.save();
    ctx.translate(x,y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0,-size);
    ctx.quadraticCurveTo(.15*size,-.16*size,size,0);
    ctx.quadraticCurveTo(.16*size,.15*size,0,size);
    ctx.quadraticCurveTo(-.15*size,.15*size,-size,0);
    ctx.quadraticCurveTo(-.15*size,-.15*size,0,-size);
    ctx.fill();
    ctx.restore();
  }

  function prop(ctx,key,x,y,scale=1,angle=0) {
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(scale,scale);
    const {rect,oval,path} = ThreadMascots(ctx);
    switch (key) {
      case "plane":
        stroke(ctx,0,0,cream,p => {
          p.moveTo(-24,8); p.lineTo(28,-14); p.lineTo(12,15); p.lineTo(1,7);
          p.lineTo(-9,18); p.lineTo(-11,7); p.closePath();
        });
        path([[-11,7],[17,-7],[1,7]],ink,1.7);
        break;
      case "ball":
        oval(0,0,18,18,cream,ink);
        oval(0,0,6,6,"#b65370");
        path([[0,-16],[0,-4],[11,10],[4,17]],ink,1.5);
        path([[-15,9],[-3,2]],ink,1.7);
        break;
      case "paint":
        oval(0,0,20,15,cream,ink);
        oval(-10,-4,4,4,"#9978ab"); oval(0,-7,4,4,"#ba627f");
        oval(10,-2,4,4,"#d3944e"); oval(2,7,5,4,"#80576a");
        path([[12,-14],[25,-22]],ink,4);
        break;
      case "camera":
        rect(-15,-13,13,6,2,gold,ink);
        rect(-22,-8,44,27,4,"#6f8dae",ink);
        oval(0,6,9,9,sky,ink);
        oval(1,5,3,3,"#fff");
        break;
      case "kite":
        stroke(ctx,0,0,gold,p => {
          p.moveTo(0,-23); p.lineTo(16,-2); p.lineTo(0,21); p.lineTo(-16,-2); p.closePath();
        });
        path([[0,-22],[0,19],[-7,26],[2,32]],ink,1.5);
        path([[-16,-2],[16,-2]],ink,1.5);
        break;
      case "notebook":
        rect(-17,-18,34,34,4,violet,ink);
        path([[-8,-8],[10,-8]],ink,1.8);
        path([[-8,0],[6,0]],ink,1.8);
        path([[-8,8],[10,8]],ink,1.8);
        break;
      case "megaphone":
        stroke(ctx,0,0,gold,p => {
          p.moveTo(-21,-7); p.lineTo(-10,-7); p.lineTo(16,-17);
          p.lineTo(16,16); p.lineTo(-10,6); p.lineTo(-21,6); p.closePath();
        });
        path([[-10,7],[-5,18],[-1,17]],ink,3);
        path([[22,-11],[28,-14]],ink,2);
        path([[23,0],[30,0]],ink,2);
        break;
      case "chart":
        path([[-22,-16],[-22,17],[21,17]],ink,2.8);
        rect(-14,2,8,15,2,violet,ink);
        rect(-1,-5,8,22,2,sky,ink);
        rect(12,-15,8,32,2,gold,ink);
        break;
      case "lens":
        oval(-4,-4,14,14,sky,ink);
        path([[6,6],[18,18]],ink,4.8);
        path([[-11,-7],[-8,-11]],cream,2);
        break;
      case "phone":
        rect(-13,-22,26,44,6,sky,ink);
        rect(-8,-15,16,26,2,cream,ink);
        path([[-3,16],[3,16]],ink,2);
        break;
      case "compass":
        oval(0,0,20,20,cream,ink);
        stroke(ctx,0,0,gold,p => {
          p.moveTo(-10,12); p.lineTo(-4,-4); p.lineTo(11,-12); p.lineTo(4,4); p.closePath();
        });
        break;
    }
    ctx.restore();
  }

  function ribbons(ctx,color,muted=cream) {
    ctx.save();
    ctx.lineWidth = 2.1;
    ctx.globalAlpha = .82;
    const shades = [muted,color,violet,sky,gold];
    for (let i=0;i<shades.length;i++) {
      ctx.beginPath();
      ctx.moveTo(-7,190+i*14);
      ctx.bezierCurveTo(135,208+i*16,167,152+i*11,332,174+i*12);
      ctx.bezierCurveTo(437,185+i*12,523,100+i*19,629,119+i*18);
      ctx.strokeStyle = shades[i];
      ctx.stroke();
    }
    ctx.restore();
  }

  function illustration(ctx,accent=gold,resultFields,phase=0) {
    const {oval,rect,student,hero,rival,path} = ThreadMascots(ctx);
    const lift = Math.sin(Math.PI*phase);
    ctx.save();
    oval(313,165,154,136,"#664158");
    oval(316,162,131,117,"#edc48b");
    oval(316,166,121,104,"#f9dfa9");
    ctx.strokeStyle = "#f8e4bd";
    ctx.lineWidth = 2;
    ctx.setLineDash([3,8]);
    ctx.beginPath();
    ctx.ellipse(315,167,171,115,-.13,0,Math.PI*2);
    ctx.stroke();
    ctx.setLineDash([]);
    ribbons(ctx,accent);
    sparkle(ctx,117,70,13,gold);
    sparkle(ctx,484,76,14,cream);
    sparkle(ctx,532,206,8,accent);
    sparkle(ctx,127,248,9,violet);
    oval(465,112,3,3,gold);
    oval(200,68,3,3,cream);
    rect(262,256,107,18,9,"#6d554f");
    path([[277,263],[353,263]],"#f1cf95",1.3);

    ctx.save(); ctx.translate(138-lift*12,125-lift*28); ctx.rotate(-.17-lift*.16);
    rect(-35,-32,70,64,13,"#fbefd7",ink);
    prop(ctx,resultFields ? resultProps[resultFields[0].id] : "plane",0,0,.94);
    ctx.restore();
    ctx.save(); ctx.translate(476+lift*14,151-lift*22); ctx.rotate(.17+lift*.18);
    rect(-35,-32,70,64,13,violet,ink);
    prop(ctx,resultFields ? resultProps[resultFields[1].id] : "paint",0,3,.83);
    ctx.restore();

    student(rival,237-lift*10,254,{scale:.83,flip:-1,arm:15+lift*18,bob:-lift*11,tilt:-.08});
    student(hero,315+lift*7,260,{scale:1.43,arm:35+lift*12,bob:-lift*16,tilt:-.04-lift*.04});
    ctx.beginPath();
    ctx.ellipse(382,187,22,13,-.35,0,Math.PI*2);
    ctx.strokeStyle = "#7f4f48";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(382,184,20,12,-.35,0,Math.PI*2);
    ctx.strokeStyle = gold;
    ctx.lineWidth = 3;
    ctx.stroke();
    sparkle(ctx,414,133,9,cream);
    ctx.restore();
  }

  function vignette(ctx,index,time=0,reaction=0) {
    const {oval,path,student,hero,rival,driver} = ThreadMascots(ctx);
    const offset = index%scenes.length;
    const people = [hero,rival,driver];
    const actor = people[offset%people.length];
    oval(79,63,75,45,"#eed9b6");
    oval(79,63,65,40,"#f6e8d0");
    const swing = Math.sin(time*3+offset*.5)*.5+.5;
    const travel = Math.sin(time*2.2+offset)*.5+.5;
    const move = reaction+.35*swing;
    const x = 70 + (offset===1 ? move*9 : offset===0 ? -move*9 : travel*4);
    const positions = [
      [111+travel*21,51-move*30,-.3+move*.18],
      [119+travel*14,68-move*37,time*2.9+reaction*4],
      [121,54-move*19,.15-swing*.35],
      [119+travel*8,57-move*18,.06+move*.2],
      [124+travel*14,43-move*14,-.13+swing*.35],
      [120,58-move*19,-.2+move*.52],
      [119+travel*7,52-move*11,swing*.24-.18]
    ];
    const [px,py,angle] = positions[offset];
    if (offset===4) path([[x+23,64],[px-10,py+20],[px,py+14]],"#86526a",1.6);
    if (offset===0 || offset===1) path([[px-19,py+10],[px-28,py+11],[px-34,py+10]],"#ad7558",1.2);
    student(actor,x,102,{
      scale:.68,arm:(offset%2?17:24)+move*24,bob:-move*(offset%2?11:6),
      tilt:(offset%2?-.09:.07)*move,flip:1
    });
    prop(ctx,scenes[offset],px,py,.74,angle);
    sparkle(ctx,38,42-move*7,6+move*3,"#a66b60");
    sparkle(ctx,139,24-move*4,6+swing*2,gold);
    if (reaction>.05) {
      sparkle(ctx,104-reaction*9,25-reaction*12,4+reaction*5,"#b16f81");
      sparkle(ctx,146,74+reaction*8,3+reaction*4,"#bc8257");
    }
  }

  function scene(mode,index=0,resultFields) {
    const canvas = document.createElement("canvas");
    const large = mode !== "question";
    canvas.width = large ? 1240 : 320;
    canvas.height = large ? 594 : 224;
    canvas.className = mode === "result" ? "result-art" : large ? "hero-art" : "quiz-art";
    canvas.setAttribute("aria-hidden","true");
    const ctx = canvas.getContext("2d");
    ctx.scale(2,2);
    const paint = large
      ? (time,reaction) => illustration(ctx,resultFields?.[1].tint,resultFields,(time%4.2)/4.2+reaction*.18)
      : (time,reaction) => vignette(ctx,index,time,reaction);
    animation.set(canvas,{ctx,paint,frame:0,started:null,lastPaint:0,tap:-1000,enabled:false});
    paint(0,0);
    return canvas;
  }

  function play(canvas,enabled) {
    const state = animation.get(canvas);
    if (!state || state.enabled === enabled) return;
    state.enabled = enabled;
    cancelAnimationFrame(state.frame);
    if (!enabled) return;
    function frame(now) {
      if (!canvas.isConnected || !state.enabled) return;
      if (state.started === null) state.started = now;
      if (now-state.lastPaint >= 1000/30) {
        state.lastPaint = now;
        const phase = Math.max(0,Math.min(1,(now-state.tap)/510));
        const reaction = Math.sin(Math.PI*phase);
        state.ctx.clearRect(0,0,canvas.width/2,canvas.height/2);
        state.paint((now-state.started)/1000,reaction);
      }
      state.frame = requestAnimationFrame(frame);
    }
    state.frame = requestAnimationFrame(frame);
  }

  function react(canvas) {
    const state = animation.get(canvas);
    if (state?.enabled) state.tap = performance.now();
  }

  return {scene,play,react,illustration,sparkle};
})();
