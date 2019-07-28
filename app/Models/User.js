'use strict'

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class User extends Model {

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token')
  }

  kills () {
    return this.hasMany('App/Models/Kill')
  }

  games () {
    return this.hasMany('App/Models/Game')
  }

  killer () {
    return this.hasMany('App/Models/Kill', 'killer_id')
  }

  victimOf () {
    return this.hasMany('App/Models/Kill', 'victim_id')
  }
}

module.exports = User
