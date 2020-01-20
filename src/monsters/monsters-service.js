const MonstersService = {
    getAllMonsters(knex) {
        console.log('get all monsters is being called')
        return knex.select('*').from('monsters')
    },

    createNewMonster(knex, newMonster) {
        console.log('create new monster has been called')
        return knex
        .insert(newMonster)
        .into('monsters')
        .returning(['id', 'name', 'health', 'armor_class', 'status_effects'])
    },

    getMonstersByEncounterId (db, encounterId) {
        console.log(`getMonstersByEncounterId has been called`)
        return db
        .from('monsters')
        .innerJoin('encounters', 'encounters.id', 'monsters.encounter')
        .select(
            'monsters.id',
            'monsters.name',
            'monsters.health',
            'monsters.armor_class',
            'monsters.status_effects',
            'monsters.encounter'
        )
        .where('monsters.encounter', encounterId)
    },

    getMonsterById(knex, id){
        console.log('getMonstersById fired')
        return knex.from('monsters').select('*').where('id', id).first()
    },

    deleteMonsterById(db, id) {
        return db('monsters')
        .where({ id })
        .delete()
    }
};

module.exports = MonstersService