const express = require("express");
const favController = require("../controllers/favController");
const authentication = require("../middleware/authentication");

const router = express.Router();
router.use(authentication);

router.get("/", favController.getAll);
router.post("/:CharacterId", favController.add);

// Export the router
module.exports = router;
