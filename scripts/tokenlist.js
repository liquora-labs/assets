const axios = require("axios");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const ROOT_DIR = path.resolve(__dirname, "..");

const TOKENS_DIR = path.join(ROOT_DIR, "public", "tokens");

if (!fs.existsSync(TOKENS_DIR)) {
  fs.mkdirSync(TOKENS_DIR, { recursive: true });
}

const normalizeLogoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("ipfs://")) {
    const hash = url.replace("ipfs://", "");
    return `${process.env.IPF_GATEWAY}/${hash}`;
  }
  return url;
};

const download = async (url, destination) => {
  try {
    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
      timeout: 15000,
      headers: { "User-Agent": "Mozilla/5.0" },
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
    });
    const contentType = response.headers["content-type"];
    if (!contentType || !contentType.startsWith("image/")) {
      throw new Error(`Not an image. Content-Type: ${contentType}`);
    } // Adjust file extension if needed (e.g. svg)
    const ext = contentType.includes("svg") ? ".svg" : ".png";
    const finalPath = destination.endsWith(ext)
      ? destination
      : destination.replace(/\.\w+$/, ext);
    const writer = fs.createWriteStream(finalPath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(finalPath));
      writer.on("error", (err) => {
        if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
        reject(err);
      });
    });
  } catch (err) {
    if (fs.existsSync(destination)) {
      fs.unlinkSync(destination);
    }
    throw err;
  }
};
const fetchAndSaveTokens = async () => {
  try {
    const { data } = await axios.get(process.env.TOKEN_LIST_API_URL);
    const tokens = data.tokens;
    for (const token of tokens) {
      if (!token.logoURI || !token.address) continue;
      const baseFileName = token.address.toLowerCase();
      const filePath = path.join(TOKENS_DIR, baseFileName + ".png");
      // Check if file already exists (with either .png or .svg)
      const pngPath = path.join(TOKENS_DIR, baseFileName + ".png");
      const svgPath = path.join(TOKENS_DIR, baseFileName + ".svg");
      if (fs.existsSync(pngPath) || fs.existsSync(svgPath)) {
        console.log(`✅ Already exists: ${baseFileName}`);
        continue;
      }
      const logoURI = normalizeLogoUrl(token.logoURI);

      if (!logoURI) continue;
      try {
        const savedPath = await download(logoURI, filePath);
        console.log(`⬇️ Downloaded: ${baseFileName} -> ${savedPath}`);
      } catch (err) {
        console.error(`❌ Failed to download ${baseFileName}:`, err.message);
      }
    }
    const tokensByChainId = tokens.reduce((acc, token) => {
      if (!token.chainId) return acc;
      // skip tokens without chainId
      if (!acc[token.chainId]) {
        acc[token.chainId] = [];
      }
      acc[token.chainId].push(token);
      return acc;
    }, {});
    console.log({ tokensByChainId });
    for (const chainId of Object.keys(tokensByChainId)) {
      const ROOT_DIR = path.resolve(__dirname, "..");
      const OUTPUT_DIR = path.join(ROOT_DIR, "blockchains", "tokenlist");
      const chainDir = path.join(OUTPUT_DIR, chainId);

      // create folder if not exists
      fs.mkdirSync(chainDir, { recursive: true });

      const filePath = path.join(chainDir, "tokenlist.json");
      const existingFiles = new Set(fs.readdirSync(TOKENS_DIR));
      fs.writeFileSync(
        filePath,
        JSON.stringify(
          {
            name: process.env.TOKEN_LIST_NAME,
            chainId: Number(chainId),
            timestamp: new Date().toISOString(),
            tokenCount: tokensByChainId[chainId].length,
            tokens: tokensByChainId[chainId].map((token) => {
              const address = token.address.toLowerCase();
              const found = [...existingFiles].find((file) =>
                file.startsWith(address + "."),
              );
              return {
                address,
                name: token.name,
                symbol: token.symbol,
                decimals: token.decimals,
                logoURI: `${process.env.PUBLIC_BASE_URL}/tokens/${found || "generic.png"}`,
              };
            }),
          },
          null,
          2,
        ),
      );

      console.log(`✅ Generated: ${filePath}`);
    }
  } catch (err) {
    console.error("❌ Error fetching token list:", err?.message);
  }
};
if (require.main === module) {
  fetchAndSaveTokens();
}
