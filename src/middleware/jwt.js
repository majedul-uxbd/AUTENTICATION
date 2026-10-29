const jwt = require("jsonwebtoken");
const { eq } = require("drizzle-orm");
const { API_STATUS_CODE } = require("../consts/error-status.js");
const { db } = require("../db/index.js");
const { users } = require("../db/schema.js");

/**
 * 
 * @description This middleware function is used to authenticate a user based on a JWT token
 * provided in the Authorization header of the request. It verifies the token, 
 * checks if the user exists in the database, and attaches the user ID to the request object for further processing.
 * @returns 
 */
const authenticateToken = async (req, res, next) => {
    const authorization = req.get("authorization");
    const match = authorization?.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
        return res.status(API_STATUS_CODE.UNAUTHORIZED).send({
            status: "failed",
            message: "A valid bearer token is required",
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(API_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
            status: "failed",
            message: "Authentication is not configured",
        });
    }

    let payload;
    try {
        payload = jwt.verify(match[1], process.env.JWT_SECRET);
    } catch {
        return res.status(API_STATUS_CODE.UNAUTHORIZED).send({
            status: "failed",
            message: "Invalid or expired token",
        });
    }

    if (!payload || typeof payload !== "object" || !Number.isInteger(payload.userId)) {
        return res.status(API_STATUS_CODE.UNAUTHORIZED).send({
            status: "failed",
            message: "Invalid token payload",
        });
    }

    try {
        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, payload.userId))
            .limit(1);

        if (!user) {
            return res.status(API_STATUS_CODE.UNAUTHORIZED).send({
                status: "failed",
                message: "User is no longer available",
            });
        }

        req.user = { userId: user.id };
        return next();
    } catch (error) {
        console.error(error);
        return res.status(API_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
            status: "failed",
            message: "Internal server error",
        });
    }
};

module.exports = {
    authenticateToken,
};