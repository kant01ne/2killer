'use strict'
const User = use('App/Models/User')
const Game = use('App/Models/Game')
const Kill = use('App/Models/Kill')
const _ = use('underscore');
const {bgColors, getRandomItem} = require('../../../utils/misc.js')


const BASE_URL = process.env.BASE_URL;

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

            // Save Kill.
            const killData = {description: request.body.description};

            // If update kill
            if (request.body.kill_id) {
                const existingKill = await Kill.find(request.body.kill_id);
                existingKill.merge(killData)
                await existingKill.save()
            } 
            // Else if new kill
            else {
                const newKill = await game.kills().create(killData);
                await auth.user.kills().save(newKill)
            
            }
                
            return response.redirect(`/g/${game.encrypt()}`)
    
        } catch (e) {
            console.log(e)
            return;
        }
    }

    async start ({response, params}) {
        const game = await Game.find(params.id)
    
        if (!game.started_at)
            await game.start();

        return response.redirect(`/g/${game.encrypt()}`)
    }


    async new ({response, auth}) {
        const game = await Game.create();
        await auth.user.games().save(game)

        return response.redirect(`/g/${game.encrypt()}`)
    }

    async index ({params , auth, request, view}) {
        const killSuggestion = await getKillSuggestion();
        const backgroundColor = getRandomItem(bgColors)

        // No game.
        if (!params.encrypted) {
            return view.render('welcome', {
                username: auth.user.username,
                killSuggestion,
                backgroundColor
            })
        }
        // Otherwise, load existing Game data.
        const game = await Game.findFromEncrypted(params.encrypted.toString());
        let killers = (await game.killers().fetch()).rows;
        killers = _.sortBy(killers, 'username')
        const kills = (await game.kills().fetch()).rows;
        const kill =  _(kills.map(k => k.toJSON())).findWhere({killer_id: auth.user.id});
        const ownKill =  _(kills.map(k => k.toJSON())).findWhere({user_id: auth.user.id});
        const isKillOwner =  Boolean(_(killers.map(k => k.toJSON())).findWhere({id: auth.user.id}));
        const victim = kill ? await User.find(kill.victim_id) : null;
        

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(request.headers()['user-agent']);
        const isUpdateKill =  request._qs && request._qs.updateKill;
        const isSuggestKill =  request._qs && request._qs.suggestKill;

        return view.render('welcome', {
            game: game.toJSON(),
            username: auth.user.username,
            minPlayers: Game.minPlayers(),
            killers: killers.map(k => k.username),
            link: `${BASE_URL}${request.url()}`,
            isGameOwner: game.user_id === auth.user.id,
            startedAt: game.started_at,
            victim,
            isKillOwner,
            kill,
            ownKill,
            isMobile,
            isUpdateKill,
            isSuggestKill,
            killSuggestion,
            backgroundColor
        })
    }
}


async function getKillSuggestion () {
    try {
        const kills = (await Kill.query().where('is_approved_by_admin', true).fetch()).rows;

        // If no kills, return undefined.
        if (kills.length == 0)
            return undefined;

        // Otherwise, return random kill. 
        return kills[Math.floor(Math.random() * kills.length)].description;
        

    } catch (e) {
        return undefined;
    }
}
module.exports = GameController
