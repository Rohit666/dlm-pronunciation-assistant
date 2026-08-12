const getPagination = (page, limit) => {
  const currentPage = parseInt(page) || 1;

  const pageLimit = parseInt(limit) || 10;

  const offset = (currentPage - 1) * pageLimit;

  return {
    currentPage,
    pageLimit,
    offset,
  };
};

const getPagingData = (totalItems, rows, currentPage, pageLimit) => {
  return {
    totalItems,

    totalPages: Math.ceil(totalItems / pageLimit),

    currentPage,

    itemsPerPage: pageLimit,

    rows,
  };
};

module.exports = {
  getPagination,
  getPagingData,
};
