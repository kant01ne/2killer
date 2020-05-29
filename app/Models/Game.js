'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Assignment = use('App/Models/Assignment')
const User = use('App/Models/User')
const crypto = require('crypto')
const Env = use('Env')
const _ =require('underscore');
const minPlayers = 3;


/**
 * Game
 * 
 *   BelongsTo @owner
 *      hasMany @kills
 *      hasMany @games
 *      hasMany @killerOf ---------------------x
 *      hasMany @victimOf ----------------x    |
 *                                        |    |
 *   hasMany @kills                       |    |
 *      belongsTo @owner  -------------x  |    |
 *      belongsTo @killer -------------+--+----x   
 *      belongsTo @victim -------------+--x
 *                                     |
 *   ManyThrough kills @killers -------x
 * 
 */
class Game extends Model {
    static boot () {
        super.boot()
    }

    static minPlayers() {
        return minPlayers;
    }

     static decrypt(text){
        var decipher = crypto.createDecipher('aes-256-ctr', Env.get('GAME_SECRET'))
        var dec = decipher.update(text,'hex','utf8')
        dec += decipher.final('utf8');
        return JSON.parse(dec);
    }

    static async findFromEncrypted (text) {
        const {id} = Game.decrypt(text)
        return await Game.find(id)
    }

    async start () {
        try {
            console.log("Started At", this.started_at)
            if (this.started_at)
                return true;

            const kills = (await this.kills().fetch()).rows
            const players = await Promise.all(kills.map(kill => User.find(kill.user_id)))
            const params = _.map(kills, k => {return { id: k.user_id, ownKillId: k.id }})
            const assignment = new Assignment(params)
            const nodes = assignment.assign()

            // Persist kills with killers and victims.
            await Promise.all(kills.map(kill => {
                const node = _.find(nodes, n => n.killId === kill.id )
                const killer =_.find(players, p => node.killerId === p.id);
                const victim =_.find(players, p => node.victimId === p.id);

                return Promise.all([
                    kill.killer().associate(killer).catch(console.log),
                    kill.victim().associate(victim).catch(console.log)
                ]);
            }));

            this.started_at = new Date();
            return await this.save();
        } catch (e) {
            console.log(e)
        }
    }

    encrypt () {
        // TODO user cypheriv
        let cipher = crypto.createCipher('aes-256-ctr', Env.get('GAME_SECRET'))
        let crypted = cipher.update(JSON.stringify({
            id: this.id,
            user_id: this.user_id
        }),'utf8','hex')
        crypted += cipher.final('hex');
        return crypted;
    }

    kills () {
        return this.hasMany('App/Models/Kill')
    }

    killers () {
        return this.manyThrough('App/Models/Kill', 'owner')
      }

    owner () {
        return this.belongsTo('App/Models/User')
    }
}

module.exports = Game
