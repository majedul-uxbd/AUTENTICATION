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


const path = require('path');
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * @description This file contains the path to the placeholder image used in the user's profile.
 */
const placeholderImagePath = 'uploads/placeholder/placeholder-image.png';

/**
 * OTP expire time
 */
const OTP_EXPIRED_PERIOD_IN_MINS = 5;

const FRONTEND_URL = isDevelopment ? 'http://192.168.88.27:3000/CRM/en' : 'https://bdtmp.ultra-x.jp/crm/en';
const VERIFY_OTP_URL = 'verify-otp';
const USER_LOGIN = 'login';



module.exports = {
    placeholderImagePath,
    OTP_EXPIRED_PERIOD_IN_MINS,
    FRONTEND_URL,
    VERIFY_OTP_URL,
    USER_LOGIN
}