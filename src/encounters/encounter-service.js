const EncountersService = {
    getUserEncounter(knex, users) {
        return knex.select({ users }).from('encounters')
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
    },
    updateEncounter(knex, id, newEncounterMonster) {
        return knex('encounters')
        .where( { id })
        .update(newEncounterMonster)
    }
}

module.exports = EncountersService