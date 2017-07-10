

//
// For variable naming convention see https://emagnusandersson.com/myNodeApps_notation
//


//
// See also under the "Default config variables" in the script.js-file for the default values and for more variables that can be configured.
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



intDDOSMax=300; // intDDOSMax: How many requests before DDOSBlocking occurs. 
tDDOSBan=5; // tDDOSBan: How long in seconds till the blocking is lifted.

strSalt='abcdef'; // Random letters to prevent that the hashed passwords looks the same as on other sites. (See more at https://en.wikipedia.org/wiki/Salt_(cryptography))


googleSiteVerification="googleXXXXXXXXXXXXXXXX.html"; // Needed if you use Google Webmaster Tools  (www.google.com/webmasters)



  //
  // Using an "if"-statement (as below) allows you to keep the same config-file for multiple infrastructure
  //
  // If you are running on:
  //   * digitalocean.com, then create a environment variable strInfrastructure='do' 
  //   * localhost, then you can enter your settings in the "else"-statement below
  //

if(process.env.strInfrastructure=='do'){  
  port = 8080;
    // vPassword=view password, aPassword= admin password
  vPassword="123"; aPassword="123"; 
    // If levelMaintenance=1 then site visitors gets a "Down for maintenance"-message
  //levelMaintenance=1;
    // Content of the <title>-tag of the start page. (if left undefined then it is defaulted to the domain name)
  //strStartPageTitle='blabla'; 

}else {
  vPassword="123"; aPassword="123"; 
  //levelMaintenance=1;
  //strStartPageTitle='blabla'; 
} 


