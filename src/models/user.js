const mongoose=require('mongoose');
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const validator=require('validator')
const Friends=require('../models/friends')
const EventUpdates=require('../models/updates')
const Schema=mongoose.Schema;

const tokenSchema=new Schema({
    token:{
        type:String,
            
    }
})

const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        unique:true,
        trim:true,
        required:true
    },
    age:{
        type:Number,
        required:true,
        validate(age){
            if(age<0){
                throw new Error("Age is Invalid")
            }
        }
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error("Invalid Email")
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        validate(val){
            if(val.includes("password")){
                throw new Error("Invalid")
            }
        }
    },
    tokens:[
       tokenSchema
    ],
    friendsCount:{
        type:Number,
        default:0
    }   
},{
    timestamps:true
})

userSchema.methods.toJSON=function(){
    const userObject=this.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

//encrypt password and save in db
userSchema.pre('save',async function(next){
    const user=this;
    if(user.isModified('password')){
        user.password= await bcrypt.hash(user.password,8)
    }
})

//validating password and username/email
userSchema.statics.validateCredentials=async(email,username,password)=>{
    var user
    if(email){
         user=await USER.findOne({email})
         
    }
    if(username){
         user=await USER.findOne({username})
    }
    if(!user){
        throw new Error("User not found")
    }
    const isMatch=bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}
//generating tokens
userSchema.methods.generateToken=async function(){
    try {
        const token=jwt.sign({_id:this._id.toString()},process.env.JWT_SECRET,{expiresIn:'7 days'})
        this.tokens.push({ token })//push directly inserts the token in tokens while concat returns a new array w/o inserting token in original array
        await this.save()
    
        return token
    } catch (error) {
        return error.message
    }
    
}
//on deleting a user other dependent records must be removed 
userSchema.pre('remove',async function(next){
    const user=this
    const username=this.username

    
    try {
        //delete friend records of this user
    
    } catch (error) {
        
    }

})
var USER=mongoose.model('User',userSchema)

module.exports=USER
