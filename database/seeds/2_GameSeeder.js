'use strict'

/*
|--------------------------------------------------------------------------
| GameSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/
const maxUserId = 4;
/** @type {import('@adonisjs/lucid/src/Factory')} */

const Factory = use('Factory')
const User = use('App/Models/User')
const Database = use('Database')
const {getRandomItem} = require('../../utils/misc.js')

class GameSeeder {
  async run () {
    const users = (await User.all()).rows;
    console.log('Start Game Seed');
    const gamesArray = await Factory
      .model('App/Models/Game')
      .makeMany(users.length * 3)
    return await gamesArray.map(async (game) => {
      const owner = getRandomItem(users);
      await owner.games().save(game);
      return console.log(`http://127.0.0.1:3333/g/${game.encrypt()}`)
    });
  }
}

module.exports = GameSeeder
