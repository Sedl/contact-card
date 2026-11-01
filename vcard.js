import {contactIcon, urlIcon} from './icons.js';

// Display common UTF-8 vCard 3.0/4.0 properties; preserve the original for download.
function unescapeText(value) {
  return value.replace(/\\([nN,;\\])/g, (_, char) => /[nN]/.test(char) ? '\n' : char);
}

export function parseVCard(text) {
  const card = {name: '', organization: '', title: '', note: '', emails: [], phones: [], links: []};
  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n').replace(/\n[ \t]/g, '').split('\n');
  for (const line of lines) {
    // Locate the value separator outside quoted parameter values.
    let quoted = false;
    let separator = -1;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') quoted = !quoted;
      if (line[i] === ':' && !quoted) { separator = i; break; }
    }
    if (separator < 0) continue;
    const header = line.slice(0, separator);
    const property = header.split(';')[0].split('.').pop().toUpperCase();
    // Legacy encoded properties need a fuller parser; avoid showing encoded gibberish.
    if (/;ENCODING=/i.test(header)) continue;
    const raw = line.slice(separator + 1);
    const value = unescapeText(raw);
    if (property === 'FN' && !card.name) card.name = value;
    if (property === 'TITLE' && !card.title) card.title = value;
    if (property === 'ORG' && !card.organization) {
      card.organization = (raw.match(/(?:\\.|[^;])+/g) || []).map(unescapeText).filter(Boolean).join(' · ');
    }
    if (property === 'NOTE' && !card.note) card.note = value;
    if (property === 'EMAIL') card.emails.push(value);
    if (property === 'TEL') card.phones.push(value.replace(/^tel:/i, ''));
    if (property === 'URL') {
      try {
        const url = new URL(value);
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) continue;
        const github = ['github.com', 'www.github.com'].includes(url.hostname.toLowerCase());
        card.links.push({href: url.href, label: github ? `GitHub · ${url.pathname.replace(/^\//, '') || 'github.com'}` : url.host + url.pathname});
      } catch { /* Ignore malformed URLs; they remain in the downloaded original. */ }
    }
  }
  return card;
}

export function renderVCard(container, heading, card) {
  container.replaceChildren();
  heading.textContent = card.name || 'Contact card';
  function paragraph(value, className) {
    if (!value) return;
    const node = document.createElement('p');
    node.className = className;
    node.textContent = value;
    container.append(node);
  }
  paragraph([card.title, card.organization].filter(Boolean).join(' · '), 'subtitle');
  paragraph(card.note, 'note');
  const list = document.createElement('ul');
  list.className = 'contact-links';
  function link(label, href, external = false, icon = 'website') {
    const item = document.createElement('li');
    const anchor = document.createElement('a');
    const text = document.createElement('span');
    text.className = 'contact-label';
    text.textContent = label;
    anchor.append(contactIcon(icon), text);
    anchor.href = href;
    if (external) { anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; }
    item.append(anchor);
    list.append(item);
  }
  for (const email of card.emails) link(email, `mailto:${encodeURIComponent(email)}`, false, 'email');
  for (const phone of card.phones) link(phone, `tel:${encodeURIComponent(phone)}`, false, 'phone');
  for (const url of card.links) link(url.label, url.href, true, urlIcon(url.href));
  if (list.children.length) container.append(list);
  container.hidden = false;
}
