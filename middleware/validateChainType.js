const ALLOWED_TYPES = ["mainnet", "testnet"];

module.exports.validateChainType = (req, res, next) => {
  const { type } = req.params;
  const normalizedType = String(type).toLowerCase();

  if (!ALLOWED_TYPES.includes(normalizedType)) {
    return res.status(400).json({
      status: "error",
      code: "INVALID_CHAIN_TYPE",
      message: `Invalid 'type' parameter: '${type}'. Allowed values are: ${ALLOWED_TYPES.join(
        ", ",
      )}.`,
    });
  }

  next();
};
