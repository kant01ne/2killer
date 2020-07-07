'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env');

const {logs} = require('../../utils/logs.js')

class ExceptionHandler {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({req, auth}, next) {
    try {
      await next();
    } catch (e) {
      let url = req.url;
      url = url.replace(Env.get('ADMIN_PASSWORD'), 'p');
      const username = (auth && auth.user && auth.user.username) || null;
      const sessionValue = (req.headers.cookie && req.headers.cookie.split('adonis-session-values=')[1].slice(0,15)) || null
      logs({
        type:'Exception',
        method: req.method,
        sessionValue,
        url,
        username,
        error: e
      });
      return next() // Return status code.
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async wsHandle ({request}, next) {
    // call next to advance the request
    await next()
  }
}

module.exports = ExceptionHandler
