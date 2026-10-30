const jwt = require("jsonwebtoken");
const { eq } = require("drizzle-orm");
const { API_STATUS_CODE } = require("../consts/error-status.js");
const { db } = require("../db/index.js");
const { users } = require("../db/schema.js");
const { setServerResponse } = require("../utilities/set-server-response.js");

/**
 * 
 * @description This middleware function is used to authenticate a user based on a JWT token
 * provided in the Authorization header of the request. It verifies the token, 
 * checks if the user exists in the database, and attaches the user ID to the request object for further processing.
 * @returns 
 */
const authenticateToken = async (req, res, next) => {
    const lgKey = req.body.lg;
    const authorization = req.get("authorization");
    const match = authorization?.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
        return res.status(API_STATUS_CODE.UNAUTHORIZED).send(
            setServerResponse(
                API_STATUS_CODE.UNAUTHORIZED,
                "authorization_token_is_required",
                lgKey
            )
        );
    }

    if (!process.env.JWT_SECRET) {
        return res.status(API_STATUS_CODE.INTERNAL_SERVER_ERROR).send(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                "authentication_is_not_configured",
                lgKey
            )
        );
    }

    let payload;
    try {
        payload = jwt.verify(match[1], process.env.JWT_SECRET);
    } catch {
        return res.status(API_STATUS_CODE.UNAUTHORIZED).send(
            setServerResponse(
                API_STATUS_CODE.UNAUTHORIZED,
                "authorization_token_is_invalid_or_expired",
                lgKey
            )
        );
    }

    if (!payload || typeof payload !== "object" || !Number.isInteger(payload.id)) {
        return res.status(API_STATUS_CODE.UNAUTHORIZED).send(
            setServerResponse(
                API_STATUS_CODE.UNAUTHORIZED,
                "invalid_authorization_token",
                lgKey
            )
        );
    }

    try {
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                role: users.role,
            })
            .from(users)
            .where(
                eq(users.id, payload.id),
                eq(users.email, payload.email),
                eq(users.role, payload.role)
            )
            .limit(1);

        if (!user) {
            return res.status(API_STATUS_CODE.UNAUTHORIZED).send(
                setServerResponse(
                    API_STATUS_CODE.UNAUTHORIZED,
                    "user_is_no_longer_available",
                    lgKey
                )
            );
        }

        req.auth = { id: user.id, email: user.email, role: user.role };
        next();
    } catch (error) {
        console.error(error);
        return res.status(API_STATUS_CODE.INTERNAL_SERVER_ERROR).send(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                "internal_server_error",
                lgKey
            )
        );
    }
};

module.exports = {
    authenticateToken,
};