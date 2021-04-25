'use strict'

const { test, trait } = use('Test/Suite')('Game')
const {ioc} = use('@adonisjs/fold')
const User = use('App/Models/User');
const Game = use('App/Models/Game');
trait('Test/ApiClient');
trait('Auth/Client');

// Could not make before/after work using https://adonisjs.com/docs/4.1/testing#_lifecycle_hooks
test('before', async() => {
  await use('Database').beginGlobalTransaction();
});

test('make sure 2 + 2 is 4', async ({ client, assert }) => {
  // Create game.
  const newGameRequest = (await client.post(`/games/new`).send().end())

  const gameId = newGameRequest._res.redirects[0].split("/")[4];
  // Create kills.
  const killsRow = [{
    id: gameId,
    description: "Kill de Baba",
    username: "Baba"
  }, {
    id: gameId,
    description: "Kill de Bebe",
    username: "Bebe"
  }, {
    id: gameId,
    description: "Kill de Caca",
    username: "Caca"
  }, {
    id: gameId,
    description: "Kill de Coco",
    username: "Coco"
  }, {
    id: gameId,
    description: "Kill de Dada",
    username: "Dada"
  }, {
    id: gameId,
    description: "Kill de Dudu",
    username: "Dudu"
  }, {
    id: gameId,
    description: "Kill de Dodo",
    username: "Dodo"
  }, {
    id: gameId,
    description: "Kill de Fafa",
    username: "Fafa"
  }, {
    id: gameId,
    description: "Kill de Fifi",
    username: "Fifi"
  }, {
    id: gameId,
    description: "Kill de Fofo",
    username: "Fofo"
  }, {
    id: gameId,
    description: "Kill de Gege",
    username: "Gege"
  }, {
    id: gameId,
    description: "Kill de Jiji",
    username: "Jiji"
  }, {
    id: gameId,
    description: "Kill de Keke",
    username: "Keke"
  }, {
    id: gameId,
    description: "Kill de Kiki",
    username: "Kiki"
  }, {
    id: gameId,
    description: "Kill de Lili",
    username: "Lili"
  }, {
    id: gameId,
    description: "Kill de Lolo",
    username: "Lolo"
  }, {
    id: gameId,
    description: "Kill de Mama",
    username: "Mama"
  }, {
    id: gameId,
    description: "Kill de Nono",
    username: "Nono"
  }, {
    id: gameId,
    description: "Kill de Papa",
    username: "Papa"
  }, {
    id: gameId,
    description: "Kill de Papi",
    username: "Papi"
  }];

  const nbOfPlayers = Math.floor(Math.random() * (killsRow.length - 3)) + 3;
  
  await Promise.all(killsRow.slice(0, nbOfPlayers).map(kill => client.post(`/game`).send(kill).end()));

  // Start game.
  await client.post(`/games/${gameId}/start`).send().end();
  
  const game = await Game.findFromEncrypted(gameId);
  const kills = (await game.kills().fetch()).rows;
  console.log('\n\n----New Assignment-----\n\n');
  let killerToVictim = {};

  await Promise.all(kills.map(async kill => {
    const victim = await User.find(kill.toJSON().victim_id);
    const owner = await User.find(kill.toJSON().user_id);
    const killer = await User.find(kill.toJSON().killer_id);

    if (killerToVictim[killer.username]) {
      console.log(killerToVictim);
      throw new Error(`${killer.username} can not kill ${victim.username} because already killing ${killerToVictim[killer.username]} `);
    }
    killerToVictim[killer.username] = victim.username;
  }));

  let killer = "Baba";
  for (let i =0;i < nbOfPlayers; i++) {
    console.log(killer, '=>', killerToVictim[killer]);
    killer = killerToVictim[killer];
  }

})

test('after', async() => {
  await use('Database').rollbackGlobalTransaction();
});