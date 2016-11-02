const csv = require('csv');
const fs = require('fs');

const fetch = require( "node-fetch" );
const access = require("./access.json");


const createAuthenticationHeader = (username, password) => {
  return "Basic " + new Buffer( username + ":" + password ).toString( "base64" );
};


fetch(
  "http://dhis.academy/lao_25/api/25/analytics.json?dimension=dx:Q21U47uf0xo.REPORTING_RATE;Fpl26CKBEqZ.REPORTING_RATE;xm6LbvmURdm.REPORTING_RATE;eDXUmwx0yw8.REPORTING_RATE&dimension=pe:LAST_3_MONTHS&dimension=ou:IWp9dQGM0bS;OU_GROUP-jblbYwuvO33;OU_GROUP-gHfSdwPrC83&displayProperty=SHORTNAME&outputIdScheme=UID",
  {
    headers: {
      Authorization: createAuthenticationHeader( access.username, access.password )
    }
  }
)
  .then( result => result.json() )
  .then( data => transformToCSV( data ) );


const transformToCSV = result => {
 csv.stringify( result.rows, { header: true, columns: result.headers.map( h => h.column ) }, function(err, output )
 {
        fs.writeFile("../data/de.csv", output, function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
 });
}