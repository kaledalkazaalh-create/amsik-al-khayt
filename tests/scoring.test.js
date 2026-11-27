"use strict";

if (typeof require === "function") {
  require("../data.js");
  require("../scoring.js");
}

(() => {
  const {items, types} = GameData;
  const {makeOrder, validOrder, scoreProfile} = GameScoring;
  const byId = new Map(items.map(item => [item.id, item]));
  const responses = rate => Object.fromEntries(items.map(item => [item.id, rate(item)]));
  let checks = 0;
  function assert(condition, message) {
    if (!condition) throw new Error(message);
    checks++;
  }

  const expected = {R:null, I:"ux", A:"content", S:"community", E:"strategy", C:"analytics"};
  types.forEach(({key}) => {
    const result = scoreProfile(responses(item => item.type === key ? 5 : 1));
    assert(result.code[0] === key, `Pure ${key} leads the interest code`);
    assert(result.profile.find(type => type.key === key).total === 25, "Maximum is 25");
    assert(result.profile.filter(type => type.key !== key).every(type => type.total === 5), "Minimum is 5");
    if (expected[key]) assert(result.ranking[0].id === expected[key], `Expected pure ${key} track`);
    else assert(result.reason === "limited" && result.ranking.every(track => track.match === 0), "Unmapped pure interest");
    if (key === "C") assert(result.close && result.ranking[1].id === "strategy", "Equal leading tracks remain close");
  });

  for (const [rating, reason] of [[1, "low"], [3, "low"], [4, "broad"], [5, "broad"]]) {
    const flat = scoreProfile(responses(() => rating));
    assert(flat.reason === reason && flat.tied, "Flat profiles are cautious");
    assert(flat.suggestions.map(track => track.id).join() === "content,analytics", "Flat suggestions offer contrasting trials");
    assert(flat.ranking.every(track => track.percent === (rating - 1) * 25), "Flat match normalizes consistently");
  }

  const equal = scoreProfile(responses(item => {
    if (item.type === "I") return 4;
    if (item.type === "A") return item.id.endsWith("1") ? 5 : item.id.endsWith("2") ? 3 : 4;
    return 3;
  }));
  assert(equal.code.startsWith("AI") && equal.tied, "Number of top responses breaks an equal sum");
  const worked = scoreProfile(responses(item => {
    const ratings = {I:[5,5,5,4,4], C:[5,4,4,4,4], E:[5,3,3,3,3]};
    return ratings[item.type]?.[Number(item.id.at(-1))-1] ?? 2;
  }));
  assert(worked.ranking.find(track => track.id === "analytics").percent === 79, "Worked example rounds to 79 percent");
  assert(worked.ranking.find(track => track.id === "search").percent === 72, "Rank-weighted three-letter code");
  assert(!worked.reason, "Differentiated profile shows track percentages");

  for (let trial = 0; trial < 100; trial++) {
    const order = makeOrder();
    assert(validOrder(order), "Order includes each activity once");
    for (let i = 0; i < order.length; i += types.length) {
      const round = order.slice(i, i + types.length).map(id => byId.get(id).type);
      assert(new Set(round).size === types.length, "Each block includes every type");
      if (i) assert(round[0] !== byId.get(order[i-1]).type, "No repeat at block boundary");
    }
  }
  try {
    scoreProfile({});
    throw new Error("Incomplete profile was accepted");
  } catch (error) {
    assert(error instanceof TypeError, "Incomplete profile is rejected");
  }

  console.log(`Scoring checks passed: ${checks}`);
})();

