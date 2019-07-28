'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class KillSchema extends Schema {
  up () {
    this.create('kills', (table) => {
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('killer_id').unsigned().references('id').inTable('users')
      table.integer('victim_id').unsigned().references('id').inTable('users')
      table.integer('game_id').unsigned().references('id').inTable('games')
      table.unique(['game_id', 'user_id'])
      table.string('description', 80).notNullable()
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('kills')
  }
}

module.exports = KillSchema
