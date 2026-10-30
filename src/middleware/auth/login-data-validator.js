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


const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.empty": "email_is_required",
            "string.email": "invalid_email_address",
            "any.required": "email_is_required",
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
const loginDataValidator = (req, res, next) => {
    const lgKey = req.body.lg;
    const { error, value } = loginSchema.validate(req.body, {
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
    req.body.loginData = {
        email: normalizedEmail,
        password: value.password,
    };
    next();
};

module.exports = {
    loginDataValidator,
};