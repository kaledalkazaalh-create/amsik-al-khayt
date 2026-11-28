"use strict";

(() => {
  const canvas=document.querySelector("#campus-canvas");
  if(!canvas) return;
  const ctx=canvas.getContext("2d");
  if(!ctx) return;
  const toggle=document.querySelector(".show-toggle");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const {ink,rect,oval,path,shape,hero,rival,driver,student}=ThreadMascots(ctx);
  const width=canvas.width,height=canvas.height,ratio=Math.max(1.5,Math.min(devicePixelRatio,2));
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  ctx.setTransform(ratio,0,0,ratio,0,0);
  const duration=22,still=8.2;
  let time=reduced.matches?still:0,lastTime,request,playing=false;

  const clamp=v=>Math.max(0,Math.min(1,v));
  const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
  const mix=(a,b,t)=>a+(b-a)*t;

  function background(t) {
    const storm=clamp((t-12.4)/1.7)*(1-clamp((t-20.1)/1.5));
    const sky=ctx.createLinearGradient(0,0,0,height);
    sky.addColorStop(0,storm?"#222e43":"#3a2440");
    sky.addColorStop(.72,storm?"#596170":"#8b5361");
    sky.addColorStop(1,"#241b26");
    rect(0,0,width,height,0,sky,null);
    oval(653,67,30,30,storm?"#bdc5d0":"#f7dcaa",null);
    shape(p=>{p.moveTo(0,260);p.quadraticCurveTo(96,215,191,251);p.quadraticCurveTo(320,218,424,252);p.lineTo(424,350);p.lineTo(0,350);p.closePath();},"#493342",null);
    shape(p=>{p.moveTo(0,328);p.lineTo(760,328);p.lineTo(760,420);p.lineTo(0,420);p.closePath();},"#261d28",null);
    for(let i=0;i<8;i++){
      const x=i*101+13,h=42+(i*29)%82;
      rect(x,328-h,52,h,2,i%2?"#382b39":"#41303c",null);
      for(let r=0;r<3;r++)for(let c=0;c<2;c++){
        rect(x+9+c*19,338-h+r*20,7,8,1,"#f3d093"+"38",null);
      }
    }
    path([[0,348],[760,348]],"#ce9c75",2);
    rect(0,351,760,69,0,"#322732",null);
    for(let x=20;x<760;x+=96)path([[x,393],[x+38,393]],"#9e7568",2.5);
    if(storm>.05){ctx.fillStyle=`rgba(16,25,42,${storm*.28})`;ctx.fillRect(0,0,width,height);}
  }

  function fakeQr() {
    rect(464,123,252,218,9,"#eee8df","#fff9eb");
    rect(478,137,224,188,2,"#fff","#cbbba8");
    const n=17,cell=8.3,startX=503,startY=148;
    function finder(x,y){
      rect(startX+x*cell,startY+y*cell,7*cell,7*cell,1,"#120f08",null);
      rect(startX+(x+1)*cell,startY+(y+1)*cell,5*cell,5*cell,1,"#fff",null);
      rect(startX+(x+2)*cell,startY+(y+2)*cell,3*cell,3*cell,1,"#120f08",null);
    }
    for(let r=0;r<n;r++)for(let c=0;c<n;c++){
      const inFinder=(c<7&&r<7)||(c>=n-7&&r<7)||(c<7&&r>=n-7);
      if(!inFinder&&((r*13+c*7+r*c)%5<2))rect(startX+c*cell,startY+r*cell,cell,cell,0,"#120f08",null);
    }
    finder(0,0);finder(n-7,0);finder(0,n-7);
    rect(690,145,4,162,2,"#d3c4b3",null);
  }

  function rope(x,y,alpha=1){
    ctx.save();ctx.globalAlpha=alpha;
    path([[x,0],[x,y-60]],"#eadbc4",2.8);
    path([[x-4,0],[x-4,y-60]],"#29313c",1);
    ctx.restore();
  }

  function rifle(x,y,angle=0,flash=0){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);
    rect(-23,-4,31,9,2,"#3d4447",ink);
    rect(5,-2,20,4,1,"#abb4b5",ink);
    rect(-28,-3,8,7,2,"#745d46",ink);
    rect(-8,3,7,11,1,"#3b4141",ink);
    rect(-1,-7,5,4,1,"#59605c",ink);
    if(flash>0){ctx.save();ctx.globalAlpha=flash;shape(p=>{p.moveTo(25,0);p.lineTo(40,-7);p.lineTo(35,0);p.lineTo(40,7);p.closePath();},"#ffe8a2",null);ctx.restore();}
    ctx.restore();
  }

  function rappel(x,y,phase,person,gunAngle=0){
    const drop=ease(phase);
    const py=mix(-86,y,drop);
    if(drop<.98)rope(x,py,.95);
    student(person,x,py,{scale:.77,arm:18,bob:Math.sin(phase*Math.PI*2)*5,tilt:drop<.94?-.13:0,run:phase*7,masked:true,tactical:true});
    rifle(x+24,py-43,gunAngle);
  }

  function rain(t){
    const amount=clamp((t-12.5)/1.4)*(1-clamp((t-20.3)/1.2));
    if(!amount)return;
    const frame=Math.floor(t*60);
    ctx.save();ctx.globalAlpha=.78*amount;ctx.strokeStyle="#c8d9e7";ctx.lineWidth=1.45;ctx.lineCap="round";
    for(let i=0;i<55;i++){
      const x=(i*71+frame*9)%790-15;
      const y=(i*43+frame*23)%440-18;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-6,y+18);ctx.stroke();
    }
    ctx.restore();
    if(t>16.1&&t<16.3){ctx.fillStyle="rgba(232,240,250,.22)";ctx.fillRect(0,0,width,height);}
  }

  function sceneCaption(text,alpha=1){
    ctx.save();ctx.globalAlpha=alpha;
    rect(20,18,292,40,14,"#271c2edc","#d8b797");
    ctx.direction="rtl";ctx.textAlign="right";ctx.font="bold 19px 'IBM Plex Sans Arabic',Tahoma,sans-serif";
    ctx.fillStyle="#fff2da";ctx.fillText(text,294,45);
    ctx.restore();
  }

  function frame(t){
    background(t);
    fakeQr();
    const targets=[{x:180,y:270,p:0,person:hero},{x:292,y:282,p:.36,person:rival},{x:399,y:270,p:.72,person:driver}];
    if(t<4){
      sceneCaption("وصول الفريق بالحبال",1-clamp((t-3.2)/.8));
      targets.forEach(member=>rappel(member.x,member.y,(t-member.p*1.1)/2.6,member.person));
    }else{
      const walk=ease((t-4)/6.5);
      sceneCaption(t<11?"تقدّم بهدوء نحو الرمز":"الفريق يطلب الإسناد",t<11?1:.92);
      const xs=targets.map((member,i)=>mix(member.x,[550,628,690][i],walk));
      const hit=ease((t-11.05)/.5);
      const fall=ease((t-11.6)/1.05);
      const kneel=ease((t-12.7)/1.05);
      const run=t<11?mix(0,(t-4)*9,walk):0;
      const injuredX=xs[1],injuredY=targets[1].y;
      if(t<11.6){
        targets.forEach((member,i)=>{
          const cautious=Math.sin(t*4+i)*2;
          student(member.person,xs[i],member.y,{scale:.77,arm:i===1?21:17,bob:cautious,run,flip:1,masked:true,tactical:true});
          rifle(xs[i]+20,member.y-43,.03);
        });
      }else{
        const fallX=injuredX+fall*21;
        const fallY=injuredY+fall*12;
        student(targets[1].person,fallX,fallY,{scale:.77,arm:-13,bob:fall*10,run:0,flip:1,tilt:fall*1.16,emotion:t>12.3?"sad":"wow",masked:true,tactical:true});
        rifle(fallX+18,fallY-35,fall*1.1);
        [0,2].forEach(i=>{
          const person=targets[i].person;
          const x=xs[i]+(i===0?18:-18);
          const reach=kneel*20;
          student(person,x,targets[i].y+reach,{scale:.77,arm:mix(17,-28,kneel),bob:-kneel*3,run:0,flip:i===0?1:-1,tilt:i===0?kneel*.2:-kneel*.18,emotion:t>12.3?"sad":"wow",masked:true,tactical:true});
          if(kneel<.55)rifle(x+16,targets[i].y-41,.05);
        });
        if(t>11.05&&t<11.68){
          const flash=1-clamp((t-11.05)/.63);
          ctx.save();ctx.globalAlpha=flash;
          path([[735,183],[injuredX+12,injuredY-57]],"#f8dfa2",3);
          oval(injuredX+12,injuredY-57,19*flash,19*flash,"#fff0ad","#ffca75");
          ctx.restore();
        }
        if(t>13.2){
          ctx.save();ctx.globalAlpha=clamp((t-13.2)/.55)*.8;
          ctx.direction="rtl";ctx.textAlign="center";ctx.font="bold 18px 'IBM Plex Sans Arabic',Tahoma,sans-serif";
          ctx.fillStyle="#f1d9c4";ctx.fillText("لحظة صمت تحت المطر",380,391);ctx.restore();
        }
      }
    }
    rain(t);
    const fade=clamp((t-21)/1);
    if(fade){ctx.fillStyle=`rgba(28,20,30,${fade})`;ctx.fillRect(0,0,width,height);}
  }

  function tick(now){
    if(lastTime!==undefined)time=(time+Math.min((now-lastTime)/1000,.08))%duration;
    lastTime=now;frame(time);request=requestAnimationFrame(tick);
  }
  function setPlaying(active){
    if(active===playing)return;
    playing=active;lastTime=undefined;
    if(active)request=requestAnimationFrame(tick);else cancelAnimationFrame(request);
    toggle.textContent=active?"أوقف الحركة":"شغّل الحركة";
    toggle.setAttribute("aria-label",toggle.textContent+" في مشهد الفريق");
  }
  toggle.hidden=false;
  toggle.addEventListener("click",()=>setPlaying(!playing));
  reduced.addEventListener("change",event=>{
    if(event.matches){setPlaying(false);time=still;frame(time);}
    else setPlaying(true);
  });
  canvas.setAttribute("aria-label","مشهد كرتوني متكرر لفريق أزرق وأبيض ينزل بالحبال إلى رمز تجريبي، ثم يسقط أحدهم في مشهد درامي تحت المطر من دون مشاهد دموية. رمز المسح الفعلي بجانبه واضح.");
  frame(time);
  setPlaying(!reduced.matches);
})();
