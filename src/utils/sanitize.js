import sanitizeHtml from 'sanitize-html';

export function sanitize(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';

  return sanitizeHtml(dirty, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'img', 'span'
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'],
      iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
      table: ['class', 'border', 'cellpadding', 'cellspacing'],
      '*': ['class', 'style', 'id']
    },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com', 'maps.google.com', 'www.google.com']
  });
}

export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} }).trim();
}

export default sanitize;
