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



const NodeCache = require("node-cache");

// Shared cache instance (stdTTL: 60s or customize as needed)
const cache = new NodeCache({ stdTTL: 60 });

module.exports = {
    cache
};
