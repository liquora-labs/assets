const axios = require("axios");

const fs = require("fs");

const path = require("path");

 

require("dotenv").config();

 

const fetchAndSaveChainList = async () => {

  try {

    const { data } = await axios.get(process.env.CHAIN_LIST_API_URL);

 

    // Transform API data

    const transformedChains = data.result.map((chain) => ({

      id: chain.chainid,

      name: chain.chainname,

      blockExplorer: chain.blockexplorer,

    }));

 

    const testnetKeywords = ["testnet", "rinkeby", "ropsten"];

 

    // Separate mainnets and testnets (inline)

    const mainnets = transformedChains.filter(

      (chain) =>

        !testnetKeywords.some((keyword) =>

          chain.name.toLowerCase().includes(keyword),

        ),

    );

 

    const testnets = transformedChains.filter((chain) =>

      testnetKeywords.some((keyword) =>

        chain.name.toLowerCase().includes(keyword),

      ),

    );

 

    const ROOT_DIR = path.resolve(__dirname, "..");

 

    // -------------------------

    // Save mainnets

    // -------------------------

    const mainnetPath = path.resolve(

      ROOT_DIR,

      process.env.CHAIN_LIST_MAINNET_OUTPUT_PATH,

    );

    const mainnetData = {

      name: `${process.env.CHAIN_LIST_NAME} - mainnet,`,

      timestamp: new Date().toISOString(),

      totalChains: mainnets.length,

      chains: mainnets,

    };

 

    let writeMainnet = true;

    if (fs.existsSync(mainnetPath)) {

      const existing = JSON.parse(fs.readFileSync(mainnetPath, "utf-8"));

      const existingIds = existing.chains.map((c) => c.id);

      const newIds = mainnets.map((c) => c.id);

      writeMainnet =

        existingIds.length !== newIds.length ||

        !existingIds.every((id, index) => id === newIds[index]);

    }

 

    if (writeMainnet) {

      fs.mkdirSync(path.dirname(mainnetPath), { recursive: true });

      fs.writeFileSync(mainnetPath, JSON.stringify(mainnetData, null, 2));

      console.log(`✅ mainnet list saved: ${mainnetPath}`);

    } else {

      console.log("✅ mainnet list unchanged, no file written.");

    }

 

    // -------------------------

    // Save testnets

    // -------------------------

    const testnetPath = path.resolve(

      ROOT_DIR,

      process.env.CHAIN_LIST_TESTNET_OUTPUT_PATH,

    );

    const testnetData = {

      name: `${process.env.CHAIN_LIST_NAME} - testnet`,

      timestamp: new Date().toISOString(),

      totalChains: testnets.length,

      chains: testnets,

    };

 

    let writeTestnet = true;

    if (fs.existsSync(testnetPath)) {

      const existing = JSON.parse(fs.readFileSync(testnetPath, "utf-8"));

      const existingIds = existing.chains.map((c) => c.id);

      const newIds = testnets.map((c) => c.id);

      writeTestnet =

        existingIds.length !== newIds.length ||

        !existingIds.every((id, index) => id === newIds[index]);

    }

 

    if (writeTestnet) {

      fs.mkdirSync(path.dirname(testnetPath), { recursive: true });

      fs.writeFileSync(testnetPath, JSON.stringify(testnetData, null, 2));

      console.log(`✅ testnet list saved: ${testnetPath}`);

    } else {

      console.log("✅ testnet list unchanged, no file written.");

    }

  } catch (err) {

    console.error("❌ Error fetching chainlist:", err?.message);

  }

};

 

if (require.main === module) {

  fetchAndSaveChainList();

}