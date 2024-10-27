const express = require('express');
const { home, login, signup,  forgotPassword, 
        resetPassword_link, resetPassword_form, resetPassword,
      } = require('../controllers/userController');

const { authenticateToken } = require('../middleware/jwtMiddleware');

const { adminLOGIN, adminREGISTER, adminRegister, adminLogin, adminLogout, adminHome, 
        adminProfile, adminEditProfile, adminChangePassword, 
        adminAllUsers, adminManageUsers, adminAddUser, adminAddUserDB, adminEditUser, adminEditUserDB, adminDeleteUser, adminBlockUser,adminBlockedUsers, adminRecentlyDeletedUsers, 
        adminCategory, adminAddCategory, adminAddCategoryDB, adminEditCategory, adminEditCategoryDB, adminDeleteCategory,
        } = require('../controllers/adminController');

const router = express.Router();

router.get('/', authenticateToken, home);
router.post('/login', login);
router.post('/signup', signup);
router.get('/forgotPassword', forgotPassword);
router.post('/resetPassword_link', resetPassword_link);
router.get('/resetPassword_form/:token', resetPassword_form);
router.post('/resetPassword', resetPassword);



//########################################################################################
// ADMIN ROUTES
//########################################################################################

router.get('/admin', authenticateToken, adminLOGIN);
router.get('/admin/register', adminREGISTER);
router.post('/admin', adminLogin);
router.post('/admin/register', adminRegister);
router.get('/admin/logout', authenticateToken, adminLogout);
router.get('/adminHome', authenticateToken, adminHome);

//########################################################################################
// ADMIN PROFILE MANAGEMENT
//########################################################################################

router.get('/admin/profile/myProfile', authenticateToken, adminProfile);
router.post('/admin/profile/edit', authenticateToken, adminEditProfile);
router.post('/admin/profile/changePassword', authenticateToken, adminChangePassword);

//#########################################################################################################
// ADMIN USER MANAGEMENT
//#########################################################################################################

router.get('/admin/users/allUsers', authenticateToken, adminAllUsers);
router.get('/admin/users/manage', authenticateToken, adminManageUsers);
router.get('/admin/users/manage/add', authenticateToken, adminAddUser);
router.post('/admin/users/manage/addUserDB', authenticateToken, adminAddUserDB);
router.get('/admin/users/manage/edit/:userName', authenticateToken, adminEditUser);
router.post('/admin/users/manage/editUserDB/:userName', authenticateToken, adminEditUserDB);
router.post('/admin/users/manage/delete', authenticateToken, adminDeleteUser);
router.post('/admin/users/manage/block', authenticateToken, adminBlockUser);
router.get('/admin/users/blocked', authenticateToken, adminBlockedUsers);
router.get('/admin/users/recentlyDeleted', authenticateToken, adminRecentlyDeletedUsers);

//#########################################################################################################
// ADMIN CATEGORY MANAGEMENT
//#########################################################################################################

router.get('/admin/products/category', authenticateToken, adminCategory);
router.get('/admin/products/category/add', authenticateToken, adminAddCategory);
router.post('/admin/products/category/addDB', authenticateToken, adminAddCategoryDB);
router.get('/admin/products/category/edit/:name', authenticateToken, adminEditCategory);
router.post('/admin/products/category/editDB/:name', authenticateToken, adminEditCategoryDB);
router.post('/admin/products/category/delete', authenticateToken, adminDeleteCategory);

module.exports = router;