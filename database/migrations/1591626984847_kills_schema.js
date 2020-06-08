'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class KillsSchema extends Schema {
  up () {
    this.table('kills', (table) => {
      table.boolean('is_approved_by_admin').defaultTo(false)
      // alter table
    })
  }

  down () {
    this.table('kills', (table) => {
      // reverse alternations
      table.dropColumn('is_approved_by_admin')
    })
  }
}

module.exports = KillsSchema
