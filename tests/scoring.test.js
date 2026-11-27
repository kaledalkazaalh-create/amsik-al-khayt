"use strict";
const assert = require("node:assert/strict");
require("../data.js");
require("../scoring.js");
const {fields} = ThreadData;
const {items, byId, validOrder, order, score} = ThreadScoring;
const ratings = (fn) => Object.fromEntries(items.map(item => [item.id,fn(item)]));

assert.equal(items.length,21);
for (const field of fields) {
  const result = score(ratings(item => item.field === field.id ? 5 : 2));
  assert.equal(result.suggestions[0].id,field.id);
  assert.equal(result.suggestions[0].average,5);
  assert.equal(result.suggestions[0].reasons.length,2);
}
assert.equal(score(ratings(() => 3)).status,"unclear");
assert.equal(score(ratings(() => 4)).status,"close");
assert.deepEqual(score(ratings(() => 4)).suggestions.map(field => field.id),["analytics","content"]);
const tie = score(ratings(item => {
  const field = {analytics:[4,4,4],search:[5,4,3],content:[4,4,4]}[item.field];
  return field?.[Number(item.id.at(-1))] ?? 1;
}));
assert.deepEqual(tie.suggestions.map(field => field.id),["search","analytics"]);
assert.equal(tie.status,"close");
assert.throws(() => score({}), TypeError);
assert.throws(() => score(ratings(item => item.id === items[0].id ? 6 : 3)),TypeError);
for (let trial=0;trial<100;trial++) {
  const ids = order();
  assert.ok(validOrder(ids));
  const categories = ids.map(id => byId.get(id).field);
  assert.ok(categories.every((field,i) => !i || field !== categories[i-1]));
  for (let i=0;i<categories.length;i+=fields.length) {
    assert.equal(new Set(categories.slice(i,i+fields.length)).size,fields.length);
  }
}
const luminance = color => color.slice(1).match(/../g).map(hex => parseInt(hex,16)/255)
  .map(x => x <= .04045 ? x/12.92 : ((x+.055)/1.055)**2.4)
  .reduce((sum,x,i) => sum + x*[.2126,.7152,.0722][i],0);
const contrast = (a,b) => {
  const values = [luminance(a),luminance(b)].sort((x,y) => y-x);
  return (values[0]+.05)/(values[1]+.05);
};
for (const {name,color,tint} of fields) {
  for (const background of [tint,"#ffffff","#f0e5d1","#f3f2f0"]) {
    assert.ok(contrast(color,background) >= 4.5,name + " contrast");
  }
}
console.log("PASS: 21 items, pure fields, unclear/close profiles, ties, invalid ratings, balanced ordering and contrast.");
console.log(fields.map(({id,color,tint}) => id + "=" + contrast(color,tint).toFixed(2)).join(", "));

