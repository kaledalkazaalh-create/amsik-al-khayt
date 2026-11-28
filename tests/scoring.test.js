"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
require("../data.js");
require("../scoring.js");
const {fields,checks}=ThreadData;
const {items,byId,validOrder,order,score}=ThreadScoring;
const ratings=fn=>Object.fromEntries(items.map(item=>[item.id,fn(item)]));

assert.equal(fields.length,7);
assert.equal(items.length,30);
assert.equal(fields.reduce((sum,field)=>sum+field.activities.length,0),28);
assert.ok(fields.every(field=>field.activities.length===4 && field.jobs.length>=5 && field.jobs.length<=10 && field.skills.length===4));
for (const field of fields) {
  const report=score(ratings(item=>item.field===field.id&&!item.checkOf?5:2));
  assert.equal(report.suggestions[0].id,field.id);
  assert.equal(report.suggestions[0].average,5);
  assert.equal(report.suggestions[0].reasons.length,2);
  assert.equal(report.status,null);
}
assert.equal(score(ratings(()=>3)).status,"unclear");
const tied=score(ratings(()=>4));
assert.equal(tied.status,"close");
assert.deepEqual(tied.suggestions.map(field=>field.id),[fields[0].id,fields[1].id]);
const clear=score(ratings(item=>item.field==="analytics"&&!item.checkOf?5:2));
assert.equal(clear.suggestions[0].total,20);
assert.equal(clear.suggestions[1].total,8);
assert.equal(clear.status,null);
assert.deepEqual(clear.suggestions.map(field=>field.id),["analytics","search"]);
const gap=score(ratings(item=>{
  const pattern={"analytics-0":5,"analytics-1":4,"analytics-2":3,"analytics-3":3,"search-0":2,"search-1":2,"search-2":1,"search-3":1};
  return pattern[item.id]??1;
}));
assert.equal(gap.suggestions[0].total,15);
assert.equal(gap.suggestions[1].total,6);
assert.equal(gap.status,null);
const inconsistent=score(ratings(item=>item.checkOf?5:item.id==="analytics-0"?2:4));
assert.equal(inconsistent.inconsistent,true);
const consistent=score(ratings(item=>item.checkOf?3:5));
assert.equal(consistent.inconsistent,false);
for(const check of checks) assert.equal(check.text,byId.get(check.checkOf).text);
assert.throws(()=>score({}),TypeError);
assert.throws(()=>score(ratings(item=>item.id===items[0].id?6:3)),TypeError);

for (let trial=0;trial<100;trial++) {
  const ids=order();
  assert.ok(validOrder(ids));
  const categories=ids.slice(0,28).map(id=>byId.get(id).field);
  assert.ok(categories.every((field,i)=>!i||field!==categories[i-1]));
  for(let i=0;i<28;i+=7) assert.equal(new Set(categories.slice(i,i+7)).size,7);
  assert.deepEqual(ids.slice(-2),checks.map(item=>item.id));
}

const luminance=color=>color.slice(1).match(/../g).map(hex=>parseInt(hex,16)/255)
  .map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4)
  .reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);return(values[0]+.05)/(values[1]+.05)};
for(const {name,color,tint} of fields) {
  for(const background of [tint,"#ffffff","#f0e5d1","#f3f2f0"])
    assert.ok(contrast(color,background)>=4.5,`${name} contrast against ${background}`);
}
for(const page of ["index.html","play.html","print.html"]) {
  const html=fs.readFileSync(path.join(__dirname,"..",page),"utf8");
  assert.match(html,/lang="ar"\s+dir="rtl"/);
  assert.match(html,/<link rel="icon" href="data:,">/);
  assert.doesNotMatch(html,/سنافر|السنافر|RIASEC|ICR/);
}
const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8");
assert.match(app,/canvas\.width\s*=\s*1080/);
assert.match(app,/canvas\.height\s*=\s*1920/);
console.log("PASS: 30 items, seven fields, four scored tasks each, 2 consistency checks, ranking/status, balanced order and contrast.");
console.log(fields.map(({id,color,tint})=>`${id}=${contrast(color,tint).toFixed(2)}`).join(", "));
