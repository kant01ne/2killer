'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

class Admin {
  async handle ({params, response}, next) {
      // If password mismatch, unauthorized.
      if (params.password !== Env.get('ADMIN_PASSWORD'))
        return response.unauthorized('Not an admin');
        
      // Otherwise, next.
      return await next()
  }
}

module.exports = Admin
