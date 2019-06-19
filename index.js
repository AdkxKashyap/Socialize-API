const express=require('express')
require("./src/db/mongoose")
const userManagementRouter=require('./src/routes/user-management')
const userUpdates=require("./src/routes/eventUpdates")
const handleEventsUpdate=require('./src/middleware/handleUpdates')
const app=express()
const port=process.env.PORT

app.use(express.json())
app.use(handleEventsUpdate)
app.use(userManagementRouter)
app.use(userUpdates)

app.listen(port,()=>{
    console.log("server running on port",port)
})