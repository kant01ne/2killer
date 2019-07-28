'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Kill = use('App/Models/Kill')
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
        if (this.started_at)
            return true;

        let killers = _.shuffle((await this.killers().fetch()).rows);
        if (killers.length < minPlayers) // Minimum of players
            return false;

        let kills = _.shuffle((await this.kills().fetch()).rows);
        // Pre compute data: Re-order kills so that killers[i].id !== kills[i].user_id
        killers.map((killer, i) => {
            // If not own kill, return.
            if (kills[i].owner_id !== killer.id)
                return;
            
            // Otherwise, swap with next. TODO Edge Case here when swapping with first item [0]
            kills.swap(i, (i+1) % kills.length);
        })

        // Assign killers.
        Promise.all(killers.map(async (killer, i) => {
            await kills[i].killer().associate(killer)
        }));

        // Assign victims.
        await Promise.all(killers.map(async (killer, i) => {
            const victim = i > 0 ? killers[i - 1] : killers[killers.length - 1];
            await kills[i].victim().associate(victim).catch(e => console.log(e));
        }));

        this.started_at = new Date();
        return await this.save();
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
