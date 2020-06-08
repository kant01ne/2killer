'use strict'
const User = use('App/Models/User')

class GuestAuth {
  async handle ({request, session, auth }, next) {
    try {
      await auth.check();
      if (!request.body.username)
        return await next()

      auth.user.username = request.body.username
      await auth.user.save()
      console.log('auth check passed');
    } catch {
      if (auth.user)
        return await next();

      console.log('generating new user for', session._sessionId);
      const user = await User.findOrCreate({sessionId: session._sessionId})
      await auth.remember(true).login(user);
    }
    await next()

  }
}

module.exports = GuestAuth
