const MonstersService = {

    getMonstersByEncounterId (db) {
        return db
        .from('monsters')
        .innerJoin('encounters', 'encounters.id', 'monsters.encounter')
        .select(
            monsters.name,
            monsters.health,
            monsters.armor_class,
            monsters.status_effects
        )
    }
}