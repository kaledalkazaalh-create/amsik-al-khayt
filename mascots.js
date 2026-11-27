"use strict";

globalThis.ThreadMascots = ctx => {
  const ink = "#243653";

  function rect(x,y,w,h,r,color,line) {
    ctx.beginPath();
    ctx.roundRect(x,y,w,h,r);
    ctx.fillStyle = color;
    ctx.fill();
    if (line) {
      ctx.strokeStyle = line;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  function oval(x,y,rx,ry,color,line) {
    ctx.beginPath();
    ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    if (line) {
      ctx.strokeStyle = line;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  function path(points,color,lineWidth=3) {
    ctx.beginPath();
    points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function shape(draw,fill,stroke=ink,lineWidth=2.4) {
    ctx.beginPath();
    draw(ctx);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = stroke;
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }

  const hero = {skin:"#55b9ef", light:"#81dcfa", hat:"#fff3db", shade:"#d9d7eb", scarf:"#963d57", cap:-1};
  const rival = {skin:"#4ca8e7", light:"#76cefa", hat:"#faf4e8", shade:"#c7d2e8", scarf:"#376b7b", cap:1};
  const driver = {skin:"#5bbbe8", light:"#88dcf5", hat:"#fbe5bf", shade:"#d8bfa9", scarf:"#aa7452", cap:1};

  function face(person,emotion,blink) {
    oval(-23,-58,7,9,person.skin,ink);
    oval(-24,-60,3,4,person.light);
    const skin = ctx.createLinearGradient(-18,-80,19,-39);
    skin.addColorStop(0,person.light);
    skin.addColorStop(1,person.skin);
    oval(0,-61,25,23,skin,ink);
    ctx.save();
    ctx.scale(person.cap,1);
    shape(p => {
      p.moveTo(-25,-75); p.bezierCurveTo(-34,-83,-21,-98,-15,-111);
      p.bezierCurveTo(-5,-128,14,-125,26,-115);
      p.bezierCurveTo(36,-109,35,-98,24,-98);
      p.quadraticCurveTo(16,-98,17,-92);
      p.quadraticCurveTo(24,-84,26,-75);
      p.quadraticCurveTo(0,-66,-25,-75);
    },person.hat);
    shape(p => {
      p.moveTo(-24,-77); p.quadraticCurveTo(-14,-79,-3,-76);
      p.quadraticCurveTo(12,-73,25,-77); p.lineTo(27,-73);
      p.quadraticCurveTo(1,-66,-26,-73);
    },person.shade,ink,1.4);
    path([[-15,-99],[-11,-106],[-4,-110]],"#ffffffcc",2.7);
    ctx.restore();
    if (blink) {
      path([[-11,-63],[-4,-63]],ink,2);
      path([[8,-63],[14,-63]],ink,2);
    } else {
      oval(-6,-63,6,8,"#fff",ink);
      oval(10,-63,6,8,"#fff",ink);
      oval(-4,-62,2.5,3.5,ink);
      oval(12,-62,2.5,3.5,ink);
    }
    if (emotion === "cross") {
      path([[-13,-73],[-3,-70]],ink,2.2);
      path([[16,-72],[8,-70]],ink,2.2);
      path([[-2,-46],[3,-48],[8,-46]],ink,2.2);
    } else if (emotion === "wow") {
      oval(3,-46,4.4,4.5,ink);
    } else {
      shape(p => {
        p.moveTo(-3,-49); p.quadraticCurveTo(4,-46,12,-51);
        p.quadraticCurveTo(7,-39,-1,-43);
      },ink,null);
      oval(5,-45,3,1,"#f6a5a2");
    }
    oval(15,-55,8,6.7,person.skin,ink);
    oval(17,-57,2.8,1.6,person.light);
    oval(-12,-52,4,1.6,"#d07ca05c");
  }

  function student(person,x,y,{flip=1,bob=0,run=0,arm=0,emotion="happy",blink=false,tilt=0,scale=1.13}={}) {
    oval(x,y+2,31*scale,5,"#9c6b604d");
    ctx.save();
    ctx.translate(x,y+bob);
    ctx.scale(flip*scale,scale);
    ctx.rotate(tilt);
    const stride = Math.sin(run)*11;
    path([[-9,-22],[-11+stride,-9]],ink,12);
    path([[9,-22],[12-stride,-9]],ink,12);
    path([[-9,-22],[-11+stride,-9]],person.hat,8.5);
    path([[9,-22],[12-stride,-9]],person.hat,8.5);
    oval(-11+stride,-6,12,6,person.hat,ink);
    oval(14-stride,-6,12,6,person.hat,ink);
    oval(-17,-30,13,16,person.scarf,ink);
    oval(0,-29,19,19,person.skin,ink);
    shape(p => {
      p.moveTo(-19,-26); p.quadraticCurveTo(2,-17,18,-27);
      p.quadraticCurveTo(20,-8,2,-10); p.quadraticCurveTo(-16,-8,-19,-26);
    },person.hat);
    const hands = [[[16,-39],[25,-34-arm*.45],[33,-34-arm]],[[-15,-40],[-24,-35],[-28,-34+arm*.29]]];
    hands.forEach(points => {
      path(points,ink,8.7);
      path(points,person.skin,5.7);
      oval(...points.at(-1),6.1,5.3,person.light,ink);
    });
    rect(-12,-43,25,7,3,person.scarf,ink);
    path([[-9,-38],[-13,-30]],person.scarf,4.7);
    face(person,emotion,blink);
    ctx.restore();
  }

  return {ink,rect,oval,path,shape,hero,rival,driver,face,student};
};
