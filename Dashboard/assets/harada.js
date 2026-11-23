/* SWINGWELL strategic layer. Native DOM + JSON; no build or runtime dependencies. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const positions = [0, 1, 2, 3, 5, 6, 7, 8];
  const priorities = { unassigned: 'Not assigned', active: 'Active focus', development: 'Development', maintenance: 'Maintenance' };
  const pillarFocus = { active: 'Active', development: 'Development', maintenance: 'Maintenance', future: 'Future' };
  let matrix, evidence, plan;
  const commitments = new Map();
  const el = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  const dateLabel = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const localDate = (zone) => new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const read = async (path) => {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return response.json();
  };
  const diaryLink = path => path.startsWith('../Diary Entries/') ? `diary.html?entry=${encodeURIComponent(path.slice(3))}` : path;
  function button(text, action, cls) {
    const b = el('button', text, cls); b.type = 'button'; b.addEventListener('click', action); return b;
  }
  function badge(priority) { return el('span', priorities[priority] || 'Unconfirmed', `priority ${priority || ''}`); }
  function list(items) {
    const ul = el('ul'); items.forEach(item => ul.append(el('li', item))); return ul;
  }
  function showView(name, focus = false) {
    if (!['harada', 'flight-plan', 'performance'].includes(name)) name = 'harada';
    document.querySelectorAll('.app-view').forEach(view => { view.hidden = view.id !== name; });
    document.querySelectorAll('[data-view]').forEach(link => {
      if (link.dataset.view === name) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (focus) $(`#${name} h2`).focus({ preventScroll: true });
  }
  function route(focus = false) {
    const hash = location.hash.slice(1);
    if (['overview', 'latest', 'round-splits', 'trend', 'combined-trend', 'priorities'].includes(hash)) {
      showView('performance'); $(`#${hash}`).scrollIntoView();
    } else showView(hash || 'harada', focus);
  }
  window.addEventListener('hashchange', () => route(true));
  route();

  // Adapt the approved handoff schema for rendering without rewriting its data or IDs.
  function normalizeMatrix(data) {
    const o = data.objective || {};
    return { ...data, version: data.matrix_version, updated: data.approved_on,
      objective: { ...o, index: o.handicap_index_target, deadline: o.target_date, starting_index: o.baseline_index },
      pillars: (data.pillars || []).map((p, i) => ({ ...p, title: p.name, position: p.position ?? positions[i],
        commitments: (p.commitments || []).map((c, j) => ({ ...c, title: c.text, position: c.position ?? positions[j], priority: c.priority ?? 'unassigned' })) })) };
  }
  function normalizePlan(data) {
    return { ...data, timezone: data.timezone || 'America/Los_Angeles',
      sessions: (data.sessions || []).map(s => ({ ...s, blocks: (s.blocks || []).map(b => ({ ...b, title: b.name })) })) };
  }
  function validateMatrix(data) {
    if (!data.version || !data.objective || !Number.isFinite(data.objective.index) || !Number.isFinite(data.objective.starting_index) || !/^\d{4}-\d{2}-\d{2}$/.test(data.objective.deadline)) throw new Error('Objective incomplete');
    if (data.pillars?.length !== 8) throw new Error('Eight pillars required');
    const ids = new Set(), used = new Set();
    for (const pillar of data.pillars) {
      if (!pillar.id || !pillar.title || ids.has(pillar.id) || !positions.includes(pillar.position) || used.has(pillar.position) || pillar.commitments?.length !== 8) throw new Error('Invalid pillar structure');
      if (pillar.focus !== undefined && !Object.hasOwn(pillarFocus, pillar.focus)) throw new Error('Invalid pillar focus');
      ids.add(pillar.id); used.add(pillar.position);
      const cells = new Set();
      for (const c of pillar.commitments) {
        if (!c.id || !c.title || ids.has(c.id) || !positions.includes(c.position) || cells.has(c.position) || !priorities[c.priority]) throw new Error('Invalid commitment structure');
        ids.add(c.id); cells.add(c.position);
      }
    }
  }
  function renderGoal(history) {
    const o = matrix.objective, box = $('#goal-summary'); box.replaceChildren();
    const goal = el('div', undefined, 'goal-main');
    goal.append(el('span', 'HANDICAP INDEX', 'eyebrow'), el('strong', o.index.toFixed(1), 'goal-number'), el('span', `by ${dateLabel(o.deadline)}`));
    const record = SwingwellPerformance.indexHistory(history || {}, o).current;
    const detail = el('div', undefined, 'goal-progress');
    detail.append(el('p', `Starting index ${o.starting_index.toFixed(1)} · Goal ${o.index.toFixed(1)}`));
    if (record && Number.isFinite(record.index)) {
      detail.append(el('p', `${record.verified === true ? 'Latest verified' : 'Last recorded'}: ${record.index.toFixed(1)} · ${dateLabel(record.date)}`, 'recorded-index'));
      if (record.verified !== true) detail.append(el('p', 'Verification pending · dated repository observation.', 'helper'));
      const span = o.starting_index - o.index;
      const value = span > 0 ? Math.max(0, Math.min(100, (o.starting_index - record.index) / span * 100)) : 0;
      const progress = el('progress'); progress.max = 100; progress.value = value; progress.setAttribute('aria-label', 'Progress based on dated handicap observation');
      detail.append(progress, el('p', `${Math.round(value)}% toward goal · recorded ${dateLabel(record.date)}`, 'helper'));
    } else detail.append(el('p', 'No handicap observation available. Goal remains confirmed.', 'helper'));
    box.append(goal, detail);
    if (record) {
      if (record.source) detail.append(el('p', record.source, 'helper'));
      $('#verified-performance').replaceChildren(el('strong', `${record.verified ? 'Latest verified' : 'Last recorded'} handicap index: ${record.index.toFixed(1)} · ${dateLabel(record.date)}`), el('p', `${record.source || 'Dated repository observation; verification pending'}. Starting index ${o.starting_index.toFixed(1)}; goal ${o.index.toFixed(1)} by ${dateLabel(o.deadline)}. The index charts include this observation; round statistics retain their recorded dates.`));
    }
  }
  function pillarButton(pillar, cls = '') {
    const label = pillarFocus[pillar.focus] || 'Not assigned';
    const b = button('', () => selectPillar(pillar.id, true), `pillar-cell focus-${pillar.focus || 'unassigned'} ${cls}`);
    b.append(el('span', pillar.title, 'pillar-name'), el('span', label, 'pillar-focus'));
    b.dataset.pillar = pillar.id; b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', `${pillar.title}: ${label} focus. View eight commitments`); return b;
  }
  function renderMatrix() {
    const overview = $('#harada-overview'); overview.replaceChildren();
    for (let p = 0; p < 9; p++) {
      if (p === 4) { const center = el('div', undefined, 'objective-cell'); center.append(el('strong', matrix.objective.index.toFixed(1)), el('span', dateLabel(matrix.objective.deadline))); overview.append(center); }
      else overview.append(pillarButton(matrix.pillars.find(x => x.position === p)));
    }
    const full = $('#full-matrix'); full.replaceChildren();
    for (let block = 0; block < 9; block++) {
      const group = el('div', undefined, `matrix-block ${block === 4 ? 'central-block' : ''}`);
      group.setAttribute('role', 'group');
      const pillar = matrix.pillars.find(x => x.position === block);
      group.setAttribute('aria-label', block === 4 ? 'Central objective and eight pillars' : `${pillar.title} and eight commitments`);
      for (let cell = 0; cell < 9; cell++) {
        let b;
        if (block === 4) b = cell === 4 ? button(`${matrix.objective.index.toFixed(1)} by ${dateLabel(matrix.objective.deadline)}`, () => $('#harada-title').focus(), 'objective-cell') : pillarButton(matrix.pillars.find(x => x.position === cell));
        else if (cell === 4) b = pillarButton(pillar);
        else {
          const c = pillar.commitments.find(x => x.position === cell);
          b = button(`${c.id} · ${c.title}`, () => selectCommitment(c.id), `commitment-cell ${c.priority}`);
          b.setAttribute('aria-label', `${pillar.title}: ${c.title}, ${priorities[c.priority]}${c.status === 'unconfirmed' ? ', awaiting confirmation' : ''}`);
        }
        b.classList.add('matrix-cell'); group.append(b);
      }
      full.append(group);
    }
  }
  function selectPillar(id, focus = false) {
    const pillar = matrix.pillars.find(p => p.id === id); if (!pillar) return;
    document.querySelectorAll('[data-pillar]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pillar === id)));
    const pane = $('#pillar-detail'); pane.replaceChildren();
    pane.append(el('p', matrix.status === 'illustrative' ? 'Illustrative pillar · wording to confirm' : 'Strategic pillar', 'eyebrow'));
    const h = el('h3', pillar.title); h.tabIndex = -1; pane.append(h);
    pane.append(el('p', `Pillar focus: ${pillarFocus[pillar.focus] || 'Not assigned'} · Individual commitments have their own priorities.`, 'helper'));
    pane.append(el('p', pillar.outcome));
    const objectives = pillar.performance_guidance ? [pillar.performance_guidance] : [];
    if (objectives.length) pane.append(el('h4', 'Performance guidance · goals, not measured results'), list(objectives));
    else pane.append(el('p', 'Performance objectives will appear when confirmed.', 'helper'));
    const group = el('div', undefined, 'commitment-list');
    pillar.commitments.slice().sort((a,b) => a.position-b.position).forEach(c => {
      const b = button('', () => selectCommitment(c.id), 'commitment-choice'); b.dataset.commitment = c.id;
      const text = el('span'); text.append(el('strong', `${c.id} · ${c.title}`), el('small', c.status === 'unconfirmed' ? 'Awaiting canonical wording' : 'Open evidence and next action'));
      b.append(text, badge(c.priority)); group.append(b);
    });
    pane.append(group); $('#commitment-detail').hidden = true;
    if (focus) h.focus({ preventScroll: true });
  }
  function evidenceSection(parent, title, items) {
    if (!items?.length) return;
    parent.append(el('h4', title), list(items));
  }
  function selectCommitment(id) {
    const entry = commitments.get(id); if (!entry) return;
    selectPillar(entry.pillar.id);
    const c = entry.commitment, d = evidence?.commitments?.[id];
    const pane = $('#commitment-detail'); pane.replaceChildren(); pane.hidden = false;
    pane.append(button('Back to commitments', () => { pane.hidden = true; $(`[data-commitment="${id}"]`).focus(); }, 'text-button'));
    pane.append(el('p', entry.pillar.title, 'eyebrow'));
    const title = el('h3', `${c.id} · ${c.title}`); title.tabIndex = -1; pane.append(title, badge(c.priority), el('p', c.description || ''));
    if (matrix.status === 'illustrative' || d?.status === 'illustrative') pane.append(el('p', 'Illustrative example. Sample measurements and actions are not verified personal evidence.', 'prototype-notice'));
    if (!d) pane.append(el('p', 'Baseline needed. No commitment-specific evidence or measured results supplied yet. No coaching hypothesis or next action has been inferred from older diaries.', 'empty-state'));
    else {
      if (d.observation_date) pane.append(el('p', `Observation: ${dateLabel(d.observation_date)}`, 'helper'));
      evidenceSection(pane, 'Recorded facts', d.facts?.map(x => typeof x === 'string' ? x : `${x.date ? dateLabel(x.date) + ': ' : ''}${x.text}`));
      if (d.metrics?.length) {
        const metrics = el('dl', undefined, 'stat-grid');
        d.metrics.forEach(m => { const item = el('div'); item.append(el('dt', m.label), el('dd', `${m.value ?? 'Not recorded'} ${m.unit || ''}`), el('small', m.date ? dateLabel(m.date) : 'Date not recorded')); metrics.append(item); }); pane.append(metrics);
      }
      (d.observation_ids || []).forEach(key => {
        const observation = evidence.observations?.[key];
        if (observation) renderObservation(pane, observation);
        else pane.append(el('p', 'Linked observation unavailable.', 'helper'));
      });
      if (d.shots?.carry?.length) renderShots(pane, d.shots);
      evidenceSection(pane, 'Performance objectives', d.performance_objectives);
      evidenceSection(pane, 'Coaching hypotheses · not established facts', d.hypotheses?.map(x => `${x.date ? dateLabel(x.date) + ': ' : ''}${x.text}`));
      pane.append(el('h4', 'Next action'), el('p', d.next_action || 'No next action recorded.', 'next-action'));
      if (d.references?.length) {
        pane.append(el('h4', 'Source diary and historical references'));
        d.references.forEach(ref => {
          if (typeof ref.path !== 'string' || !/^\.\.\/(Diary Entries|Monthly Summaries|Plan|Analysis)\//.test(ref.path) || ref.path.includes('/../')) return;
          const a = el('a', ref.label || ref.path, 'archive-link'); a.href = diaryLink(ref.path); pane.append(a);
        });
      }
    }
    evidenceSection(pane, 'Pillar performance guidance · not measured evidence', [entry.pillar.performance_guidance]);
    const linked = plan?.sessions?.filter(s => s.commitment_ids.includes(id)) || [];
    if (linked.length) {
      pane.append(el('h4', plan.status === 'confirmed' ? 'Next practice · confirmed flight plan' : 'Proposed next practice · provisional flight plan'));
      linked.forEach(s => pane.append(button(s.title, () => { showView('flight-plan'); location.hash = 'flight-plan'; requestAnimationFrame(() => { const card = document.getElementById(s.id); card.scrollIntoView({ block: 'start' }); card.focus({ preventScroll: true }); }); }, 'session-link')));
    }
    pane.scrollIntoView({ block: 'start' }); title.focus({ preventScroll: true });
  }
  function renderObservation(pane, observation) {
    const section = el('section', undefined, 'evidence-observation');
    section.append(el('h4', observation.title), el('p', `${dateLabel(observation.date)} · ${observation.source}`, 'helper'), el('p', observation.sample_note), el('p', observation.summary_note, 'helper'));
    const table = el('table', undefined, 'evidence-table');
    table.append(el('caption', 'Simulator shot-history averages · not recalculated from the readable subset'));
    const head = el('thead'), row = el('tr');
    ['Metric', 'Reported average'].forEach(label => { const th=el('th', label); th.scope='col'; row.append(th); }); head.append(row); table.append(head);
    const body = el('tbody');
    (observation.metrics || []).forEach(m => { const tr=el('tr'), th=el('th', m.label); th.scope='row'; tr.append(th,el('td', `${m.value ?? 'Not recorded'} ${m.unit || ''}`)); body.append(tr); }); table.append(body); section.append(table);
    if (observation.shots) renderShots(section, observation.shots);
    pane.append(section);
  }
  function renderLatestEvidence() {
    const box = $('#latest-evidence'), session = evidence?.latest_session;
    if (!session) return;
    box.hidden = false;
    box.replaceChildren(el('h3', `Latest recorded practice · ${dateLabel(session.date)}`), el('h4', session.title), el('p', session.summary));
    (session.commitment_ids || []).filter(id=>commitments.has(id)).forEach(id => box.append(button(`${id} · View evidence`, () => { location.hash='harada'; showView('harada'); selectCommitment(id); }, 'session-link')));
    const ref=session.reference;
    if (ref?.path?.startsWith('../Diary Entries/') && !ref.path.includes('/../')) { const a=el('a', 'Read the complete diary', 'archive-link'); a.href=diaryLink(ref.path); box.append(a); }
  }
  function renderShots(pane, shots) {
    const values = shots.carry.filter(Number.isFinite); if (!values.length) return;
    const mean = values.reduce((a,b) => a+b,0) / values.length, min = Math.min(...values), max = Math.max(...values);
    const partial = shots.coverage === 'partial';
    const label = shots.label || (shots.status === 'illustrative' ? 'Illustrative shot history' : 'Recorded shot history');
    pane.append(el('h4', label));
    const metrics = el('dl', undefined, 'stat-grid');
    [...(partial ? [] : [['Mean carry', `${mean.toFixed(1)} ${shots.unit}`]]), [partial ? 'Readable subset range' : 'Carry range', `${(max-min).toFixed(1)} ${shots.unit}`], [partial ? 'Readable shots' : 'Shots', values.length]].forEach(([k,v]) => { const item = el('div'); item.append(el('dt',k),el('dd',v)); metrics.append(item); }); pane.append(metrics);
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 600 160'); svg.setAttribute('role','img'); svg.setAttribute('aria-label',`${label}: ${values.join(', ')} ${shots.unit}`); svg.classList.add('shot-chart');
    values.forEach((v,i) => { const x=35+i*(530/Math.max(1,values.length-1)), y=125-(v-min)/Math.max(1,max-min)*90; const circle=document.createElementNS(ns,'circle'); circle.setAttribute('cx',x); circle.setAttribute('cy',y); circle.setAttribute('r',5); svg.append(circle); const text=document.createElementNS(ns,'text'); text.setAttribute('x',x); text.setAttribute('y',y-12); text.setAttribute('text-anchor','middle'); text.textContent=v; svg.append(text); }); pane.append(svg);
    if (partial) {
      pane.append(el('p', shots.order || 'Readable subset only', 'helper'));
      const table=el('table',undefined,'evidence-table'); table.append(el('caption','Readable carries · all visible outcomes retained'));
      const head=el('thead'), row=el('tr'); ['Displayed row',`Carry (${shots.unit})`].forEach(label=>{const th=el('th',label);th.scope='col';row.append(th);});head.append(row);table.append(head);
      const body=el('tbody'); values.forEach((v,i)=>{const row=el('tr');row.append(el('td',i+1),el('td',v.toFixed(1)));body.append(row);});table.append(body);pane.append(table);
    }
    pane.append(el('p', `Carry by shot (${shots.unit}): ${values.join(', ')}. Range is maximum minus minimum; it is not lateral dispersion.`, 'helper'));
  }
  function validatePlan(data) {
    if (data.matrix_version !== matrix.version || !Array.isArray(data.sessions) || data.sessions.length !== 4) throw new Error('Four sessions linked to this matrix version required');
    const dates = [data.week_start, data.week_end];
    if (dates.some(d => !/^\d{4}-\d{2}-\d{2}$/.test(d)) || data.week_end < data.week_start) throw new Error('Invalid plan dates');
    localDate(data.timezone);
    const ids=new Set();
    data.sessions.forEach(s => {
      if (!/^[A-Za-z0-9-]+$/.test(s.id) || ids.has(s.id) || !s.title || !s.purpose || !s.blocks?.length || !s.success_criteria?.length || !s.commitment_ids?.length || s.commitment_ids.some(id => !commitments.has(id)) || s.blocks.some(b => !b.title || !b.instructions || !Number.isFinite(b.minutes) || b.minutes <= 0) || s.blocks.reduce((a,b)=>a+b.minutes,0) !== s.duration_minutes) throw new Error('Incomplete session or invalid commitment link');
      ids.add(s.id);
    });
  }
  function sessionText(session) {
    const names = session.commitment_ids.map(id => { const c=commitments.get(id); return `${id} — ${c.pillar.title}: ${c.commitment.title}`; });
    return [ 'SWINGWELL — ' + session.title, ...(plan.status !== 'confirmed' ? ['PROVISIONAL — awaiting Sunday Plan confirmation'] : ['CONFIRMED FLIGHT PLAN']), ...(localDate(plan.timezone) > plan.week_end ? ['PAST PLAN — not the current week'] : []), ...(plan.note ? [plan.note] : []), `Week: ${dateLabel(plan.week_start)} – ${dateLabel(plan.week_end)}`, `Duration: approximately ${session.duration_minutes} minutes`, '', 'PURPOSE', session.purpose, '', 'HARADA COMMITMENTS', ...names, '', 'PRACTICE BLOCKS', ...session.blocks.flatMap((b,i) => [`${i+1}. ${b.title} — approximately ${b.minutes} min`, b.instructions, '']), 'SUCCESS CRITERIA', ...session.success_criteria.map(x => '• ' + x), '', ...(session.process_commitment ? ['PROCESS COMMITMENT', session.process_commitment, ''] : []), ...(session.stop_rule ? ['STOP RULE',session.stop_rule,''] : []), 'AFTER PRACTICE', 'Record completed work and observations in your existing SWINGWELL Markdown diary.' ].join('\n');
  }
  async function copySession(session, status, fallback, copyButton) {
    const text = sessionText(session);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = 'Copied complete session. Paste into Apple Notes.'; fallback.hidden = true;
      copyButton.textContent = 'Copy again';
    } catch {
      status.textContent = 'Automatic copying is unavailable. Select and copy the complete session below.';
      fallback.hidden = false; fallback.querySelector('textarea').value = text;
      const field = fallback.querySelector('textarea'); field.focus(); field.select();
    }
  }
  function renderPlan() {
    const heading = $('#plan-heading'); heading.replaceChildren();
    const today = localDate(plan.timezone), state = today < plan.week_start ? 'Upcoming week' : today > plan.week_end ? 'Past plan — awaiting the Sunday Plan' : 'Current week';
    heading.append(el('p', `${state} · ${dateLabel(plan.week_start)} – ${dateLabel(plan.week_end)}`, 'plan-date'));
    if (plan.status !== 'confirmed') heading.append(el('p', 'Provisional — awaiting Sunday Plan confirmation. No review or approval is implied.', 'prototype-notice'));
    if (plan.note) heading.append(el('p', plan.note));
    heading.append(el('p', 'Saturday: learn. Sunday: prepare. Monthly: align. Copy a session into Apple Notes; record completed work in your existing diary.', 'helper'));
    if (plan.prepared_on) heading.append(el('p', `Prepared ${dateLabel(plan.prepared_on)}`, 'helper'));
    if (typeof plan.review_ref === 'string' && /^\.\.\/Monthly Summaries\//.test(plan.review_ref) && !plan.review_ref.includes('/../')) {
      const review = el('a', 'Read the Saturday Review behind this plan', 'archive-link'); review.href = plan.review_ref; heading.append(review);
    }
    const container = $('#session-list'); container.replaceChildren();
    plan.sessions.forEach((s,i) => {
      const card = el('article',undefined,'session-card flight-card'); card.id=s.id; card.tabIndex=-1;
      card.append(el('p', `Session ${i+1} · approximately ${s.duration_minutes} min`, 'eyebrow'),el('h3',s.title),el('p',s.purpose));
      const links=el('div',undefined,'commitment-links');
      s.commitment_ids.forEach(id => { const item=commitments.get(id); links.append(button(`${id} · ${item.commitment.title}`,()=>{ location.hash='harada'; showView('harada'); selectCommitment(id); },'text-button')); }); card.append(links);
      s.blocks.forEach(b => { const block=el('div',undefined,'practice-block'); block.append(el('h4',`${b.title} · ${b.minutes} min`),el('p',b.instructions)); card.append(block); });
      card.append(el('h4','Success criteria'),list(s.success_criteria));
      if(s.process_commitment) card.append(el('h4','Process commitment'),el('p',s.process_commitment,'next-action'));
      if(s.stop_rule) card.append(el('p',s.stop_rule,'helper'));
      const status=el('p','', 'copy-status'); status.setAttribute('role','status');
      const fallback=el('div',undefined,'copy-fallback'); fallback.hidden=true;
      const label=el('label','Complete session text'); label.htmlFor=`copy-${s.id}`;
      const area=el('textarea'); area.id=`copy-${s.id}`; area.readOnly=true; area.rows=14;
      fallback.append(label,area,button('Select all text',()=>{area.focus();area.select();}));
      const copy=button('Copy to Clipboard',()=>copySession(s,status,fallback,copy),'primary-button');
      card.append(copy,status,fallback);container.append(card);
    });
  }
  $('#expand-matrix').addEventListener('click', () => {
    const panel=$('#full-matrix-panel'); panel.hidden=!panel.hidden;
    $('.strategy-workspace').classList.toggle('matrix-expanded', !panel.hidden);
    $('#expand-matrix').setAttribute('aria-expanded',String(!panel.hidden));
    $('#expand-matrix').textContent=panel.hidden?'Full 81-cell matrix':'Close full matrix';
  });
  async function init() {
    try {
      matrix=normalizeMatrix(await read('data/harada.json'));validateMatrix(matrix);
      matrix.pillars.forEach(p => p.commitments.forEach(c => commitments.set(c.id,{pillar:p,commitment:c})));
      $('#prototype-notice').textContent=matrix.status==='illustrative'?'Illustrative matrix and priorities. Goal confirmed; canonical commitments pending.':`Approved matrix ${matrix.version} · ${dateLabel(matrix.updated)} · Raise the floor, preserve the ceiling.`;
      $('.updated').textContent = matrix.status === 'illustrative' ? 'Prototype · canonical matrix pending' : `Matrix ${matrix.version}`;
      renderMatrix(); renderGoal(null);
      read('data/index-history.json').then(renderGoal).catch(()=>renderGoal(null));
      selectPillar(matrix.pillars.find(p=>p.id==='AP')?.id || matrix.pillars[0].id);
      const results=await Promise.allSettled([read('data/commitment-evidence.json'),read('data/weekly-plan.json')]);
      if(results[0].status==='fulfilled' && results[0].value.matrix_version===matrix.version) { evidence=results[0].value; renderLatestEvidence(); }
      else $('#pillar-detail').append(el('p','Commitment evidence is unavailable or uses a different matrix version.','helper'));
      try {
        if(results[1].status!=='fulfilled') throw new Error('Plan unavailable');
        const candidate=normalizePlan(results[1].value);validatePlan(candidate);plan=candidate;renderPlan();
      } catch { $('#plan-heading').replaceChildren(el('p','No valid four-session plan is available for this matrix version. Awaiting the Sunday Plan.','empty-state')); }
    } catch {
      $('#prototype-notice').textContent='The Harada data is unavailable or incomplete. Performance and the diary archive remain accessible.';
      $('#plan-heading').textContent='The flight plan needs a valid Harada matrix before commitment links can be displayed.';
    }
  }
  init();
})();
