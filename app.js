var express = require('express');
var app = express();
var fs = require('fs');
var lbl = require('line-by-line');
var zlib = require('zlib');

// MongoJS - https://github.com/mafintosh/mongojs
// connection -- default port: 27017
// var mongojs = require('mongojs');
// var db = mongojs(connectionString, [collections]);
// connectionString = "username:password@example.com/mydb"
// var db = require("mongojs").connect( "mydb", ["users", "reports"]);

// db.users.save({email: "srirangan@gmail.com", password: "iLoveMongo", sex: "male"}, function(err, saved) {
//   if( err || !saved ){ console.log("User not saved") } else { console.log("User saved") } });

// db.users.update({email: "srirangan@gmail.com"}, {$set: {password: "iReallyLoveMongo"}}, function(err, updated) {
//   if( err || !updated ){ console.log("User not updated") } else { console.log("User updated") } });

// db.users.find({sex: "female"}, function(err, users) {
//   if( err || !users){ console.log("No female users found") }
//   else { users.forEach( function(femaleUser){ console.log(femaleUser) } ) } });

var db = require("mongojs").connect( "FITS", ["m_2dfGRS", "studies"]);

// readFITSindex();
readFITSfile("361520");


function readFITSindex(){
  new lbl('fits/2dfGRS_FITSindex.txt')
    .on('error', function (err) { }) // 'err' contains error object
    .on('end', function () { console.log(" Import complete. ") }) // All lines are read, file is closed now.
    .on('line', function (line) {
      if(line.charAt(0)!='#'){
        val = line.split("  ");
        db.m_2dfGRS.save({_id: val[1], name: val[2], file: val[4]}, function(err, saved) {
          if( err || !saved ){ console.log("FITS "+ val[1] + " not saved.") } }) } }) }


function readFITSfile(serialID){
  db.m_2dfGRS.find({ _id: serialID}, function(err, fits) {
    if( err || !fits){ console.log("No records found") }
    else {
      fits.forEach( function(doc){
        fs.readFile('fits/2dfGRS/'+doc.file+'.gz', function (err, gzipBuffer) {
          zlib.gunzip(gzipBuffer, function(err, result) {
            if(err) return console.error(err);
            var FITS = getFITSdata(result.toString());
            var CSVprop = [];
            var studies = { "2dfGRS": { "FITS" : { "properties": {} }}};
            FITS.forEach(function(chunk){
              chunk.header.forEach(function(line){
                if(line.indexOf('END     ') == -1){
                  main = line.split('/');
                  prop = main[0].split('=');
                  // console.log(prop[0].trim() + ' = ' + prop[1].trim()); // data
                  // console.log(prop[0].trim() + ' = ' + main[1].trim()); // metadata
                  studies['2dfGRS'].FITS.properties[prop[0].trim()] = main[1].trim();
                  CSVprop.push(prop[0].trim()+','+main[1].trim());
              } });
              // console.log(chunk.header);
            })
            console.log(studies['2dfGRS'].FITS.properties);
            // Save CSV
            var filename = "2dfGRS-"+serialID+".csv";
            fs.writeFile("public/exports/"+filename, CSVprop.join("\n"), function(err) {
              if(err){console.log(err)}else{console.log("File "+filename+" was saved!")} }); 

          }) }) }) } }) }


function getFITSdata(data){
  var FITS = [], headerFlag = true, headerBlock = [], dataBlock = [], lines = [];

  for (var i=0; i<(data.length/80); i++) { lines.push(data.substring(i*80, (i*80)+80)) }

  lines.forEach( function(line){
    if(!headerFlag){
      if(line.substring(0,8)=='XTENSION'){
        FITS.push({ "header": headerBlock, "image": dataBlock.join('')});
        headerFlag = true; headerBlock = []; dataBlock = [];}}
    else{dataBlock.push(line)}
    
    if(headerFlag){
      headerBlock.push(line);
      if(line.substring(0,8)=='END     '){headerFlag = false} } });

  FITS.push({ "header": headerBlock, "image": dataBlock.join('')});
  return FITS;
}


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
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static( app.root + '/public', { maxAge: 657450000 })); // one week 7*24*60*60*1000
  app.use(function(req, res){ res.send( 404, "ERROR: 404 - 'Page not found'")}); // Better to redirect to home '/'
});

app.get('/', function(req, res){
  res.sendfile('public/index.html'); });

app.post('/api/file', function(req, res){
  fs.readFile('fits/samples/2dF-361520.fits', 'utf8', function (err, data) { // file OK
  // fs.readFile('fits/samples/2dF-371970.fits', 'utf8', function (err, data) { // file OK
  // fs.readFile('fits/samples/EUVEngc4151imgx.fits', 'utf8', function (err, data) { // file OK
  // fs.readFile('fits/samples/FGSf64y0106m_a1f.fits', 'utf8', function (err, data) { // blank line and '/   '
  // fs.readFile('fits/samples/FOCx38i0101t_c0f.fits', 'utf8', function (err, data) { // Block 1438 starts with header at 2000 - > block.substring(2000,2880))
  // fs.readFile('fits/samples/FOSy19g0309t_c2f.fits', 'utf8', function (err, data) { // Block 1 of Data starts with ' / GROUP...'
  // fs.readFile('fits/samples/HRSz0yd020fm_c2f.fits', 'utf8', function (err, data) {  // Block 3 of Data starts with '    / CALIBRATION...' and It can be '/ ....'' 
  // fs.readFile('fits/samples/IUElwp25637mxlo.fits', 'utf8', function (err, data) { // Block of data 'TABLE' , Starts in header 2
  // fs.readFile('fits/samples/NICMOSn4hk12010_mos.fits', 'utf8', function (err, data) { // blank lines in header blocks 3, 4 and 10
  // fs.readFile('fits/samples/UITfuv2582gc.fits', 'utf8', function (err, data) { // file OK
  // fs.readFile('fits/samples/WFPC2ASSNu5780205bx.fits', 'utf8', function (err, data) { // blank line blocks 2, 4 and 6
  // fs.readFile('fits/samples/WFPC2u5780205r_c0fx.fits', 'utf8', function (err, data) { // blank line 2, 5 and 7
  // fs.readFile('fits/samples/slowe-d_e_20110718_8_1_1_1.fits', 'utf8', function (err, data) { // file OK
    if (err){ console.log(err)}
    FITSfile = data;
    res.send(FITSfile); }); });

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);