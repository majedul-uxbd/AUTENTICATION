import { Router } from "express";
import {
    getUser,
    deleteUser,
} from "../controllers/user.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", authMiddleware, getUser);
router.delete("/me", authMiddleware, deleteUser);

export default router;