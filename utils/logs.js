'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

const Humio = require("humio");

const humio = new Humio({
    apiToken: Env.get('HUMIO_API_TOKEN'), // needed if you use the administration api
    ingestToken: Env.get('HUMIO_INGEST_TOKEN'), // the default ingest tokens to use for #run and #stream
    host: "cloud.us.humio.com", // the host name
    port: 443, // default (443), the port Humio is run on
    basePath: "/api/v1/ingest/humio-structured", // default ("/"), basePath prepended to all API URLs.
    repository: Env.get('HUMIO_REPOSITORY') // default ("sandbox"), the default repository (or view) to work with
  });


async function logs (json) {
    console.log("Sending logs to Humio:", json);
    try {
        await humio.sendJson(json);
    } catch (e) {
        console.error(e);
    }
}

exports.logs = logs;