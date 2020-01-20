const MonstersService  = require('../src/monsters/monsters-service')
const knex = require('knex')
const { makeUsersArray } = require('./users.fixtures')
const { makeEncountersArray } = require('./encounters.fixtures')
const { makeMonstersArray } = require('./monsters.fixtures')

let db;

let testUsers = makeUsersArray();

let testEncounters = makeEncountersArray();

let testMonsters = makeMonstersArray();

before(() => {
    db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL
    })
});

before(() => {
    return db.raw('TRUNCATE TABLE users, encounters, monsters RESTART IDENTITY CASCADE')
});

//truncate tables after each test to prevent test leak
afterEach(() => {
    return db.raw('TRUNCATE TABLE users, encounters, monsters RESTART IDENTITY CASCADE')
});

//disconnect after test
after(() => db.destroy());

context('Given monsters table has data', () => {
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

    it('getMonstersByEncounterId() resolves monsters with specific encounter_id', () => {
        const encounterId = 3;
        const expectedMonster = {
            id: 5,
            name: "Goblin5",
            health: 8,
            armor_class: 12,
            status_effects: "paralyzed",
            encounter: 3
        }
        return MonstersService.getMonstersByEncounterId(db, encounterId)
            .then((actual) => {
                console.log(actual)
                expect(actual[0]).to.eql(expectedMonster)
            })
    })
});