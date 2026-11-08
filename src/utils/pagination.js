export function getPagination(req, defaultLimit = 10) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationMeta(totalItems, currentPage, limit, currentUrl = '') {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return {
    totalItems,
    currentPage,
    totalPages,
    limit,
    hasPrev,
    hasNext,
    prevPage: hasPrev ? currentPage - 1 : null,
    nextPage: hasNext ? currentPage + 1 : null,
    currentUrl
  };
}

export default {
  getPagination,
  buildPaginationMeta
};
