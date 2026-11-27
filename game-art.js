"use strict";

globalThis.ThreadArt = (() => {
  const gold = "#ffd58a";
  const cream = "#f9edd4";
  const scenes = ["plane","ball","paint","camera","kite","notebook","megaphone"];
  const ink = "#2f304b";
  const violet = "#e3c2d9";
  const lime = "#dfe3b4";
  const sky = "#b4d7ec";
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

    ctx.save(); ctx.translate(138,125-lift*13); ctx.rotate(-.17-lift*.10);
    rect(-35,-32,70,64,13,"#fbefd7",ink);
    prop(ctx,resultFields ? resultProps[resultFields[0].id] : "plane",0,0,.94);
    ctx.restore();
    ctx.save(); ctx.translate(476,151-lift*9); ctx.rotate(.17+lift*.07);
    rect(-35,-32,70,64,13,violet,ink);
    prop(ctx,resultFields ? resultProps[resultFields[1].id] : "paint",0,3,.83);
    ctx.restore();

    student(rival,237,254,{scale:.83,flip:-1,arm:15+lift*7,bob:-lift*5,tilt:-.08});
    student(hero,315,260,{scale:1.43,arm:35+lift*9,bob:-lift*6,tilt:-.04});
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

  function vignette(ctx,index,motion=0) {
    const {oval,student,hero,rival,driver} = ThreadMascots(ctx);
    const offset = index%scenes.length;
    const people = [hero,rival,driver];
    const actor = people[offset%people.length];
    oval(79,63,75,45,"#eed9b6");
    oval(79,63,65,40,"#f6e8d0");
    const move = Math.sin(Math.PI*motion);
    const shift = offset===1 ? move*9 : offset===0 ? -move*6 : 0;
    const x = 77+shift;
    student(actor,x,102,{
      scale:.68,arm:(offset%2?17:24)+move*24,bob:-move*(offset%2?11:6),
      tilt:(offset%2?-.09:.07)*move,flip:1
    });
    prop(ctx,scenes[offset],121+move*((offset%2)?14:7),52-move*((offset===0||offset===4)?30:17),.73,.11+move*.55);
    sparkle(ctx,38,42-move*7,6+move*3,"#a66b60");
    sparkle(ctx,138,24-move*4,6,gold);
  }

  function scene(mode,index=0,accent) {
    const canvas = document.createElement("canvas");
    const large = mode !== "question";
    canvas.width = large ? 1240 : 320;
    canvas.height = large ? 594 : 224;
    canvas.className = large ? "hero-art" : "quiz-art";
    canvas.setAttribute("aria-hidden","true");
    const ctx = canvas.getContext("2d");
    ctx.scale(2,2);
    if (large) illustration(ctx,accent);
    else vignette(ctx,index);
    return canvas;
  }

  function animate(canvas,duration,paint,reduced) {
    if (reduced) return;
    const ctx = canvas.getContext("2d");
    const start = performance.now();
    function frame(now) {
      if (!canvas.isConnected) return;
      ctx.clearRect(0,0,canvas.width/2,canvas.height/2);
      const progress = Math.min(1,(now-start)/duration);
      paint(ctx,progress);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function react(canvas,index,reduced) {
    animate(canvas,315,(ctx,t) => vignette(ctx,index,t),reduced);
  }

  function greet(canvas,reduced) {
    animate(canvas,1220,(ctx,t) => illustration(ctx,gold,null,t),reduced);
  }

  return {scene,react,greet,illustration,sparkle};
})();
