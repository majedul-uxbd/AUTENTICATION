const express = require("express");
const { Router } = express;
const {
    getUser,
    deleteUser,
} = require("../controllers/user.controller.js");

const { authenticateToken } = require("../middleware/jwt.js");

const userRoutes = Router();

userRoutes.get("/me", authenticateToken, getUser);
userRoutes.delete("/me", authenticateToken, deleteUser);

module.exports = {
    userRoutes
};