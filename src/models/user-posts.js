const mongoose=require('mongoose')

const Schema=mongoose.Schema

const imagesSchema=new Schema({
    imageBuffer:{
        type:Buffer
    }
})

const userPostsSchema=new Schema({
    username:{
        type:String,
        required:true
    },
    type:{
        //user can upload texts,images,videos or any combination of the same.
        //eg:type:"IMAGE_TEXT" for both image and texts or "TEXT" for only text type post
        type:String,
        required:true
    },
    visibility:{
        //user can choose who can view their posts.
        //private,public,friends,exclude some friends
        type:String,
        required:true
    },
    textContent:{
        //will contain texts only
        type:String
        // required:true
    },
    imageData:[
        //if user uploads an image the data will be stored here
        //user can upload multiple images
        imagesSchema
    ],
    //friends who cannot see this post
    excludedFriends:[
        {
            type:String
        }
    ],
    likes:{
        type:Number,
        default:0
    },
    dislikes:{
        type:Number,
        default:0
    },
    comments:{
        type:Number,
        default:0
    }
},{
    timestamps:true
})

userPostsSchema.methods.toJSON=function(){
    const userObject=this.toObject()
    delete userObject.imageData
    return userObject
}

const USER_POSTS=mongoose.model('User Posts',userPostsSchema)

module.exports=USER_POSTS