const jwt = require('jsonwebtoken');
const Blacklist = require('../models/blackListSchema');

async function blacklistToken( token ) {
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);
    
    const blacklistedToken = new Blacklist({ token, expiresAt });
    await blacklistedToken.save();
}


module.exports = blacklistToken;
