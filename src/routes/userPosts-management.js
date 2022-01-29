const express=require('express')
const USER_POSTS=require('../models/user-posts')
const auth=require('../middleware/auth')
const GetAllFriendsService=require("../services/getAllFriendsOfUser")
const GetPostsService=require('../services/getPostsService')
const multer=require('multer')
const jimp=require('jimp')
const router=new express.Router()

//upload posts

const uploadImages=multer({
    limits:{
    fieldSize:10000000} 
})
//using jimp npm modeule for image editing
const modifyImage=async(imageBuffer)=>{
    
    var image= await jimp.read(imageBuffer)
    image.resize(256,256)
    var buffData=await image.getBufferAsync(jimp.MIME_PNG).then((res)=>{
        return res
    })
    
    return buffData       
    
}

const uploadFieldNames=uploadImages.fields([{name:'imageData',maxCount:5}])
router.post('/socializeAPI/v1.0/uploadPost',uploadFieldNames,auth,async(req,res)=>{
    const images=req.files.imageData
    
    try {
        req.body.username=req.user.username
        const userPost=new USER_POSTS(req.body)//req.body holds the text fields

        
        async function asyncForEach(array,cb){
            //Reason for writing a seperate custom forEach func is that the build in for Each function does not support async 
            //check https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
            for(i=0;i<array.length;i++){
                await cb(array[i])
            }
        }

        //dealing with the image files
        if(images!=null){
            await asyncForEach(images,async(imageData)=>{
                const imageBufferData=imageData.buffer
                const imageBuffer=await modifyImage(imageBufferData)
                userPost.imageData.push({imageBuffer})//the name of the field in the schema needs to be same with the variable name containing the data that need to be added
             
            })
        }

        
        //saving the user-post in db
        await userPost.save()
        
        res.status(201).send(userPost._id)
    } catch (error) {
        res.status(500).send(error.message)
    }
})
//retriving only 5 posts per request.
//get all posts of user
router.get('/socializeAPI/v1.0/getPostsOfUser/:limit/:skip',auth,async(req,res)=>{
    const username=req.user.username
    const skip=parseInt(req.params.skip) ||0
    const limit=parseInt(req.params.limit)||5

    try {
        const posts=await GetPostsService.getPostsOfUsers(username,limit,skip)
        res.status(200).send(posts)
    } catch (error) {
        res.status(500).send(error.message)
    }
})
//get posts
router.get('/socializeAPI/v1.0/getPosts/:limit/:skip',auth,async(req,res)=>{
    //posts can be public,private,viewed by some friends or all friends.
    //posts are displayed in order of their time of upload

    try {
        const limit=parseInt(req.params.limit)
        const skip=parseInt(req.params.skip) 
        GetPostsService.getPostsOfFriends(req.user.username,limit,skip).then((postData)=>{
            res.status(200).send(postData)
        })     
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.get('/socializeAPI/v1.0/getPostsOfParticularUser/:otherUsername/:limit/:skip',auth,async(req,res)=>{
    const username=req.user.username
    const otherUsername=req.params.otherUsername
    const limit=parseInt(req.params.limit)
    const skip=parseInt(req.params.skip)
    try {
        GetPostsService.getPostsOfParticularUser(username,otherUsername,limit,skip).then((posts)=>{
            res.status(200).send(posts)
        })
    } catch (error) {
        res.status(500).send(error.message)
    }
    
})

//update posts
router.patch('/socializeAPI/v1.0/updatePost/:postId',auth,async(req,res)=>{
    const postId=req.params.postId
    
    try {
        const post=await GetPostsService.fetchPostById(postId)
        if(post.username!=req.user.username){
            throw new Error("Post does not belong to this user")
        }

        const updates=Object.keys(req.body)
        const validUpdates=["excludedFriends","visibility","type","textContent","imageData"]
        const isValidUpdate=updates.every((update)=>{
            return validUpdates.includes(update)
        })
        if(!isValidUpdate){
            throw new Error("Invalid Update")
        }

        updates.forEach((update)=>{
            post[update]=req.body[update]
        })
        await post.save()
        res.status(200).send(post._id)
    } catch (error) {
        res.status(500).send(error.message)
    }
   
    
})

//delete
router.delete('/socializeAPI/v1.0/deletePost/:postId',auth,async(req,res)=>{
    try {
        const postId=req.params.postId
        const post=await GetPostsService.fetchPostById(postId)
        if(post.username!=req.user.username){
            throw new Error("Post does not belong to this user")
        }
        USER_POSTS.deleteOne({_id:postId})
        res.status(200).send(postId)
    } catch (error) {
        res.status(500).send(error.message)
    }
})
module.exports=router