/* One reader for the canonical Markdown archive. No generated diary copies. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const node = (tag, text) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const dateLabel = date => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const entryPath = new URLSearchParams(location.search).get('entry');
  let entries = [];
  const safeURL = (href, base, image = false) => {
    try {
      const url = new URL(href, base);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
      // Images remain repository-local; external references are ordinary links.
      if (image && url.origin !== location.origin) return null;
      return url.href;
    } catch { return null; }
  };

  // Marked supplies syntax tokens only. Never insert Markdown-generated HTML.
  // Fixed element types + textContent keep raw HTML and unsafe URLs inert.
  function appendTokens(parent, tokens, base) {
    for (const token of tokens || []) {
      let element;
      switch (token.type) {
        case 'space': case 'def': case 'checkbox': continue;
        case 'heading': element = node(`h${Math.min(6, token.depth + 1)}`); break;
        case 'paragraph': element = node('p'); break;
        case 'strong': case 'em': case 'del': case 'blockquote': element = node(token.type); break;
        case 'br': case 'hr': parent.append(node(token.type)); continue;
        case 'code': element = node('pre'); element.append(node('code', token.text)); parent.append(element); continue;
        case 'codespan': parent.append(node('code', token.text)); continue;
        case 'list':
          element = node(token.ordered ? 'ol' : 'ul');
          if (token.ordered) element.start = token.start;
          for (const item of token.items) {
            const li = node('li');
            if (item.task) {
              const checkbox = node('input'); checkbox.type = 'checkbox'; checkbox.disabled = true;
              checkbox.checked = item.checked; checkbox.setAttribute('aria-label', item.checked ? 'Completed' : 'Not completed');
              li.append(checkbox, document.createTextNode(' '));
            }
            appendTokens(li, item.tokens, base); element.append(li);
          }
          parent.append(element); continue;
        case 'table': {
          const wrap = node('div'); wrap.className = 'table-wrap'; wrap.tabIndex = 0;
          wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', 'Diary table; scroll horizontally if needed');
          const table = node('table'), head = node('thead'), body = node('tbody');
          [token.header, ...token.rows].forEach((row, index) => {
            const tr = node('tr');
            row.forEach((cell, column) => {
              const td = node(index ? 'td' : 'th');
              if (!index) td.scope = 'col';
              if (['left', 'right', 'center'].includes(token.align[column])) td.style.textAlign = token.align[column];
              appendTokens(td, cell.tokens, base); tr.append(td);
            });
            (index ? body : head).append(tr);
          });
          table.append(head, body); wrap.append(table); parent.append(wrap); continue;
        }
        case 'link': {
          const href = safeURL(token.href, base);
          element = node(href ? 'a' : 'span');
          if (href) {
            const url = new URL(href);
            const linked = entries.find(entry => new URL(`../${entry.path}`, location.href).pathname === url.pathname && url.origin === location.origin);
            element.href = linked ? `diary.html?entry=${encodeURIComponent(linked.path)}` : href;
            element.rel = 'noopener noreferrer';
          }
          break;
        }
        case 'image': {
          const src = safeURL(token.href, base, true);
          if (!src) { parent.append(node('span', token.text)); continue; }
          element = node('img'); element.src = src; element.alt = token.text || ''; element.loading = 'lazy';
          parent.append(element); continue;
        }
        default:
          if (token.tokens) appendTokens(parent, token.tokens, base);
          else parent.append(document.createTextNode(token.text ?? token.raw ?? ''));
          continue;
      }
      appendTokens(element, token.tokens, base); parent.append(element);
    }
  }

  function readableMarkdown(source) {
    // Hide metadata, preserving the original source. Older RTF migrations use
    // literal bullets and standalone PRE/DURING/POST labels instead of Markdown.
    return source.replace(/^\uFEFF/, '').replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
      .replace(/^([ \t]*)•[ \t]+/gm, '$1- ')
      .replace(/^(PRE|DURING|POST)\s*$/gm, '## $1');
  }

  async function showEntry() {
    $('#archive').hidden = true; $('#diary-reader').hidden = false;
    const entry = entries.find(item => item.path === entryPath);
    if (!entry) { $('#reader-status').textContent = 'This diary is not in the archive. Return to the archive to choose an entry.'; return; }
    $('#entry-title').textContent = `${dateLabel(entry.date)} · ${entry.session_type || 'Diary'}`;
    $('#entry-meta').textContent = [entry.location, entry.mental_state && `Recorded state: ${entry.mental_state}`].filter(Boolean).join(' · ');
    document.title = `${entry.date} · SWINGWELL Diary`;
    const sourceURL = new URL(`../${entry.path}`, location.href);
    const sourceLink = $('#markdown-source'); sourceLink.href = sourceURL.href; sourceLink.hidden = false;
    try {
      const response = await fetch(sourceURL, { cache: 'no-cache' });
      if (!response.ok) throw new Error('Diary unavailable');
      const source = await response.text();
      if (!window.marked) {
        $('#reader-status').textContent = 'Formatting unavailable. The original text is shown below.';
        $('#diary-content').append(node('pre', source)); return;
      }
      appendTokens($('#diary-content'), marked.lexer(readableMarkdown(source), { gfm: true, breaks: true }), sourceURL);
      $('#reader-status').textContent = '';
    } catch {
      $('#reader-status').textContent = 'This diary could not be loaded. Try again or open the Markdown source.';
    }
  }

  function renderArchive() {
    const query = $('#search').value.trim().toLowerCase();
    const filtered = entries.filter(entry => {
      const text = `${entry.date} ${entry.title} ${entry.location} ${entry.session_type}`.toLowerCase();
      return (!query || text.includes(query)) && (!$('#type-filter').value || entry.session_type === $('#type-filter').value)
        && (!$('#state-filter').value || entry.mental_state === $('#state-filter').value);
    });
    $('#entry-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'}`;
    const body = $('#diary-body'); body.replaceChildren();
    for (const entry of filtered) {
      const row = node('tr'), date = node('td'), link = node('a', entry.date);
      link.className = 'text-link'; link.href = `diary.html?entry=${encodeURIComponent(entry.path)}`;
      link.setAttribute('aria-label', `Read diary: ${entry.date}, ${entry.title}`); date.append(link);
      row.append(date, node('td', entry.session_type || '—'), node('td', entry.location || '—'), node('td', entry.mental_state || '—')); body.append(row);
    }
    if (!filtered.length) { const row = node('tr'), td = node('td', 'No diaries match these filters.'); td.colSpan = 4; row.append(td); body.append(row); }
  }
  for (const id of ['search', 'type-filter', 'state-filter']) $(`#${id}`).addEventListener('input', renderArchive);
  if (entryPath) { $('#archive').hidden = true; $('#diary-reader').hidden = false; }
  fetch('data/diary-index.json', { cache: 'no-cache' }).then(response => {
    if (!response.ok) throw new Error('Archive unavailable');
    return response.json();
  }).then(payload => {
    entries = payload.filter(item => /^Diary Entries\/[^?#]+\.md$/.test(item.path) && !item.path.split('/').includes('..'))
      .sort((a, b) => b.date.localeCompare(a.date));
    [...new Set(entries.map(entry => entry.session_type).filter(Boolean))].sort().forEach(type => $('#type-filter').add(new Option(type, type)));
    if (entryPath) showEntry(); else renderArchive();
  }).catch(() => {
    $('#reader-status').textContent = 'The diary archive could not be loaded. Please try again.';
    $('#entry-count').textContent = 'Archive unavailable. Please try again.';
  });
})();
