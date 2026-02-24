const express = require("express");

const { getChainList } = require("../controllers/chainlist.controller");
const { validateChainType } = require("../middleware/validateChainType");

const router = express.Router();

router.get("/:type", validateChainType, getChainList);

module.exports = router;
