const express=require('express')
require("./src/db/mongoose")
const userManagementRouter=require('./src/routes/user-management')
const userUpdates=require("./src/routes/eventUpdates-management")
const handleEventsUpdate=require('./src/middleware/handleUpdates')
const uploadUserPosts=require('./src/routes/userPosts-management')
const commentsRouter=require('./src/routes/comments-management')
const searchRouter=require('./src/routes/search-bar')

const app=express()
const port=process.env.PORT

app.use(express.json())
app.use(handleEventsUpdate)
app.use(userManagementRouter)
app.use(userUpdates)
app.use(uploadUserPosts)
app.use(commentsRouter)
app.use(searchRouter)
app.listen(port,()=>{
    console.log("server running on port",port)
})