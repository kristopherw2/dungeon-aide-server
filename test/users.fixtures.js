function makeUsersArray() {
    return [
        {
            id: 1,
            username: 'firstuser',
            password: 'password',
            email: 'firstuser@email.com'
        },
        {
            id: 2,
            username: 'seconduser',
            password: 'password',
            email: 'seconduser@email.com'
        },
        {
            id: 3,
            username: 'thirduser',
            password: 'password',
            email: 'thirduser@email.com'
        },
        {
            id: 10,
            username: 'fourthuser',
            password: 'password',
            email: 'fourthuser@email.com'
        }
    ];
};

module.exports = {
    makeUsersArray,
};