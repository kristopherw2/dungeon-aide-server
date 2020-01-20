const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray} = require('./users.fixtures')
const { makeEncountersArray } = require('./encounters.fixtures')
const { makeMonstersArray } = require('./monsters.fixtures')

 //declare db variable
 let db

 //dummy data for users table
const testUsers = makeUsersArray();

 //dummy data for encounters table
const testEncounters = makeEncountersArray();

//dummy data for monsters table
const testMonsters = makeMonstersArray();

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

describe('Get /api/:encounter_id/monster', () => {
    beforeEach('insert users, encounters, monsters', () => {
        return db
        .into('users')
        .insert(testUsers)
        .then(() => {
                return db
                .into('encounters')
                .insert(testEncounters)
                .then(() => {
                    return db
                    .into('monsters')
                    .insert(testMonsters)
                })
            })
    });

    it.only(`GET /api/monsters responds with 200 and monsters by encounter_id`, () => {
        const encounter_id = 2;
        const expectedMonsters = testMonsters.filter(item => item.encounter === encounter_id)
        return supertest(app)
        .get(`/api/monsters/${encounter_id}/monster`)
        .expect(200, expectedMonsters)
    })
})