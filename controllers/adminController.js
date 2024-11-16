
const { User, DeletedUser } = require('../models/modelUserSchema');
const { Admin } = require('../models/adminschema');
const Category = require('../models/categorySchema');
const bcrypt = require('bcrypt');
const { createToken } = require('../middleware/jwtMiddleware');
const blacklistToken = require('../utility/blacklistToken');
const path = require('path');
const Product = require('../models/productSchema');
const { handleImageUploads } = require('../helpers/handleImageUploads');
const { deleteFiles } = require('../helpers/deleteImageAndThumbnail');

//################################################################################################################
// ADMIN LOGIN, SIGNUP, LOGOUT & HOME
//################################################################################################################
exports.adminLOGIN = async (req, res) => {
    if( !req.cookies.jwt && req.admin.role === 'admin' ){
        return res.render('adminLogin');
    }
   
    return res.render('adminHome', { admin : req.admin.name });

}

exports.adminREGISTER = async (req, res) => {
    
    if ( !req.cookies.jwt ) {
        return res.render('adminRegister');
      }

    return res.render('adminHome', { admin : req.admin.name } );

    }

exports.adminRegister = async (req,res) => {
    if(req.cookies.jwt && req.admin.role === 'admin'){

        res.render('adminHome', { admin : req.admin.name });
    } else {
        try {
            const {name, userName, email, mobile, password } = req.body;
            const blocked = 0;
            const role = 'admin';

            //check email and userName are unique
            const userExist = await Admin.findOne({userName});
            const emailExist = await Admin.findOne({email});
            const mobileExist = await Admin.findOne({mobile});
            if (userExist) {
            return res.render('adminLogin', {err: '!!!..User With Given Username Already Exists..!!!'})   
            }
            if (emailExist) {
                return res.render('adminLogin', {err: '!!!..User With Given Email Already Exists..!!!'});
            }
            if (mobileExist) {
                return res.render('adminLogin', {err: '!!!...User With Given Mobile Already Exists..!!!'})
            }

            //create a new user to database
            const admin = new Admin({
                name, 
                userName,
                email,
                mobile,
                password,
                blocked,
                role,
            });

            console.log(admin);
            //adding new user to db
            const savedAdmin = await admin.save();

            //create jwt token
            const token = createToken(savedAdmin);
            
            //set the authentication token
            res.cookie('jwt', token, {
                httpOnly : true,
                secure : false,
                maxAge : 86400000,
            });

            //create session
            req.session.validated = true;
            req.session.user = 'admin';

            res.render('adminHome', { admin : admin.name });
        
        }catch (error) {
            console.log(error);
            res.render('errorPage', {error: 'There was an error registering the user.', status : '500'});
        }
    }

};

exports.adminLogin = async (req, res) => {
    
    try {
        if(req.cookies.jwt && req.admin.role === 'admin' ){

            return res.render('adminHome', { admin : req.admin.name });
        }

        const { email, password } = req.body;

        const admin = await Admin.findOne({$or : [{email : email}, {userName : email}]});

        if(!admin){
            return res.render('adminLogin', {error : '!!!..Invalid username/email..!!!'});
        }

        const isPsswrdMatch = await bcrypt.compare(password, admin.password);

        if(!isPsswrdMatch){
            return res.render('adminLogin',{ error: '!!!..Invalid Password..!!!' });
        }

        if(admin.blocked){
            return res.render('adminLogin',{msg : '!!!..You Are Blocked..!!!'});
        }

        //create jwt token
        const token = createToken(admin);

        //set the authentication token
        res.cookie('jwt', token, {
            httpOnly : true,
            secure : false,
            maxAge : 86400000,
        });

        // Create a session
        req.session.validated = true;
        req.session.user = 'admin';


        res.render('adminHome', { admin : admin.name } );
    } catch (error) {
        console.error(error);
        res.render('errorPage', {error : 'An unexpected error occured.', status : '500'})
    }
};

exports.adminHome = async (req,res) => {
    
    if(req.cookies.jwt && req.admin.role === 'admin'){
        res.render('adminHome', { admin : req.admin.name });
    } else {
        res.render('login');
    }
}

exports.adminLogout = async (req, res) => {
    if(req.cookies.jwt && req.admin.role === 'admin'){
        const token = req.cookies.jwt;

        if( token ){
            deleteFiles(req);
            await blacklistToken( token );
            req.session.destroy(error => {
                if(error){
                    return res.render('errorPage', { status :'500', error : 'Could not logout '})
                }
           
                res.clearCookie('jwt');
                res.redirect('/admin');
            });
        }
    }

}

