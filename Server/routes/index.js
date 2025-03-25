require("dotenv").config();
const router = require("express").Router();
const favController = require("../controllers/favController");
const { verifyToken } = require("../helper/jwt");

const favRoutes = require("./favorite");
const userRoutes = require("./user");

router.use("/fav", favRoutes);
router.use("/users", userRoutes);
router.post("/sortHat", favController.sortHat);

module.exports = router;
