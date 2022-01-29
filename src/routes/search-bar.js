const express=require('express')
const router=express.Router()
const auth=require("../middleware/auth")
const User=require('../models/user')

router.get('/socializeAPI/v1.0/search',auth,async(req,res)=>{
    const search = req.query.search;
    
    const limit =parseInt(req.query.limit);
    let list = [];
    if(search == "") {
        res.status(200).send(list);
    }
    User.find({"name":new RegExp('.*' + search + '.*')}).limit(limit).then((users)=>{
        users.forEach((user)=>{
            list.push({
                "name":user.name,
                "username":user.username
            })
        })
       
        res.status(200).send(list);
    }).catch((err)=>{
        res.status(500).send(err.message);
    })
})

module.exports=router;