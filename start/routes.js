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

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

const {bgColors, getRandomItem} = require('../utils/misc.js')


/**
 * App
 */
/* Main Routes */
Route.get('/', 'GameController.index');
Route.post('/game', 'GameController.store').as('game')
Route.post('/games/new', 'GameController.new').as('game.new')
Route.post('/games/:id/start', 'GameController.start').as('game.start')
Route.get('/g/:encrypted', 'GameController.index')
Route.post('/kills/suggest', async ({response, request}) => {
    const killData = request.only(['description'])
    const kill = await Kill.create(killData);
    const game = await Game.find(request.body.game_id)
    
    return response.redirect(`/g/${game.encrypt()}`)
}).as('kill.suggest')
Route.get('/doc', ({view}) => {
    const backgroundColor = getRandomItem(bgColors)
    return view.render('doc', {
        backgroundColor
    })
});

/* .well-known */
Route.on('/.well-known/security.txt').render('security')
Route.on('/.well-known/robots.txt').render('robots')
Route.on('/.well-known/assetlinks.json').render('assetlinks')

/*
* Admin
*/
//TODO: Build a more robust Admin Interface ¯\_(ツ)_/¯
Route.group(() => {
    Route.get('/users', async ({response}) => {
        return response.ok(await User.all());
    });

    Route.get('/kills', async ({response}) => {
        return response.ok(await Kill.all());
    });

    Route.get('/kills/:id/approve', async ({params, response}) => {
        let kill = await Kill.find(params.id);
        kill.is_approved_by_admin = true;
        return response.ok(await kill.save());
    });

    Route.get('/games', async ({response}) => {
        return response.ok(await Game.query().with('kills').fetch())
    });


    Route.get('/games/:id', async ({params, response}) => {
        const game = await Game.query().where('id', params.id).with('kills').fetch();
        return response.ok(await game.toJSON());
    });

    Route.get('/games/:id/restart', async ({params, response}) => {
        const game = await Game.find(params.id)
        await game.start(true);

        return response.redirect(`graph`)
    });

    Route.get('/games/:id/graph', async ({params, response}) => {
        const game = await Game.find(params.id)
        const kills = (await game.kills().fetch()).rows;
        return response.ok(kills.map(k => `${k.killer_id} => ${k.victim_id} (${k.user_id})`));
    })

    Route.get('/games/:id/graph_with_pii', async ({params, response}) => {
        const game = await Game.find(params.id)
        const kills = (await game.kills().fetch()).rows;

        return response.ok(await Promise.all(kills.map(async k => {
            const killer = await User.find(k.killer_id);
            const victim = await User.find(k.victim_id);
            return `(${killer.id})${killer.username} => ${k.description} (${k.user_id})=> (${victim.id})${victim.username}`;
        })));
    })

  }).middleware(['admin']).prefix('/admin/:password')