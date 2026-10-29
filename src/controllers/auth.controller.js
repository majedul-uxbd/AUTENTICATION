const { db } = require("../db/index.js");
const { users } = require("../db/schema.js");
const { eq } = require("drizzle-orm");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const argon2 = require("argon2");
const { setServerResponse } = require("../utilities/set-server-response.js");
const { API_STATUS_CODE } = require("../consts/error-status.js");


const registerSchema = Joi.object({
    full_name: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required(),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
    role: Joi.string()
        .valid("admin", "user")
        .default("user")
        .messages({
            "any.only": "Role must be either 'admin' or 'user'",
        }),
    password: Joi.string()
        .min(6)
        .required()
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
    password: Joi.string()
        .min(6)
        .required(),
});

/**
 * 
 * @description This function is used to register a new user. It validates the request body, 
 * checks for existing users, hashes the password, and inserts the new user into the database.
 * @returns 
 */
const register = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body, {
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
            })
        }

        const { full_name, email, password, role } = value;
        const normalizedEmail = email.toLowerCase();

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, normalizedEmail))
            .limit(1);

        if (existingUser.length > 0) {
            return res.status(API_STATUS_CODE.CONFLICT).send({
                status: "failed",
                message: "Email already registered",
            });
        }

        const hashedPassword = await argon2.hash(password);

        const [newUser] = await db
            .insert(users)
            .values({
                full_name: full_name,
                email: normalizedEmail,
                password: hashedPassword,
                ...(role ? { role } : {}),
            })
            .returning({
                id: users.id,
                full_name: users.full_name,
                email: users.email,
                role: users.role,
            });

        return res.status(API_STATUS_CODE.CREATED).send({
            status: "success",
            message: "User registered successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(API_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
            status: "failed",
            message: "Internal server error",
        });
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
    register,
    login,
};