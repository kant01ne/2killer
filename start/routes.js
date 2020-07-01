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
Route.group(() => {

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

}).middleware(['logs']);

/*
* Admin
*/
//TODO: Build a more robust Admin Interface ¯\_(ツ)_/¯
Route.group(() => {
    Route.get('/users', async () => {
        return await User.all();
    });

    Route.get('/kills', async () => {
        return await Kill.all();
    });

    Route.get('/kills/:id/approve', async ({params}) => {
        let kill = await Kill.find(params.id);
        kill.is_approved_by_admin = true;
        return await kill.save()
    });

    Route.get('/games', async () => {
        return await Game.query().with('kills').fetch()
    });


    Route.get('/games/:id', async ({params}) => {
        const game = await Game.query().where('id', params.id).with('kills').fetch();
        return await game.toJSON();
    });

    Route.get('/games/:id/graph', async ({params}) => {
        const game = await Game.find(params.id)
        const kills = (await game.kills().fetch()).rows;
        return kills.map(k => `${k.killer_id}:${k.victim_id}:${k.description}`);
    })

  }).middleware(['admin']).prefix('/admin/:password')