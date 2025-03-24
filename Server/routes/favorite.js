const express = require("express");
const favController = require("../controllers/favController");
const { authorization, isAdmin } = require("../middleware/authorization");
const authentication = require("../middleware/authentication");

const router = express.Router();
router.use(authentication);

router.get("/", favController.getAll);

// Export the router
module.exports = router;
