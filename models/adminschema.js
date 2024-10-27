const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Admin Schema
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    blocked: { type: Boolean, required: true },
    role: { type: String, required: true },
    about : { type : String, },
    country : { type : String, },
    address : { type : String, },
}, { timestamps: true });

// Hashing password before storing to DB
adminSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        const document = this;
        try {
            const hashedPassword = await bcrypt.hash(document.password, saltRounds);
            document.password = hashedPassword;
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = { Admin };
