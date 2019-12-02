const USER_POSTS=require('../models/user-posts')
const GetAllFriendsService=require("./getAllFriendsOfUser")

const getPostsOfUsers=async function(username,limit,skip){
    try {
        const posts= await USER_POSTS.find({username:username}).limit(limit).skip(skip).sort({createdAt:-1})//limit:no of objects to be sent.skip:no.of objects to be skipped by the cursor
        // console.log(posts[0])
        return posts
    } catch (error) {
        return error.message
    }
}

const getPostsOfFriends=async function(username,limit=10,skip=0){
    //posts can be public,private,viewed by some friends or all friends.
    //posts are displayed in order of their time of upload
    
    const friends=await GetAllFriendsService(username)
    var postsData
    try {
        const query1= USER_POSTS.find().where({visibility:"friends"}).where({username:{$ne:username}})
                                            .and([{excludedFriends:{$ne:username}},{username:{$in:friends}}]).sort({createdAt:'desc'})
                                            .limit(limit/2).skip(skip)
                                        
        
        const query2= USER_POSTS.find().where({visibility:"public"}).where({username:{$ne:username}})
                                            .where({excludedFriends:{$ne:username}}).sort({createdAt:'desc'})
                                            .limit(limit/2).skip(skip)
           
                                            
        await  Promise.all([query1,query2]).then((res)=>{
            
           //both query1 and 2 will return arrays of object and res has both in in a single array which needs 
                                //to be separated.We will need all th eobjects in a single array for sorting.
            
            var tmpData=res[0].concat(res[1])
            tmpData.sort((a,b)=>{return new Date(b.createdAt)-new Date(a.createdAt)})
            postsData=tmpData       
        })
        return postsData
    } catch (error) {
        throw new Error(error.message) 
    }
}

const getPostsOfParticularUser=async(myUsername,otherUsername,limit,skip)=>{
    //I(loggged in user) can see only those posts whose visibility is public or friends.

    try {
        var myFriends=await GetAllFriendsService(myUsername)
        var isFriend=myFriends.find((friend)=>{return friend==otherUsername})
    
        if(isFriend!=undefined){
            var query1=await await USER_POSTS.find().and([{username:otherUsername},{excludedFriends:{$ne:myUsername}}])
                                                    .or([{visibility:"public"},{visibility:"friends"}])
                                                    .sort({createdAt:'desc'})
                                                    .limit(limit).skip(skip)
            console.log(query1)
            console.log('1')
            return query1
        }
        else{
            const query=await USER_POSTS.find().and([{username:otherUsername},{visibility:"public"},{excludedFriends:{$ne:myUsername}}])
                                                .sort({createdAt:'desc'})
                                                .limit(limit).skip(skip)
                                                console.log('2')
            return query
        }
       
    }
     catch (error) {
        throw new Error(error.message)
  
    }
}

const fetchPostById=async(id)=>{
    try {
       const post=await USER_POSTS.findById(id)
       if(post==undefined){
           throw new Error('Unable to fetch document')
       }
       return post
    } catch (error) {
        throw new Error(error.message)
    }
}
const GetPostsService={
    getPostsOfUsers,
    getPostsOfFriends,
    getPostsOfParticularUser,
    fetchPostById
}
module.exports=GetPostsService