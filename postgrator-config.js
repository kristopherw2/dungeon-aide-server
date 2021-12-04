require('dotenv').config();
const path = require('path')

module.exports = {
    migrationPattern: path.join('migrations', '*'),
    driver: "pg",
    connectionString: process.env.DATABASE_URL,
    /* "ssl": !!process.env.SSL, */
}

/* (process.env.NODE_ENV === 'test') ? process.env.TEST_DATABASE_URL :  */