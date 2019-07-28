'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Kill extends Model {
    owner () {
        return this.belongsTo('App/Models/User')
    }

    killer () {
        return this.belongsTo('App/Models/User', 'killer_id')
    }

    victim () {
        return this.belongsTo('App/Models/User', 'victim_id')
    }

    game () {
        return this.belongsTo('App/Models/Game')
    }
}

module.exports = Kill
