const path = require('path')
const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { encounters, monsters } = require('../store')
const EncountersService = require('./encounters-service')

const encountersRouter = express.Router()
const bodyParser = express.json()

encountersRouter
    .route('/encounters')
    .get((req, res) => {
        res.json(encounters);
    })
    .post(bodyParser, (req, res) => {
        const { name, user } = req.body
        
        if(!name) {
            logger.error(`Name is required`);
            return res
              .status(400)
              .send('Invalid data');
        };
        
        if(!user) {
            logger.error(`user is required`);
            return res
            .status(404)
            .send('Invalid Data')
        };
        
        if(typeof user !== "number") {
            logger.error(`user is not a number`)
            return res
            .status(400)
            .send('user must be a number')
        };
        
        const id = uuid();
        
        const newEncounter = {
            id,
            name,
            user
        };
        
        encounters.push(newEncounter)
        
        logger.info(`Encounter with id ${id} created`);
        res
            .status(201)
            .location(`http://localhost:8000/encounters/${id}`)
            .json(newEncounter)
        });

encountersRouter
        .route('/encounters/:id')
        .get((req, res) => {
            const { id } = req.params;
            const encounter = encounters.find(e => e.id == id);
        
            if(!encounter) {
              logger.error(`Encounter with id ${id} not found.`);
              return res
                .status(404)
                .send('Encounter not found')
            }
            res.json(encounters)
        })
        .delete((req, res) => {
        
            const { encounterId } = req.params;

            const index = encounters.findIndex(u => u.id === encounterId);

            if (index === -1) {
            return res
              .status(404)
              .send('Encounter not found')
          }
        
            encounters.splice(index, 1);
                res
                .status(204)
                .end()
        });
        
module.exports = encountersRouter