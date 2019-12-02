async function asyncForEach(array,cb){
    //Reason for writing a seperate custom forEach func is that the build in for Each function does not support async 
    //check https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    for(i=0;i<array.length;i++){
        await cb(array[i])
    }
}

module.exports=asyncForEach