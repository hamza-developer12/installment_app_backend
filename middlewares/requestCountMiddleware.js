const requestCount = (req, res, next) => {
  let count = 0;
  count++;
  if (count === 1) {
    req.count = count;
    next();
  }
  return;
};

module.exports = { requestCount };
