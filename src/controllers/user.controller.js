const { API_STATUS_CODE } = require("../consts/error-status.js");
const { db } = require("../db/index.js");
const { users } = require("../db/schema.js");
const { eq } = require("drizzle-orm");

// GET CURRENT USER
const getUser = async (req, res) => {
    try {
        const [user] = await db
            .select({
                id: users.id,
                name: users.full_name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, req.user.userId))
            .limit(1);
        if (!user) {
            return res.status(API_STATUS_CODE.NOT_FOUND).send({
                status: "failed",
                message: "User not found",
            });
        }

        return res.status(API_STATUS_CODE.OK).send({
            status: "success",
            message: "User retrieved successfully",
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(API_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
            status: "failed",
            message: "Internal server error",
        });
    }
};

// DELETE CURRENT USER
const deleteUser = async (req, res) => {
    try {
        const deletedUsers = await db
            .delete(users)
            .where(eq(users.id, req.user.userId))
            .returning({ id: users.id });

        if (deletedUsers.length === 0) {
            return res.status(API_STATUS_CODE.NOT_FOUND).send({
                status: "failed",
                message: "User not found",
            });
        }

        return res.status(API_STATUS_CODE.OK).send({
            status: "success",
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(API_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
            status: "failed",
            message: "Internal server error",
        });
    }
};

module.exports = {
    getUser,
    deleteUser,
};