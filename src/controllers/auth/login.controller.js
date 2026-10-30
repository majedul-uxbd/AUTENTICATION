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


const { db } = require("../../db/index.js");
const { users } = require("../../db/schema.js");
const { eq } = require("drizzle-orm");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const { API_STATUS_CODE } = require("../../consts/error-status.js");
const { setServerResponse } = require("../../utilities/set-server-response.js");
const { cache } = require("../../common/cache.js");


/**
 * Generates a JWT token for the given user info.
 * @param {{ id: number, email: string, role: string, image_url: string, lastLoginDatetime: Date }} userInfo - The user information for the token payload.
 * @returns {string} The generated JWT token.
 * @description This function will generate a unique user token.
 */
const generateToken = (userInfo, lastLoginDatetime) => {
    const token = jwt.sign(
        {
            id: userInfo.id,
            email: userInfo.email,
            role: userInfo.role,
            lastLoginDatetime: lastLoginDatetime,
            imageUrl: userInfo.image_url,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );

    return token;
};

// LOGIN
const loginUser = async (lg, loginData) => {
    try {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, loginData.email))
            .limit(1);

        if (!user) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.UNAUTHORIZED,
                    "invalid_email_or_password",
                    lg
                )
            );
        }

        const isMatch = await argon2.verify(
            user.password,
            loginData.password
        );

        if (!isMatch) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.UNAUTHORIZED,
                    "invalid_email_or_password",
                    lg
                )
            );
        }
        const lastLoginDatetime = new Date();


        await db
            .update(users)
            .set({
                lastLoginDatetime: lastLoginDatetime,
            })
            .where(eq(users.id, user.id));

        const token = generateToken(user, lastLoginDatetime);
        const userData = {
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
                imageUrl: user.imageUrl,
                lastLoginDatetime: lastLoginDatetime,
            }
        }
        cache.set("userData", userData)
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                "login_successfully",
                lg,
                userData
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

module.exports = {
    loginUser,
};