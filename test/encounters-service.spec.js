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
            users: 3
        },
    ];

    before(() => {
        db = knex({
            client:'pg',
            connection: process.env.TEST_DB_URL
        })
    });

    before(() => db.schema.table('encounters', function(t) {
        t.dropForeign('users', 'encounters_fk');
    }));

    // before(() => db('encounters').truncate())

    // before(() => {
    //     return db.raw('TRUNCATE TABLE users, encounters, monsters RESTART IDENTITY CASCADE')
    // });

    before(() => {
        return db
        .into('encounters')
        .insert(testEncounters)
    });

    afterEach(() => db.schema.table('encounters', function(t) {
        t.foreign('users').references('id').inTable('users').withKeyName('encounters_fk')
    }));

    after(() => db.destroy());

describe(`getAllEncounters()`, function() {
    it(`resolves all encounters from the 'encounters' table`, () => {
        return EncountersService.getAllEncounters(db)
        .then(actual => {
            expect(actual).to.eql(testEncounters)
        })
    })
});