const fs = require('fs');
const officegen = require('officegen');
const fetch = require( "node-fetch" );
const access = require("./access.json");
const co = require('co');
const _= require("lodash");

const createAuthenticationHeader = (username, password) => {
  return "Basic " + new Buffer( username + ":" + password ).toString( "base64" );
};

let exportObjects = [
     {name:"dataElements" , data:{} },
     {name:"indicators", data:{} },
     {name:"organisationUnits", data:{} }
];


const createExcelBook = () =>
    officegen ({
       'type': 'xlsx', // or 'xlsx', etc
       'onend': function ( written ) {
           console.log ( 'Finish to create a Excel file.\nTotal bytes created: ' + written + '\n' );
       },
       'onerr': function ( err ) {
           console.log ( err );
       }
});


const transformExcel = (expObjects) => {

    let xlsx = createExcelBook();
    expObjects.forEach(function(expObject){
            sheet = xlsx.makeNewSheet();
            sheet.name = expObject.name;
            expObject.data[expObject.name].forEach(function( de, i ) {
                sheet.data[i]=[];
                Object.keys(de).forEach( function(k, j){
                    if ( i === 0 ) {
                        sheet.data[i][j] = k;
                    }else {
                        sheet.data[i][j] = de[k];
                    }
                });
            });
    });

    let out = fs.createWriteStream( '../data/out.xlsx' );

    out.on ( 'close', function () {
      console.log ( 'Finished to create the xlsx file!' );
    });

    xlsx.generate ( out );
};


const fetchObject = (objectName) => {
   return fetch(
      `https://play.dhis2.org/demo/api/${objectName}.json?fields=:all`,
      {
        headers: {
          Authorization: createAuthenticationHeader( access.username, access.password )
        }
      }
    )
     .then( result => result.json() )
     .then( rs =>  _.find(exportObjects, {name:objectName}).data = rs )
     .catch(err => console.log) ;
}


const fetchListObject = (objects, callBack) => {

  co(function* () {
    yield fetchObject("dataElements");
    yield fetchObject("indicators");
    yield fetchObject("organisationUnits");

    transformExcel(exportObjects);
  })
  .catch(err => console.log)

}

fetchListObject(exportObjects);


