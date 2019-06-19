const mongoose=require('mongoose')
const Schema=mongoose.Schema

const friends=new Schema({
    friend1:{
        username:{
            type:String,
            required:true,
            
        }
    },
    friend2:{
        username:{
            type:String,
            required:true,
            
        }
    }
},{
    timestamps:true
})

const FriendsModel=mongoose.model('friends',friends)
module.exports=FriendsModel