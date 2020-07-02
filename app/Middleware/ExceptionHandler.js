'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const {logs} = require('../../utils/logs.js')

class ExceptionHandler {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({req, request}, next) {
    try {
      await next()
    } catch (e) {
      let url = req.url;
      url = url.replace(Env.get('ADMIN_PASSWORD'), 'p');
      const sessionValue = (req.headers.cookie && req.headers.cookie.split('adonis-session-values=')[1].slice(0,15)) || null
      logs({
        type:'Exception',
        method: req.method,
        sessionValue,
        url,
        error: e
      })
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
