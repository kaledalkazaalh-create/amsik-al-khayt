"use strict";

globalThis.ThreadMascots = ctx => {
  const ink="#183954";
  function rect(x,y,w,h,r,color,line=ink) {
    ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fillStyle=color; ctx.fill();
    if(line){ctx.strokeStyle=line;ctx.lineWidth=3;ctx.stroke();}
  }
  function oval(x,y,rx,ry,color,line=ink) {
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
    if(line){ctx.strokeStyle=line;ctx.lineWidth=3;ctx.stroke();}
  }
  function path(points,color,lineWidth=3) {
    ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.lineJoin="round";ctx.lineCap="round";ctx.stroke();
  }
  function shape(draw,fill,stroke=ink,lineWidth=2.4) {
    ctx.beginPath();draw(ctx);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
    if(stroke){ctx.lineWidth=lineWidth;ctx.strokeStyle=stroke;ctx.lineJoin="round";ctx.stroke();}
  }

  const hero={skin:"#168bdb",light:"#74c9ff",hat:"#fffdf8",shade:"#dce8ef",vest:"#53614d"};
  const rival={skin:"#1596e7",light:"#87d2ff",hat:"#fffdf8",shade:"#d8e3e8",vest:"#494f49"};
  const driver={skin:"#087ac4",light:"#67bded",hat:"#fffdf8",shade:"#dce8ef",vest:"#64584b"};

  function face(person,emotion="happy",blink=false,masked=false) {
    oval(-23,-58,7,9,person.skin,ink);
    oval(-24,-60,3,4,person.light,null);
    const skin=ctx.createLinearGradient(-18,-80,19,-39);
    skin.addColorStop(0,person.light);skin.addColorStop(1,person.skin);
    oval(0,-61,25,23,skin,ink);

    // The familiar white, pointed cap and round blue face keep the cast recognizable.
    ctx.save();ctx.scale(person.cap??1,1);
    shape(p=>{
      p.moveTo(-25,-75);p.bezierCurveTo(-34,-83,-21,-98,-15,-111);
      p.bezierCurveTo(-5,-128,14,-125,26,-115);p.bezierCurveTo(36,-109,35,-98,24,-98);
      p.quadraticCurveTo(16,-98,17,-92);p.quadraticCurveTo(24,-84,26,-75);
      p.quadraticCurveTo(0,-66,-25,-75);
    },person.hat);
    shape(p=>{p.moveTo(-24,-77);p.quadraticCurveTo(-14,-79,-3,-76);p.quadraticCurveTo(12,-73,25,-77);p.lineTo(27,-73);p.quadraticCurveTo(1,-66,-26,-73);},person.shade,ink,1.4);
    path([[-15,-99],[-11,-106],[-4,-110]],"#ffffffcc",2.7);
    ctx.restore();

    if(blink){path([[-11,-63],[-4,-63]],ink,2);path([[8,-63],[14,-63]],ink,2);}
    else {oval(-6,-63,6,8,"#fff",ink);oval(10,-63,6,8,"#fff",ink);oval(-4,-62,2.5,3.5,ink,null);oval(12,-62,2.5,3.5,ink,null);}
    oval(15,-55,8,6.7,person.skin,ink);
    oval(17,-57,2.8,1.6,person.light,null);
    if(masked){
      shape(p=>{p.moveTo(-19,-54);p.quadraticCurveTo(1,-59,20,-52);p.lineTo(17,-42);p.quadraticCurveTo(0,-36,-17,-43);p.closePath();},"#283544");
      path([[-12,-47],[11,-46]],"#7c8791",1.8);
      if(emotion==="sad"){
        path([[-13,-70],[-5,-73]],ink,2.1);path([[7,-73],[15,-70]],ink,2.1);
        oval(-10,-56,2,4,"#a9e8ff",null);oval(13,-56,2,4,"#a9e8ff",null);
      }
    }else if(emotion==="cross"){
      path([[-13,-73],[-3,-70]],ink,2.2);path([[16,-72],[8,-70]],ink,2.2);path([[-2,-46],[3,-48],[8,-46]],ink,2.2);
    }else if(emotion==="wow") oval(3,-46,4.4,4.5,ink,null);
    else {shape(p=>{p.moveTo(-3,-49);p.quadraticCurveTo(4,-46,12,-51);p.quadraticCurveTo(7,-39,-1,-43);},ink,null);oval(5,-45,3,1,"#f6a5a2",null);}
    oval(-12,-52,4,1.6,"#d07ca05c",null);
  }

  function student(person,x,y,{flip=1,bob=0,run=0,arm=0,emotion="happy",blink=false,tilt=0,scale=1.13,masked=false,tactical=false}={}) {
    oval(x,y+2,31*scale,5,"#9c6b604d",null);
    ctx.save();ctx.translate(x,y+bob);ctx.scale(flip*scale,scale);ctx.rotate(tilt);
    const stride=Math.sin(run)*11;
    path([[-9,-22],[-11+stride,-9]],ink,12);path([[9,-22],[12-stride,-9]],ink,12);
    path([[-9,-22],[-11+stride,-9]],person.hat,8.5);path([[9,-22],[12-stride,-9]],person.hat,8.5);
    oval(-11+stride,-6,12,6,person.hat,ink);oval(14-stride,-6,12,6,person.hat,ink);

    oval(0,-29,19,19,person.skin,ink);
    shape(p=>{p.moveTo(-18,-31);p.quadraticCurveTo(0,-36,18,-30);p.lineTo(17,-20);p.quadraticCurveTo(0,-14,-17,-21);p.closePath();},person.hat);
    path([[-18,-28],[-14,-22],[14,-22],[18,-28]],person.shade,1.7);
    if(tactical){
      shape(p=>{p.moveTo(-15,-40);p.lineTo(15,-40);p.lineTo(18,-20);p.lineTo(-18,-20);p.closePath();},person.vest);
      path([[-11,-38],[-2,-24],[4,-38],[14,-24]],"#d2b77e",2.4);
      rect(-15,-34,7,8,2,"#343c37",ink);
      rect(7,-34,7,8,2,"#343c37",ink);
    }
    const hands=[[[16,-39],[25,-34-arm*.45],[33,-34-arm]],[[-15,-40],[-24,-35],[-28,-34+arm*.29]]];
    hands.forEach(points=>{path(points,ink,8.7);path(points,person.skin,5.7);oval(...points.at(-1),6.1,5.3,person.light,ink);});
    face(person,emotion,blink,masked);
    ctx.restore();
  }

  return {ink,rect,oval,path,shape,hero,rival,driver,face,student};
};
