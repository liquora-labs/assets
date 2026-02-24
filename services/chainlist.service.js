const fs = require("fs/promises");
const path = require("path");

const BASE_DIR = path.join(__dirname, "..", "blockchains", "chainlist");

const buildFallback = (type) => {
  return {
    name: `${process.env.CHAIN_LIST_NAME} - ${type}`,
    timestamp: new Date().toISOString(),
    totalChains: 0,
    chains: [],
  };
};

module.exports.fetchChainList = async (type) => {
  const filePath = path.join(BASE_DIR, type, `${type}.json`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(fileContent);

    // dynamic timestamp refresh
    jsonData.timestamp = new Date().toISOString();

    return jsonData;
  } catch {
    // file missing or invalid
    return buildFallback(type);
  }
};
