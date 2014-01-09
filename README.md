# 2dfGRS

This is a project to handle the [2dfGRS](http://www2.aao.gov.au/2dfgrs/) data using [NodeJS](http://nodejs.org/) server and [MongoDB](http://www.mongodb.org/) database engine to take advantage of the [Biga Data technologies](http://en.wikipedia.org/wiki/Big_data).

It uses the NodeJS module FITS, and processes the data locally or through a browser.


## Usage:

To read and get the FITS headers (HDU):

	var fits = require('FITS');

	fits.readFile(file, function(err, FITS){
		if(err) return console.error(err);
		console.log(FITS.HDU.primary);
	});




## License:
The MIT License (MIT)

Copyright � 2014 Joe Rosa