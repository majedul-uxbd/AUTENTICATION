const jwt = require("jsonwebtoken");
const { setServerResponse } = require("../utilities/set-server-response.js");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const language = req.body.lg || "jp";

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json(setServerResponse(401, "access_denied", language));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json(setServerResponse(401, "invalid_token", language));
    }
};

module.exports = { authMiddleware };
