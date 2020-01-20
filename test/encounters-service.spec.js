const EncountersService = require('../src/encounters/encounters-service')
const knex = require('knex')
const { makeUsersArray } = require('./users.fixtures')
const { makeEncountersArray } = require('./encounters.fixtures')
const { makeMonstersArray } = require('./monsters.fixtures')

    let db
    
    //dummy data for users
    let testUsers = makeUsersArray();

    //dummy data for encounters
    let testEncounters = makeEncountersArray();

    //dummy data for monsters
    let testMonsters = makeMonstersArray();

    //create knex instance
    before(() => {
        db = knex({
            client:'pg',
            connection: process.env.TEST_DB_URL
        })
    });


    //truncate and cascade down due to FK restrictions
    before(() => {
        return db.raw('TRUNCATE TABLE users, encounters, monsters RESTART IDENTITY CASCADE')
    });

    //truncate tables after each test to prevent test leak
    afterEach(() => {
        return db.raw('TRUNCATE TABLE users, encounters, monsters RESTART IDENTITY CASCADE')
    });

    //disconnect after test
    after(() => db.destroy());


    context(`given 'encounters' has data`, () => {
        
        beforeEach(() => {
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
    
        it(`getAllEncounters() resolves all encounters from the 'encounters' table`, () => {
            return EncountersService.getAllEncounters(db)
            .then(actual => {
                expect(actual).to.eql(testEncounters)
            })
        });

        it(`getEncountersByUser() resolves an encounter by user from 'encounters' table`, () => {
            const secondId = 2;
            const secondTestEncounter = testEncounters[secondId - 1];
            return EncountersService.getEncountersByUser(db, secondId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: secondId,
                        names: secondTestEncounter.names,
                        users: secondId
                    })
                })
        });

        it(`deleteEncounter() removes an encounter by id from 'encounters' table`, () => {
            const encounterId = 3;
            return EncountersService.deleteEncounter(db, encounterId)
            .then(() => EncountersService.getAllEncounters(db))
            .then(allEncounters => {

                //filter array to delete id === encounter.id
                const expected = testEncounters.filter(item => item.id !== encounterId)
                expect(allEncounters).to.eql(expected)
            })
        });

        it(`updateEncounter() updates an encounter from the 'encounters' table`, () => {
            const idOfEncounterToUpdate = 2;
            const newEncounterData = {
                names: 'hanks carpet emporium'
            }
            return EncountersService.updateEncounter(db, idOfEncounterToUpdate, newEncounterData)
                .then(() => EncountersService.getEncountersByUser(db, idOfEncounterToUpdate))
                .then(encounter => {
                    expect(encounter).to.eql({
                        id: idOfEncounterToUpdate,
                        ...newEncounterData,
                        users: idOfEncounterToUpdate
                    })
                })
        });
    });

    context(`Given 'encounters' table has no data`, () => {

        beforeEach(() => {
            return db
                .into('users')
                .insert(testUsers)
        });

        it(`getAllEncounters() resolves an empty array`, () => {
            return EncountersService.getAllEncounters(db)
            .then(actual => {
                expect(actual).to.eql([])
            })
        });

        it(`createNewEncounter() creates a new encounter with an 'id'`, () => {
            const newEncounter = {
                id: 1,
                names: "De Besh Around",
                users: 1
            }
            return EncountersService.createNewEncounter(db, newEncounter)
        });
    });