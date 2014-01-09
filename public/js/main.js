// ### Function: main()
function main(){
  // #### Configuration server URLs Routing
  F.server = 'api/file';

	$.post(F.server, function(data) {

    F.fits = data;
    $.each(F.fits.HDU.primary, function(key, value){ $('#viewFITS').append(key + ' = ' + value + '<br />')});

  });
}
