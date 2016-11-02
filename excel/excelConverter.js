const fs = require('fs');
const officegen = require('officegen');
const fetch = require( "node-fetch" );
const access = require("./access.json");


const createAuthenticationHeader = (username, password) => {
  return "Basic " + new Buffer( username + ":" + password ).toString( "base64" );
};


fetch(
  "https://play.dhis2.org/demo/api/dataElements.json?fields:all",
  {
    headers: {
      Authorization: createAuthenticationHeader( access.username, access.password )
    }
  }
)
  .then( result => result.json() )
  .then( data => transformExcel( data ) );

const transformExcel = data => {
    let xlsx = officegen ({
        'type': 'xlsx', // or 'xlsx', etc
        'onend': function ( written ) {
            console.log ( 'Finish to create a Excel file.\nTotal bytes created: ' + written + '\n' );
        },
        'onerr': function ( err ) {
            console.log ( err );
        }
    });

    sheet = xlsx.makeNewSheet();
    sheet.name = 'DataElements';
    data.dataElements.forEach(function( de, i) {
        sheet.setCell( `A${i}`, de.id );
        sheet.setCell( `B${i}`, de.displayName );
    });

    let out = fs.createWriteStream( '../data/out.xlsx' );

    out.on ( 'close', function () {
      console.log ( 'Finished to create the xlsx file!' );
    });

    xlsx.generate ( out );
};

