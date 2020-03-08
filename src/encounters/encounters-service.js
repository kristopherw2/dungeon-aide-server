const EncountersService = {
    getAllEncounters(knex) {
        return knex.select('*').from('encounters')
    },
    getEncounterById(knex, id) {
        return knex.from('encounters').select('*').where('id', id).first()
    },
    createNewEncounter(knex, newEncounter) {
        return knex
        .insert(newEncounter)
        .into('encounters')
        .returning(['id','names'])
    },
    deleteEncounter(knex, id) {
        return knex('monsters') //deletes associated monsters from monsters table first
        .where('monsters.encounter', id)
        .delete()
        .then(() => {
            return knex ('encounters') //deletes encounter by id
            .where({ id })
            .delete()
        })
    },
    updateEncounter(knex, id, newEncounterMonster) {
        return knex('encounters')
        .where({ id })
        .update(newEncounterMonster)
    },
}

module.exports = EncountersService