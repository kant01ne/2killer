'use strict'
const User = use('App/Models/User')
const Game = use('App/Models/Game')
const Kill = use('App/Models/Kill')

class AdminController {
    async games ({params, request, view}) {
        const games = (
            await Game.query()
                .orderBy('id', 'desc')
                .with('kills')
                .with('owner')
                .fetch()
        ).rows;

        return view.render('admin.admin', {
            games: games.map(g => g.toJSON()),
            p: params.password
        });
    }

    async game ({params, view}) {
        const game = await Game.find(params.id);
        const kills = (
            await game.kills()
                .with('owner')
                .with('killer')
                .with('victim')
                .fetch()
            ).rows;

        return view.render('admin.game', {
            game: game.toJSON(),
            kills: kills.map(k => k.toJSON()),
            p: params.password
        });
    }

    async kills ({params, view}) {
        const kills = (
            await Kill.query()
                .orderBy('id', 'desc')
                .with('owner')
                .with('victim')
                .with('killer')
                .fetch()
        ).rows;

        return view.render('admin.game', {
            kills: kills.map(k => k.toJSON()),
            p: params.password
        });
    }

    async approveKill ({params, request, response}) {
        let kill = await Kill.find(params.id);
        kill.is_approved_by_admin = true;
        await kill.save();
        const redirectTo = request.request.headers.referer;
        return response.redirect(redirectTo);
    }

    async restartGame ({params, view}) {
        const game = await Game.find(params.id)
        await game.start();
        const kills = (
            await game.kills()
                .with('owner')
                .with('killer')
                .with('victim')
                .fetch()
            ).rows;

        return view.render('admin.game', {
            game: game.toJSON(),
            kills: kills.map(k => k.toJSON()),
            p: params.password
        });
    }
}

module.exports = AdminController
