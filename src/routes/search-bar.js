const express=require('express')
const router=express.Router()
const auth=require("../middleware/auth")
const User=require('../models/user')

//creating a dictionary
var map=new Map()

router.get('/socializeAPI/v1.0/search',auth,async(req,res)=>{
    User.where().or([{username:{$regex:req.query.search,}},{name:{$regex:req.query.search}}]).then((data)=>{
        data.forEach((user)=>{
            map.set(user.name,user.username)
        })
        console.log([...map])
        console.log(JSON.stringify([...map]))
        res.status(200).send(JSON.stringify([...map]))
    }).catch((err)=>{
        res.status(500).send(err.message)
    })
})


module.exports=router