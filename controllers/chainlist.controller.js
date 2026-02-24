const chainlistService = require("../services/chainlist.service");

module.exports.getChainList = async (req, res) => {
  const { type } = req.params;

  try {
    const data = await chainlistService.fetchChainList(type);
    return res.status(200).json(data);
  } catch (error) {
    console.error("❌ Controller error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
