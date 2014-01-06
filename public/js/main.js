// ### Function: main()
function main(){

  // #### Configuration server URLs Routing
  F.server = 'api/file';

	$.post(F.server, function(data) {

    // FITS files are made in blocks of 2880 bytes (36 x 80 characters)
    // Read data and create an array of lines of 80 characters each
    F.lines = [];
    for (var i=0; i<(data.length/80); i++) { F.lines.push(data.substring(i*80, (i*80)+80)) }

    // Separate data and image blocks
    F.FITS = { "filename": "File Name", "structures": [] };
    F.headerFlag = true; F.headerBlock = []; F.dataBlock = [];

    $.each(F.lines, function(idx, line){
      if(!F.headerFlag){
        if(line.substring(0,8)=='XTENSION'){
          F.FITS.structures.push({ "header": F.headerBlock, "data": F.dataBlock});
          // $('#viewFITS').append('<br /><br />');
          F.headerFlag = true; F.headerBlock = []; F.dataBlock = [];}}
      else{F.dataBlock.push(line)}
      
      if(F.headerFlag){
        F.headerBlock.push(line);
        // $('#viewFITS').append('<li>' + line + '</li>');
        if(line.substring(0,8)=='END     '){F.headerFlag = false;} }
    });

    F.FITS.structures.push({ "header": F.headerBlock, "data": F.dataBlock});

    $.each(F.FITS.structures, function(index, structure){
      $.each(structure.header, function(idx, line){$('#viewFITS').append(line + '<br />')});
      $('#viewFITS').append('<br /><br />');
    });

  });
}
