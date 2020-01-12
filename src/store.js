const encounters = [
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

const monsters = [{
    id: 1,
    name: "Goblin",
    Health: 8,
    armorClass: 12,
    statusEffect: "paralyzed",
    encounter: 1
}]

module.exports = {encounters, monsters}

