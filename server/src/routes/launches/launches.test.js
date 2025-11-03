const request=require('supertest')
const app=require('../../app')
const {mongoConnect}=require('../../services/mongo')

describe('Launches API',()=>{
   beforeAll(async()=>{
    await mongoConnect()
   })

describe ('Test GET /launches',()=>{
    test('It should respond with 200 success',async()=>{
        const response= await request(app)
        .get('/v1/launches')
        .expect(200)
        .expect('Content-Type', /json/)
        //expect(response.statusCode).toBe(200)
    })
})

describe ('Test POST /launch',()=>{
    const completeLaunchData={
        mission:'kill',
        rocket:'seal',
        target:'Kepler-62 f',
        launchDate:'June 18, 2029'
    }

    const launchDataWithoutDate={
        mission:'kill',
        rocket:'seal',
        target:'Kepler-62 f',
    }

    const launchDataWithInvalidDate={
        mission:'kill',
        rocket:'seal',
        target:'Kepler-62 f',
        launchDate:'wrong data'
    }
    test('It should respond with 201 success', async()=>{
        const response= await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect(201)
        .expect('Content-Type', /json/)

       const requestDate= new Date(completeLaunchData.launchDate).valueOf()
       const responseDate= new Date(response.body.launchDate).valueOf()
       expect(responseDate).toBe(requestDate)
       expect(response.body).toMatchObject(launchDataWithoutDate)

    })

    test('It should catch missing properties', async()=>{
        const response= await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect(400)
        .expect('Content-Type', /json/)

        expect(response.body).toStrictEqual({
            error:'missing launch property'
        })

    })

    test('It should catch invalid dates', async()=>{
        const response= await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect(400)
        .expect('Content-Type', /json/)

        expect(response.body).toStrictEqual({
            error:'invalid launch date'
        })

    })
})


})

