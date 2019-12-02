
const FRIENDS=require("../models/friends")//friends db

const getFriends=async function(username){
    try {
        var friends=[]
        const temp1=await FRIENDS.find({"friend1.username":username},'friend2.username')
        temp1.forEach((friend)=>{
            friends.push(friend.friend2.username)
        })
        const temp2= await FRIENDS.find({"friend2.username":username},'friend1.username')
        temp2.forEach((friend)=>{
            friends.push(friend.friend1.username)
        })
        return friends
    } catch (error) {
        return new Error(error.message)
    }
}

module.exports=getFriends