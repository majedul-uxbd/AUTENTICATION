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

const Joi = require("joi");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { setServerResponse } = require("../../utilities/set-server-response");


const registerSchema = Joi.object({
    full_name: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.empty": "user_full_name_is_required",
            "string.min": "fullname_must_be_at_least_3_characters",
            "string.max": "fullname_must_not_exceed_100_characters",
            "any.required": "user_full_name_is_required",
        }),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.empty": "email_is_required",
            "string.email": "invalid_email_address",
            "any.required": "email_is_required",
        }),
    role: Joi.string()
        .valid("admin", "user")
        .default("user")
        .messages({
            "any.only": "user_role_is_not_valid",
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.empty": "password_is_required",
            "string.min": "password_must_be_at_least_6_characters",
            "any.required": "password_is_required",
        }),
});

/**
 * @description
 * Register API Data Validation Middleware.
 * This middleware validates the register data using Joi schema validation.
 * @returns {Function}
 */
const registerDataValidator = (req, res, next) => {
    const lgKey = req.body.lg;
    const registerData = {
        full_name: req.body.full_name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
    }
    const { error, value } = registerSchema.validate(registerData, {
        abortEarly: false,
    });

    if (error) {
        const messageKey = error.details[0]?.message;
        const response = setServerResponse(
            API_STATUS_CODE.BAD_REQUEST,
            messageKey,
            lgKey
        );
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(response);
    }

    const normalizedEmail = value.email.toLowerCase();
    req.body.registerData = {
        full_name: value.full_name,
        email: normalizedEmail,
        password: value.password,
        role: value.role,
    };

    next();
};

module.exports = {
    registerDataValidator,
};