'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class LogException extends LogicalException {
  async handle (error, { response }) {
    if (error.code === 'EBADCSRFTOKEN') {
      response.forbidden('Cannot process your request.')
      return
    }
    console.log(error);
  }
}

module.exports = LogException
