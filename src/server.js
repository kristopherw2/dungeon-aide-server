const app = require('./app')
const knex = require('knex')
const { PORT, DATABASE_URL } =require('./config')

const db = knex({
    client: "pg",
    connection: DATABASE_URL || "postgresql://postgres@localhost/dungeon-aide"
});

app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})