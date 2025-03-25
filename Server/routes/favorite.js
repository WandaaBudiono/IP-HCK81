const express = require("express");
const favController = require("../controllers/favController");
const authentication = require("../middleware/authentication");

const router = express.Router();
router.use(authentication);

router.post("/sortHat", favController.sortHat);
router.post("/:CharacterId", favController.add);
router.get("/", favController.getAll);
router.get("/:CharacterId", favController.getCharacterDetail);
router.delete("/:CharacterId", favController.deleteFavorite);

// Export the router
module.exports = router;
