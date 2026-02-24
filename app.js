const express = require("express");

const app = express();

const path = require("path");

const chainlistRoutes = require("./routes/chainlist.routes");
const {
  errorHandler,
  notFound,
} = require("./middleware/errorHandler.middleware");

require("dotenv").config();

app.use(express.static(path.resolve("public")));

app.use(express.json());

app.use("/chainlist", chainlistRoutes);

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
