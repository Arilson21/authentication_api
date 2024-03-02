const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async(req, res, next) => {
    const { authorization } = req.headers;
    
    if(!authorization) {
        return res.status(401).json({
            errors: ['Login required']
        })
    }

    const [ token ] = authorization.split(' ');

    try{
        const dados = jwt.verify(token, process.env.TOKEN_SECRET);
        const { id } = dados;

        const user = await User.findById({ _id: id })

        if(!user){
            return res.status(401).json({
                errors: ['Invalid User']
            })
        }

        req.user = id

        return next()
    }catch(e){
        return res.status(401).json({
            errors: ['Token expired login again']
        })
    }

}

module.exports = { authMiddleware }