const User=require('../models/user')

const getAllUsernames=async()=>{
    try {
        const usernames=await User.find({}).select('username')
        return usernames
    } catch (error) {
        throw new Error(error.message)
    }
    
}

const getAllUsernamesByPattern=async(pattern)=>{
    const usernames=await User.where({username:{$regex:pattern}})
    return usernames
}

const getUsernames={
    getAllUsernames,
    getAllUsernamesByPattern
}


module.exports=getUsernames