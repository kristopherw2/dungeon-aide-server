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
    .post(jsonParser, (req, res, next) => {
        const { name } = req.body
        const newEncounter= {
            name
        }

        for (const [key, value] of Object.entries(newEncounter))
            if (value === null)
                return res.status(400).json({
                    error: {
                        message: `Missing '${key} in request body`
                    }
                })
        EncountersService.createNewEncounter(
            req.app.get('db'),
            newEncounter
        )
        .then(encounter => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${encounter.id}`))
                .json(serializeEncounter(encounter))
        })
        .catch(next)
    })