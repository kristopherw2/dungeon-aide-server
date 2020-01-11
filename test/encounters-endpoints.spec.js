const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')


describe('Encounters endpoints', function() {
     //declare db variable
    let db

     //dummy data for users table
    const testUsers =[
        {
            id: 1,
            username: 'firstuser',
            password: 'password',
            email: 'firstuser@email.com'
        },
        {
            id: 2,
            username: 'seconduser',
            password: 'password',
            email: 'seconduser@email.com'
        },
        {
            id: 3,
            username: 'thirduser',
            password: 'password',
            email: 'thirduser@email.com'
        },
        {
            id: 10,
            username: 'fourthuser',
            password: 'password',
            email: 'fourthuser@email.com'
        }
    ];

     //dummy data for encounters table
    const testEncounters = [
        {
            id: 1,
            names: 'Goblin Horde',
            users: 1,
        },
        {
            id: 2,
            names: 'Orc Adventure',
            users: 2,
        },
        {
            id: 3,
            names: 'Bard Seduction',
            users: 3
        },
    ];

     //create knexinstance
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    });

    app.set('db', db);
    
    //truncate all tables due to FK restraints before each test
    before(() => {
        return db.raw('TRUNCATE TABLE users, encounters, monsters RESTART IDENTITY CASCADE')
    });

    after('disconnect from db', () => db.destroy());

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
