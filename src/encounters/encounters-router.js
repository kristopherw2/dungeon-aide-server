const path = require('path')
const express = require('express')
const { encounters, monsters } = require('../store')
const EncountersService = require('./encounters-service')
const MonstersService = require('../monsters/monsters-service')

const encountersRouter = express.Router()
const bodyParser = express.json()
const xss = require('xss')

encountersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        EncountersService.getAllEncounters(knexInstance)
            .then(encounters => {
                res.json(encounters)
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const { names } = req.body 
        const newEncounter = { names }

        if(!names) {
            return res.status(400).json({
                error: { message: `Missing 'name' in encounter`}
            })
        };

        EncountersService.createNewEncounter(
            req.app.get('db'),
            newEncounter
        )
            .then(encounter => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${encounter[0].id}`))
                    .json(encounter)
            })
            .catch(next)
        });

// encountersRouter
//         .route('/:encounter_id')
//         .all((req, res, next) => {
//             EncountersService.getEncounterById(
//                 req.app.get('db'),
//                 req.params.encounter_id
//             )
//             .then(encounter => {
//                 if(!encounter){
//                     return res.status(404).json({ error: { message: `Encounter doesn't exist` } })
//                 }
//                 res.encounter = encounter
//             })
//             .catch(next)
//         })
//         .get((req, res, next) => {
//             const knexInstance = req.app.get('db')
//             EncountersService.getEncounterById(knexInstance, req.params.encounter_id)
//             .then(encounter => {
//                 if(!encounter) {
//                 return res
//                     .status(404)
//                     .json({
//                         error: {message: `Encounter doesn't exist`}
//                     })
//                 }
//                 res.json({
//                     id: encounter.id,
//                     names: xss(encounter.names),
//                     users: encounter.users
//                 });
//             })
//             .catch(next)
//         })
//         .delete((req, res, next) => {
//             EncountersService.deleteEncounter(
//                 req.app.get('db'),
//                 req.params.encounter_id
//             )
//             .then(() => {
//                 res.status(204).end()
//             })
//             .catch(next)
//         })
//         .patch(bodyParser, (req, res, next) => {
//             const {id, names, users} = req.body
//             const encounterToUpdate = {id, names, users};
//             const numberOfValues = Object.values(encounterToUpdate).filter(Boolean).length
//             if (numberOfValues === 0) {
//                 return res.status(400).json({
//                     error: {
//                         message: `Request must contain a name`
//                     }
//                 })
//             }
//             EncountersService.updateEncounter(
//                 req.app.get('db'),
//                 req.params.encounter_id,
//                 encounterToUpdate
//             )
//             .then(numRowsAffected => {
//                 res.status(204).end()
//             })
//             .catch(next)
//         });
        
module.exports = encountersRouter