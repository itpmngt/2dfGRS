/*
 * FITS
 *
 * A NodeJS application to handle the 2dfGRS dataset
 * http://www2.aao.gov.au/2dfgrs/
 *
 * Copyright (c) 2014 Joe Rosa <joe.rosa@itpmngt.co.uk>
 * MIT License, see LICENSE.txt, see http://www.opensource.org/licenses/mit-license.php
 */

var express = require('express');
var app = express();
var fs = require('fs');
var fits = require('FITS');

var file = 'fits/2dfGRS/075/0/371970.fits.gz';
// var file = 'fits/samples/2dF-361520.fits';

fits.readFile(file, function(err, FITS){
  if(err) return console.error(err);
  console.log(FITS.HDU.primary);
});

/*
 * Node-Express web-server
 */

app.root = __dirname;
global.host = 'localhost';
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon('public/favicon.ico'));
  //app.use(express.errorHandler());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static( app.root + '/public', { maxAge: 657450000 })); // one week 7*24*60*60*1000
  app.use(function(req, res){ res.send( 404, "ERROR: 404 - 'Page not found'")}); // Better to redirect to home '/'
});

app.get('/', function(req, res){
  res.sendfile('public/index.html'); });

app.post('/api/file', function(req, res){
  fits.readFile(file, function(err, FITS){
    if (err){ return console.error(err)}
    res.send(FITS); }); });

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);