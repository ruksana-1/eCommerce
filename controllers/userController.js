const { User, PasswordReset } = require('../models/modelUserSchema');
const bcrypt = require('bcrypt');
const { createToken } = require('../middleware/jwtMiddleware');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.home = (req, res) => {
    if(req.session.validated && req.user === 'user'){
       return res.render('home');
    }else{
        res.render('login');
    }   
};

exports.login = async (req, res) => {
    
    try {
        if(req.session.validated){
            return res.render('home');
        }

        const adminName = 'admin';
        const adminPsswrd = '12345';

        const {email, password} = req.body;

        if(email === adminName && password === adminPsswrd) {
            req.session.user = 'Admin' ;
            return res.render('adminHome')
        }

        const user = await User.findOne({$or : [{email : email}, {userName : email}]});

        if(!user){
            return res.render('login', {error : '!!!..Invalid username/email..!!!'});
        }

        const isPsswrdMatch = await bcrypt.compare(password, user.password);

        if(!isPsswrdMatch){
            return res.render('login',{ error: '!!!..Invalid Password..!!!' });
        }

        if(user.blocked){
            return res.render('login',{msg : '!!!..You Are Blocked..!!!'});
        }

        //create jwt token
        const token = createToken(user);

        // Create a session
        req.session.validated = true;
        req.session.user = 'User';

        res.render('home');
    } catch (error) {
        console.error(error);
        res.render('login', {error : 'An unexpected error occured.'})
    }
};

exports.signup = async (req,res) => {

    try {
        const {name, userName, email, mobile, password } = req.body;
        const blocked = 0;
        const role = 'user';

        //check email and userName are unique
        const userExist = await User.findOne({userName});
        const emailExist = await User.findOne({email});
        const mobileExist = await User.findOne({mobile});
        if (userExist) {
           return res.render('login', {err: '!!!..User With Given Username Already Exists..!!!'})   
        }
        if (emailExist) {
            return res.render('login', {err: '!!!..User With Given Email Already Exists..!!!'});
        }
        if (mobileExist) {
            return res.render('login', {err: '!!!...User With Given Mobile Already Exists..!!!'})
        }

        //create a new user to database
        const user = new User({
            name, 
            userName,
            email,
            mobile,
            password,
            blocked,
            role,
        });

        console.log(user);
        //adding new user to db
        const savedUser = await user.save();

        //create jwt token
        const token = createToken(savedUser);
        
        //create session
        req.session.validated = true;
        req.session.user = 'User';

        res.render('home');
    }catch (error) {
        console.log(error);
        res.status(500).json({error: 'There was an error registering the user.'});
    }

};

exports.forgotPassword = (req, res) => {
    res.render('forgotPassword');
}

exports.resetPassword_link = async (req, res) => {
    try{
        const { email } = req.body;
        const user = await User.findOne({$or : [{email : email}, {userName : email}]});

        if(!user){
            return res.render('forgotPassword', { error : '!!!..User Not Found..!!!' , text : ' Please check your details and try again.'})
        }

        // a link is valid for only 10 minute
        const recentRequest = await PasswordReset.findOne({ userId : user._id , tokenExpires : {$gt : Date.now() - 10*60*1000} });

        if(recentRequest){
            return res.render('forgotPassword', {error : 'Too Many Requests', text : 'You can request a new link only after 10 minutes. '})
        }

        //generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        const passwordReset = new PasswordReset({
            userId : user._id,
            resetToken : resetToken,
            tokenExpires : Date.now() + 10*60*1000,    // 10 mnts
        });

        await passwordReset.save();

        console.log('Password reset saved:', passwordReset);


        //send reset link through email
        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : 'ruksankalam@gmail.com',
                pass : 'hedo txaz xeje lgzj',
            }
        });

        const resetUrl = `http://${req.headers.host}/resetPassword_form/${resetToken}`;
        
        const mailOptions = {
            to : user.email,
            from : process.env.EMAIL,
            subject : 'Password Reset Link',
            text : ` Hi ${user.userName},
                       You are receiving this email because you (or someone else) have requested the reset of the password for your account.
                   Please click on the following link, or paste this into your browser to complete the process: (the link is valid for only 10 minute.\n
                   ${resetUrl}\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n\n
                   LuxeWalk.`
        }

        await transporter.sendMail(mailOptions);

        res.render('forgotPassword', { message : '!!!..Check your Email..!!!', text : 'A password reset link has been sent to ' + user.email + '.'});

    } catch (error) {
        console.error(error);
        res.render('forgotPassword', { error : '!!!...Error...!!!', text : 'An error occured while sending the password reset link.'})
    }
};

exports.resetPassword_form = async (req, res) => {
    try {
        const { token } = req.params;
        const passwordReset = await PasswordReset.findOne({resetToken : token, tokenExpires : { $gt : Date.now() - 10*60*1000} });

        if( !passwordReset ){
            return res.render('resetPassword', {error : 'Invalid Token', text : 'Please Request a new password reset link  '});
        }

        console.log('token from resetPasswordForm :' + JSON.stringify(token))
        res.render('resetPassword');    
    } catch (error){
        console.error(error);
        res.render('resetPassword', {error : 'Error', text : 'An error occurred while processing your request.'})
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user
        const user = await User.findOne({ email : email });

        if (!user) {
            console.log('User not found');
            return res.render('resetPassword', { error: 'User not found', text: 'An error occurred, user not found' });
        }

        const passwordReset = await PasswordReset.findOne({ userId : user._id, tokenExpires : {$gt : Date.now()}} );

        if (!passwordReset) {
            console.log('Password reset not found');
            return res.render('resetPassword', { error: 'Invalid Token', text: 'Please request a new password reset link  ' });
        }

        // Update the user's password
        user.password = password;
        await user.save();

        // Delete the password reset request
        await PasswordReset.deleteOne({ _id: passwordReset._id });

        res.render('resetPassword', { message: 'Password reset successful', text: 'You can login now using your new password' });

    } catch (error) {
        console.error(error);
        res.render('resetPassword', { error: 'An error occurred.', text: 'Go back to login' });
    }
};
