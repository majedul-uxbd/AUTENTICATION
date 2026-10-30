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


const { API_STATUS_CODE } = require("../../consts/error-status.js");
const { db } = require("../../db/index.js");
const { users } = require("../../db/schema.js");
const { eq } = require("drizzle-orm");
const { setServerResponse } = require("../../utilities/set-server-response.js");

/**
 * Get user data based on authentication data from JWT token.
 * @param {string} lg Language code for response messages. 
 * @param {{id: string, email: string, role: string}} authData Authentication data from JWT token. 
 * @returns 
 */
const getUserData = async (lg, authData) => {
    try {
        const [user] = await db
            .select({
                id: users.id,
                name: users.full_name,
                email: users.email,
                role: users.role,
                lastLoginDatetime: users.lastLoginDatetime,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, authData.id))
            .limit(1);
        if (!user) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.NOT_FOUND,
                    "user_not_found",
                    lg
                )
            );
        }

        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                "get_data_successfully",
                lg,
                user
            )
        );
    } catch (error) {
        console.error(error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                "internal_server_error",
                lg
            )
        );
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
    getUserData,
    deleteUser,
};