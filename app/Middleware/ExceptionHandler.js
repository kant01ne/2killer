'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class ExceptionHandler {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({}, next) {
    try {
      await next()
    } catch (e) {
      console.log('ExceptionHandler');
      console.log(e);
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
