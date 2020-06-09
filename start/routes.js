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


/**
 * App
 */
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

Route.get('/doc', ({view}) => view.render('doc'))

/*
* Admin
*/
//TODO: Build a more robust Admin Interface ¯\_(ツ)_/¯
Route.get('admin/:password/users', async ({params}) => {
    if (!adminAuth(params.password))
        return 'Unauthorized';

    return await User.all();
});

Route.get('admin/:password/kills', async ({params}) => {
    if (!adminAuth(params.password))
        return 'Unauthorized';

    return await Kill.all();
});

Route.get('admin/:password/kills/:id/approve', async ({params}) => {
    if (!adminAuth(params.password))
        return 'Unauthorized';

    let kill = await Kill.find(params.id);
    kill.is_approved_by_admin = true;
    return await kill.save()
});

Route.get('admin/:password/games', async ({params}) => {
    if (!adminAuth(params.password))
        return 'Unauthorized';

    return await Game.query().with('kills').fetch()
});

Route.get('admin/:password/games/:id', async ({params}) => {
    if (!adminAuth(params.password))
        return 'Unauthorized';

    const game = await Game.query().where('id', params.id).with('kills').fetch();
    return await game.toJSON();
});

Route.get('admin/:password/games/:id/graph', async ({params}) => {
    if (!adminAuth(params.password))
        return 'Unauthorized';

    const game = await Game.find(params.id)
    const kills = (await game.kills().fetch()).rows;
    return kills.map(k => `${k.killer_id}:${k.victim_id}`);
})

function adminAuth(password) {
    return password === Env.get('ADMIN_PASSWORD');
}


/**
 * API/DEBUG
 */

if (process.env.ENV == 'dev') {

    Route.get('api/users', async () => {
        return await User.all();
    })

    Route.get('api/tokens', async () => {
        return await Token.all()
    })

    Route.get('api/games', async () => {
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

    Route.get('api/games/:id/start', async ({params}) => {
        const game = await Game.find(params.id)

        if (game.started_at)
            return 'Game already started';

        return await game.start();
    })




    Route.post('api/games/:id/kills', async ({request, auth, params}) => {
        try {
            // If user has already submitted a kill for this game, return.
            const existing = await Kill.query().where('user_id', auth.user.id).where('game_id', params.id).fetch();
            if (existing.rows.length)
                return console.log('Already existing kill for user and game id.');

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




    Route.get('api/games/:id/kills/start', async ({params}) => {

        console.log("Entering start API");
        const game = await Game.find(params.id)

        try {
            // If game did not start yet, start and return game.
            if (!game.started_at)
                return await game.start();
        } catch (e) {
            console.log(e);
        }

        console.log(game.started_at);
        // Otherwise, return game.
        return await game.kills().fetch();
    })


}
