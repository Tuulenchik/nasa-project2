const launches = require('./launches.mongo')
const planets= require ('./planets.mongo')

const axios=require('axios')

const DEFAULT_FLIGHT_NUMBER=100


async function saveLaunch(launch){
    await launches.findOneAndUpdate({
        flightNumber:launch.flightNumber
    }, launch, {
        upsert:true
    })
}

async function getLatestFlightNumber(){
    const latestLaunch= await launches
    .findOne()
    .sort('-flightNumber')

    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER
    }
    return latestLaunch.flightNumber
}

async function scheduleLaunch(launch){
    const planet=await planets.findOne({
        keplerName: launch.target
    })
    if(!planet){
        throw new Error('no matching planet found')
    }

    const newFlightNumber=await getLatestFlightNumber() +1
    const newLaunch=Object.assign(launch,{
        flightNumber:newFlightNumber,
        success:true,
        upcoming:true,
        customers:['marichka']
    })
    
    await saveLaunch(newLaunch)
}

const SPACEX_API_URL='https://api.spacexdata.com/v4/launches/query'

async function populateLaunches() {
    const response= await axios.post(SPACEX_API_URL,
        {
            query:{},
            
            options:{
                pagination:false,
                populate:[
                    {
                    path:'rocket',
                    select:{
                        name:1
                    }
                },
                {
                    path:'payloads',
                    select:{
                        customers:1
                    }
                }
                ]
            }
        }
    )
    if(response.status!==200){
        console.log('problem downloading lauch')
        throw new Error('Launch data download failed')
    }

    const launchDocs=response.data.docs
    for(const launchDoc of launchDocs){
        const payloads= launchDoc['payloads']
        const customers=payloads.flatMap((payload)=>{
        return payload['customers']
        })
        const launch={
            flightNumber: launchDoc['flight_number'],
            mission:launchDoc['name'],
            rocket:launchDoc['rocket']['name'],
            launchDate:launchDoc['date_local'],
            upcoming:launchDoc['upcoming'],
            success:launchDoc['success'],
            customers,
        }

        await saveLaunch(launch)
        console.log(`${launch.flightNumber}, ${launch.mission}`)
    }
}


async function loadLaunchesData() {
    const firstLaunch=await findLaunch({
        flightNumber:1,
        rocket:'Falcon 1',
        mission:'FalconSat'
    })
    if(firstLaunch){
        console.log('Launch data already loaded')
    }else {await populateLaunches()}
    console.log('downloading data')
    
}

async function findLaunch(filter) {
    return await launches.findOne(filter)
}

async function existsLaunchWithId(launchId){
    return await findLaunch({
        flightNumber:launchId
    })
}

async function getAllLaunches (skip,limit){
    return await launches
    .find({},{
        _id:0, __v:0, 
    })
    .sort({flightNumber:1})
    .skip(skip)
    .limit(limit)
}

async function abortLaunchById(launchId){
 const aborted =  await launches.updateOne({
    flightNumber:launchId
  },{
    upcoming:false,
    success:false,
  });
  return aborted.modifiedCount === 1;
}



module.exports={
    existsLaunchWithId,
    getAllLaunches,
    abortLaunchById,
    scheduleLaunch,
    loadLaunchesData,
}