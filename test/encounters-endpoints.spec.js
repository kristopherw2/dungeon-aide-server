const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray} = require('./users.fixtures')
const { makeEncountersArray } = require('./encounters.fixtures')

 //declare db variable
 let db

 //dummy data for users table
const testUsers = makeUsersArray();

 //dummy data for encounters table
const testEncounters = makeEncountersArray();

 //create knexinstance
before('make knex instance', () => {
    db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
    })
    app.set('db', db);
});


//truncate all tables due to FK restraints before each test
before(() => {
    return db.raw('TRUNCATE TABLE users, encounters, monsters RESTART IDENTITY CASCADE')
});

//truncate after each test to keep tables clean
afterEach(() => {
    return db.raw('TRUNCATE TABLE users, encounters, monsters RESTART IDENTITY CASCADE')
});

after('disconnect from db', () => db.destroy());


describe('GET /encounters', function() {
    context('given there are encounters in the database', () => {
        
        //have to insert users and encounters data due to FK restraints
        beforeEach('insert encounters', () => {
            return db
            .into('users')
            .insert(testUsers)
            .then(() => {
                    return db
                    .into('encounters')
                    .insert(testEncounters)
                })
        });

        it('GET /encounters responds with 200 and all the encounters', () => {
            return supertest(app)
            .get('/encounters')
            .expect(200, testEncounters)
        });
    });
});

describe('GET /encounters/encounter_id', function() {
    context('given there are encounters in the database', () => {
    //have to insert users and encounters data due to FK restraints
    beforeEach('insert encounters', () => {
        return db
        .into('users')
        .insert(testUsers)
        .then(() => {
                return db
                .into('encounters')
                .insert(testEncounters)
            })
    });
        it('GET /encounters/:encounterId', () => {
            const encounterId = 2;
            const expectedEncounter = testEncounters[encounterId - 1];
            return supertest(app)
            .get(`/encounters/${encounterId}`)
            .expect(200, expectedEncounter)
        });
    });
});

describe(`Get /encounters`, () => {
    context('given no encounters', () => {
        it('responds with 200 and an empty array', () => {
            return supertest(app)
            .get('/encounters')
            .expect(200, [])
        });
    });
});

describe('GET /encounters/:encounter_id', () => {
    context('Given there is no encounters', () => {
        it('responds with 404', () => {
            const encounterId = 123456;
            return supertest(app)
            .get(`/encounters/${encounterId}`)
            .expect(404, {error: {message: `Encounter doesn't exist`} })
        });
    });
});

describe.only('POST /encounters', () => {
    
    beforeEach('insert users', () => {
        return db
        .into('users')
        .insert(testUsers)
    });

    it(`creates a new encounter, responds with 201 and the new encounter`, ()=>{
        const newEncounter = {
            names: 'BIG DRAGON',
            users: 1
        }

        return supertest(app)
        .post('/encounters')
        .send(newEncounter)
        .expect(201)
        .expect(res => {
            expect(res.body.names).to.eql(newEncounter.names)
            expect(res.body.users).to.eql(newEncounter.users)
            expect(res.body).to.have.property('id')
            expect(res.headers.location).to.eql(`/encounters/${res.body.id}`)
        })
        .then(postRes => {
            supertest(app)
            .get(`/encounters/${postRes.body.id}`)
            .expect(postRes.body)
        });
    });
});
