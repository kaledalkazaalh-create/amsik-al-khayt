"use strict";

globalThis.GameScoring = (() => {
  const {types, items, tracks, settings, answers} = GameData;
  const byId = new Map(items.map(item => [item.id, item]));
  const lower = items.length / types.length;
  const upper = lower * answers.length;

  function shuffle(values, random) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function makeOrder(random = Math.random) {
    const stacks = types.map(({key}) => shuffle(items.filter(item => item.type === key), random));
    const order = [];
    let lastType;
    for (let round = 0; round < lower; round++) {
      const group = shuffle(stacks.map(stack => stack[round]), random);
      if (group[0].type === lastType) {
        const swap = 1 + Math.floor(random() * (group.length - 1));
        [group[0], group[swap]] = [group[swap], group[0]];
      }
      order.push(...group.map(item => item.id));
      lastType = group.at(-1).type;
    }
    return order;
  }

  function validOrder(order) {
    return Array.isArray(order) && order.length === items.length &&
      new Set(order).size === items.length && order.every(id => byId.has(id));
  }

  function validResponse(response) {
    return Number.isInteger(response) && response >= 1 && response <= answers.length;
  }

  function scoreProfile(responses) {
    if (!responses || !items.every(item => validResponse(responses[item.id]))) {
      throw new TypeError("A complete profile is required");
    }
    const profile = types.map((type, index) => ({...type, index, total: 0, favorites: 0}));
    const profileByKey = new Map(profile.map(type => [type.key, type]));
    for (const item of items) {
      const response = responses[item.id];
      const type = profileByKey.get(item.type);
      type.total += response;
      type.favorites += Number(response === answers.length);
    }
    const sorted = [...profile].sort((a, b) => b.total - a.total || b.favorites - a.favorites || a.index - b.index);
    const top = sorted.slice(0, 3);
    const highest = sorted[0].total;
    const spread = highest - sorted.at(-1).total;
    const tied = top.some((type, index) => sorted[index + 1].total === type.total);
    const ranking = tracks.map((track, index) => {
      const values = track.codes.map(code => {
        let total = 0;
        let weightSum = 0;
        [...code].forEach((key, position) => {
          const weight = settings.weights[position];
          total += weight * (profileByKey.get(key).total - lower);
          weightSum += weight;
        });
        return 100 * total / (weightSum * (upper - lower));
      });
      const match = values.reduce((sum, value) => sum + value, 0) / values.length;
      return {...track, index, match, percent: Math.round(match)};
    }).sort((a, b) => b.match - a.match || a.index - b.index);
    const hasOverlap = ranking[0].match > 0;
    const reason = highest <= settings.lowTop ? "low" :
      spread <= settings.flatSpread ? "broad" :
      !hasOverlap ? "limited" : null;
    const suggestions = spread === 0 || !hasOverlap
      ? settings.flatExamples.map(id => ranking.find(track => track.id === id))
      : ranking.slice(0, 2);
    return {profile, top, code: top.map(type => type.key).join(""), tied, reason, ranking, suggestions, close: ranking[0].percent === ranking[1].percent};
  }

  return {makeOrder, validOrder, validResponse, scoreProfile, lower, upper};
})();

