const express = require("express");
const authentication = require("../middleware/authentication");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);

module.exports = router;
