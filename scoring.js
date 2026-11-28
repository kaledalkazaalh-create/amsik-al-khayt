"use strict";

globalThis.ThreadScoring = (() => {
  const {fields, answers, checks} = ThreadData;
  const activities = fields.flatMap(field => field.activities.map((activity, i) => ({...activity, id:`${field.id}-${i}`, field:field.id})));
  const items = [...activities, ...checks];
  const byId = new Map(items.map(item => [item.id,item]));
  const validRating = value => Number.isInteger(value) && value >= 1 && value <= answers.length;

  function shuffled(list, random) {
    const copy = [...list];
    for (let i=copy.length-1;i>0;i--) {
      const j = Math.floor(random()*(i+1));
      [copy[i],copy[j]] = [copy[j],copy[i]];
    }
    return copy;
  }

  function order(random=Math.random) {
    const result = [];
    let previous = null;
    for (let round=0;round<4;round++) {
      let group;
      do { group = shuffled(fields.map(field => field.id),random); }
      while (group[0] === previous || (round === 3 && group.at(-1) === checks[0].field));
      result.push(...group.map(field => `${field}-${round}`));
      previous = group.at(-1);
    }
    return [...result,...checks.map(item => item.id)];
  }

  function validOrder(ids) {
    return Array.isArray(ids) && ids.length === items.length && new Set(ids).size === items.length &&
      ids.every(id => byId.has(id)) && ids.slice(0,28).every((id,i) => !i || byId.get(id).field !== byId.get(ids[i-1]).field) &&
      checks.every((item,i) => ids[28+i] === item.id);
  }

  function score(responses) {
    if (!responses || !items.every(item => validRating(responses[item.id]))) {
      throw new TypeError("All activities require a response from 1 to 5");
    }
    const scores = fields.map((field,index) => {
      const rated = activities.filter(item => item.field === field.id)
        .map(item => ({...item,value:responses[item.id]}));
      const total = rated.reduce((sum,item) => sum+item.value,0);
      const favorites = rated.filter(item => item.value === 5).length;
      const reasons = rated.filter(item => item.value >= 4).sort((a,b) => b.value-a.value).slice(0,2);
      return {...field,index,total,average:total/rated.length,favorites,reasons};
    });
    const ranking = [...scores].sort((a,b) => b.total-a.total || b.favorites-a.favorites || a.index-b.index);
    const [first,second] = ranking;
    const status = first.average <= 3 ? "unclear" : first.total-second.total <= 1 ? "close" : null;
    const inconsistent = checks.some(item => Math.abs(responses[item.id]-responses[item.checkOf]) > 2);
    return {scores,suggestions:[first,second],status,inconsistent};
  }

  return {items,activities,byId,order,validOrder,validRating,score};
})();
