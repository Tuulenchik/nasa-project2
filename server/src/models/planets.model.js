const fs = require('fs');
const path=require('path')
const {parse} = require('csv-parse');

const planets=require('./planets.mongo')

const habitablePlanets = [];

function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}
//our planets data is loaded and parsed as a STREAM and all of this happens asynchronously:
//we tell node to start processing our file but we dont wait around for it 
//(our module exports the planets before they have been loaded )
//so this planets.model.js is required for planets.controller.js and frontend will still get the empty list because the planets will still be loading)
//but we can create JS PROMISE for loading code --->

function loadPlanetsData(){ //we will return a promise that resolves when habitable planets have been found
    //and we will resolve our promise BEFORE listening to the requests in our server (before server.listen function)
    return new Promise ((resolve,reject)=>{fs.createReadStream(path.join(__dirname, '..','..','data','kepler_data.csv'))
  .pipe(parse({
    comment: '#',
    columns: true,
  }))
  .on('data', async (data) => {
    if (isHabitablePlanet(data)) {
      await saveAllPlanets(data)
    }
  })
  .on('error', (err) => {
    console.log(err);
    reject(err)
  })
  .on('end', async() => {
    const countPlanetsFound=(await getAllPlanets()).length
    console.log(`${countPlanetsFound} habitable planets found!`);
    resolve() //we call this function when we are done parsing our data 
  });
})
}

async function getAllPlanets(){
  return await planets.find({},{
    _id:0, __v:0
  })
}

async function saveAllPlanets(planet){
  try{
    await planets.updateOne({
        keplerName:planet.kepler_name
      },{
        keplerName:planet.kepler_name
      },{
        upsert:true
      })
  }catch(err){
    console.err(`couldn't save a planet ${err}`)
  }
}

  module.exports={
    loadPlanetsData,
    getAllPlanets,
  }
//for this to work we need to install csv-parse: npm install csv-parse