const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
//#############################################################################
//user schema
//#############################################################################
const UserSchema = new mongoose.Schema({
    name: { type : String, required : true },
    userName: { type : String, required : true, unique : true },
    email: { type : String, required : true, unique : true },
    mobile: { type : Number, required : true, unique : true },
    password: { type : String, required : true },
    blocked: { type : Boolean, required : true},
    role : { type : String, required : true},
},{timestamps : true}
);

//hashing passeord before storing to DB
UserSchema.pre('save', async function (next){
    if(this.isNew || this.isModified('password')){
        const document = this;
        try{
            const hashedPassword = await bcrypt.hash(document.password, saltRounds);
            document.password = hashedPassword;
            next();
        }catch(err){
            next(err);
        }
    }else{
        next();
    }
});

const User = mongoose.model('User', UserSchema);

//###################################################################################
//schema for reseting password
//####################################################################################

const passwordResetSchema = new mongoose.Schema({
    userId : { type : mongoose.Schema.Types.ObjectId,
               required : true, ref : 'User' },
    resetToken : { type : String, required : true},
    tokenExpires : { type : Date, required : true},
},{timestamps: true},
)

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

//##################################################################################################
//Deleted User schema
//###################################################################################################
const DeletedUserSchema = new mongoose.Schema({
    name: { type : String, required : true },
    userName: { type : String, required : true },
    email: { type : String, required : true },
    mobile: { type : Number, required : true },
    password: { type : String, required : true },
    blocked: { type : Boolean, required : true},
},{timestamps : true}
);

const DeletedUser = mongoose.model('DeletedUser', DeletedUserSchema);

module.exports = { User, PasswordReset, DeletedUser };