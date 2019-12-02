const express=require('express')
const validator=require('validator')
const multer=require('multer')
const sharp=require('sharp')
const USER=require('../models/user')
const FRIENDS=require("../models/friends")//friends db
const GetAllFriendsService=require("../services/getAllFriendsOfUser")
const postalPINService=require("../services/postalPINService")
const EventsUpdates=require("../models/updates")//events db
const auth=require('../middleware/auth')
const router=new express.Router()

router.post('/socializeAPI/v1.0/signup',async(req,res)=>{
    const user=new USER(req.body)
    try {
        const token=await user.generateToken()
        res.status(201).send("{user,token}")
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//Upload profile pics(optional)
//using multer 
const uploadProfile=multer({
    limits:{
        fieldSize:2000000
    }
    
})

router.post('/socializeAPI/v1.0/avatar',uploadProfile.single('avatar'),auth,async(req,res)=>{
    try {
        const buffData=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
        req.user.avatar=buffData
        const user=new USER(req.user)
        await user.save()
        res.status(201).send(user)
    } catch (error) {
        res.status(500).send(error.message)
    }
    
},(error,req,res,next)=>{
    res.status(400).send(error.message)
})
//get profile pic of an user
router.get('/socializeAPI/v1.0/avatar/:username',auth,async(req,res)=>{
    try {
        const user=await USER.findOne({username:req.params.username})
        if(!user.avatar){
            throw new Error("User does not have a profile picture")
        }
        // res.set('Content-Type','image/png')
        res.status(200).send(user.avatar)    
    } catch (error) {
        res.status(500).send(error.message)
    }
    
})
//delete profile picture
router.delete('/socializeAPI/v1.0/avatar',auth,async(req,res)=>{
    try {
        req.user.avatar=undefined
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.get('/socializeAPI/v1.0/login',async(req,res)=>{
    try {
        if(validator.isEmail(req.body.username)){
            const user=await USER.validateCredentials(req.body.username,null,req.body.password)
            const token=await user.generateToken();
        
            res.status(200).send({user,token})
        }
        else{
            const user=await USER.validateCredentials(null,req.body.username,req.body.password)
            const token=await user.generateToken();
            res.status(200).send({user,token})
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//logout
router.delete("/socializeAPI/v1.0/logout",auth,async(req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!=req.token
        })
        await req.user.save()
        res.status(200).send(req.user)
    } catch (error) {
        res.send(error.message)
    }
})

//logout from all accounts
router.delete("/socializeAPI/v1.0/logoutAllDevices",auth,async(req,res)=>{
    try {
        req.user.tokens=[]
        await req.user.save()
        res.status(200).send(req.user)
    } catch (error) {
        res.send(error.message)
    }
})

//delete account
router.delete("/socializeAPI/v1.0/delete",auth,async(req,res)=>{
    try {
        const username=req.user.username
        await req.user.remove()
        await FRIENDS.deleteMany().or([{friend1:username},{friend2:username}])
        await EventsUpdates.deleteMany().or([{updateTo:username},{updateSrc:username}])
        res.status(200).send(req.user)
    } catch (error) {
        res.send(error.message)
    }
})

//get user by username
router.get('/socializeAPI/v1.0/user/:username',auth,async (req,res)=>{
    
    try {
        const username=req.params.username
        const user=await USER.findOne({username})
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error.message)
    }
})
//show current user's profile
router.get('/socializeAPI/v1.0/me',auth,(req,res)=>{
    res.status(200).send(req.user)
})
//Update user
router.patch('/socializeAPI/v1.0/update',auth,async(req,res)=>{
    try {
        const updates=Object.keys(req.body)
        const allowedUpdates=["age","email","password"]
        const isValidUpdate=updates.every((update)=>{
         return allowedUpdates.includes(update)
        })
        if(!isValidUpdate){
           return res.status(400).send("Invalid Update") 
        }
        const user=req.user
        updates.forEach((update)=>user[update]=req.body[update])
        await user.save()
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error.message)
    }
   
})
//update username
router.patch("/socializeAPI/v1.0/update/username",auth,async(req,res)=>{
    try {
        const me=req.user.username
        const newUsername=req.body.username
        
        await USER.findOneAndUpdate({username:me},{username:newUsername})
        
        //updating username in Friends db
        await FRIENDS.updateMany({'friend1.username':me},{'friend1.username':newUsername})
        await FRIENDS.updateMany({'friend2.username':me},{'friend2.username':newUsername})
        
        //updating username in updates db
        await EventsUpdates.updateMany({updateTo:me},{updateTo:newUsername})
        await EventsUpdates.updateMany({updateSrc:me},{updateSrc:newUsername})

        res.status(200).send("success")
    } catch (error) {
        res.status(500).send(error.message)
    }
    
})

//shows all friends of user 
router.get('/socializeAPI/v1.0/getAllFriends',auth,async(req,res)=>{    
    const me=req.user.username
    
    try {   
        
        const friends=await GetAllFriendsService(me)
        console.log(friends)
        res.status(200).send(friends)
        
    } catch (error) {
        res.status(500).send(error.message)
    }
})
//add address
router.post('/socializeAPI/v1.0/addAddress',auth,async(req,res)=>{
    const username=req.user.username
    try {
        
        const user=await USER.findOne({username})
        const address=req.body
        const isValid=await postalPINService.validatePIN(address.pincode)
        if(!isValid){
            res.status(400).send("Invalid PIN")
        }        
        
        res.status(200).send(user._id)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports=router