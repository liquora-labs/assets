const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();

const ROOT_DIR = path.resolve(__dirname, "..");

async function fetchChains() {
  const { data } = await axios.get(process.env.CHAIN_LIST_API_URL, {
    timeout: 15_000,
  });

  if (!data?.result || !Array.isArray(data.result)) {
    throw new Error("Invalid chain list API response");
  }

  return data.result;
}

function transformChains(chains) {
  return chains.map((chain) => ({
    id: chain.chainid,
    name: chain.chainname,
    logoURI: `${process.env.PUBLIC_BASE_URL}/chains/${chain.chainid}.png`,
    blockExplorer: chain.blockexplorer,
  }));
}

function splitChains(chains) {
  const isMainnet = (name) => {
    const n = name.toLowerCase();
    return n.includes("mainnet") || !n.includes("testnet");
  };

  return {
    mainnets: chains.filter((c) => isMainnet(c.name)),
    testnets: chains.filter((c) => !isMainnet(c.name)),
  };
}

async function hasChainListChanged(filePath, newChains) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const existing = JSON.parse(raw);

    const existingIds = (existing.chains || [])
      .map((c) => c.id)
      .sort((a, b) => a - b);

    const newIds = newChains.map((c) => c.id).sort((a, b) => a - b);

    if (existingIds.length !== newIds.length) return true;

    return !existingIds.every((id, i) => id === newIds[i]);
  } catch {
    return true;
  }
}

async function saveChainList({ filePath, chains, type }) {
  const changed = await hasChainListChanged(filePath, chains);

  if (!changed) {
    console.log(`✅ ${type} list unchanged, no file written.`);
    return false;
  }

  const payload = {
    name: `${process.env.CHAIN_LIST_NAME} - ${type}`,
    timestamp: new Date().toISOString(),
    totalChains: chains.length,
    chains,
  };

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2));

  console.log(`✅ ${type} list saved: ${filePath}`);
  return true;
}

async function fetchAndSaveChainList() {
  try {
    console.log("🔄 Fetching chain list...");

    const rawChains = await fetchChains();
    const transformed = transformChains(rawChains);
    const { mainnets, testnets } = splitChains(transformed);

    const mainnetPath = path.resolve(
      ROOT_DIR,
      process.env.CHAIN_LIST_MAINNET_OUTPUT_PATH,
    );

    const testnetPath = path.resolve(
      ROOT_DIR,
      process.env.CHAIN_LIST_TESTNET_OUTPUT_PATH,
    );

    await Promise.all([
      saveChainList({
        filePath: mainnetPath,
        chains: mainnets,
        type: "mainnet",
      }),
      saveChainList({
        filePath: testnetPath,
        chains: testnets,
        type: "testnet",
      }),
    ]);

    console.log("✅ Chain list sync complete.");
  } catch (error) {
    console.error("❌ Error fetching chainlist:", error?.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  fetchAndSaveChainList();
}
