const express=require('express')
const {
    httpGetAllPlanets
}=require('./planets.controller')
//usually we would write: const planetsController=require('./planets.controller')
//or we can destructure and return that object and we can know exaclty which function are we using
//and we can any other functions in the same way (using direclty when we specify our routes)

//and now we need to add our ENDPOINT --> Go to client/src/hook/requests.js
const planetsRouter=express.Router()
planetsRouter.get('/', httpGetAllPlanets) //getAllPlanets function will be 
//written in planets.controller.js

module.exports=planetsRouter