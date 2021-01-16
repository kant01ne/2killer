'use strict'
const {logs} = require('../../utils/logs.js')
/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env');

const BaseExceptionHandler = use('BaseExceptionHandler')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle (error, { request, response }) {
    return response.redirect('/');
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report (error, { request }) {
    const req = request.request;
    let url = req.url;
    url = url.replace(Env.get('ADMIN_PASSWORD'), 'p');
    const sessionValue = (req.headers.cookie && req.headers.cookie.split('adonis-session-values=')[1] && req.headers.cookie.split('adonis-session-values=')[1].slice(0,15)) || null
    logs({
      type:'Exception',
      method: req.method,
      sessionValue,
      url,
      message: error.message,
      status: error.status
    });
  }
}

module.exports = ExceptionHandler
