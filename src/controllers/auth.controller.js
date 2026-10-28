const { db } = require("../db/index.js");
const { users } = require("../db/schema.js");
const { eq } = require("drizzle-orm");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { setServerResponse } = require("../utilities/set-server-response.js");

const registerSchema = Joi.object({
    full_name: Joi.string().trim().min(3).required().messages({ "any.required": "Name is required", "string.empty": "Name is required", "string.min": "Name must be at least 3 characters long" }),
    email: Joi.string().trim().email().required().messages({ "any.required": "Email is required", "string.empty": "Email is required", "string.email": "Invalid email address format" }),
    role: Joi.string().valid("admin", "user").default("user").messages({ "any.only": "Role must be either 'admin' or 'user'" }),
    password: Joi.string().min(8).required().messages({ "any.required": "Password is required", "string.empty": "Password is required", "string.min": "Password must be at least 8 characters long" }),
});

const loginSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({ "any.required": "Email is required", "string.empty": "Email is required", "string.email": "Invalid email address format" }),
    password: Joi.string().min(1).required().messages({ "any.required": "Password is required", "string.empty": "Password is required" }),
});

const validationMessageKey = (detail) => {
    const field = detail.path[0];
    if (field === "full_name") return detail.type === "string.min" ? "name_min" : "name_required";
    if (field === "email") return detail.type === "string.email" ? "email_invalid" : "email_required";
    if (field === "role") return "role_invalid";
    if (field === "password") return detail.type === "string.min" && detail.context?.limit === 8 ? "password_min" : "password_required";
    return "validation_failed";
};

const validationErrors = (error, language) => error.details.map((detail) => ({
    field: detail.path.join("."),
    message: setServerResponse(400, validationMessageKey(detail), language).message,
}));

// REGISTER
const register = async (req, res) => {
    try {
        const language = req.body.lg || "jp";
        const { error, value } = registerSchema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = validationErrors(error, language);

            return res.status(400).json(setServerResponse(400, "validation_failed", language, { errors }));
        }

        const { full_name, email, password, role } = value;
        const normalizedEmail = email.toLowerCase();

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, normalizedEmail))
            .limit(1);

        if (existingUser.length > 0) {
            return res.status(409).json(setServerResponse(409, "email_exists", language));
        }

        const hashedPassword = await bcrypt.hash(password, 12);

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

        return res.status(201).json(setServerResponse(201, "register_success", language, { user: newUser }));
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json(setServerResponse(409, "email_exists", language));
        }

        console.error(error);
        return res.status(500).json(setServerResponse(500, "internal_error", language));
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const language = req.body.lg || "jp";
        const { error, value } = loginSchema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = validationErrors(error, language);

            return res.status(400).json(setServerResponse(400, "validation_failed", language, { errors }));
        }

        const { email, password } = value;

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        if (!user) {
            return res.status(401).json(setServerResponse(401, "invalid_credentials", language));
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json(setServerResponse(401, "invalid_credentials", language));
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json(setServerResponse(200, "login_success", language, { token }));
    } catch (error) {
        console.error(error);
        return res.status(500).json(setServerResponse(500, "internal_error", language));
    }
};

module.exports = { register, login };
