'use strict'

/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstrap Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass relative path from the project root.
*/

const { Ignitor } = require('@adonisjs/ignitor')

const ENV = process.env.ENV;

if (ENV == 'prod') {
  // IF Prod use SSL.
  const path = require('path')
  const fs = require('fs')
  const https = require('https')
  const options = {
    key: fs.readFileSync(path.join(__dirname, './server.key')),
    cert: fs.readFileSync(path.join(__dirname, './server.crt'))
  }

  // Create the Https secure server.
  new Ignitor(require('@adonisjs/fold'))
    .appRoot(__dirname)
    .fireHttpServer(handler => {
      return https.createServer(options, handler)
    })
    .catch(console.error)
  
  // Redirect from http port 80 to https
  var http = require('http');
  http.createServer(function (req, res) {
      res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
      res.end();
  }).listen(80);


  // Otherwise, for dev, use HTTP.
} else {
  new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .fireHttpServer()
  .catch(console.error)
}
