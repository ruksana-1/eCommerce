const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        await mongoose.connect('mongodb://localhost/DB');
        console.log('MongoDB Connected...');
    } catch (err){
        console.error(err.message);
    }
}
module.exports = connectDB;