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


describe('GET /api/encounters', function() {
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

        it('GET /api/encounters responds with 200 and all the encounters', () => {
            return supertest(app)
            .get('/api/encounters')
            .expect(200, testEncounters)
        });
    });
});

describe('GET /api/encounters/encounter_id', function() {
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
                .then(() => {
                    return db
                    .into('monsters')
                    .insert()
                })
            })
    });
        it('GET /api/encounters/:encounterId', () => {
            const encounterId = 2;
            const expectedEncounter = testEncounters[encounterId - 1];
            return supertest(app)
            .get(`/api/encounters/${encounterId}`)
            .expect(200, expectedEncounter)
        });
    });

    context(`Given an XSS attack encounter`, () => {
        const maliciousEncounter = {
            id: 22,
            names: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
            users: 3
        };

        beforeEach(`insert malicious encounter`, () => {
            return db
            .into('users')
            .insert(testUsers)
            .then(() => {
            return db
            .into('encounters')
            .insert(maliciousEncounter)
            });
        });

        it(`removes XSS attack`, () => {
            return supertest(app)
            .get(`/api/encounters/${maliciousEncounter.id}`)
            .expect(200)
            .expect(res => {
                expect(res.body.names).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
            })
        });
    });
});

describe(`Get /api/encounters`, () => {
    context('given no encounters', () => {
        it('responds with 200 and an empty array', () => {
            return supertest(app)
            .get('/api/encounters')
            .expect(200, [])
        });
    });
});

describe('GET /api/encounters/:encounter_id', () => {
    context('Given there is no encounters', () => {
        it('responds with 404', () => {
            const encounterId = 123456;
            return supertest(app)
            .get(`/api/encounters/${encounterId}`)
            .expect(404, {error: {message: `Encounter doesn't exist`} })
        });
    });
});

describe('POST /api/encounters', () => {
    
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
        .post('/api/encounters')
        .send(newEncounter)
        .expect(201)
        .expect(res => {
            expect(res.body[0].names).to.eql(newEncounter.names)
        //     expect(res.body.users).to.eql(newEncounter.users)
            expect(res.body[0]).to.have.property('id')
            console.log(res.body[0].id);
            expect(res.headers.location).to.eql(`/api/encounters/${res.body[0].id}`)
        })
        .then(postRes => {
            supertest(app)
            .get(`/api/encounters/${postRes.body.id}`)
            .expect(postRes.body[0])
        });
    });

    it(`responds with 400 and an error message when the 'names' property is missing`, () => {
        return supertest(app)
        .post('/api/encounters')
        .send({
            users: 2
        })
        .expect(400, { error: { message: `Missing 'name' in encounter`} })
    });
});

describe(`DELETE /api/encounters/:encounter_id`, () => {
    context(`Given there are encounters in the database`, () => {

        beforeEach(`Insert encounters and users`, () => {
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
            });
        });

        it('responds with 204 and removes the encounter', () => {
            const idToRemove = 3;
            const expectedEncounter = testEncounters.filter(encounter => encounter.id !== idToRemove)
            const expectedMonsters = testMonsters.filter(monster => monster.encounter !== idToRemove)
            return supertest(app)
            .delete(`/api/encounters/${idToRemove}`)
            .expect(204)
            .then(res =>
                supertest(app)
                .get('/api/encounters')
                .expect(expectedEncounter)
                );
        });
    });

    context(`Given no encounters`, () => {
        it(`responds with 404`, () => {
            const encounterId = 123456789;

            return supertest(app)
            .delete(`/api/encounters/${encounterId}`)
            .expect(404, { error: { message: `Encounter doesn't exist`} } )
        });
    });
});

describe(`PATCH /api/encounters/:encounter_id`, () => {
    context(`Given no Encounters`, () => {
        it(`responds with 404`, () => {
            const encounterId = 123456;
            return supertest(app)
                .patch(`/api/encounters/${encounterId}`)
                .expect(404, { error: { message: `Encounter doesn't exist` } })
        });
    });

    context(`Given there are encounters in the database`, () => {
        
        beforeEach(`inserts users and encounters`, () => {
            return db
                .into('users')
                .insert(testUsers)
                .then(() => {
                    return db
                    .into('encounters')
                    .insert(testEncounters)
                })
        });

        it(`responds with 204 and updates the encounter`, () => {
            const idToUpdate = 2;
            const updatedEncounter = {
                names: "This be the updated name"
            };
            const expectedEncounter = {
                ...testEncounters[idToUpdate - 1],
                ...updatedEncounter
            };

            return supertest(app)
                .patch(`/api/encounters/${idToUpdate}`)
                .send(updatedEncounter)
                .expect(204)
                .then(res =>
                    supertest(app)
                    .get(`/api/encounters/${idToUpdate}`)
                    .expect(expectedEncounter)
                    )
        });

        it(`responds with 400 when no required fields are supplied`, () => {
            const idToUpdate = 2;
            return supertest(app)
                .patch(`/api/encounters/${idToUpdate}`)
                .send({ irrelevantField: "yep" })
                .expect(400, { error: { message: 'Request must contain a name'} } )
        });

        it(`responds with 204 when updating only a subset of field`, () => {
            const idToUpdate = 2;
            const updatedEncounter = {
                names: "This be the updated name"
            };
            const expectedEncounter = {
                ...testEncounters[idToUpdate - 1],
                ...updatedEncounter
            };

                return supertest(app)
                    .patch(`/api/encounters/${idToUpdate}`)
                    .send({
                        ...updatedEncounter,
                        fieldToIgnore: "this should not be in the GET response"
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                        .get(`/api/encounters/${idToUpdate}`)
                        .expect(expectedEncounter)
                    )
        });
    });
});
