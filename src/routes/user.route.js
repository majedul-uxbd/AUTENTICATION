const { Router } = require("express");
const { getUser, deleteUser } = require("../controllers/user.controller.js");

const { authMiddleware } = require("../middleware/auth.middleware.js");

const router = Router();

router.post("/me", authMiddleware, getUser);
router.delete("/me", authMiddleware, deleteUser);

module.exports = router;
