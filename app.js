import {parseLink, decryptCard} from './crypto.js';
import {parseVCard, renderVCard} from './vcard.js';

const status = document.querySelector('#status');
const download = document.querySelector('#download');
const contact = document.querySelector('#contact');
const heading = document.querySelector('h1');
let objectUrl;
let generation = 0;

async function load() {
  const current = ++generation;
  download.hidden = true;
  contact.hidden = true;
  contact.replaceChildren();
  heading.textContent = 'Contact card';
  download.removeAttribute('href');
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  status.textContent = 'Opening contact…';
  try {
    const fragment = location.hash;
    // Consume the secret link without retaining it in the current history entry.
    // replaceState does not reload the page or trigger the hashchange handler.
    if (fragment) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    if (!window.isSecureContext || !crypto.subtle) {
      throw new Error('Open this page over HTTPS, or use localhost for desktop testing.');
    }
    const {id, key} = parseLink(fragment);
    const response = await fetch(`cards/${id}.enc`, {cache: 'no-store', credentials: 'omit', redirect: 'error'});
    if (response.status === 404) throw new Error('This contact is unavailable or has been removed.');
    if (!response.ok) throw new Error('Could not load the contact. Please try again.');
    const text = await response.text();
    if (text.length > 1500000) throw new Error('Contact file is too large.');
    const data = await decryptCard(JSON.parse(text), id, key);
    if (current !== generation) return;
    const card = parseVCard(new TextDecoder('utf-8', {fatal: true}).decode(data));
    renderVCard(contact, heading, card);
    objectUrl = URL.createObjectURL(new Blob([data], {type: 'text/vcard;charset=utf-8'}));
    download.href = objectUrl;
    download.hidden = false;
    status.textContent = 'Save these details to your contacts with the button below.';
  } catch (error) {
    if (current === generation) {
      status.textContent = error instanceof SyntaxError ? 'The contact file is invalid.' : error.message;
    }
  }
}
window.addEventListener('hashchange', load);
load();
