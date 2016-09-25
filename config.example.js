

//
// For variable naming convention see https://emagnusandersson.com/myNodeApps_notation
//



  // Leave these empty if don't want to show them.
strBTC='1abcdefghijklmnopqrstuvwxyzABCDEFG'; // Bitcoin address 
ppStoredButt="ABCDEFGHIJKLM";  // Paypal-stored-button

  // Number of seconds before you have to login again (as viewer, to view read protected pages)
  // (before you have to enter vPassword again)
//maxViewUnactivityTime=24*60*60;  
  // Number of seconds before you have to login again (as admin, to do administrative tasks)
  // (before you have to enter aPassword again)
//maxAdminUnactivityTime=5*60;   



intDDOSMax=200; // intDDOSMax: How many requests before DDOSBlocking occurs. 
tDDOSBan=5; // tDDOSBan: How long in seconds till the blocking is lifted

strSalt='abcdefghij'; // Random letters to prevent that the hashed passwords looks the same as on other sites.


googleSiteVerification="googleXXXXXXXXXXXXXXXX.html"; // Needed if you use Google Webmaster Tools  (www.google.com/webmasters)


weIconLib='lib/image/Icon/';  wIconRed16=weIconLib+'iconRed16.png';   wIconRed200=weIconLib+'iconRed200.png';  wIcon16=weIconLib+'icon16.png';  wIcon200=weIconLib+'icon200.png';


  //
  // This "if"-statement allows you to keep the same config-file for multiple infrastructure
  //
  // If you are running on:
  //   * heroku.com, then create a environment variable strInfrastructure='heroku' 
  //   * appfog.com, then create a environment variable strInfrastructure='af' 
  //   * digitalocean.com, then create a environment variable strInfrastructure='do' 
  //   * localhost, then you can enter your settings in the "else"-statement below
  //

if(process.env.strInfrastructure=='heroku'){  
    // Heroku uses the environment variable "PORT" to store the port used:
  port = parseInt(process.env.PORT, 10); 


    // Setting uriDB
    // If you added the ClearDB-database on the heroku.com-interface then that one is used.
  if('CLEARDB_DATABASE_URL' in process.env) uriDB=process.env.CLEARDB_DATABASE_URL;
    // If you want to use some other urlDB then fill it in here
  //uriDB='mysql://user:password@localhost/database';


    // vPassword=view password, aPassword= admin password
  vPassword="1234"; aPassword="1234";


    // If levelMaintenance=1 then site visitors gets a "Down for maintenance"-message
  //levelMaintenance=1;

    // Content of the <title>-tag of the start page. (if left undefined then it is defaulted to the domain name)
  //strStartPageTitle='blabla'; 

}
else if(process.env.strInfrastructure=='af'){  

    // Appfog uses the environment variable "VCAP_APP_PORT" to store the port used:
  port = parseInt(process.env.VCAP_APP_PORT, 10);
 
    // Setting uriDB 
    // If you added the MySql-database on the appfog.com-interface then that one is used.
  if('VCAP_SERVICES' in process.env) {
    var tmp=process.env.VCAP_SERVICES, services_json = JSON.parse(tmp);
    var mysql_config = services_json["mysql-5.1"][0]["credentials"];
    var sqlUserName = mysql_config["username"];
    var sqlPassword = mysql_config["password"];
    var sqlHost = mysql_config["hostname"];
    var portTmp = mysql_config["port"];
    var sqlDBName = mysql_config["name"];
    uriDB="mysql://"+sqlUserName+':'+sqlPassword+'@'+sqlHost+'/'+sqlDBName+"?reconnect=true";
  }
    // If you want to use some other urlDB then fill it in here
  //uriDB='mysql://user:password@localhost/database';

    // (For explanations of uriDB, vPassword, aPassword, levelMaintenance, strStartPageTitle  see comments above)
  vPassword="1234"; aPassword="1234";
  //levelMaintenance=1;
  //strStartPageTitle='blabla'; 


}else if(process.env.strInfrastructure=='do'){  // (is yet to be written)
  uriDB=='mysql://user:password@host/database';
  port = 8080;
  vPassword="1234"; aPassword="1234"; 
  //levelMaintenance=1;
  //strStartPageTitle='blabla'; 

}else {
  uriDB='mysql://user:password@localhost/database';
  vPassword="1234"; aPassword="1234"; 
  //levelMaintenance=1;
  //strStartPageTitle='blabla'; 
} 







//
// See also under the "Default config variables" in the script.js-file for more variables that can be configured.
//



