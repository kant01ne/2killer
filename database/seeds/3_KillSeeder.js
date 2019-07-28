'use strict'

/*
|--------------------------------------------------------------------------
| KillSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const User = use('App/Models/User')
const Game = use('App/Models/Game')
const Kill = use('App/Models/Kill')
const {getRandomItem} = require('../../utils/misc.js')

class KillSeeder {
  async run () {
    try {
      console.log('Start Kill Seed');

      // Create one kill per game owner.

      const users = (await User.all()).rows
      const games = (await Game.all()).rows
      const nbKills = games.length * 7;
      await Promise.all(games.map(async (game) => {
        const user = await game.owner().fetch();
        const kill = await Factory.model('App/Models/Kill').make()
        await user.kills().save(kill);
        return await game.kills().save(kill);
      }));

      // Populate randomly the rest.

      let stupidArray = [];
      for (let i = 0; i < nbKills; i++)
        stupidArray.push(i);

      return await Promise.all(stupidArray.map(async () => {
        const game = getRandomItem(games);
        const user = getRandomItem(users);

        let res = (await Kill.query().where('user_id', user.id).where('game_id', game.id).fetch()).rows;
        if (res.length)
          return;

        const kill = await Factory.model('App/Models/Kill').make();
        try {
          await user.kills().save(kill);
          return await game.kills().save(kill);
        } catch (e) {}
      }));

    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = KillSeeder
