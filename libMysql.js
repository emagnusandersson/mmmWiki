
"use strict"

//storeMultPage=function(){
  //var Sql=[];
  //Sql.push(`LOCK TABLES ${pageTab} WRITE;`);
  //Sql.push(`UNLOCK TABLES;`);
  
//}
  
/*
app.getInfoNDataNoReqRes=async function(objArg){
  var {queredPage, rev, strHashIn, requesterCacheTime, boTLS, wwwSite}=objArg;

  var Ou={objTemplateE:{}, boTalkExist:0};
  //return [null,Ou];

    // Get site
  var sql=`SELECT boDefault, @boTLS:=boTLS AS boTLS, @idSite:=idSite AS idSite, siteName, @www:=www AS www, googleAnalyticsTrackingID, srcIcon16, strLangSite, aWPassword, aRPassword, UNIX_TIMESTAMP(tCreated) AS tCreated FROM ${siteTab} WHERE www=?;`;
  var Val=[wwwSite];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  if(results.length==0) { extend(Ou, {mess:'wwwNotFound'}); return [null,Ou]; } //res.out500(wwwSite+', site not found'); return [];
  var {boTLS, idSite, siteName, www, googleAnalyticsTrackingID, srcIcon16, strLangSite, aWPassword, aRPassword, tCreated}=results[0]; 
  
    // Check if there is a redirect for this page
  var sql=`SET @queredPage=?;
  SELECT url AS urlRedir FROM ${redirectTab} WHERE idSite=@idSite AND pageName=@queredPage;`, Val=[queredPage];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  if(results[1].length) {
    var urlRedir=results[1][0].urlRedir;
    var sql=`UPDATE ${redirectTab} SET nAccess=nAccess+1, tLastAccess=now() WHERE idSite=@idSite AND pageName=@queredPage;`, Val=[queredPage];
    var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
    //res.out301(urlRedir); return;
    extend(Ou, {mess:'redirect', urlRedir}); return [null,Ou];
  };
  
    // Check if there is a redirect for this domain
  var sql=`SELECT url AS urlRedirDomain FROM ${redirectDomainTab} WHERE www=@www;`, Val=[];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  if(results.length) { 
    //res.out301(results[0].urlRedirDomain+'/'+queredPage); return;
    extend(Ou, {mess:'redirectDomain', urlRedir:results[0].urlRedirDomain+'/'+queredPage}); return [null,Ou];
  };
  
    // Get wwwCommon
  var sql=`SELECT boTLS, siteName, www  FROM ${siteTab} WHERE boDefault=1;`, Val=[];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  if(results.length==0) { extend(Ou, {mess:'noDefaultSite'}); return [null,Ou]; } //res.out500('no default site'); return;
  var objSiteDefault=results[0];
  
    // Check if page exist
  var sql=`SELECT @pageName:=pageName AS pageName, @idPage:=idPage AS idPage, @boOR:=boOR AS boOR, boOW, boSiteMap, UNIX_TIMESTAMP(tCreated) AS tCreated, UNIX_TIMESTAMP(tMod) AS tMod FROM ${pageTab} WHERE idSite=@idSite AND pageName=@queredPage;`, Val=[];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  if(results.length==0) { Ou.mess='noSuchPage'; return [null,Ou]; };
  var objPage=results[0];
  
    // Redirect to correct case OR correct boTLS
  var sql=`SET @boRedirectCase = BINARY @pageName!=@queredPage OR @boTLS!=?;
  SELECT boRedirectCase AS boRedirectCase, @boTLS AS boTLS, @www AS www,, @pageName AS pageRedir;`, Val=[boTLS];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  var {boRedirectCase, pageRedir}=results[1][0];
  if(boRedirectCase) { extend(Ou, {mess:'redirectTLS', boTLS:site.boTLS});  return [null,Ou]; } //res.out301(pageRedir);  return;
  
    // Calc boTalkExist
  var sql=`SELECT @boTalk:=isTalk(@queredPage) AS boTalk, @boTemplate:=isTemplate(@queredPage) AS boTemplate;`, Val=[];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  var {boTalk, boTemplate}=results[0];
  var boTalkExist=false;
  if(boTalk==0) {
    var talkPage=(boTemplate?'template_':'')+'talk:'+queredPage;
    var sql=`SELECT count(idPage) AS boTalkExist FROM ${pageTab} WHERE idSite=@idSite AND pageName=?;`, Val=[talkPage];
    var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
    var {boTalkExist}=results[0];
  };
  
    // Get version table
  var sql=`SELECT rev, summary, signature, idFile, idFileCache, UNIX_TIMESTAMP(tMod) AS tMod, UNIX_TIMESTAMP(tModCache) AS tModCache, strHash FROM ${versionTab} WHERE idPage=@idPage;`, Val=[];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  var nVersion=results.length;
  if(nVersion==0) { Ou.mess='noSuchRev'; return [null,Ou];  } //res.out500('no versions?!?'); return;
  if(rev>=nVersion) { Ou.mess='noSuchRev'; return [null,Ou];  } //res.out500(`No rev ${rev}, (${nVersion} version)`); return; 
  if(rev==-1) rev=nVersion-1;  //version=rev+1;
  var arrVersionCompared=[null,rev+1];
  var matVersionOrg=results,  matVersion=makeMatVersion(matVersionOrg);
      
    // The requested revision rev
    // Note @tMod and @tModCache are already in unix-time
  var {strHash, idFile, idFileCache, tMod, tModCache}=matVersionOrg[rev];
  var boValidServerCache=tMod<=tModCache && strHash.length;
  var boValidReqCache=boValidServerCache && strHash=strHashIn && tModCache<=requesterCacheTime/1000);
  if(boValidReqCache) { Ou.mess='304'; return [null,Ou]; } //res.out304(); return;
  

  var sql=`SELECT data AS strEditText FROM ${fileTab} WHERE idFile=?;`, Val=[idFile];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  var strEditText=results[0].strEditText.toString();
  
  if(boValidServerCache){
      // Calc VboValidReqCache
    var sql=`SELECT data AS strHtmlText FROM ${fileTab} WHERE idFile=?;
        SELECT pageName, boOnWhenCached FROM ${subTab} WHERE idPage=@idPage AND pageName REGEXP '^template:';`, Val=[idFileCache];
    var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
    var strHtmlText=results[0][0].strHtmlText.toString();
    var objTemplateE=createObjTemplateE(results[1]);
  }
  
  Ou.mess='serverCacheOK'; return [null,Ou]; 
}
*/

