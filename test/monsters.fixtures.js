function makeMonstersArray() {
    return [
        {
            id: 1,
            name: "Goblin1",
            health: 8,
            armor_class: 12,
            status_effects: "paralyzed",
            encounter: 1
        },
        {
            id: 2,
            name: "Goblin2",
            health: 8,
            armor_class: 12,
            status_effects: "paralyzed",
            encounter: 1
        },
        ,
        {
            id: 5,
            name: "Goblin5",
            health: 8,
            armor_class: 12,
            status_effects: "paralyzed",
            encounter: 3
        },
        
    ];
};

module.exports = { makeMonstersArray, }