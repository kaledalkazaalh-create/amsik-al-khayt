"use strict";

globalThis.ThreadScoring = (() => {
  const {fields, answers} = ThreadData;
  const items = fields.flatMap(field => field.texts.map((text, i) => ({id: field.id + "-" + i, field: field.id, text})));
  const byId = new Map(items.map(item => [item.id, item]));
  const validRating = value => Number.isInteger(value) && value >= 1 && value <= answers.length;
  function shuffled(list, random) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function order(random = Math.random) {
    const stacks = fields.map(field => shuffled(items.filter(item => item.field === field.id), random));
    const result = [];
    for (let round = 0; round < stacks[0].length; round++) {
      const group = shuffled(stacks.map(stack => stack[round]), random);
      if (group[0].field === byId.get(result.at(-1))?.field) {
        const j = 1 + Math.floor(random() * (group.length - 1));
        [group[0], group[j]] = [group[j], group[0]];
      }
      result.push(...group.map(item => item.id));
    }
    return result;
  }
  function validOrder(ids) {
    return Array.isArray(ids) && ids.length === items.length && new Set(ids).size === items.length &&
      ids.every(id => byId.has(id));
  }
  function score(responses) {
    if (!responses || !items.every(item => validRating(responses[item.id]))) {
      throw new TypeError("All 21 activities require a response from 1 to 5");
    }
    const scores = fields.map((field, index) => {
      const rated = items.filter(item => item.field === field.id).map(item => ({...item, value: responses[item.id]}));
      const total = rated.reduce((sum, item) => sum + item.value, 0);
      const favorites = rated.filter(item => item.value === 5).length;
      const reasons = rated.filter(item => item.value >= 4).sort((a,b) => b.value - a.value).slice(0,2);
      return {...field, index, total, average: total / rated.length, favorites, reasons};
    });
    const ranking = [...scores].sort((a,b) => b.total - a.total || b.favorites - a.favorites || a.index - b.index);
    const [first, second, third] = ranking;
    const uniform = first.total === ranking.at(-1).total;
    const status = first.average <= 3 ? "unclear" :
      first.total - second.total <= 1 || second.total === third.total ? "close" : null;
    const suggestions = uniform ? ["analytics","content"].map(id => scores.find(field => field.id === id)) : [first, second];
    return {scores, suggestions, status};
  }
  return {items, byId, order, validOrder, validRating, score};
})();

