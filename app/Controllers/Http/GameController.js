'use strict'
const User = use('App/Models/User')
const Game = use('App/Models/Game')
const _ = use('underscore');

class GameController {
    async store ({request, response, auth}) {
        try {
            let game;
            // If existing game, fetch
            if (request.body.id)
                game = await Game.find(request.body.id);
    
            // Otherwise, save new game.
            if (!game) {
                game = await Game.create();
                await auth.user.games().save(game)
            }

            // Save new Kill.
            const killData = {description:request.body.description};
            const kill = await game.kills().create(killData);
            await auth.user.kills().save(kill)
            return response.redirect(`/g/${game.encrypt()}`)
    
        } catch (e) {
            console.log(e)
            return;
        }
    }

    async start ({response, params}) {
        console.log("Entering start");
        const game = await Game.find(params.id)
    
        if (!game.started_at)
            await game.start();

        return response.redirect(`/g/${game.encrypt()}`)
    }

    async index ({params , auth, request, view}) {
        // No game.
        if (!params.encrypted)
            return view.render('welcome', {
                username: auth.user.username,
            })

        // Otherwise, load existing Game.
        const game = await Game.findFromEncrypted(params.encrypted.toString());
        const killers = (await game.killers().fetch()).rows;
        const kills = (await game.kills().fetch()).rows;
        const kill =  _(kills.map(k => k.toJSON())).findWhere({killer_id: auth.user.id});
        const isKillOwner =  Boolean(_(killers.map(k => k.toJSON())).findWhere({id: auth.user.id}));
        const victim = kill ? await User.find(kill.victim_id) : null;

        return view.render('welcome', {
            game: game.toJSON(),
            username: auth.user.username,
            minPlayers: Game.minPlayers(),
            killers: killers.map(k => k.username),
            link: `${request.headers().host}${request.url()}`,
            isGameOwner: game.user_id === auth.user.id,
            startedAt: game.started_at,
            victim,
            isKillOwner,
            kill
        })
    }
}

module.exports = GameController
