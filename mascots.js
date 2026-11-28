"use strict";

globalThis.ThreadMascots = ctx => {
  const ink = "#2b211b";
  function rect(x,y,w,h,r,color,line=ink) {
    ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fillStyle=color; ctx.fill();
    if (line) { ctx.strokeStyle=line; ctx.lineWidth=3; ctx.stroke(); }
  }
  function oval(x,y,rx,ry,color,line=ink) {
    ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fillStyle=color; ctx.fill();
    if (line) { ctx.strokeStyle=line; ctx.lineWidth=3; ctx.stroke(); }
  }
  function path(points,color,lineWidth=3) {
    ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.strokeStyle=color; ctx.lineWidth=lineWidth; ctx.lineJoin="round"; ctx.lineCap="round"; ctx.stroke();
  }
  function shape(draw,fill,stroke=ink,lineWidth=2.4) {
    ctx.beginPath(); draw(ctx); ctx.closePath(); ctx.fillStyle=fill; ctx.fill();
    if (stroke) { ctx.lineWidth=lineWidth; ctx.strokeStyle=stroke; ctx.lineJoin="round"; ctx.stroke(); }
  }
  const hero={skin:"#287fb8",light:"#f8fbfc",hat:"#fffdf7",shade:"#17567f",scarf:"#fffdf7",cap:1};
  const rival={skin:"#3a91c7",light:"#ffffff",hat:"#f8fbfc",shade:"#1d668f",scarf:"#ffffff",cap:-1};
  const driver={skin:"#246f9e",light:"#f5fbff",hat:"#fffdf7",shade:"#194c70",scarf:"#ffffff",cap:1};

  function face(person,emotion="happy",blink=false) {
    oval(0,-61,25,23,person.skin,ink);
    oval(-5,-64,4,5,person.hat,ink,1.2); oval(9,-64,4,5,person.hat,ink,1.2);
    if (blink) { path([[-9,-63],[-2,-63]],ink,2); path([[6,-63],[13,-63]],ink,2); }
    else { oval(-5,-63,2,3,ink,null); oval(9,-63,2,3,ink,null); }
    if (emotion==="cross") { path([[-12,-73],[-3,-70]],ink,2.2); path([[14,-72],[7,-70]],ink,2.2); path([[-1,-47],[4,-44],[9,-47]],ink,2.2); }
    else if (emotion==="wow") oval(4,-47,4,4,ink,null);
    else path([[-4,-49],[2,-44],[10,-49]],ink,2.1);
    oval(16,-55,7,5,person.light,null);
    oval(-14,-53,5,2,"#d59477",null);
  }

  function student(person,x,y,{flip=1,bob=0,run=0,arm=0,emotion="happy",blink=false,tilt=0,scale=1.13}={}) {
    oval(x,y+2,31*scale,5,"#9c6b604d",null);
    ctx.save(); ctx.translate(x,y+bob); ctx.scale(flip*scale,scale); ctx.rotate(tilt);
    const stride=Math.sin(run)*11;
    path([[-9,-22],[-11+stride,-9]],ink,12); path([[9,-22],[12-stride,-9]],ink,12);
    path([[-9,-22],[-11+stride,-9]],person.hat,7); path([[9,-22],[12-stride,-9]],person.hat,7);
    oval(-11+stride,-6,12,6,person.hat,ink); oval(14-stride,-6,12,6,person.hat,ink);
    oval(-17,-30,12,12,person.scarf,ink);
    oval(0,-29,19,19,person.skin,ink);
    // Woven cross-lines make each character read as a small ball of thread.
    path([[-13,-35],[13,-23]],person.light,2); path([[-13,-25],[12,-35]],person.light,2);
    path([[-16,-40],[-25,-35-arm*.45],[-32,-35-arm]],ink,8);
    path([[-16,-40],[-25,-35-arm*.45],[-32,-35-arm]],person.skin,5.3);
    oval(-32,-35-arm,5,5,person.light,null);
    path([[16,-40],[25,-35],[32,-35+arm*.29]],ink,8);
    path([[16,-40],[25,-35],[32,-35+arm*.29]],person.skin,5.3);
    oval(32,-35+arm*.29,5,5,person.light,null);
    face(person,emotion,blink);
    ctx.restore();
  }

  return {ink,rect,oval,path,shape,hero,rival,driver,face,student};
};