//################################################################################################################
// ADMIN PROFILE MANAGEMENT
//################################################################################################################

exports.adminProfile = async (req, res) => {
    if (req.cookies.jwt && req.admin.role === 'admin') {
        const admin = await Admin.findOne({ email: req.admin.email });
        if (!admin) {
            return res.render('adminLogin', { error: 'Admin not found' });
        }
        
        console.log('User:', req.user);
        console.log('Admin:', admin);
        res.render('adminProfile', { admin });
    } else {
        res.render('adminLogin', { error: 'Unauthorized access' });
    }
};

exports.adminEditProfile = async (req, res) => {
    if (req.cookies.jwt && req.admin.role === 'admin') {
        const { name, about, country, address, mobile, email } =req.body;

        try {
            const admin = await Admin.findOneAndUpdate(
              { email : req.admin.email },
              {
                $set: {
                  name,
                  about,
                  country,
                  address,
                  mobile,
                  email,
                },
              },
              { new: true }
            );
      
            if (!admin) {
              return res.render('errorPage', { error : "Can't find the requested resource.", status : '404'});
            }
      
            res.render('adminProfile', { admin : admin, msg: 'User Updated Successfully.' });
          } catch (error) {
            console.log(error);
            return res.render('errorPage', { error : 'Error Updating User', status : '500' });
          }
        }
    

    }

exports.adminChangePassword = async (req, res) => {

    try{
        if (req.cookies.jwt && req.admin.role === 'admin') {

            const { password, newPassword } = req.body;

            const admin = await Admin.findOne({ email : req.admin.email });

            if(!admin){
                return res.render('errorPage', { error : 'Not Found', status : '404'});
            }

            const isValidPassword = await bcrypt.compare(password, admin.password);

            if(isValidPassword){
                admin.password = newPassword;

                await admin.save();

                return res.render('adminProfile', { admin , msg : 'Password Changed.'})
            } else {
                return res.render('adminProfile', { admin, err : 'Current Password is Incorrect', status : '400'});
            }

        }
    } catch (error) {
        console.log('An error occured while changing the password.');
        return res.render('errorPage', {error : 'An Error Occured While Changing the Password', status : '500'})
    }
}

//################################################################################################################
// ADMIN USER MANAGEMENT
//################################################################################################################

exports.adminAllUsers = async (req, res) => {
    if(req.cookies.jwt && req.admin.role === 'admin'){
        try{
            const userInfo = await User.find({});

            return res.render('adminAllUsers',{userInfo : userInfo , admin : req.admin.name });
        }catch(error){
            console.error(error);
            res.render('errorPage', { error : 'An Error Occured', status : '500'});
        }
    }
}

exports.adminManageUsers = async (req, res) => {
    if(req.cookies.jwt && req.admin.role === 'admin'){
        console.log('the admin email is ', req.admin.email);
        try{
            const userInfo = await User.find({});
            return res.render('adminManageUsers', { userInfo : userInfo, admin : req.admin.name });
        } catch (error) {
            console.error(error);
            return res.render('errorPage', { error : 'An Error Occured', status : '500'})
        }
    }
}

exports.adminAddUser = async(req, res) => {
    if(req.cookies.jwt && req.admin.role === 'admin'){
        res.render('adminAddUserForm');
    }
}

