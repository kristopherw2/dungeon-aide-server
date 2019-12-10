const EncountersService = {
    getAllEncounters(knex) {
        return knex.select('*').from('encounters')
    },
    createNewEncounter(knex, newEncounter) {
        return knex
        .insert(newEncounter)
        .into('encounters')
        .returning('names')
    },
    deleteEncounter(knex, id) {
        return('encounters')
        .where({ id })
        .delete()
    }
}

module.exports = EncountersService