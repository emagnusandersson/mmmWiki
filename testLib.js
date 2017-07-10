
// Must exist on this: req, res, queredPage, GRet, mesEO, tModBrowser, siteName, Str, boVLoggedIn, boALoggedIn, jsonInput
// Must exist on req: method, headers, boTLS, www
// Must exist on res: outXXX, setHeader
// Assigned on GRet: objPage, objRev, objTemplateE, strEditText, strHtmlText, boTalkExist, arrVersionCompared, matVersion, strDiffText


res={
  setHeader:function(){},
  writeHead:function(){},
  end:function(str){debugger; console.log(this.statusCode+' '+str);}
  };
var tmp=res;
tmp.outCode=function(iCode,str){  str=str||''; this.statusCode=iCode; if(str) this.setHeader("Content-Type", "text/plain");   this.end(str);}
tmp.out200=function(str){ this.outCode(200, str); }
tmp.out201=function(str){ this.outCode(201, str); }
tmp.out204=function(str){ this.outCode(204, str); }
tmp.out301=function(url){  this.writeHead(301, {Location: url});  this.end();   }
tmp.out301Loc=function(url){  this.writeHead(301, {Location: '/'+url});  this.end();   }
tmp.out403=function(){ this.outCode(403, "403 Forbidden\n");  }
tmp.out304=function(){  this.outCode(304);   }
tmp.out404=function(str){ str=str||"404 Not Found\n"; this.outCode(404, str);    }
tmp.out500=function(err){ var errN=(err instanceof Error)?err:(new MyError(err)); console.log(errN.stack); this.writeHead(500, {"Content-Type": "text/plain"});  this.end(err+ "\n");   }
tmp.out501=function(){ this.outCode(501, "Not implemented\n");   }


