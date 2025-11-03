const {getAllPlanets}=require('../../models/planets.model')//we create the array of planets
//in MODELS : planets.model.js
async function httpGetAllPlanets(req,res){
    return res.status(200).json(await getAllPlanets()) //return the array as JSON
    //we use RETURN so our function STOPS EXECUTING and only one response is ever set
}
module.exports={
    httpGetAllPlanets
}//we return it as an object because there's going to be multiple functions that
//might be returned


//controller takes in ACTIONS and REQUESTS from user and works with them to 
//update the models