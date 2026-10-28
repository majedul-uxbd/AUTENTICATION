const { db } = require("../db/index.js");
const { users } = require("../db/schema.js");
const { eq } = require("drizzle-orm");
const Joi = require("joi");
const { getLanguage, setServerResponse } = require("../utilities/set-server-response.js");

const userIdSchema = Joi.object({
    userId: Joi.number().integer().positive().required(),
});

const validateUserId = (req, res) => {
    const { error, value } = userIdSchema.validate(req.user, { abortEarly: false });
    if (error) {
        res.status(400).json(setServerResponse(400, "invalid_user_id", getLanguage(req), {
            errors: error.details.map((detail) => ({ field: detail.path.join("."), message: detail.message }))
        }));
        return null;
    }
    return value.userId;
};

// GET CURRENT USER
const getUser = async (req, res) => {
    try {
        const language = req.body.lg || "jp";
        const userId = validateUserId(req, res);
        if (userId === null) return;
        const [user] = await db
            .select({
                id: users.id,
                name: users.full_name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
        if (!user) {
            return res.status(404).json(setServerResponse(404, "user_not_found", language));
        }

        return res.status(200).json(setServerResponse(200, "user_found", language, { user }));
    } catch (error) {
        console.error(error);
        return res.status(500).json(setServerResponse(500, "internal_error", getLanguage(req)));
    }
};

// DELETE CURRENT USER
const deleteUser = async (req, res) => {
    try {
        const language = req.body.lg || "jp";
        const userId = validateUserId(req, res);
        if (userId === null) return;

        const deletedUsers = await db
            .delete(users)
            .where(eq(users.id, userId))
            .returning({ id: users.id });

        if (deletedUsers.length === 0) {
            return res.status(404).json(setServerResponse(404, "user_not_found", language));
        }

        return res.status(200).json(setServerResponse(200, "user_deleted", language));
    } catch (error) {
        console.error(error);
        return res.status(500).json(setServerResponse(500, "internal_error", getLanguage(req)));
    }
};

module.exports = { getUser, deleteUser };
