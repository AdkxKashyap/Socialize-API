
const express=require('express')
require('dotenv').config();
require("./src/db/mongoose")

const userManagementRouter=require('./src/routes/user-management')
const userUpdates=require("./src/routes/eventUpdates-management")
const handleEventsUpdate=require('./src/middleware/handleUpdates')
const uploadUserPosts=require('./src/routes/userPosts-management')
const commentsRouter=require('./src/routes/comments-management')
const searchRouter=require('./src/routes/search-bar')
const cors=require('cors')

try {
    const app=express()
app.use(cors())
const port=process.env.PORT

app.use(express.json())

app.use(handleEventsUpdate)
app.use(userManagementRouter)
app.use(userUpdates)
app.use(uploadUserPosts)
app.use(commentsRouter)
app.use(searchRouter)
app.listen(port,()=>{
    // console.log("Server Running On Port",port)
})
} catch (error) {
   console.log(error);
}


// no need for `app.listen()` on Deta, we run the app automatically.
// module.exports = app; // make sure to export your `app` instance.