require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const winston = require('winston')
const encountersRouter = require('./encounters/encounters-router')
const uuid = require('uuid/v4')

const app = express()

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json())

 //app.use('/api/encounters', encountersRouter)

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log'})
  ]
});

if(NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const encounters = [{
  id: 1,
  name: 'Goblin Horde',
  user: 1
}]

const monsters = [{
  id: 1,
  name: "Goblin",
  Health: 8,
  armorClass: 12,
  statusEffect: "paralyzed",
  encounter: 1
}]

app.get('/encounters', (req, res) => {
  res.json(encounters);
})

app.get('/encounters/:id', (req, res) => {
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

app.post('/encounters', (req, res) => {
const { name, user } = req.body
  
  
  if(!name) {
    logger.error(`Name is required`);
    return res
      .status(400)
      .send('Invalid data');
  }

  if(!user) {
    logger.error(`user is required`);
    return res
    .status(404)
    .send('Invalid Data')
  }

  if(typeof user !== "number") {
    logger.error(`user is not a number`)
    return res
    .status(400)
    .send('user must be a number')
  }

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

app.delete('/encounters/:encounterId', (req, res) => {
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

app.get('/monsters', (req, res) => {
  res.json(monsters)
});

app.get('/monsters/:id', (req, res) => {
  const { id } = req.params;
  const monster = monsters.find(e => e.id == id);

  if(!monster) {
    logger.error(`Monster with id ${id} not found.`);
    return res
      .status(404)
      .send('Encounter not found')
  }
  res.json(monsters)
});

app.post('/monsters', (req, res) => {
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

  // if(!encounterId) {
  //   logger.error(`Encounter ID is required`);
  //   return res
  //     .status(400)
  //     .send('Invalid data');
  // }

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

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
      response = { error: { message: 'server error' } }
    } else {
      console.error(error)
      response = { message: error.message, error }
    }
    res.status(500).json(response)
    });

module.exports = app