
"use strict"

var escapeHtml=function(text) {
  var map={'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'};
  return text.replace(RegExp("[&<>\"']",'g'), function(m) { return map[m]; });
}


app.simpleTags='div|span|font|code|small|sub|sup|u|h1|h2|h3|h4|h5|h6|s';

app.STARTCHAR=String.fromCharCode(1);  app.ENDCHAR=String.fromCharCode(2);
app.STARTCHARSTR='\\01';  app.ENDCHARSTR='\\02';

app.Parser=function(text, boTrustEditors){
  this.boTrustEditors=boTrustEditors;

  this.arrComment=[]; // For storing of all the comment sections 
  this.arrStyle=[]; // For storing of all the style sections 
  this.arrNoWiki=[]; // For storing of all the nowiki sections
  this.arrHtmlSection=[]; // For storing of all the html sections
  

  this.arrInterWikiLink=[]; // For storing the link (page) name of so called interwiki links (links to Wikipedia, wiktionary ...)
  this.arrInterWiki_WikiType=[]; // For storing what kind of interwiki link. (Wikipedia, wiktionary ...)

  this.arrILink=[]; // For storing of all the internal links 

  this.arrExtLink=[]; // For storing of all the external links

  this.arrImageLink=[]; // For storing of all the image links
  this.arrImageWidth=[];
  this.arrImageFrame=[]; //Array of booleans
  this.arrImageHAlign=[];
  
  this.arrGalleryImageLink=[];
  this.arrHLAttr=[];
  this.arrTagAttr=[];
  this.arrVideoAttr=[];
  this.arrVideoSourceAttr=[];
  this.arrImgRawAttr=[];
  this.arrBRAttr=[];
  this.arrIframeAttr=[];
  this.bagTemplate=[]; // Will look like: [[name,boExist], [name,boExist],  ....]
  this.arrPre=[]; // For storing all pre sections

  this.boSimpleTagReplaced;
  this.iGall;
  this.iHL;
  this.text=text;

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Parser.prototype.preParse = function(callback) {
  if(typeof callback=='undefined') callback=function(){};
  var text=this.text;
  text = text.replace(RegExp(STARTCHARSTR,'g'),''); //Remove any possible STARTCHAR's
  text = text.replace(RegExp(ENDCHARSTR,'g'),'');  //Remove any possible ENDCHAR's
  //text = text.replace(RegExp("<!--[\\s\\S]*?-->",'g'),''); //in javascript there is no modifier to make "." match '\n', but one can use "[\s\S]" instead
  text = text.replace(RegExp("<!--[\\s\\S]*?-->",'g'),thisChanged(this.replaceCommentCB,this)); //in javascript there is no modifier to make "." mathch '\n', but one can use "[\s\S]" instead
  text = text.replace(RegExp("<style>([\\s\\S]*?)<\/style>",'ig'),thisChanged(this.replaceStyleCB,this)); //Replace style with temporary markups and sanitize content
  text = text.replace(RegExp("\{\{(.*?)\}\}",'g'),thisChanged(this.replaceTemplateCB,this));
  this.text=text;  callback(null,0);
}

Parser.prototype.renameILinkOrImage = function(text, strILink='', strILinkN='', strImage='', strImageN='') {
  this.boSpaceOrUnderscore=strILink.indexOf('_')!=-1;  this.boSpaceOrUnderscoreImage=strImage.indexOf('_')!=-1;
  const regTmp=RegExp('_','g');
  this.strILink=strILink; this.strILinkWSpace=strILink.replace(regTmp,' ');
  this.strILinkN=strILinkN; this.strILinkNWSpace=strILinkN.replace(regTmp,' ');
  this.strImage=strImage; this.strImageWSpace=strImage.replace(regTmp,' ');
  this.strImageN=strImageN; this.strImageNWSpace=strImageN.replace(regTmp,' ');
  text = text.replace(RegExp(STARTCHARSTR,'g'),''); //Remove any possible STARTCHAR's
  text = text.replace(RegExp(ENDCHARSTR,'g'),'');  //Remove any possible ENDCHAR's
  text = text.replace(RegExp("<!--[\\s\\S]*?-->",'g'),thisChanged(this.replaceCommentCB,this)); //in javascript there is no modifier to make "." match '\n', but one can use "[\s\S]" instead
  text = text.replace(RegExp("<nowiki>([\\s\\S]*?)<\/nowiki>",'ig'),thisChanged(this.replaceNoWikiCB,this)); 
  text = text.replace(RegExp("<htmlsection>([\\s\\S]*?)<\/htmlsection>",'ig'),thisChanged(this.replaceHtmlSectionCB,this)); 
  text = text.replace(RegExp("<pre>([\\s\\S]*?)<\/pre>",'ig'),thisChanged(this.replacePreCB,this)); 
    //Replace pre-sections (<pre></pre>) with temporary markups (although not "spacePre" (see below))
  
  text=text.replace(/([^\[])\[([^\[])/g, '$1' +STARTCHAR +'singleLBracket' +ENDCHAR +'$2');   //Temporary markups of single left brackets. If you know any better way to handle brackets, doublebrackets etc. you can change all this. Especially how to handle single brackets in linktext etc, at the same time as handling links in imagecaptions.
  text=text.replace(/([^\]])\]([^\]])/g,'$1' +STARTCHAR +'singleRBracket' +ENDCHAR +'$2');    //Temporary markups of single right brackets.  
  text = text.replace(/\[\[([^\[\]]+?)\]\]/g ,thisChanged(this.replaceILinkRenameCB,this));  //Replace internal links with temporary markups.
  text = text.replace(/\[\[([^\[\]]+?)\]\]/g ,thisChanged(this.replaceILinkRenameCB,this));  //Replace internal links with temporary markups.

  text = text.replace(/\[\[ *image *:(.+?)\]\]/ig,thisChanged(this.replaceImageRenameCB,this));   //Replace images with temporary markups.
  
  
  text = text.replace(RegExp(STARTCHARSTR +'img(\\d+)' +ENDCHARSTR +'([\\s\\S]*?)' +STARTCHARSTR +'\/img(\\1)' +ENDCHARSTR,'g'), thisChanged(this.putBackImageRenameCB,this)); //Put back Images   
  text = text.replace(RegExp(STARTCHARSTR +'iLink(\\d+)' +ENDCHARSTR +'([\\s\\S]*?)' +STARTCHARSTR +'\/iLink(\\1)' +ENDCHARSTR,'g') ,thisChanged(this.putBackILinkRenameCB,this)); //Put back Internal links

  //
  // Put back all the removed stuff
  //
  
  text = text.replace(RegExp(STARTCHARSTR+'singleLBracket'+ENDCHARSTR,'g'),'['); //Put back single left brackets
  text = text.replace(RegExp(STARTCHARSTR+'singleRBracket'+ENDCHARSTR,'g'),']'); //Put back single right brackets
  
  text = text.replace(RegExp(STARTCHARSTR +'pre(\\d+)\/' +ENDCHARSTR,'g'),thisChanged(this.putBackPreCB,this));     
  text = text.replace(RegExp(STARTCHARSTR +'htmlsection(\\d+)' +ENDCHARSTR,'g'),thisChanged(this.putBackHtmlSectionCB,this));  //Put back html sections
  text = text.replace(RegExp(STARTCHARSTR +'nowiki(\\d+)' +ENDCHARSTR,'g'),thisChanged(this.putBackNoWikiCB,this));  //Put back nowiki sections
     
  text = text.replace(RegExp(STARTCHARSTR +'comment(\\d+)'+ENDCHARSTR,'g'),thisChanged(this.putBackCommentCB,this));     

  return text;
}

    // ILink
Parser.prototype.replaceILinkRenameCB=function(m,n){ 
  var i=this.arrILink.length;
  if(n.match(/^ *(image *:)|(category *:)/i) ) { return m; }
  var parts=n.split('|'), nParts=parts.length;
  var innerText; if(nParts>1)  innerText=parts[1];  else innerText='';
  var pageLikeWritten=parts[0].trim(); //pageLikeWritten, needed when there is no innerText
  var pageLikeWrittenLC=pageLikeWritten.toLowerCase();
  if(this.strILink==pageLikeWrittenLC) pageLikeWritten=this.strILinkN;
  else if(this.boSpaceOrUnderscore && this.strILinkWSpace==pageLikeWrittenLC) pageLikeWritten=this.strILinkNWSpace;    // If boSpaceOrUnderscore then both versions must be compared
  this.arrILink[i]=[pageLikeWritten, 0];
  return STARTCHAR +'iLink' +i +ENDCHAR +innerText +STARTCHAR +'/iLink' +i +ENDCHAR;
}
Parser.prototype.putBackILinkRenameCB=function(m,n,o){
  var pageLikeWritten=this.arrILink[n][0], text=o.length?'|'+o:'';
  return '[[' +pageLikeWritten +text +']]';
}

    // images
Parser.prototype.replaceImageRenameCB=function(m,n){ 
  var i=this.arrImageLink.length;
  var parts=n.split('|');
  var name=parts[0].trim(), partsTmp=parts.slice(1);
  var nameLC=name.toLowerCase();
  if(this.strImage==nameLC) name=this.strImageN;
  else if(this.boSpaceOrUnderscoreImage && this.strImageWSpace==nameLC) name=this.strImageNWSpace;    // If boSpaceOrUnderscoreImage then both versions must be compared
  this.arrImageLink[i]=name;
  return STARTCHAR +'img' +i +ENDCHAR +partsTmp.join('|') +STARTCHAR +'/img' +i +ENDCHAR; 
}
Parser.prototype.putBackImageRenameCB=function(m,i,o){
  var name=this.arrImageLink[i];
  if(o.length) o='|'+o;
  return '[[image:' +name +o +']]';
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Parser.prototype.parse = function(callback) {
  if(typeof callback=='undefined') callback=function(){};
  var text=this.text;


  text = text.replace(RegExp(STARTCHARSTR +'template(\\d+)\/' +ENDCHARSTR,'g'),thisChanged(this.putBackTemplateCB,this)); //Put back existing templates

  //
  // Remove lots of stuff and put in temporary markups
  //
     
  text = text.replace(RegExp("<(\/?script[^>]*?)>",'ig'),'&lt;$1&gt;'); 
  //text = text.replace(RegExp("<(\/?script[^>]*?)>",'ig'),translateScriptTag); 
  text = text.replace(RegExp("<nowiki>([\\s\\S]*?)<\/nowiki>",'ig'),thisChanged(this.replaceNoWikiCB,this)); 
  text = text.replace(RegExp("<htmlsection>([\\s\\S]*?)<\/htmlsection>",'ig'),thisChanged(this.replaceHtmlSectionCB,this)); 
  text = text.replace(RegExp("<pre>([\\s\\S]*?)<\/pre>",'ig'),thisChanged(this.replacePreCB,this)); 
    //Replace pre-sections (<pre></pre>) with temporary markups (although not "spacePre" (see below))
  
  text = text.replace(RegExp("<iframe\\b([^\n>]*?)>([\\s\\S]*?)<\/iframe>",'ig'),thisChanged(this.replaceIframeCB,this)); 
  text = text.replace(RegExp("<video\\b([^\n>]*?)>([\\s\\S]*?)<\/video>",'ig'),thisChanged(this.replaceVideoCB,this)); 
  text = text.replace(RegExp("<source\\b([^\n>]*?)>",'ig'),thisChanged(this.replaceVideoSourceCB,this)); 
  text = text.replace(RegExp("<img\\b([^\n>]*?)>",'ig'),thisChanged(this.replaceImgRawCB,this)); 
  text = text.replace(RegExp("<br\\b([^\n>]*?)>",'ig'),thisChanged(this.replaceBRCB,this)); 


  //
  // Remove external links
  //
  
    // Setting up for external links
  var arrUrlProtocols = ['http://', 'https://', 'ftp://', 'irc://', 'gopher://', 'telnet://', 'nntp://', 'worldwind://', 'mailto:', 'news:'];
  var protocols = [];   for(var i in arrUrlProtocols){var tmp=arrUrlProtocols[i].replace(/\//g,'\\/');   protocols.push(tmp);   }
  var strUrlProtocolsRegEx=protocols.join('|');  // Create a regular expression used to match url protocols

  
    // External links with hook paranthesis '[]' and special linktext
  //var patt=/\[((?:blabla)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]) +([^\]\x0a\x0d]+?)\]/ig;
  //var tmp=patt.toString().replace(/blabla/,strUrlProtocolsRegEx);    tmp=tmp.substr(1,tmp.length-4); //remove first '/' and last '/ig'
  //var patt=new RegExp(tmp,'ig'); debugger
  var patt=new RegExp('\\[((?:'+strUrlProtocolsRegEx+')[^\\][<>"\\x00-\\x20\\x7F]+) *([^\\]\\x0a\\x0d]*?)\\]','ig');
  text=text.replace(patt,thisChanged(this.replaceExternalLinkCB,this)); 

    // External links without hook parantheseis
  //var patt=/((?:blabla)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  //var tmp=patt.toString().replace(/blabla/,strUrlProtocolsRegEx);    tmp=tmp.substr(1,tmp.length-4); //remove first '/' and last '/ig'
  //var patt=new RegExp(tmp,'ig');
  var patt=new RegExp('((?:'+strUrlProtocolsRegEx+')[^\\][<>"\\x00-\\x20\\x7F]+)\\b','ig');
  text=text.replace(patt,thisChanged(this.replaceExternalLinkCB,this)); 
  

  //
  // Remove more stuff
  //
  
  text=text.replace(/([^\[])\[([^\[])/g, '$1' +STARTCHAR +'singleLBracket' +ENDCHAR +'$2');   //Temporary markups of single left brackets. If you know any better way to handle brackets, doublebrackets etc. you can change all this. Especially how to handle single brackets in linktext etc, at the same time as handling links in imagecaptions.
  text=text.replace(/([^\]])\]([^\]])/g,'$1' +STARTCHAR +'singleRBracket' +ENDCHAR +'$2');    //Temporary markups of single right brackets.  
  text = text.replace(/\[\[ *((?:wikipedia)|(?:wiktionary)) *:([^\n]+?)\]\]/ig,thisChanged(this.replaceInterWikiLinkCB,this));  //Replace interwiki links with temporary markups.
  text = text.replace(/\[\[([^\[\]]+?)\]\]/g ,thisChanged(this.replaceILinkCB,this));  //Replace internal links with temporary markups.

  text = text.replace(/\[\[ *image *:(.+?)\]\]/ig,thisChanged(this.replaceImageCB,this));   //Replace images with temporary markups.
    // Gallery resp horizontallist. They are a bit similar, the difference is that:
    //   *gallery items has fixed width
    //   *horizontallist items has dynamic width
  text = text.replace(/<gallery>([\s\S]*?)<\/gallery>/ig ,thisChanged(this.replaceGalleryCB,this));
  text = text.replace(/<horizontallist>([\s\S]*?)<\/horizontallist>/ig ,thisChanged(this.replaceHLCB,this));
 

  //
  // Do some of the translations
  //

  text = text.replace(RegExp("'''([^\n\']+)'''",'g'),thisChanged(this.replaceBoldCB,this));
  text = text.replace(RegExp("''([^\n\']+)''",'g'),thisChanged(this.replaceItalicCB,this));
  text = text.replace(RegExp("^([=]{2,7})(.+?)([=]{2,7})\\s*$",'mg'),thisChanged(this.replaceHeadingCB,this));
  
  while(1){
    this.boSimpleTagReplaced=0;
    text = text.replace(RegExp("<("+simpleTags+")\\b([^\n>]*?)>([\\s\\S]*?)<\/\\1>",'ig'), thisChanged(this.replaceTagCB,this));
    if(this.boSimpleTagReplaced==0) break;
  }
  
  //text = this.translateSpacePre(text); // "SpacePre":  a space in the beginning of a line means that the line should be within a <pre></pre>. Notice that if one don't use a space, but instead writes <pre></pre> directly in the wiki-text, then mediawiki handles the text a little bit different (so those cases aren't handled here)


 this.text=text;  callback(null,0);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Parser.prototype.endParse = function(callback) {
  if(typeof callback=='undefined') callback=function(){};
  var text=this.text;

  var TaPa=new ParserTable(1);
  var lines=text.split(/\r?\n/); //Split text into an array
  
  

  //
  // Remove all tables from text and split up all the tablecontent in a few global variables 
  //
  
  
  var i=0;
  while(true){
    if(i==lines.length) break;
    var line=lines[i];
    if(line.match(/^([\*#:;]*?[^\{]*?)\{\|(.*)$/)) { // If a table-starter-token is found      
      var linesRemainingOld=lines.slice(i); //the subarray from index i to the end
      var linesRemainingNew=TaPa.replaceTable(linesRemainingOld); //Using recursion to handle nested tables
      lines=lines.slice(0,i).concat(linesRemainingNew); //Put in the new remaining part in the place of the old
    }
    i++;
  }
  text=lines.join("\n"); //Merge the array to a string again

   
  TaPa.cellContent.push([[text]]);

  
  for(var keyT in TaPa.cellContent){
    var boLast=keyT==TaPa.cellContent.length-1; 
    var tmpT=TaPa.cellContent[keyT];
    for(var keyR in TaPa.cellContent[keyT]){
      var tmpR=TaPa.cellContent[keyT][keyR];
      for(var keyC in TaPa.cellContent[keyT][keyR]){
        var tmptext=TaPa.cellContent[keyT][keyR][keyC]; 
        tmptext=tmptext.replace(/</g,'&lt;');  tmptext=tmptext.replace(/>/g,'&gt;');
        //tmptext=escapeHtml(tmptext);
        if(boLast) tmptext=this.translateSpacePre(tmptext);
        tmptext=this.translateNestedLists(tmptext);
        tmptext = tmptext.replace(/^----/gm,'<hr/>'); //Translate horizontal rulers 
        tmptext = tmptext.replace(/\r?\n\s*\r?\n\s*\r?\n/g,"<p/><br/>\n"); //Translate tripple newlines to <p/><br/>
        tmptext = tmptext.replace(/\r?\n\s*\r?\n/g,"<p/>\n"); //Translate double newlines to <p/>
        tmptext = tmptext.replace(/  \r?\n/g,"<p/>\n"); //Translate two trailing spaces => "<p/>"
        TaPa.cellContent[keyT][keyR][keyC] = tmptext;
      }
    }
  }
  
  
  var tmp=TaPa.cellContent.pop(), text=tmp[0][0];
  var lines = text.split("\n");

  //
  // Put back the tables
  //
   
  var lines=TaPa.putbackTables(lines);
  text=lines.join("\n");
  
  
  for(var i=0;i<this.arrNoWiki.length;i++) { this.arrNoWiki[i]=escapeHtml(this.arrNoWiki[i]); }
  for(var i=0;i<this.arrHtmlSection.length;i++) { this.arrHtmlSection[i]=escapeHtml(this.arrHtmlSection[i]); }
  for(var i=0;i<this.arrPre.length;i++) { this.arrPre[i]=escapeHtml(this.arrPre[i]); }


  //
  // Put back all the removed stuff
  //
  
  text = text.replace(RegExp(STARTCHARSTR+'singleLBracket'+ENDCHARSTR,'g'),'['); //Put back single left brackets
  text = text.replace(RegExp(STARTCHARSTR+'singleRBracket'+ENDCHARSTR,'g'),']'); //Put back single right brackets
  
  text = text.replace(RegExp(STARTCHARSTR +'template(\\d+)\/' +ENDCHARSTR,'g'),thisChanged(this.putBackTemplateStubsCB,this)); //Put back template stubs   
  text = text.replace(RegExp(STARTCHARSTR +'pre(\\d+)\/' +ENDCHARSTR,'g'),thisChanged(this.putBackPreCB,this));     
  text = text.replace(RegExp(STARTCHARSTR +'htmlsection(\\d+)' +ENDCHARSTR,'g'),thisChanged(this.putBackHtmlSectionCB,this));  //Put back html sections
  text = text.replace(RegExp(STARTCHARSTR +'nowiki(\\d+)' +ENDCHARSTR,'g'),thisChanged(this.putBackNoWikiCB,this));  //Put back nowiki sections
    
  text = text.replace(RegExp(STARTCHARSTR +'style(\\d+)'+ENDCHARSTR,'g'),thisChanged(this.putBackStyleCB,this));    
  text = text.replace(RegExp(STARTCHARSTR +'comment(\\d+)'+ENDCHARSTR,'g'),thisChanged(this.putBackCommentCB,this));    
  text = text.replace(RegExp(STARTCHARSTR +'iLink(\\d+)' +ENDCHARSTR +'([\\s\\S]*?)' +STARTCHARSTR +'\/iLink(\\1)' +ENDCHARSTR,'g') ,thisChanged(this.putBackILinkCB,this)); //Put back Internal links
  text = text.replace(RegExp(STARTCHARSTR +'iWLink(\\d+)' +ENDCHARSTR +'([\\s\\S]*?)' +STARTCHARSTR +'\/iWLink(\\1)' +ENDCHARSTR,'g') ,thisChanged(this.putBackInterWikiLinkCB,this));
  text = text.replace(RegExp(STARTCHARSTR +'eLink(\\d+)' +ENDCHARSTR +'([\\s\\S]*?)' +STARTCHARSTR +'\/eLink(\\1)' +ENDCHARSTR,'g'),thisChanged(this.putBackExternalLinkCB,this)); 
  text = text.replace(RegExp(STARTCHARSTR +'img(\\d+)' +ENDCHARSTR +'([\\s\\S]*?)' +STARTCHARSTR +'\/img(\\1)' +ENDCHARSTR,'g'), thisChanged(this.putBackImageCB,this)); //Put back Images  
  text = text.replace(RegExp(STARTCHARSTR +'gall(\\d+)' +ENDCHARSTR +'([\\s\\S]*?)' +STARTCHARSTR +'\/gall(\\1)' +ENDCHARSTR,'g'), thisChanged(this.putBackGalleryCB,this)); //Put back Gallerys 
  text = text.replace(RegExp(STARTCHARSTR +'hl(\\d+)' +ENDCHARSTR +'([\\s\\S]*?)' +STARTCHARSTR +'\/hl(\\1)' +ENDCHARSTR,'g'), thisChanged(this.putBackHLCB,this)); //Put back HL  
  


  text = text.replace(RegExp(STARTCHARSTR+'bold'+ENDCHARSTR+'([\\s\\S]*?)'+STARTCHARSTR+'\/bold'+ENDCHARSTR,'g'), thisChanged(this.putBackBoldCB,this));
  text = text.replace(RegExp(STARTCHARSTR+'italic'+ENDCHARSTR+'([\\s\\S]*?)'+STARTCHARSTR+'\/italic'+ENDCHARSTR,'g'), thisChanged(this.putBackItalicCB,this));
  text = text.replace(RegExp(STARTCHARSTR+'heading(\\d+)'+ENDCHARSTR+'([\\s\\S]*?)'+STARTCHARSTR+'\/heading\\1'+ENDCHARSTR,'g'), thisChanged(this.putBackHeadingCB,this));
  
  while(1){
    this.boSimpleTagReplaced=0;
    text = text.replace(RegExp(STARTCHARSTR+"("+simpleTags+")"+'(\\d+)'+ENDCHARSTR+'([\\s\\S]*?)'+STARTCHARSTR+'\/\\1\\2'+ENDCHARSTR,'g'), thisChanged(this.putBackTagCB,this));
    if(this.boSimpleTagReplaced==0) break;
  }


  text = text.replace(RegExp(STARTCHARSTR+"iframe(\\d+)"+ENDCHARSTR+'([\\s\\S]*?)'+STARTCHARSTR+'\/iframe\\1'+ENDCHARSTR,'g'), thisChanged(this.putBackIframeCB,this));
  text = text.replace(RegExp(STARTCHARSTR+"video(\\d+)" +ENDCHARSTR+'([\\s\\S]*?)'+STARTCHARSTR+'\/video\\1'+ENDCHARSTR,'g'), thisChanged(this.putBackVideoCB,this));
  text = text.replace(RegExp(STARTCHARSTR+"source(\\d+)"+ENDCHARSTR,'g'), thisChanged(this.putBackVideoSourceCB,this));
  text = text.replace(RegExp(STARTCHARSTR+"imgRaw(\\d+)"+ENDCHARSTR,'g'), thisChanged(this.putBackImgRawCB,this));

  text = text.replace(RegExp(STARTCHARSTR+"br(\\d+)"+ENDCHARSTR,'g'), thisChanged(this.putBackBRCB,this));
 
  this.text=text;
  callback(null,0);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //  spacePre
Parser.prototype.translateSpacePre=function(text){ 
  var lines = text.split("\n");
  var boInPre=false;
  for(var key in lines) {
    var line=lines[key], matches;
    if ( matches=line.match(/^ (.*?)$/) ) {
      if(boInPre) lines[key]=matches[1];  else  lines[key]= '<pre>' +matches[1];
      boInPre=true;
    } else { 
      if(boInPre) { lines[key]= "</pre>\n" +line; boInPre=false; }  
    }
  }
  
  return lines.join("\n");
}

    //  nestedLists
Parser.prototype.translateNestedLists=function(text){ 
  var lines = text.split("\n");
  var chars = ['\\*', '\\#', ';', ':'];
  var indentInc=['<ul><li>','<ol><li>','<dl><dt>','<dl><dd>']; 
  var indentSame=['</li><li>','</li><li>','</dt><dt>','</dd><dd>'];
  var indentDec=['</li></ul>','</li></ol>','</dt></dl>','</dd></dl>'];
  
  for(var i=0;i<4;i++){
    var indent_level_last=0;
    var j=0;
    while(true) {
      if(j==lines.length ) { break;}
      //if ( preg_match( '/^('+preg_quote(chars[i])+'*)(.*?)$/' , lines[j] , matches ) ) {
      var tmpStr='^(' +chars[i] +'*)(.*?)$';
      var tmp=RegExp(tmpStr), matches;
      if ( matches=lines[j].match(tmp) ) {
        var indent_level = matches[1].length;
        if(indent_level==indent_level_last && indent_level>0)  lines[j] = indentSame[i] +matches[2];
          //If the indenture level shall be the same
        else if(indent_level>indent_level_last)   {
          lines[j] = str_repeat( indentInc[i] , indent_level-indent_level_last ) +matches[2];
            // If the indenture level shall increase
        }
        else if(indent_level<indent_level_last)   { // If the indenture level shall decrease
          lines[j]=str_repeat( indentDec[i] , indent_level_last-indent_level );
          if(indent_level>0) lines[j]+=(indentSame[i] +matches[2]);
          //else array_splice(lines, j+1, 0, matches[2] );
          else lines.splice(j+1, 0, matches[2] );
        }
        indent_level_last=indent_level;
      }
      j++;
    }
    if(indent_level_last>0) lines.push(str_repeat( indentDec[i] , indent_level_last ) +"\n"); 
      //If still indented on the last line (then decrease till zero indenture)
    
  }
  return lines.join("\n");
}

    // images
Parser.prototype.replaceImageCB=function(m,n){ 
  var i=this.arrImageLink.length;
  var parts=n.split('|');
  this.arrImageLink[i]=parts[0].trim();
  var nParts=parts.length;
  var boFrame=false, boThumb=false,  boWidthSet=false,  width='',  halign,  capture='';
  var partsTmp=parts.slice(1);
  
  for(var j in partsTmp){
    var part=partsTmp[j], tmpMatch;
    if(part.match(/^ *thumb *$/i)) { boFrame=true; boThumb=true;}
    else if(tmpMatch=part.match(/^ *(\d+) *px *$/i)) width=tmpMatch[1]; 
    else if(part.match(/^ *left *$/i)) halign='left';
    else if(part.match(/^ *right *$/i)) halign='right';
    else if(part.match(/^ *center *$/i)) halign='center';
    else if(part.match(/^ *frame *$/i)) boFrame=true;
    else capture=part;
  }
  if(typeof halign=='undefined' && boThumb) halign='right';
  
  if(boThumb && width=='') width='200';
  this.arrImageFrame[i]=boFrame;
  this.arrImageWidth[i]=width;
  this.arrImageHAlign[i]=halign;
  
  return STARTCHAR +'img' +i +ENDCHAR +capture +STARTCHAR +'/img' +i +ENDCHAR; 
}

Parser.prototype.putBackImageCB=function(m,i,caption){
  
  var file=this.arrImageLink[i];
  var width=this.arrImageWidth[i];
  //confirm(width.length+' '+tmp.length)
  //var widthstr;  if(width.length>0) widthstr='width=' +width; else widthstr='';
  //var str='<a href="' +file +'" class=image><img src="' +file +'" ' +widthstr +' class=thumbimage></a>';
  var thumb, strStyle, strClass;
  if(width.length) {
    thumb=width+'px-'+file;  strStyle='style="max-width:'+width+'px"'; strClass='class=thumbimage';
  } else { thumb=file; strStyle=""; strClass="";}
  var str='<a href="'+file+'" class=image><img src="'+thumb+'" '+strStyle+' '+strClass+'></a>';
  var boFrame=this.arrImageFrame[i], halign=this.arrImageHAlign[i];
  var strAlignClass, strFrameWidth, strOuterFrameClass, strInnerFrameClass, strCaptionClass;
  if(boFrame) {
    if(halign=='right') strAlignClass='tright'; else if(halign=='left') strAlignClass='tleft'; else if(halign=='center') strAlignClass='center'; else strAlignClass=''; 
    if(width.length>0) strFrameWidth='style="width:' +(Number(width)+2) +'px;"'; else strFrameWidth='';
    if(halign=='center' && width=='') {console.log("Is this right really?!? In putBackImageCB: halign=='center' && width==''"); strOuterFrameClass='noFrame';strInnerFrameClass='noFrame';strCaptionClass='noFrameCaption';} else {strOuterFrameClass='thumb';strInnerFrameClass='thumbinner';strCaptionClass='thumbcaption';}
    
    str='<div class="' +strOuterFrameClass +' ' +strAlignClass +'"><div class=' +strInnerFrameClass +' ' +strFrameWidth +'>' +str +'<div class=' +strCaptionClass +'>' +caption +'</div></div></div>';        
  }
  else {
    if(halign=='right') strAlignClass='floatright'; else if(halign=='left') strAlignClass='floatleft'; else if(halign=='center') strAlignClass='floatcenter'; else strAlignClass='floatnone';
    if(strAlignClass=='floatnone') str='<span class='+strAlignClass+'>' +str +'</span>';
    else str='<div class='+strAlignClass+'>' +str +'</div>';
  }
  
  return str;
}


    // ILinks
Parser.prototype.replaceILinkCB=function(m,n){ 
  var i=this.arrILink.length;
  
  if(n.match(/^ *(image *:)|(category *:)/i) ) { return m; }
  //if(preg_match('/(?i)^ *(image *:)|(category *:)/',n,tmp) ) { return m; }
  var parts=n.split('|'), nParts=parts.length;
  var innerText; if(nParts>1)  innerText=parts[1];  else innerText='';
  var pageLikeWritten=parts[0].trim(); //pageLikeWritten, needed when there is no innerText
  var pageLikeQuered=pageLikeWritten.replace(/ /g,'_');
  
  this.arrILink[i]=[pageLikeWritten, pageLikeQuered];
  
  return STARTCHAR +'iLink' +i +ENDCHAR +innerText +STARTCHAR +'/iLink' +i +ENDCHAR;
}

Parser.prototype.putBackILinkCB=function(m,n,o){
  var pageLikeWritten=this.arrILink[n][0], pageLikeQuered=this.arrILink[n][1];
  var text; if(o.length)  {text=o;}  else  {text=pageLikeWritten;}
  
  var strID='id=int'+n;
  //var boExist=this.arrILink[n][2]; 
  //var boExist=pageLikeQuered.toLowerCase() in this.objExistingSubLower;
  var ind=this.arrExistingSubLower.indexOf(pageLikeQuered.toLowerCase()),  boExist=ind!=-1;
  var pageCanonical=pageLikeQuered; if(boExist) pageCanonical=this.arrExistingSub[ind];
  var strClass='', strNoFollow=''; if(!boExist) { strClass='class=stub'; strNoFollow='rel="nofollow"'; }
  
  return '<a href="' +pageCanonical +'" '+strClass+' '+strNoFollow+'>' +text +'</a>';
}





    // interWikiLinks
Parser.prototype.replaceInterWikiLinkCB=function(m,n,o){ 
  var i=this.arrInterWikiLink.length;
  this.arrInterWiki_WikiType[i]=n.toLowerCase();  //Storing 'wikipedia', 'wiktionary', 'wikibooks' ...
  var parts=o.split('|');
  var nParts=parts.length;
  var innerText; if(nParts>1)  innerText=parts[1];  else innerText='';
  var pagename=parts[0].trim();  //Wait with the convertion to lowercase and putting in underscores, since pagename might be used as linktext
  this.arrInterWikiLink[i]=pagename;
  return STARTCHAR +'iWLink' +i +ENDCHAR +innerText +STARTCHAR +'/iWLink' +i +ENDCHAR;
}
Parser.prototype.putBackInterWikiLinkCB=function(m,n,o){
  var i=n;
  var str0;  if(this.arrInterWiki_WikiType[i]=='wikipedia') str0='https://en.wikipedia.org/wiki/';
  else if(this.arrInterWiki_WikiType[i]=='wiktionary') str0='https://en.wiktionary.org/wiki/';
  var pagename=this.arrInterWikiLink[i];
  
  var text; if(o.length>0)  {text=o;}  else  {text=pagename;}
  //str1=strtolower(strtr(pagename,' ','_'));
  var str1=pagename.replace(/ /g,'_');
  //str1=strtr(pagename,' ','_');

  var strClass='class=wikipedia';
  return '<a href="' +str0 +str1 +'" ' +strClass +'>' +text +'</a>';
}


    // externalLink
Parser.prototype.replaceExternalLinkCB=function(m,n,o){
  var i=this.arrExtLink.length;
  var str1; this.arrExtLink.push(n);   if(arguments.length>2 && o.length>0) str1=o; else str1=''; 
  return STARTCHAR +'eLink' +i +ENDCHAR +str1 +STARTCHAR +'/eLink' +i +ENDCHAR;
}
Parser.prototype.putBackExternalLinkCB=function(m,n,o){
  var linkname=this.arrExtLink[n], text;    if(o.length>0) {text=o;} else {text=linkname;}
  var strClass='class="external"';
  return '<a href="' +linkname +'" ' +strClass +'>' +text +'</a>';
}

    // comments
Parser.prototype.replaceCommentCB=function(m){
    var i=this.arrComment.length;  this.arrComment[i]=m;  return STARTCHAR+'comment'+i+ENDCHAR;  }
Parser.prototype.putBackCommentCB=function(m,n){  return this.arrComment[n];  }

    // nowiki
Parser.prototype.replaceNoWikiCB=function(m,n){
  var i=this.arrNoWiki.length;
  this.arrNoWiki[i]=n;
  return STARTCHAR +'nowiki' +i +ENDCHAR;
}
Parser.prototype.putBackNoWikiCB=function(m,n){  return this.arrNoWiki[n];  }




    // templates
Parser.prototype.replaceTemplateCB=function(m,n){
  var templateName=n.trim().replace(/ /g,'_');
  templateName=escapeHtml(templateName); //to prevent scripttags in template name
  var i=this.bagTemplate.length;   //All templates (red or blue) are stored, So that one can later can create a list of them in the edit section 
  this.bagTemplate.push([templateName,0]);
  return STARTCHAR+'template'+i+'/'+ENDCHAR;;
}

Parser.prototype.putBackTemplateCB=function(m,n){
  var templateName=this.bagTemplate[n][0];
  var templateNameAsQuered='template:'+templateName; 
  if(templateNameAsQuered in this.objTemplate){
    return this.objTemplate[templateNameAsQuered];
  }else{    return m;   }
}
Parser.prototype.putBackTemplateStubsCB=function(m,n){ 
  var templateName=this.bagTemplate[n][0];
  var templateNameAsQuered='template:'+templateName;
  var strClass='class=stub';
  return '<a href="'+'/'+templateNameAsQuered+'" '+strClass+'>'+templateNameAsQuered+'</a>';
}

    // htmlSection
Parser.prototype.replaceHtmlSectionCB=function(m,n){
  if(this.boTrustEditors==0) {return "<htmlsection-tag doesn't work unless the admin disables \"write-access\"/>";}
  var i=this.arrHtmlSection.length;
  this.arrHtmlSection.push(n);
  return STARTCHAR+'htmlsection'+i+ENDCHAR;
}
Parser.prototype.putBackHtmlSectionCB=function(m,n){
  return this.arrHtmlSection[n];
}

    // pre
Parser.prototype.replacePreCB=function(m,n){
  var i=this.arrPre.length;
  this.arrPre.push(n);
  return STARTCHAR+'pre'+i+'/'+ENDCHAR;
}
Parser.prototype.putBackPreCB=function(m,n){    return '<pre>'+this.arrPre[n]+'</pre>';  }


Parser.prototype.translateScriptTag=function(m,n){return '&lt;'+n+'&gt;';}


    // style
Parser.prototype.replaceStyleCB=function(m,n){
  if(this.boTrustEditors==0) {return "<style-tag doesn't work unless the admin disables \"write-access\"/>";}
  var i=this.arrStyle.length;
  this.arrStyle.push(sanitizeStyle(n));
  return STARTCHAR+'style'+i+ENDCHAR;
}
Parser.prototype.putBackStyleCB=function(m,n){  return '<style>'+this.arrStyle[n]+'</style>';  }

    // simple tags
Parser.prototype.replaceTagCB=function(m,tag,attr,text){
  this.boSimpleTagReplaced=1;
  var i=this.arrTagAttr.length;
  this.arrTagAttr.push(sanitize(attr,tag));
  return STARTCHAR+tag+i+ENDCHAR+text+STARTCHAR+"/"+tag+i+ENDCHAR;
}
Parser.prototype.putBackTagCB=function(m,tag,n,text){  
  this.boSimpleTagReplaced=1;
  var attr=this.arrTagAttr[n]; 
  return "<"+tag+" "+attr+">"+text+"</"+tag+">";  
}

    // br
Parser.prototype.replaceBRCB=function(m,n){
  var i=this.arrBRAttr.length;
  this.arrBRAttr.push(sanitize(n,'br'));
  return STARTCHAR+'br'+i+ENDCHAR;
}
Parser.prototype.putBackBRCB=function(m,n){    var attr=this.arrBRAttr[n];   return "<br "+attr+">";   }

    // bold, italic, headings
Parser.prototype.replaceBoldCB=function(m,n){  return STARTCHAR+'bold'+ENDCHAR+n+STARTCHAR+'/bold'+ENDCHAR;  }
Parser.prototype.putBackBoldCB=function(m,n){   return '<b>'+n+'</b>';  }
Parser.prototype.replaceItalicCB=function(m,n){  return STARTCHAR+'italic'+ENDCHAR+n+STARTCHAR+'/italic'+ENDCHAR; }
Parser.prototype.putBackItalicCB=function(m,n){    return '<i>'+n+'</i>';  }
Parser.prototype.replaceHeadingCB=function(m,n,o,p){
  var c1=n.length, c2=p.length; if(c1!==c2) return m;
  var c=c1-1; // Since "==" => h1,  "===" => h2 etc.
  return STARTCHAR+'heading'+c+ENDCHAR+o+STARTCHAR+'/heading'+c+ENDCHAR;
}
Parser.prototype.putBackHeadingCB=function(m,n,o){  return "<h"+n+">"+o+"</h"+n+">";  }


  
    // iframe
Parser.prototype.replaceIframeCB=function(m,attr,text){  
  if(this.boTrustEditors==0) {return "<iframe-tag doesn't work unless the admin disables \"write-access\"/>";}
  var i=this.arrIframeAttr.length;
  var attr=sanitize(attr,'iframe');
  this.arrIframeAttr.push(attr);
  return STARTCHAR+'iframe'+i+ENDCHAR+text+STARTCHAR+"/iframe"+i+ENDCHAR;
}
Parser.prototype.putBackIframeCB=function(m,n,text){  
  var attr=this.arrIframeAttr[n];
  return "<iframe "+attr+">"+text+"</iframe>";  
}


 
    // gallery
Parser.prototype.replaceGalleryCB=function(m,text){ 
  var iGall=this.iGall=this.arrGalleryImageLink.length;
  this.arrGalleryImageLink[iGall]=[];
  text = text.replace(RegExp("^ *file: *(.*?)$",'gmi'), thisChanged(this.replaceImageInGalleryCB,this));
  return STARTCHAR+'gall'+iGall+ENDCHAR+text+STARTCHAR+'/gall'+iGall+ENDCHAR; 
}
Parser.prototype.replaceImageInGalleryCB=function(m,n){ 
  var iGall=this.iGall, j=this.arrGalleryImageLink[iGall].length;
  var parts=n.split('|');
  this.arrGalleryImageLink[iGall].push(parts[0].trim());
  var capture=''; if(parts.length==2) capture=parts[1];
  return STARTCHAR+'gallImg'+iGall+'_'+j+ENDCHAR+capture+STARTCHAR+'/gallImg'+iGall+'_'+j+ENDCHAR; 
}
Parser.prototype.putBackGalleryCB=function(m,n,text){
  text = text.replace(RegExp(STARTCHARSTR+'gallImg(\\d+)_(\\d+)'+ENDCHARSTR+'(.*?)'+STARTCHARSTR+'\/gallImg(\\1)_(\\2)'+ENDCHARSTR,'g'), thisChanged(this.putBackImageInGalleryCB,this) ); //Put back Imges
  return "<ul class=gallery>"+text+"</ul>";
}
Parser.prototype.putBackImageInGalleryCB=function(m,n,o,caption){
  var i=n,  j=o, uOrg=this.arrGalleryImageLink[i][j];
  var width=150,  uThumb=""+width+"apx-"+uOrg+"";

  var strStyleLi="style=\"width:"+width+"px\"";
  var strStyle="style=\"max-width:"+width+"px;max-height:"+width+"px\"";
  var str="<li class=gallerybox "+strStyleLi+" ><a href="+uOrg+"><img "+strStyle+" src=\""+uThumb+"\"/></a><div>"+caption+"</div></li>";
  return str;
}


    // HL
Parser.prototype.replaceHLCB=function(m,text){ 
  var iHL=this.iHL=this.arrHLAttr.length; 
  this.arrHLAttr[iHL]=[];
  text = text.replace(RegExp("<hli(.*?)>([\\s\\S]*?)<\/hli>",'ig'), thisChanged(this.replaceHLItemCB,this));
  return STARTCHAR+'hl'+iHL+ENDCHAR+text+STARTCHAR+'/hl'+iHL+ENDCHAR; 
}
Parser.prototype.replaceHLItemCB=function(m,n,text){ 
  var iHL=this.iHL, j=this.arrHLAttr[iHL].length;
  this.arrHLAttr[iHL].push(n.trim());
  return STARTCHAR+'hli'+iHL+'_'+j+ENDCHAR+text+STARTCHAR+'/hli'+iHL+'_'+j+ENDCHAR; 
}
Parser.prototype.putBackHLCB=function(m,n,text){
  text = text.replace(RegExp(STARTCHARSTR+'hli(\\d+)_(\\d+)'+ENDCHARSTR+'([\\s\\S]*?)'+STARTCHARSTR+'\/hli(\\1)_(\\2)'+ENDCHARSTR,'g'), thisChanged(this.putBackItemInHLCB,this) ); //Put back Imges
  return "<ul class=HL>"+text+"</ul>";
}
Parser.prototype.putBackItemInHLCB=function(m,n,o,text){
  var i=n, j=o, attr=this.arrHLAttr[i][j];
  return "<li class=HLbox "+attr+">"+text+"</li>";
}

    // video
Parser.prototype.replaceVideoCB=function(m,attr,text){
  var i=this.arrVideoAttr.length;
  this.arrVideoAttr.push(sanitize(attr,'video'));
  return STARTCHAR+'video'+i+ENDCHAR+text+STARTCHAR+"/video"+i+ENDCHAR;
}
Parser.prototype.putBackVideoCB=function(m,n,text){  
  var attr=this.arrVideoAttr[n];
  return "<video "+attr+">"+text+"</video>";  
}
Parser.prototype.replaceVideoSourceCB=function(m,attr){
  var i=this.arrVideoSourceAttr.length;
  this.arrVideoSourceAttr.push(sanitize(attr,'source'));
  return STARTCHAR+'source'+i+ENDCHAR;
}
Parser.prototype.putBackVideoSourceCB=function(m,n){  
  var attr=this.arrVideoSourceAttr[n];
  return "<source "+attr+">";  
}
Parser.prototype.replaceImgRawCB=function(m,attr){
  var i=this.arrImgRawAttr.length;
  this.arrImgRawAttr.push(sanitize(attr,'img'));
  return STARTCHAR+'imgRaw'+i+ENDCHAR;
}
Parser.prototype.putBackImgRawCB=function(m,n){  
  var attr=this.arrImgRawAttr[n];
  return "<img "+attr+">";  
}



Parser.prototype.setArrSub=function(){ // Uses objExistingSub and StrSub to calculate (assign) this.arrSub = [[name,boExist], [name,boExist] ....] 
  this.arrSub=[], this.arrExistingSub=[], this.arrExistingSubLower=[]; 
  for(var name in this.objExistingSub) { this.arrExistingSub.push(name);  this.arrExistingSubLower.push(name.toLowerCase()); }
  for(var i=0;i<this.StrSub.length;i++){ var name=this.StrSub[i], boExist=this.arrExistingSubLower.indexOf(name.toLowerCase())!=-1; this.arrSub.push([name,boExist]);  }
}


Parser.prototype.getStrTemplate=function(){ // Returns [name, name ....] 
  var obj={};
  for(var i=0;i<this.bagTemplate.length;i++) {
    var strName='template:'+this.bagTemplate[i][0], key=strName.toLowerCase();
    obj[key]=strName;
  }
  this.StrTemplate=[]; for(var name in obj){ this.StrTemplate.push(obj[name]);  }
  return this.StrTemplate;
}

Parser.prototype.getStrSub=function(){ // Returns [name, name ....] 
  var obj={};
  for(var i=0;i<this.bagTemplate.length;i++) {
    var strName='template:'+this.bagTemplate[i][0], key=strName.toLowerCase();
    obj[key]=strName;
  }
  for(var i=0; i<this.arrILink.length;i++) { var v=this.arrILink[i], strName=v[1], key=strName.toLowerCase();    obj[key]=strName;     }

  this.StrSub=[]; for(var name in obj){ this.StrSub.push(obj[name]);  }
  return this.StrSub;
}


Parser.prototype.getStrSubImage=function(){ // Returns [name, name ....] 
  var obj={};
  for(var i=0;i<this.arrImageLink.length;i++) {   var strName=this.arrImageLink[i], key=strName.toLowerCase(); obj[key]=strName;  }
  for(var i=0; i<this.arrGalleryImageLink.length;i++) { 
    var arrLoc=this.arrGalleryImageLink[i];
    for(var j=0; j<arrLoc.length;j++) {  var strName=arrLoc[j], key=strName.toLowerCase(); obj[key]=strName;        }
  }

  var StrSub=[]; for(var name in obj){ StrSub.push(obj[name]);  }
  return StrSub;
}



