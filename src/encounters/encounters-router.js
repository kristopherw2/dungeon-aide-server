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
        const { names, id } = req.body 
        const newEncounter = { names, id }

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
        
        // if(!names) {
        //     logger.error(`Name is required`);
        //     return res
        //       .status(400)
        //       .send('Invalid Data');
        // };
        
        // if(!users) {
        //     logger.error(`user is required`);
        //     return res
        //     .status(404)
        //     .send('Invalid Data')
        // };
        
        // if(typeof users !== "number") {
        //     logger.error(`user is not a number`)
        //     return res
        //     .status(400)
        //     .send('user must be a number')
        // };
        
        // const id = uuid();
        
        // const newEncounter = {
        //     id,
        //     names,
        //     users
        // };
        
        // encounters.push(newEncounter)
        
        // logger.info(`Encounter with id ${id} created`);
        // res
        //     .status(201)
        //     .location(`http://localhost:8000/encounters/${id}`)
        //     .json(newEncounter)
        });

encountersRouter
        .route('/:encounter_id')
        .all((req, res, next) => {
            EncountersService.getEncounterById(
                req.app.get('db'),
                req.params.encounter_id
            )
            .then(encounter => {
                console.log(encounter)
                if(!encounter){
                    return res.status(404).json({ error: { message: `Encounter doesn't exist` } })
                }
                res.encounter = encounter
                //next()
            })
            .catch(next)
        })
        .get((req, res, next) => {
            const knexInstance = req.app.get('db')
            EncountersService.getEncounterById(knexInstance, req.params.encounter_id)
            .then(encounter => {
                if(!encounter) {
                return res
                    .status(404)
                    .json({
                        error: {message: `Encounter doesn't exist`}
                    })
                }
                res.json({
                    id: encounter.id,
                    names: xss(encounter.names),
                    users: encounter.users
                });
            })
            .catch(next)
        })
        .delete((req, res, next) => {
            EncountersService.deleteEncounter(
                req.app.get('db'),
                req.params.encounter_id
            )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
        })
        .patch(bodyParser, (req, res, next) => {
            const {id, names, users} = req.body
            const encounterToUpdate = {id, names, users};
            const numberOfValues = Object.values(encounterToUpdate).filter(Boolean).length
            if (numberOfValues === 0) {
                return res.status(400).json({
                    error: {
                        message: `Request must contain a name`
                    }
                })
            }
            EncountersService.updateEncounter(
                req.app.get('db'),
                req.params.encounter_id,
                encounterToUpdate
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
        });
        
module.exports = encountersRouter