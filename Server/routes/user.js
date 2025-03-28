const express = require("express");
const authentication = require("../middleware/authentication");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/googleLogin", userController.googleLogin);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", authentication, userController.getUserProfile);

module.exports = router;
