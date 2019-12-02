const mongoose=require('mongoose')
const Schema=mongoose.Schema

const commentsSchema=new Schema({
    //id of the post or any user upload to which the user is commenting
    id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    likes:{
        type:Number,
        default:0
    },
    dislikes:{
        type:Number,
        default:0
    },
    subComments:[{
        //this will be used for the replies to the main comments. 
        comments:{
            content:{
                type:String
            },
            username:{
                type:String,
                required:true
            },
            likes:{
                type:Number,
                default:0
            },
            dislikes:{
                type:Number,
                default:0
            }
        }
    }]
},{
    timestamps:true
})

const CommentsModel=new mongoose.model('comments',commentsSchema)
module.exports=CommentsModel