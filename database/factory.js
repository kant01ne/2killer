'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

Factory.blueprint('App/Models/User', (faker) => {
  return {
    username: faker.username(),
    sessionId: faker.guid()
  }
})

Factory.blueprint('App/Models/Game', (faker) => {
    return {
    }
  })
  
  Factory.blueprint('App/Models/Kill', (faker) => {
    return {
      description: faker.sentence({words: 6})
    }
  })
  
  