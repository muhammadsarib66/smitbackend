const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticateToken, requireAdmin } = require('../middleware/middleware');
const upload = require('../middleware/multer');

// Public routes (no authentication required)
router.post('/admin/signup', upload.single('profileImg'), UserController.adminSignup);
router.post('/admin/login', UserController.adminLogin);
router.post('/user/signup', upload.single('profileImg'), UserController.userSignup);
router.post('/user/login', UserController.userLogin);
// Password reset routes
router.post('/user/forgot-password', UserController.sendPasswordResetOTP);
router.post('/user/verify-otp', UserController.verifyPasswordResetOTP);
router.post('/user/reset-password', UserController.resetPasswordWithOTP);

// Protected user routes (require authentication)
router.get('/user/profile', authenticateToken, UserController.getOwnProfile);
router.put('/user/profile', authenticateToken, UserController.updateOwnProfile);
router.patch('/user/profile-image', authenticateToken, upload.single('profileImg'), UserController.updateOwnProfileImage);

// Protected admin routes (require admin authentication)
router.delete('/admin/user/:id', authenticateToken, requireAdmin, UserController.deleteUser);
router.post('/admin/user', authenticateToken, requireAdmin, upload.single('profileImg'), UserController.addUser);
router.put('/admin/user/:id', authenticateToken, requireAdmin, upload.single('profileImg'), UserController.updateUser);
router.patch('/admin/user/:id/profile-image', authenticateToken, requireAdmin, upload.single('profileImg'), UserController.updateProfileImage);
router.get('/admin/users', authenticateToken, requireAdmin, UserController.getAllUsers);

module.exports = router;
