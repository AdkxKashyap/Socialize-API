const rp=require('request-promise')
const asyncForEach=require('./asyncForEach')
const getPIN_Data=async(code)=>{
    const uri="https://api.postalpincode.in/pincode/"+code
    try {

        const options={
            method:'GET',
            uri,
        }
       
        const PIN_data=await rp(options)
            // console.log(data)
            // var res="Invalid PIN"
            console.log(4)
            console.log(PIN_data.Status)
            // console.log(PIN_data)
            if(PIN_data.Status=="Error"||PIN_data.Message=="No records found"||PIN_data.PostOffice==null)
            {
                 console.log(5)
                
                return "Invalid PIN"
                // return res 
            }
            // console.log(PIN_data)
            return PIN_data
        
        
    } catch (error) {
        throw new Error(error.Message)
    }
}
 const validatePIN=async(pin)=>{

    try {
        console.log(2)
        const res=await getPIN_Data(pin)
        // const cb=async function(data){
        //    const isValid=await getPIN_Data(data)
        //    console.log(isValid)
        // }

        // await asyncForEach(addresses,cb)
        if(res=="Invalid PIN"){
            console.log(6)
            return false
        }  
        
        return true
    } catch (error) {
        
        throw new Error(error.message)    
}
    
}

const PostalPINService={
    getPIN_Data,
    validatePIN
}
module.exports=PostalPINService

