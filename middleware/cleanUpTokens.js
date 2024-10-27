const cron = require('node-cron');
const { PasswordReset } = require('../models/modelUserSchema');

const deleteExpiredTokens = async () => {
    try{
        await PasswordReset.deleteMany({ tokenExpires : {$lt : Date.now()} });

        console.log('Expired tokens deleted successfully');
    } catch (error) {
        console.error(' Error deleting the expired tokens : ', error);
    }
};

cron.schedule('0 0 * * *', deleteExpiredTokens);

module.exports = deleteExpiredTokens;