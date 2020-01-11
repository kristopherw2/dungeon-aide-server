const EncountersService = {
    getAllEncounters(knex) {
        return knex.select('*').from('encounters')
    },
    getEncountersByUser(knex, users) {
        return knex.from('encounters').select('*').where('users', users).first()
    },
    createNewEncounter(knex, newEncounter) {
        return knex
        .insert(newEncounter)
        .into('encounters')
        .returning('names')
    },
    deleteEncounter(knex, id) {
        return knex('encounters')
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