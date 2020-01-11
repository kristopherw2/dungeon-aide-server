const EncountersService = require('../src/encounters/encounters-service')
const knex = require('knex')

    let db
    
    //dummy data for users
    let testUsers =[
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
    ]

    //dummy data for encounters
    let testEncounters = [
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


    context(`given 'encounters' has data`, function() {
        
        beforeEach(() => {
            return db
                .into('users')
                .insert(testUsers)
                .then(() => {
              return db
                .into('encounters')
                .insert(testEncounters)
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