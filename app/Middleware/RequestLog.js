'use strict'
const {logs} = require('../../utils/logs.js')

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

class RequestLog {
  async handle ({req, request, res, response, params}, next) {
    try {

      // Upstream Middleware.

      // Clean up.
      let body = Object.assign({}, request.body);
      delete body['_csrf'];
      let p = Object.assign({}, params);
      delete p['password']
      let url = req.url;
      url = url.replace(Env.get('ADMIN_PASSWORD'), 'p');

      const userAgent = (request.headers && request.headers()['user-agent']) || null;
      const sessionValue = (req.headers.cookie && req.headers.cookie.split('adonis-session-values=')[1].slice(0,15)) || null
      logs({
        type: 'request',
        method: req.method,
        url,
        adonis_session_value: sessionValue,
        params: p,
        body,
        userAgent
      });

      await next();

      // Downstream Middleware.
      logs({
        type: 'response',
        method: req.method,
        adonis_session_value: sessionValue,
        statusCode: res.statusCode,
        url,
        params,
        body,
        userAgent
      });

    } catch (e) {
      console.log(e);
    }

  }
}

module.exports = RequestLog;
