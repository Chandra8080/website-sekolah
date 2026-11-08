import slug from 'slug';

export function createSlug(text) {
  if (!text) return '';
  return slug(text, { lower: true });
}

export function generateRegistrationNo(prefix = 'PPDB') {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomStr}`;
}

export default createSlug;
