/* Join dated observations for display without rewriting historical source files. */
(() => {
  'use strict';
  const valid = item => item && Number.isFinite(item.index) && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && !item.target;
  function indexHistory(payload = {}, objective = {}) {
    const byDate = new Map();
    for (const item of [...(payload.history || []), payload.current]) {
      if (valid(item)) byDate.set(item.date, { ...item });
    }
    const verified = { index: objective.latest_verified_index, date: objective.latest_verified_date,
      source: objective.latest_verified_source, verified: true };
    if (valid(verified)) byDate.set(verified.date, verified);
    const history = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({ ...item, label: `${item.date.slice(5, 7)}/${item.date.slice(8)}` }));
    return { history, current: history.at(-1) };
  }
  window.SwingwellPerformance = { indexHistory };
})();
