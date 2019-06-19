const mongoose=require('mongoose')
const Schema=mongoose.Schema

const updatesSchema=new Schema({
    updateType:{
        type:String,
        required:true
    },
    updateTo:{
        type:String,
        required:true,
},
    updateSrc:{
        type:String,
        required:true
},
    seen:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const USERUPDATES=mongoose.model("eventUpdates",updatesSchema)
module.exports=USERUPDATES