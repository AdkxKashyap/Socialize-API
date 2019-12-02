const express=require('express')
const router=new express.Router()
const COMMENTS=require('../models/comments')
const USER_POSTS=require('../models/user-posts')
const auth=require('../middleware/auth')

router.post('/socializeAPI/v1.0/comments',auth,async(req,res)=>{
    var commentId
    try {
        const username=req.user.username
        const comment=new COMMENTS({
            ...req.body,
            username:username
        })
        const userPostId=req.body.id
        comment.save(async(err,comment)=>{
            if(err){
                throw new Error(err.message)
            }
            commentId=comment._id
            //increment no of comments of the post
            const post= await USER_POSTS.findById(userPostId)
            post.comments+=1
            await post.save()
            res.status(201).send("Operation Successfully Completed")
        })
        // console.log(typeof(comment.id))
        
        
        
    } catch (error) {
        await USER_POSTS.findByIdAndDelete(commentId)
        res.status.send(error.message)
    }
})

router.delete('/socializeAPI/v1.0/comments/:id',auth,async(req,res)=>{
    try {
    //only the admin or the uploader can delete the comment
    const id=req.params.id
    const comment=await COMMENTS.findById(id)
    const me=req.user.username
    //admin is the one to which the post belongs to
    const post=await USER_POSTS.findById(comment.id)
    const admin=post.username
    if(me!=admin&&me!=comment.username){
        throw new Error("Deletion denied")
    }
    else{
        await COMMENTS.findByIdAndDelete(id)
        post.comments-=1
        await post.save()
        res.status(200).send("Operation Succesfully Completed")
    }
    } catch (error) {
        res.status(400).send(error.message)
    }
    
})

//get comments
//update comment
module.exports=router