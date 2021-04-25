'use strict'
const User = use('App/Models/User')

class GuestAuth {
  async handle ({request, session, auth, response }, next) {
    try {
      // Update session ID if present in query params
      if (request._qs.sess) {
        session.put('userId', request._qs.sess)
      }
      await auth.check();
      // if no username provided in request, return.
      if (!request.body.username)
        return await next()

      // otherwise update username
      auth.user.username = request.body.username
      await auth.user.save()
    } catch {
      if (auth.user)
        return await next();

      let sessionId = session.get('userId') || session._sessionId
      const user = await User.findOrCreate({sessionId})
      await auth.remember(true).login(user);
      await session.put('userId', user.sessionId)
      // if session ID present in query params, clear URL.
      if (request._qs.sess) {
        return response.redirect(request.url())
      }

      if (!request.body.username)
        return await next()

      auth.user.username = request.body.username
      await auth.user.save()
    }
    await next()

  }
}

module.exports = GuestAuth
