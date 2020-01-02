const express = require('express')
const uuid = require('uuid/v4')
const path = require('path')
const { encounters, monsters } = require('../store')
const MonsterService = require('./monsters-service')

const monsterRouter = express.Router()
const bodyParser = express.json()

monsterRouter
    .route('/monster')
    .get((req, res) => {
        res.json(monsters)
    })
    .post(bodyParser, (req, res) => {
        const { name, health, armorClass, statusEffect } = req.body
    
        if(!name) {
          logger.error(`Name is required`);
          return res
            .status(400)
            .send('Invalid data');
        }
    
        if(!health) {
          logger.error(`health is required`);
          return res
            .status(400)
            .send('Invalid data');
        }
    
        if(!armorClass) {
          logger.error(`Armor Class is required`);
          return res
            .status(400)
            .send('Invalid data');
        }
    
        if(!statusEffect) {
          logger.error(`Status Effects are required`);
          return res
            .status(400)
            .send('Invalid data');
        }
    
        const id = uuid();
        const encounter = uuid();
    
        const newMonster = {
          id,
          name,
          health,
          armorClass,
          statusEffect,
          encounter
        };
    
        monsters.push(newMonster);
        
        logger.info(`Monster with id ${id} added to encounter with id ${encounter}`);
      
        res
          .status(201)
          .location(`http://localhost:8000/monster/${id}`)
          .json({monsters});
      });

monsterRouter
    .route('/monster/:id')
    .get((req, res) => {
        const { id } = req.params;
        const monster = monsters.find(e => e.id == id);
    
        if(!monster) {
          logger.error(`Monster with id ${id} not found.`);
          return res
            .status(404)
            .send('Encounter not found')
        }
        res.json(monsters)
    })
    .delete((req, res) => {
        const { id } = req.params;

        const monsterIndex = monsters.findIndex(m => m.id == id);
    
        if(monsterIndex === -1) {
          logger.error(`Monster with id ${id} not found.`);
          return res
            .status(404)
            .send('Not Found');
        }
    
        monsters.splice(monsterIndex, 1);
    
        logger.info(`monster with id ${id} deleted.`);
        res
          .status(204)
          .end();
    })

module.exports = monsterRouter