'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')


async function logs (json) {
    console.log("LOGS\n", json);
}

exports.logs = logs;