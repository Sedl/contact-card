export function decode64(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error('Invalid encoded data.');
  }
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
}

export function parseLink(fragment) {
  const params = new URLSearchParams(fragment.replace(/^#/, ''));
  const id = params.get('id');
  const encoded = params.get('key');
  if (!/^[0-9a-f]{32}$/.test(id || '') || !/^[A-Za-z0-9_-]{43}$/.test(encoded || '') ||
      params.getAll('id').length !== 1 || params.getAll('key').length !== 1) {
    throw new Error('This contact link is incomplete or invalid. Scan the card again.');
  }
  const key = decode64(encoded);
  if (key.length !== 32) throw new Error('Invalid contact key.');
  return {id, key};
}

export async function decryptCard(envelope, id, keyBytes) {
  if (envelope.version !== 1 || envelope.algorithm !== 'AES-256-GCM') {
    throw new Error('Unsupported contact file format.');
  }
  const iv = decode64(envelope.nonce);
  const ciphertext = decode64(envelope.ciphertext);
  if (iv.length !== 12 || ciphertext.length < 16 || ciphertext.length > 1048592) {
    throw new Error('Invalid contact file.');
  }
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['decrypt']);
  try {
    return await crypto.subtle.decrypt({name: 'AES-GCM', iv, tagLength: 128,
      additionalData: new TextEncoder().encode(`vcard:1:${id}`)}, key, ciphertext);
  } catch {
    throw new Error('Cannot decrypt this contact. The key is incorrect or the file has changed.');
  }
}
