'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
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

    async start (restart) {
        try {
            // Fetch all kills, shuffle.
            let kills = await _.shuffle((await this.kills().fetch()).rows);
            // Fetch Killers, in same order.
            let players = await Promise.all(kills.map(kill => User.find(kill.user_id)))

            // Choose a random step for killers and victim.
            // Make sure they are different from each other.
            // Make sure they are different from 0 => Avoid Own Kill or Victim's kill.
            const killerStep = Math.floor(Math.random() * players.length - 2) + 1;
            let victimStep;
            do {
                victimStep = Math.floor(Math.random() * players.length - 2) + 1
            } while (victimStep === killerStep)

            // Assign killers and victims to kills.
            await Promise.all(kills.map((kill, i) => {
                const victimId = (i + players.length + victimStep) % players.length;
                const killerId = (i + players.length + killerStep) % players.length;
                console.log(killerId, victimId)
                return Promise.all([
                    kills[i].killer().associate(players[killerId]).catch(console.log),
                    kills[i].victim().associate(players[victimId]).catch(console.log)
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
