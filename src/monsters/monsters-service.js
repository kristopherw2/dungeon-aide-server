const MonstersService = {
    getAllMonsters(knex) {
        return knex.select('*').from('monsters')
    },

    createNewMonster(knex, newMonster) {
        return knex
        .insert(newMonster)
        .into('monsters')
        .returning(['id', 'name', 'health', 'armor_class', 'status_effects'])
    },

    getMonstersByEncounterId (db, encounterId) {
        return db
        .from('monsters')
        .select(
            'monsters.id',
            'monsters.name',
            'monsters.health',
            'monsters.armor_class',
            'monsters.status_effects'
        )
        .where('monsters.encounter', encounterId)
    },

    getMonsterById(knex, id){
        return knex.from('monsters').select('*').where('id', id).first()
    },

    deleteMonsterById(db, id) {
        return db('monsters')
        .where({ id })
        .delete()
    }
};

module.exports = MonstersService