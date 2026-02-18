const express = require("express");

const app = express();

const path = require("path");

const fs = require("fs");

require("dotenv").config();

const { validateChainType } = require("./middleware/validateChainType");

app.use(express.static(path.resolve("public")));

app.get("/chainlist/:type", validateChainType, (req, res) => {
  const { type } = req.params;

  const filePath = path.join(
    __dirname,

    "blockchains",

    "chainlist",

    type,

    `${type}.json`,
  );

  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");

      const jsonData = JSON.parse(fileContent);

      // Update timestamp

      jsonData.timestamp = new Date().toISOString();

      return res.status(200).json(jsonData);
    } catch {
      return res.status(200).json({
        name: `${process.env.CHAIN_LIST_NAME} - ${type}`,

        timestamp: new Date().toISOString(),

        totalChains: 0,

        chains: [],
      });
    }
  } else
    return res.status(200).json({
      name: `${process.env.CHAIN_LIST_NAME} - ${type}`,

      timestamp: new Date().toISOString(),

      totalChains: 0,

      chains: [],
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
