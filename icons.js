// GitHub mark: Simple Icons (CC0); see THIRD_PARTY_NOTICES.md.
// Other symbols are local geometric drawings. Only these fixed paths become SVG.
const paths = {
  github: ['M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3-.404c1.02.005 2.045.138 3 .404 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'],
  email: ['M3 5h18v14H3Z', 'm3 6 9 7 9-7'],
  phone: ['m5 3 4 1 1 5-3 2c1.5 3 3 4.5 6 6l2-3 5 1 1 4c-1 2-3 3-5 2C9 19 5 15 3 8c-1-2 0-4 2-5Z'],
  website: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', 'M3 12h18', 'M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z'],
  key: ['M14 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z', 'm13 12 8 8h-4v-3h-3l-3-3', 'M7 7h.01'],
};

export function contactIcon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('class', 'contact-icon');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('fill', name === 'github' ? 'currentColor' : 'none');
  if (name !== 'github') {
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
  }
  for (const data of paths[name] || paths.website) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', data);
    svg.append(path);
  }
  return svg;
}

export function urlIcon(href) {
  const url = new URL(href);
  if (['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) return 'github';
  if (/\.(asc|pgp|gpg)$/i.test(url.pathname)) return 'key';
  return 'website';
}
