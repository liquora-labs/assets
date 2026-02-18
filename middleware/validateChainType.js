const allowedTypes = ["mainnet", "testnet"];

module.exports.validateChainType = (req, res, next) => {
  const { type } = req.params;
  if (!allowedTypes.includes(type.toLowerCase())) {
    return res.status(400).json({
      error: `Invalid type parameter. Allowed values: ${allowedTypes.join(", ")},`,
    });
  }
  next();
};
