const express = require('express')
const path = require('path')
const { encounters, monsters } = require('../store')
const MonsterService = require('./monsters-service')

const monsterRouter = express.Router()
const bodyParser = express.json()
const xss = require('xss')

monsterRouter
    .route('/')
    .get((req, res, next) => {
      const knexInstance = req.app.get('db')
      MonsterService.getAllMonsters(knexInstance)
          .then(monsters => {
            res.json(monsters)
          })
          .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const { name, health, armor_class, status_effects, encounter } = req.body
        const newMonster = { name, health, armor_class, status_effects, encounter }
    
        if(!name) {
          logger.error(`Name is required`);
          return res
            .status(400)
            .send('Invalid data');
        }
    
        if(!health) {
          return res.status(400).json({
            error: { message: `Missing 'name' for monster`}
          })
        }
    
        if(!armor_class) {
          return res
            .status(400)
            .json({
              error: { message: `Missing 'armor class' for monster`}
            })
        }
    
        if(!status_effects) {
          return res
            .status(400)
            .json({
              error: { message: `Missing 'status effects' for monster`}
            })
        }

        MonsterService.createNewMonster(
          req.app.get('db'),
          newMonster
        )
        .then(monster => {
          res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${monster[0].id}`))
          .json(monster)
        })
        .catch(next)
      });

monsterRouter
    .route('/:monster_id')
    .all((req, res, next) => {
      console.log('CAPS MOTHERFUCKER')
      MonsterService.getMonsterById (
        req.app.get('db'),
        req.params.monster_id
        )
        .then(monster => {
          if(!monster) {
            return res.status(404).json({ error: { message: `Monster does not exist`} })
          }
          res.monster = monster
          next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
      const knexInstance = req.app.get('db')
      MonsterService.getMonsterById(knexInstance, req.params.monster_id)
      .then(monsters => {
        
        if(!monsters) {
          return res
            .status(404)
            .json({ error: { message: `Monster doesn't exist` } })
        }
        res.json({
          id: monsters.id,
          name: xss(monsters.name),
          health:xss(monsters.health),
          armor_class:xss(monsters.armor_class),
          status_effects:xss(monsters.status_effects),
          encounter: monsters.encounter
        })
      })
      .catch(next)
    })
    .delete((req, res, next) => {
      MonsterService.deleteMonsterById(
        req.app.get('db'),
        req.params.monster_id
      )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
        // const { id } = req.params;

        // const monsterIndex = monsters.findIndex(m => m.id == id);
    
        // if(monsterIndex === -1) {
        //   logger.error(`Monster with id ${id} not found.`);
        //   return res
        //     .status(404)
        //     .send('Not Found');
        // }
    
        // monsters.splice(monsterIndex, 1);
    
        // logger.info(`monster with id ${id} deleted.`);
        // res
        //   .status(204)
        //   .end();
    })

module.exports = monsterRouter