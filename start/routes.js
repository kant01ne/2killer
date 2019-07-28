'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
const Token = use('App/Models/Token')
const User = use('App/Models/User')
const Game = use('App/Models/Game')
const Kill = use('App/Models/Kill')
const Database = use('Database')
Route.on('/').render('welcome');

/**
 * App
 */
Route.post('game', 'GameController.store').as('game')
Route.post('games/:id/start', 'GameController.start').as('game.start')
Route.get('g/:encrypted', 'GameController.index')

/**
 * API
 */
Route.get('api/users', async () => {
    return await User.all();
})

Route.get('api/tokens', async () => {
    return await Token.all()
})

Route.get('api/games', async () => {
    console.log('Entering Games Route');
    return await Game.query().with('kills').fetch()
})

Route.get('api/kills', async () => {
    return await Kill.all()
})

Route.post('api/games', async ({request, auth}) => {
    const gameData = request.only(['name'])
    const game = await Game.create(gameData);
    return await auth.user.games().save(game)
})

Route.get('api/games/:id', async ({params}) => {
    const game = await Game.find(params.id);
    return await game.toJSON();
})

Route.get('api/games/:id/start', async ({params}) => {
    console.log("Entering start");
    const game = await Game.find(params.id)

    if (game.started_at)
        return 'Game already started';

    return await game.start();
})

// Set as debug routes.
Route.get('api/games/:id/steal', async ({session, auth, params}) => {
    const game = await Game.find(params.id)

    // Find previous owner's kill.
    const owner = await game.owner().fetch()
    let res = await Kill.query().where('user_id', owner.id).where('game_id', game.id).fetch()
    
    // Replace with new user.
    await auth.user.kills().save(res.rows[0]);

    // Change owner.
    return await auth.user.games().save(game)
})



Route.post('api/games/:id/kills', async ({request, auth, params}) => {
    try {
        // If user has already submitted a kill for this game, return.
        const existing = await Kill.query().where('user_id', auth.user.id).where('game_id', params.id).fetch();
        if (existing.rows.length)
            return console.log('Already existing kill for user ang game id.');

        // Otherwise, save kill.
        const killData = request.only(['description'])
        const game = await Game.find(params.id)
        const kill = await game.kills().create(killData);
        return await auth.user.kills().save(kill)

    } catch (e) {
        console.log(e)
        return;
    }
})


Route.get('api/games/:id/kills', async ({params}) => {
    const game = await Game.find(params.id)

    return await game.kills().fetch();
})

Route.get('api/games/:id/graph', async ({params}) => {
    const game = await Game.find(params.id)

    const kills = (await game.kills().fetch()).rows;
    return kills.map(k => `${k.killer_id}:${k.victim_id}`);
})


Route.get('api/games/:id/kills/start', async ({params}) => {

    console.log("Entering start API");
    const game = await Game.find(params.id)

    try {
        // If game did not start yet, start.
        if (!game.started_at)
            return await game.start();
    } catch (e) {
        console.log(e);
    }

    console.log(game.started_at);
    // Otherwise, return true.
    return await game.kills().fetch();
    // return true;
})


Route.delete('games/:id', async ({params}) => {
    const game = await Game.find(params.id)
    return console.log(await game.delete())
})

