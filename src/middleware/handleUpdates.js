const express=require('express')
const router=new express.Router()
const auth=require("./auth")

router.get("/socializeAPI/v1.0/eventUpdates/eventType/:eventId",auth,(req,res)=>{
    const eventType=req.query.eventType
    const eventId=req.params.eventId
    const eventDecision=req.query.eventDecision
    
    res.redirect("/socializeAPI/v1.0/eventUpdates/"+eventType+"/"+eventId+"?eventDecision="+eventDecision)
})

module.exports=router