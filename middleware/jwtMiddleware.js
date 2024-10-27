const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;
const Blacklist = require('../models/blackListSchema');
const { Admin, AdminProfile } = require('../models/adminschema');

//#############################################################################
//jwt token creation
//#############################################################################

const createToken = (data) => {
    const playload = { id : data._id, 
                      email : data.email,
                      role : data.role };

    return jwt.sign ( playload, secretKey, {expiresIn : '7d'});
};

//#############################################################################
//authectication of token 
//#############################################################################

const authenticateToken = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        console.log('No token found in cookies');
        return res.render('adminLogin');
    }

    //---------------------------------------------------------------------------
    //blacklisted token checking
    //---------------------------------------------------------------------------

    const blacklistedToken = await Blacklist.findOne({ token });
    if( blacklistedToken ){
        console.log('Token is blacklisted.');
        return res.redirect('/admin');
    }

    jwt.verify (token, secretKey, async (err,decoded) => {
        if(err) {
            console.log('Error verifying token:', err);
            return res.render('errorPage', { error : 'Invalid token.', status : '401'});
        }
        console.log('Decoded token:', decoded);
        
        //token playload { email, id, role }
        //req.user = decoded ;   
        
        //admin all details attached to req
        let admin = await Admin.findOne({ email : decoded.email });
        req.admin = admin ;
        console.log(req.admin.name);
        
        next();
    });
};


module.exports = { createToken, authenticateToken };