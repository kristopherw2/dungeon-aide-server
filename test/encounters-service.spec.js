const EncountersService = require('../src/encounters/encounters-service')
const knex = require('knex')
    let db
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
            users: 3,
        },
    ]

    before(() => {
        db = knex({
            client:'pg',
            connection: process.env.TEST_DB_URL
        })
    })

    after(() => db.destroy())

    before(() => db('encounters').truncate())



    before(() => {
        return db
        .into('encounters')
        .insert(testEncounters)
    })

describe(`Encounters service object`, function() {
    it(`resolves all encounters from the 'encounters' table`, () => {
        return EncountersService.get(db)
        .then(actual => {
            expect(actual).to.eql(testEncounters)
        })
    })
})