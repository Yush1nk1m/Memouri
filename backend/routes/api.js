const express = require("express");
const router = express.Router();

const user = require("./users");    
router.use("/users", user);

const group = require("./groups");
router.use("/groups", group);

const video = require("./videos");
router.use("/videos", video);

module.exports = router;