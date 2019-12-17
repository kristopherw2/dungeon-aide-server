const exprress = require('express')
const path = require('path')
const MonsterService = require('./monsters-service')

const monsterRouter = express.Router()
const jsonBodyParser = express.json()