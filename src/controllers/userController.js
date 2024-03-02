const User = require('../models/User');
const asynchandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwtToken');
const crypto = require('crypto');
const mailer = require('../modules/mailer');
const mongoose = require('mongoose');
const isEmail = require('isemail');

const createUser = asynchandler(async(req, res) => {
    try{
        const { email, password } = req.body;

        if(!isEmail.validate(email)){
            return res.status(400).json({
                errors: 'Invalid email'
            })
        }

        if(password.length < 6 || password.length > 15) {
            return res.status(400).json({
                errors: 'The password must be between 6 and 15 characters long'
            })
        }

        const user = await User.findOne({ email });

        if(user){
            return res.status(400).json({
                errors: 'User already exists'
            })
        }
        const newUser = await User.create(req.body)
        newUser.password = undefined;

        return res.json(newUser)

    }catch(e){
        throw new Error(e)

    }
});

const loginUser = asynchandler(async(req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if(!user){
        return res.status(400).json({
            errors: 'User not found'
        })
    }

    if(! await bcrypt.compare(password, user.password)){
        return res.status(400).json({
            errors: 'Invalid password'
        })
    }

    user.password = undefined;

    const token = generateToken({id: user._id})
    res.json({user, token})
});

const getAllUser =  asynchandler(async(req, res) => {
    try{
        const users = await User.find()

        res.json(users)
    } catch(e){
        throw new Error(e)
    }
    
});

const updateUser = asynchandler(async(req, res) => {
    try{
        const _id = req.user
        const {name, email, password} = req.body;

        if(!isEmail.validate(email)){
            return res.status(400).json({
                errors: 'Invalid email'
            })
        }

        if(password.length < 6 || password.length > 15) {
            return res.status(400).json({
                errors: 'The password must be between 6 and 15 characters long'
            })
        }

        if(!mongoose.Types.ObjectId.isValid(_id)){
            return res.status(400).json({
                errors: 'Invalid id'
            })
        }

        const user = await User.findById({_id});

        if(!user){
            return res.status(400).json({
                errors: 'User not found'
            });
        }

        if(name) user.name = name;
        if(email) user.email = email;
        if(password) user.password = password;

        await user.save();

        user.password = undefined;
        res.status(200).json(user)
    }catch(e) {
        console.log(e)
    }
});

const deleteUser = asynchandler(async(req, res) => {
    try{
        const _id = req.user
        if(!mongoose.Types.ObjectId.isValid(_id)){
            return res.status(400).json({
                errors: 'Invalid id'
            })
        }

        await User.findByIdAndDelete(_id)
        res.status(200).json('User deleted')
    }catch(e) {
        console.log(e)
    }
})

const forgotPassword =  asynchandler(async(req, res) => {
    const { email } = req.body;

    try{
        const user = await User.findOne({ email })
        
        if(!user){
            return res.status(400).json({
                errors: 'User not found'
            });
        }

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        mailer.sendMail({
            to: email,
            from: process.env.MAIL_FROM,
            template: 'forgot_password',
            context: {token},
        }, (err) => {
            if(err) {
                return res.status(400).json({
                    errors: 'Cannot send'
                });
            }

            res.sendStatus(200)
        })

    }catch(e){
        throw new Error(e)
    }
});

const resetPassword =  asynchandler(async(req, res) => {
    const { email, token, password } = req.body;

    try{
        const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires');

        if(!user){
            return res.status(400).json({
                errors: 'User not found'
            });
        }

        if(token !== user.passwordResetToken){
            return res.status(400).json({
                errors: 'Token invalid'
            });
        }

        const now = new Date();

        if(now > user.passwordResetExpires){
            return res.status(400).json({
                errors: 'Token expires, generate a new'
            });
        }

        if(password.length < 6 || password.length > 15) {
            return res.status(400).json({
                errors: 'The password must be between 6 and 15 characters long'
            })
        }

        user.password = password;

        await user.save();

        res.sendStatus(200)
    }catch(e){
        throw new Error(e)
    }
});


const verifyToken =  asynchandler(async(req, res) => {
    try{
        res.sendStatus(200)
    }catch(e){
        throw new Error(e)
    }
});



module.exports = { createUser, loginUser, getAllUser,updateUser,deleteUser, forgotPassword, resetPassword, verifyToken }