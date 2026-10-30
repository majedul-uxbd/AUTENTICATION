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


/**
 * 
 * @description This function is used to register a new user. It validates the request body, 
 * checks for existing users, hashes the password, and inserts the new user into the database.
 * @returns 
 */
const registerNewUser = async (lg, registerData) => {
    try {
        const isExist = await db
            .select()
            .from(users)
            .where(eq(users.email, registerData.email))
            .limit(1);

        if (isExist.length > 0) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    "email_already_registered",
                    lg
                )
            );
        }

        const hashedPassword = await argon2.hash(registerData.password);

        const [newUser] = await db
            .insert(users)
            .values({
                full_name: registerData.full_name,
                email: registerData.email,
                password: hashedPassword,
                ...(registerData.role ? { role: registerData.role } : {}),
            });

        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                "user_registered_successfully",
                lg,
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

// LOGIN
const login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message,
            }));

            return res.status(API_STATUS_CODE.BAD_REQUEST).send({
                status: "failed",
                message: errors[0]?.message
            });
        }

        const { email, password } = value;

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        if (!user) {
            return res.status(API_STATUS_CODE.UNAUTHORIZED).send({
                status: "failed",
                message: "Invalid credentials",
            });
        }

        const isMatch = await argon2.verify(
            user.password,
            password
        );

        if (!isMatch) {
            return res.status(API_STATUS_CODE.UNAUTHORIZED).send({
                status: "failed",
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(API_STATUS_CODE.OK).send({
            status: "success",
            message: "Login successfully",
            token,
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
    registerNewUser,
    login,
};