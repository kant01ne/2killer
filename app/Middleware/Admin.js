'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

class Admin {
  async handle ({params}, next) {
      // If password mismatch, unauthorized.
      if (params.password !== Env.get('ADMIN_PASSWORD'))
        return 'Unauthorized';
        
      // Otherwise, next.
      return await next()
  }
}

module.exports = Admin
