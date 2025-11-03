const express=require('express')
const path=require('path')
const cors= require('cors')
const morgan= require('morgan')

const api=require('./routes/api')



const app=express()

app.use(cors({
    origin: 'http://localhost:3000',
}))

app.use(morgan('combined'))



app.use(express.json())
app.use(express.static(path.join(__dirname,'..','public'))) //we use it to connect public folder with index html file so it can show up when we launch the server
//and now the launch part is on localhost 8000 and not 3000 like we used to have on a client

//the request comes in to express, gets checked for JSON content type
//if we are passing some data app.use(express.json()) and then goes 
//through our express router app.use(planetsRouter) which handles first of all
// of these planets routes

app.use('/v1', api)
app.get('/*',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','public','index.html'))
})
//now it will automatically browse index.html file when launching the server
//express is trying to find '/history' file using static file serving middleware and if it doesnt find then it goes to find /history endpoint in our api that doesnt exist
// * - asterisk or star matches everything that follows the slash so react can handle the routing instead 
module.exports=app