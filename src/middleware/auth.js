const jwt=require('jsonwebtoken')
const User=require('../models/user')
const authMiddleware=async function(req,res,next){
    try {
        const token=req.header('Authorization').replace('Bearer ','')
        const decodedToken=jwt.verify(token,process.env.JWT_SECRET)//returns user Id
        const user=await User.findOne({_id:decodedToken._id,'tokens.token':token})
        if(!user){
            throw new Error()
        }
        req.user=user
        req.token=token
        
    next()
    } catch (error) {
        res.status(500).send('Authentication Failed')
    }
    
}

module.exports=authMiddleware