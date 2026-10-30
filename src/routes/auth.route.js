/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd> 
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Ultra-X Asia Pacific
 * 
 * @description 
 * 
 */

const express = require("express");
const authRoutes = express.Router();
const { registerDataValidator } = require("../middleware/auth/register-data-validator.js");
const { loginDataValidator } = require("../middleware/auth/login-data-validator.js");
const { loginUser } = require("../controllers/auth/login.controller.js");
const { registerNewUser } = require("../controllers/auth/register.controller.js");
const { authenticateToken } = require("../middleware/jwt.js");
const { getUserData } = require("../controllers/auth/user.controller.js");


authRoutes.post("/register",
    registerDataValidator,
    async (req, res) => {
        const { lg, registerData } = req.body;
        registerNewUser(lg, registerData)
            .then(data => {
                return res.status(data.statusCode).send({
                    status: data.status,
                    message: data.message
                })
            })
            .catch(error => {
                return res.status(error.statusCode).send({
                    status: error.status,
                    message: error.message,
                })
            })
    });


authRoutes.post("/login",
    loginDataValidator,
    async (req, res) => {
        const { lg, loginData } = req.body;
        loginUser(lg, loginData)
            .then(data => {
                return res.status(data.statusCode).send({
                    status: data.status,
                    message: data.message,
                    data: data.result
                })
            })
            .catch(error => {
                return res.status(error.statusCode).send({
                    status: error.status,
                    message: error.message,
                })
            })
    });

authRoutes.post("/get-user",
    authenticateToken,
    async (req, res) => {
        const { lg } = req.body;
        const authData = req.auth;
        getUserData(lg, authData)
            .then(data => {
                return res.status(data.statusCode).send({
                    status: data.status,
                    message: data.message,
                    data: data.result
                })
            })
            .catch(error => {
                return res.status(error.statusCode).send({
                    status: error.status,
                    message: error.message,
                })
            })
    });

module.exports = {
    authRoutes
};