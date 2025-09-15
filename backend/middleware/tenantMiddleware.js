// middleware/tenantMiddleware.js
module.exports = (req, res, next) => {
  const tenantId = req.headers["x-tenant-id"];
  if (!tenantId) {
    return res.status(400).json({ error: "x-tenant-id header missing" });
  }
  req.tenantId = parseInt(tenantId);
  next();
};
