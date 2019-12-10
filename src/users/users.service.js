const UsersService = {
    getUserByUserName(db, user_name) {
        return db('users')
        .where({ user_name })
        .first()
    },
    comparePasswords(password) {
        
    }

}