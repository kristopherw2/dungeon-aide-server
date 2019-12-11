const path = require('path')
const express = require('express')
const EncountersService = require('./encounters-service')

const encountersRouter = express.Router()
const jsonParser = express.json()

const serializeEncounter = encounter => ({
    id: encounter.id,
    name: encounter.name,
    users: encounter.users
})

encountersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        EncountersService.getUserEncounter(knexInstance)
        .then(encounters => {
            res.json(encounters.map(serializeEncounter))
        })
        .catch(next)
    })