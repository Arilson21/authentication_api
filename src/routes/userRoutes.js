const express = require('express');
const router = express.Router();
const { createUser, loginUser, getAllUser, updateUser,deleteUser, forgotPassword, resetPassword, verifyToken } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware')



router.post('/register', createUser );
router.post('/login', loginUser);
router.get('/show',authMiddleware, getAllUser)
router.put('/update',authMiddleware, updateUser);
router.delete('/delete',authMiddleware, deleteUser)
router.post('/verify-token', authMiddleware, verifyToken)
router.post('/forgot_password', forgotPassword)
router.post('/reset_password', resetPassword)



module.exports = router;