exports.adminAddUserDB = async(req, res) => {
    if(req.cookies.jwt && req.admin.role === 'admin'){
        try{
            const {name, userName, email, mobile, password } = req.body;
            const blocked = 0;
            const role = 'user';

            //check email and userName are unique
        const userExist = await User.findOne({userName});
        const emailExist = await User.findOne({email});
        const mobileExist = await User.findOne({mobile});
        if (userExist) {
           return res.render('adminAddUserForm', {err: '!!!..User With Given Username Already Exists..!!!'})   
        }
        if (emailExist) {
            return res.render('adminAddUserForm', {err: '!!!..User With Given Email Already Exists..!!!'});
        }
        if (mobileExist) {
            return res.render('adminAddUserForm', {err: '!!!...User With Given Mobile Already Exists..!!!'})
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

        res.render('adminAddUserForm', {message : 'User Saved Successfully.'});

        } catch (error) {
            console.error(error);
            res.render('errorPage', { error : 'An Error Occured while creating New User.', status : '500'})
        }
    }
}

exports.adminEditUser = async (req, res) => {
    try{
        if(req.cookies.jwt && req.admin.role === 'admin'){
            const userName = req.params.userName;
            console.log(userName);

            const userInfo = await User.findOne({ userName : userName });

            if(!userInfo){
                return res.render('adminEditUserForm', { err : 'Something went wrong User not Found.'});
            }

            res.render('adminEditUserForm', { userInfo : userInfo });
        }
    } catch (error) {
        cosole.log('An error occured in edit user route');
        res.render('errorPage', { error : 'Something went wrong', status : '500'} );
    }
}

exports.adminEditUserDB = async (req, res) => {
    if (req.cookies.jwt && req.admin.role === 'admin') {
      const username = req.params.userName;
      const { name, userName, email, mobile, password } = req.body;
  
      try {
        const userInfo = await User.findOneAndUpdate(
          { userName: username },
          {
            $set: {
              name,
              userName,
              email,
              mobile,
              ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
            },
          },
          { new: true }
        );
  
        if (!userInfo) {
          return res.render('adminEditUserForm', { err: 'User not Found' });
        }
  
        // to sent all user data to the manage user page.
        const users = await User.find({});
  
        res.render('adminManageUsers', { userInfo: users, admin : req.admin.name , message: 'User Updated Successfully.' });
      } catch (error) {
        console.log(error);
        return res.render('errorPage', { error: 'Error Updating User', status : '500' });
      }
    }
  }

exports.adminBlockUser  = async (req, res) => {
    try{
        if(req.cookies.jwt && req.admin.role === 'admin'){
            const { userName } = req.body;

            const user = await User.findOne({ userName: userName });

            if (user) {
                const blocked = !user.blocked;
                const userInfo = await User.findOneAndUpdate({ userName: userName }, { $set: { blocked } }, { new: true });

                const users = await User.find({});

                res.render('adminManageUsers', { admin : req.admin.name, message: 'Successfull', userInfo: users });
            } else {
                res.render('adminManageUsers', { admin : req.admin.name, error: 'User  not found' });
            }
        }
    } catch (error) {
        console.error(error);
        res.render('errorPage', { error : 'Error Occured while blocking the user.', status : '500'});
    }
}

exports.adminDeleteUser = async (req, res) => {
    try {
      if (req.cookies.jwt && req.admin.role === 'admin') {
        const { userName } = req.body;

        const deletedUser = await User.findOne({ userName });
        
        if(deletedUser){
            const newDeletedUser = new DeletedUser ({
                name : deletedUser.name,
                userName : deletedUser.userName,
                email : deletedUser.email,
                mobile : deletedUser.mobile,
                password : deletedUser.password,
                blocked : deletedUser.blocked
            });

            await newDeletedUser.save();
        }


        var userInfo = await User.deleteOne({ userName });

        userInfo = await User.find({});
        console.log(userInfo);

        // Redirect to the same page with the updated data
        res.redirect(`/admin/users/manage`);

      } 

    } catch (err) {
      console.error(err);
      return res.render('errorPage', { error : 'Error while deleting the user', status : '500'} );
    }
}

exports.adminBlockedUsers = async (req, res) => {
    if(req.cookies.jwt && req.admin.role === 'admin'){
        const userInfo = await User.find({ blocked : true });

        res.render('adminBlockedUsers', {userInfo : userInfo, admin : req.admin.name });
    }
    
}

exports.adminRecentlyDeletedUsers = async (req, res) => {
    if(req.cookies.jwt && req.admin.role === 'admin'){

        const userInfo = await DeletedUser.find({});
        
        res.render('adminRecentlyDeletedUsers', { userInfo : userInfo, admin : req.admin.name  });
    }
}

//################################################################################################################
// ADMIN CATEGORY MANAGEMENT
//################################################################################################################

exports.adminCategory = async (req, res) => {

    let category = await Category.find({}).populate('parent', 'name');
    const admin = await Admin.findOne({ email : req.admin.email });

    console.log('categories : ', category);
    console.log('admin : ', admin);
    if(category.length === 0  || !admin){
       return res.render('errorPage', { error : 'Not Fount', status : '404'});

    }
    
    category = category.map(cat => ({
        ...cat._doc,
        parent: cat.parent ? cat.parent.name : null // Use the parent name or null if no parent
    }));
    
    console.log('the value send ', admin.name);
    res.render('adminCategory', { category, admin : admin.name });
    
}

exports.adminAddCategory = async (req, res) => {

    const category = await Category.find({});

    res.render('adminAddCategory', { category });

}

exports.adminAddCategoryDB = async (req, res) => {
    try{
        const existingCategory = await Category.findOne({ name : req.body.name });

        const category = await Category.find({});

        if(existingCategory){
            return res.render('adminAddCategory', { category , err : 'Category Already Exists.'})
        }

        const newCategory = new Category(req.body);
        if(req.body.parent === ''){
            newCategory.parent = null;
        }
    
        await newCategory.save();
        
        res.redirect('/admin/products/category');
    } catch (error){
        console.log(error);
        res.render('errorPage', { error : error.message, status : '400' });
    }
}

exports.adminEditCategory = async (req, res) => {

    const categoryName = await Category.findOne({ name : req.params.name });

    if( categoryName ){
        const category = await Category.find({});
        res.render('adminEditCategory', { category, categoryName });
    }

}

exports.adminEditCategoryDB = async (req, res) => {
    try{
        const categoryName = req.params.name;
        
        let { name, description, parent } = req.body;

        if(parent === ''){
            parent = null;
        }
    
        await Category.findOneAndUpdate(
            { name : categoryName },
            {
                $set : {
                    name,
                    description,
                    parent
                }
            });
        
        res.redirect('/admin/products/category');
    } catch (error){
        console.log(error);
        res.render('errorPage', { error : error.message, status : '400' });
    }
}

exports.adminDeleteCategory = async (req, res) => {
    try{  
        const { name } = req.body;
        console.log('categoryname to delete : ', name);
        console.log(typeof name)

        const category = await Category.findOneAndDelete({ name : name });

        return res.redirect('/admin/products/category');

    } catch(error) {
        console.error('error while deleting the category : ', error);
        res.render('errorPage', {status : '404', error : 'Not Found the Category.'});
    }
}

//################################################################################################################
// ADMIN PRODUCT MANAGEMENT
//################################################################################################################

exports.adminAllProdusts = async (req, res) => {
    try{
        const products = await Product.find().select('_id thumbnailsPath brandName category price stockCount').populate('category');

        const productData = products.map( product => ({
            _id : product._id,
            thumbnailsPath : product.thumbnailsPath[0],
            brandName : product.brandName,
            description : product.description,
            category : product.category,
            price : product.price,
            stockCount : product.stockCount,
        }));

        res.render('adminAllProducts', { admin : req.admin.name, products : productData });

    } catch (error) {
        console.error(error);
        res.render('errorPage', {status : '500', error : 'Internal Server Error'});
    }

}

exports.adminManageProducts = async (req, res) => {
    try{
        const products = await Product.find().select('_id thumbnailsPath brandName category price stockCount').populate('category');

        console.log(products);

        const productData = products.map( product => ({
            _id : product._id,
            thumbnailsPath : product.thumbnailsPath[0],
            brandName : product.brandName,
            description : product.description,
            category : product.category,
            price : product.price,
            stockCount : product.stockCount,
        }));

        res.render('adminManageProducts', { admin : req.admin.name, products : productData });

    } catch (error) {
        console.error(error);
        res.render('errorPage', {status : '500', error : 'Internal Server Error'});
    }
}

exports.adminAddProduct = async (req, res) => {

    const categories = await Category.find({});

    res.render('adminAddProductForm', { categories });

}

exports.adminAddProductDB = async (req, res) => {

    console.log(req.body, req.files);
    const { brandName,
            description,
            type,
            occation,
            category,
            sizes,
            price,
            discount,
            priceAfterDiscount,
            discountAmount,
            stockCount,
            isFeatured, } = req.body;

            const imagePaths = [];
            const thumbnailPaths = [];

            console.log('imagePaths :', imagePaths, 'thumbnailPaths : ', thumbnailPaths);

            //await result of the function handleimageUploads()
            const { imagePaths: newImagePaths, thumbnailPaths: newThumbnailPaths } = await handleImageUploads(req.files, imagePaths, thumbnailPaths);

            console.log('After calling function imagePaths :', imagePaths, 'thumbnailPaths : ', thumbnailPaths);

            let sizesArray = Array.isArray(sizes) ? sizes : (typeof sizes === 'string' ? sizes.split(',') : []);

            const newProduct = new Product({
                brandName,
                description,
                type,
                occation,
                category,
                sizes : sizesArray,
                price,
                discount,
                priceAfterDiscount,
                discountAmount,
                stockCount,
                isFeatured,
                imagesPath : newImagePaths,
                thumbnailsPath : newThumbnailPaths,
            });

            try{
                await newProduct.save();

                const categories = await Category.find({});

                res.render('adminAddProductForm', { message : 'Product added Successfully', categories : categories});
            } catch (error) {
                console.error('Error saving product : ', error);

                // delete the images & thumbanail if the save fails
                deleteFiles(newImagePaths);
                deleteFiles(newThumbnailPaths);

                const categories = await Category.find({});

                res.render('adminAddProductForm', { err : 'Failed to add Product !', categories});
            }

}

exports.adminViewProduct = async(req, res) => {

    const product = await Product.findOne({ _id : req.params.id}).populate('category');

    if(product){
        res.render('adminViewProduct', { product, admin : req.admin.name });
    }else{
        res.render('errorPage', { status: '404', error : 'Product Not Found'});
    }

}

exports.adminEditProduct = async(req, res) => {

    const { id }= req.body;

    const product = await Product.findOne({ _id : id }).populate('category');

    const categories = await Category.find();
    console.log(product);
    res.render('adminEditProductForm', { categories, product })
}

exports.adminEditProductDB = async(req, res) => {

    console.log(req.body.id);
    const {
        id,
        brandName,
        description,
        type,
        occation,
        category,
        sizes,
        price,
        discount,
        priceAfterDiscount,
        discountAmount,
        stockCount,
        isFeatured, } = req.body;

        const product = await Product.findOne({ _id : id });

        if (!product){
            return res.render('errorPage', { status : '404', error : 'Product not found.'});
        }

        //store old image & thumbnail paths for deletion
        const oldImagePaths = product.imagesPath;
        const oldThumbnailPaths = product.thumbnailsPath;

        product.brandName = brandName;
        product.description = description;
        product.type = type;
        product.occation = occation;
        product.category = category;
        product.sizes = sizes;
        product.price = price;
        product.discount = discount;
        product.discountAmount = discountAmount;
        product.priceAfterDiscount = priceAfterDiscount;
        product.stockCount = stockCount;
        product.isFeatured = isFeatured;

        if(req.files && req.files.length > 0){

            // holding the paths for images and thumbanils
            const imagePaths = [];
            const thumbnailPaths =[];

            // await result of the function handleimageUploads()
            // storing the result to new variables named newImagePaths and newThumbanilPaths
            //  imagePaths: newImagePaths is used here to rename the imagePaths property from the returned object to newImagePaths.
            const { imagePaths : newImagePaths, thumbnailPaths : newThumbnailPaths } = await handleImageUploads(req.files, imagePaths, thumbnailPaths);

            product.imagesPath = newImagePaths;
            product.thumbnailsPath = newThumbnailPaths;

            //delete image and thumbnails
            deleteFiles(oldImagePaths);
            deleteFiles(oldThumbnailPaths);
    
        }

        const products = await Product.find({});

        const productData = products.map( product => ({
            _id : product._id,
            thumbnailsPath : product.thumbnailsPath[0],
            brandName : product.brandName,
            description : product.description,
            category : product.category,
            price : product.price,
            stockCount : product.stockCount,
        }));

        try{
            await product.save();
            res.render('adminManageProducts', { products : productData, admin : req.admin.role, message : 'Product Updated Successfully'});

        } catch (error) {
            console.error('Error saving product : ', error);

            //delete image and thumbnails
            deleteFiles(newImagePaths);
            deleteFiles(newThumbnailPaths);

            res.render('adminManageProducts', { products : productData, admin : req.admin.role, err : 'Failed to edit product !' });

        }
}

exports.adminDeleteProduct = async(req, res) => {
    try{
        const id = req.body.id;

        const product = await Product.findOne({ _id : id });

        if(!product){
            return res.render('adminManageProducts', { products : productData, admin : req.admin.role, err : 'Failed to delete the Product'});
        }

        deleteFiles(product.imagesPath);
        deleteFiles(product.thumbnailsPath);

        await Product.deleteOne({ _id : id});

        const products = await Product.find({});
        const productData = products.map( product => ({
            _id : product._id,
            thumbnailsPath : product.thumbnailsPath[0],
            brandName : product.brandName,
            description : product.description,
            category : product.category,
            price : product.price,
            stockCount : product.stockCount,
        }));
        
        return res.render('adminManageProducts', { products : productData, admin : req.admin.role, message : 'Product Deleted Successfully'});
    } catch (error){
        console.error('Error deleting the Product : ', error);
        return res.render('errorPage', { status : '500', error : 'Internal server error'})
    }
}