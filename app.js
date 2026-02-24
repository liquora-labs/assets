const express = require("express");
const path = require("path");
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const morgan = require("morgan");

const chainlistRoutes = require("./routes/chainlist.routes");
const {
  errorHandler,
  notFound,
} = require("./middleware/errorHandler.middleware");
const {
  rateLimiterMiddleware,
} = require("./middleware/rateLimiter.middleware");

require("dotenv").config();

const app = express();

app.use(helmet());
app.use(hpp());
app.use(cors({ origin: "*", methods: ["GET"] }));

app.use(morgan("combined"));

app.use(rateLimiterMiddleware);

app.use(express.static(path.resolve("public")));

app.use("/chainlist", chainlistRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
