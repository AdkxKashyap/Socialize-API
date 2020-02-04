const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const UserUpdates = require("../models/updates");//EventUpdates DB
const Friends=require("../models/friends")


router.post(
  "/socializeAPI/v1.0/eventUpdates/:username/:type",
  auth,
  async (req, res) => {
    try {
      console.log(req.user)
      const username = req.params.username;
      const me = req.user.username;

      const userUpdates = new UserUpdates({
        updateType: req.params.type,
        updateTo: username,
        updateSrc:me
      });
      // console.log(req.user)
      console.log(userUpdates)
      await userUpdates.save()
      // console.log(userUpdates)
      // console.log(me)
      res.status(201).send(userUpdates)
    } catch (error) {
      console.log(error.message)
        res.status(500).send({error:error.message})
    }
  }
);

//Get all updates of particular user excluding friend requests
router.get("/socializeAPI/v1.0/eventUpdates",auth,async(req,res)=>{
  try {
    const username=req.user.username
    UserUpdates.where({updateTo:username}).where({seen:false}).where('updateType').ne("friendRequest").exec((err,results)=>{
      if(err){
        res.send(err.message)
      }
      
     UserUpdates.where({updateTo:username}).where('updateType').ne("friendRequest").update({seen:true}).exec((err,rows)=>{
       if(err){
         res.send(err.message)
       }
      res.status(200).send(results)//ne is not equals
     })
      
    })
    
  } catch (error) {
    res.send(error.message)
  }
}) 

//get all friend requests of user
router.get("/socializeAPI/v1.0/eventUpdates/friendRequest",auth,async(req,res)=>{
  try {
    const me=req.user.username
    const friendRequests=await UserUpdates.find({updateTo:me,updateType:"friendRequest",seen:false})
    await UserUpdates.updateMany({updateTo:me,updateType:"friendRequest"},{seen:true})
    res.status(200).send(friendRequests)

  } catch (error) {
    res.status(500).send(error.message)
  }
  
})

//handle friendRequests
router.get("/socializeAPI/v1.0/eventUpdates/friendRequest/:eventId",auth,async(req,res)=>{
    try {
      const eventId=req.params.eventId
      const eventDecision=req.query.eventDecision
      if(eventDecision=="accept"){
        UserUpdates.findById({_id:eventId},'updateTo updateSrc',async(err,result)=>{
          if(err){
            return res.status(500).send(err.message)
          }
        const friends=new Friends({
          friend1:{
            username:result.updateTo
          },
          friend2:{
            username:result.updateSrc
          }
        })
        req.user.friendsCount+=1
        //update friendCount of other user
        await req.user.save()
        await friends.save()
        await UserUpdates.updateOne({_id:eventId},{seen:true})
        res.status(200).send(friends)
        })
      }
      else{
        
        await UserUpdates.deleteOne({_id:eventId})
        return res.status(200).send("deletion successfull")
      }
      
    } catch (error) {
      res.send(error.message)
    }
})

//unfriend
router.delete("/socializeAPI/v1.0/unfriend/:username",auth,async(req,res)=>{
  
  try {
    const me=req.user.username
    const friendName=req.params.username
    var delResult=await Friends.deleteOne({friend1:me,friend2:friendName})
    if(delResult.n<=0){
      delResult=await Friends.deleteOne({friend1:friendName,friend2:me})
      if(delResult.n<=0){
        throw new Error("No friends found between the two users.")
      }
    }
    req.user.friendsCount-=1
    await req.user.save()
    res.status(200).send({delResult})
    
  } catch (error) {
    res.send(error.message)
  }
})
module.exports=router

