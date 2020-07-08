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
Route.post('/kills/suggest', 'GameController.suggestKill').as('kills.suggest');

/* .well-known */
Route.on('/.well-known/security.txt').render('security')
Route.on('/.well-known/robots.txt').render('robots')
Route.on('/.well-known/assetlinks.json').render('assetlinks')

/*
* Admin
*/
Route.group(() => {
    Route.get('/', 'AdminController.games');
    Route.get('/game/:id', 'AdminController.game');
    Route.get('/game/:id/restart', 'AdminController.restartGame');
    Route.get('/kills', 'AdminController.kills');
    Route.get('/kills/:id/approve', 'AdminController.approveKill');
  }).middleware(['admin']).prefix('/admin/:password')