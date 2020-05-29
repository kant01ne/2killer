'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Kill = use('App/Models/Kill')
const User = use('App/Models/User')
const Assignment = use('App/Models/Assignment')
const crypto = require('crypto')
const Env = use('Env')
const _ =require('underscore');
const minPlayers = 4;


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

            let kills = (await this.kills().fetch()).rows
            console.log("kills = ")
            console.log(kills)
            let params = await _.map(kills, (k) => {return { id: k.user_id, ownKillId: k.id }})
            let assignment = new Assignment(params)
            let players = assignment.assign()

            // Assign killers and victims to kills.
            await Promise.all(kills.map((kill, i) => {
                let player = _.find(players, (p) => { return p.killId === kill.id })
                return Promise.all([
                    kills[i].killer().associate(player.killerId).catch(console.log),
                    kills[i].victim().associate(player.victimId).catch(console.log)
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
