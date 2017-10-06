
(function(){


MmmWikiFiltExtention={
  setSingleParent:function(idParent){
    var tmpFilt=this[this.iParent]; array_mergeM(tmpFilt[0],tmpFilt[1]), ind=tmpFilt[0].indexOf(idParent); if(ind!=-1)  mySplice1(tmpFilt[0],ind);  tmpFilt[1]=[idParent]; tmpFilt[2]=1;
  },
  checkIfSingleParent:function(){
    var tmpFilt=this[this.iParent]; return (tmpFilt[1].length==1 && tmpFilt[2]==1);
  },
  getParentsOn:function(){
    var tmpFilt=this[this.iParent];  return tmpFilt[1];
  },
  getNParentsOn:function(){
    var tmpFilt=this[this.iParent];  return tmpFilt[1].length;
  },
  getSingleParent:function(){
    var tmpFilt=this[this.iParent]; if(tmpFilt[1].length==1 && tmpFilt[2]==1) return tmpFilt[1][0];     else return false;
  },
  clearParent:function(){
    var tmpFilt=this[this.iParent]; array_mergeM(tmpFilt[1], tmpFilt[0]);  tmpFilt[0].length=0; tmpFilt[2]=1;
  },
  isWhite:function(){
    var tmpFilt=this[this.iParent]; return tmpFilt[2];
  },
  setSite:function(siteName){
    var tmpFilt=this[this.iSiteName]; array_mergeM(tmpFilt[0],tmpFilt[1]), ind=tmpFilt[0].indexOf(siteName); if(ind!=-1)  mySplice1(tmpFilt[0],ind);  tmpFilt[1]=[siteName]; tmpFilt[2]=1;
  }
}



function popUpExtend($el){
  $el.openPop=function() {
"use strict"
    //siz=getViewPortSize();  winW=siz.w;winH=siz.h;
    //var siz=getViewPortSize(); var winW=siz.w;
    var winW=$(window).width(),winH=$(window).height();
    var $doc=$(document), scrollX=$doc.scrollLeft(), scrollY=$doc.scrollTop(); 
    //var pageYOffset=window.pageYOffset;   if(typeof pageYOffset =='undefined') pageYOffset=document.body.scrollTop;
    $el.setBlanketSize();
  
    $el.addClass('popUpDiv');
    
    $body.prepend($el.$blanket);  
    $body.prepend($el);

    //$(window).scroll($el.setBlanketSize);
    $(window).on('scroll',$el.setBlanketSize);
    //$(window).scroll(function(){alert('tt');});
    
    //var bubW=$el.width(), bubH=$el.height();
    var bubW=$el.outerWidth(), bubH=$el.outerHeight(); //alert('$(window).width(): '+winW+' '+winH+', bubW: '+bubW+' '+bubH);
    var x=scrollX+(winW-bubW)/2; if(x<0) x=0;    var y=scrollY+(winH-bubH)/4;  if(y<0) y=0;
    //$el.append("scrollY:"+scrollY+", winH:"+winH+", bubH:"+bubH);
    //if($.browser.msie)  $el.css({left:x+'px'});   else $el.css({top:y+'px',left:x+'px'});
    $el.css({top:y+'px',left:x+'px'});
  }

  $el.closePop=function() { 
    $el.detach();    
    //$(window).unbind('scroll',$el.setBlanketSize);
    $(window).off('scroll',$el.setBlanketSize);
    $el.$blanket.detach(); 
  }
  
  $el.setBlanketSize=function(){
    
    var docH=$(document).height(), winH=$(window).height(), blankH=docH>winH?docH:winH, blankHOld=$el.$blanket.css("height");
    if(blankH!=blankHOld)  $el.$blanket.css({"height": blankH  });
    var docW=$(document).width(), winW=$(window).width(), blankW=docW>winW?docW:winW, blankWOld=$el.$blanket.css("width");
    if(blankW!=blankWOld)  $el.$blanket.css({"width": blankW  });
    
  }
  
  $el.$blanket=$('<div>').addClass('blanketPop');
  //$el.$blanket.css({background:'#555'});
  $el.$blanket.css({background:'#fff'});
  return $el;
}


histGoTo=function($view){}
doHistBack=function(){  history.back();}
doHistPush=function(obj){ 
    // Set "scroll" of stateNew  (If the scrollable div is already visible) 
  var $view=obj.$view;
  var scrollT=$window.scrollTop();
  if(typeof $view.setScroll=='function') $view.setScroll(scrollT); else history.StateMy[history.state.ind].scroll=scrollT;  //$view.intScroll=scrollT; 

  if((boChrome || boOpera) && !boTouch)  history.boFirstScroll=true;

  var indNew=history.state.ind+1;
  stateTrans={hash:history.state.hash, ind:indNew};  // Should be called stateLast perhaps
  history.pushState(stateTrans, strHistTitle, uCanonical);
  history.StateMy=history.StateMy.slice(0,indNew);
  history.StateMy[indNew]=obj;
}


doHistReplace=function(obj, indDiff){
  if(typeof indDiff=='undefined') indDiff=0;
  history.StateMy[history.state.ind+indDiff]=obj;
}
changeHist=function(obj){
  history.StateMy[history.state.ind]=obj;
}
getHistStatName=function(){
  return history.StateMy[history.state.ind].$view.toString();
}


history.distToGoal=function($viewGoal){
  var ind=history.state.ind;
  var indGoal;
  for(var i=ind; i>=0; i--){
    var obj=history.StateMy[i];
    if(typeof obj=='object') var $view=obj.$view; else continue;
    if($view===$viewGoal) {indGoal=i; break;}
  }
  
  var dist; if(typeof indGoal!='undefined') dist=indGoal-ind;
  return dist;
}
history.fastBack=function($viewGoal, boRefreshHash){
  var dist=history.distToGoal($viewGoal);
  if(dist) {
    if(typeof boRefreshHash!='undefined') history.boResetHashCurrent=boRefreshHash;
    history.go(dist);
  }
}



commentButtonExtend=function($el){
"use strict"
  $el.setUp=function(boTalkExist){
    if(boTalkExist) {
      $a.css({color:""}); if($a.prop('rel')) $a.prop({rel:''});
    } else $a.css({color:"red"}).prop({rel:'nofollow'});
  } 
  var matches=queredPage.match(/^ *(talk:|template:|template_talk:|) *(.*)/)
  var kind=matches[1].replace(/:/,'');
  var _page=matches[2].replace(/ /,'_');
  //$body.css({'line-height':'100%'});
  var url='',boShallHave=0;
  if(kind=='template') { url=uSite+'/template_talk:'+_page; boShallHave=1; }
  else if(kind=='') { url=uSite+'/talk:'+_page; boShallHave=1;}
  
  var $a=$('<a>').prop({href:url});

  if(boSmallAndroid){
    
    var $tmpImg=$('<img>').prop({src:uComment}).css({display:'inline-block',height:'1em',width:'1em',position:'absolute',left:'0em',top:'0em',border:'0px'});
    $a.append("██",$tmpImg).css({'font-size':'1.5em',position:'absolute',left:'0em',top:'0em'});  //██⬛
    //var $divAbs=$('<div>').append($a).css({position:'relative',display:'inline-block',height:'1.6em',width:'1.6em','vertical-align':'baseline',top:'0em'});
    $el.append($a).css({position:'relative',display:'inline-block',height:'1.5em',width:'1.5em',overflow:'hidden','vertical-align':'baseline',cursor:'pointer'});
    $el.click(function(){window.location.assign(url)});
    
/*
    var strSpeechBubble="💬";
    $a.append(strSpeechBubble);
    $el.append($a).css({'font-size':'0.88em','vertical-align':'text-bottom','line-height':strSizeIcon,'display':'inline-block'});
*/
  }else {
    $a.append('Comments');
    $el.append($a).css({'font-size':'0.88em','vertical-align':'text-bottom','line-height':strSizeIcon,'display':'inline-block'});
  }
  $el.toggle(Boolean(boShallHave));
  //if(boShallHave) $el.css({display:''}); else {$el.hide(); }  //$el.show(); // $el.show() => display:block in Firefox !!!!!
  return $el;
}

vLoginDivExtend=function($el){
"use strict"
  $el.myToggle=function(boOn){
    if(boOn) $el.show();else $el.hide(); if(boOn) $el.$vPass.focus();
  }
  var vPassF=function(){  
    var tmp=SHA1($vPass.val()+strSalt);
    var vec=[['vLogin',{pass:tmp}],['pageLoad',1]];   majax(oAJAX,vec); 
    $vPass.val('');
  }
  var $vPass=$('<input type=password>').keypress( function(e){ if(e.which==13) {vPassF();return false;} });     
  var $vPassButt=$('<button>').append('Login').click(vPassF);
  $el.$vPass=$vPass;
  $el.addClass('vPassword').append($vPass, $vPassButt);

  return $el;
}



createChildInd=function(arrI){
  var tmp=[]; for(var i=0;i<arrI.length;i++){  var itmp=arrI[i];  tmp[itmp]=i;  }  return tmp;
}

createColJIndexNamesObj=function(arrName){
"use strict"
  var o={};
  for(var i=0;i<arrName.length;i++){ 
    var tmp="j"+arrName[i][0].toUpperCase()+arrName[i].substr(1);       o[tmp]=i;
  }
  return o;
}


messExtend=function($el){
"use strict"
  $el.resetMess=function(time){ 
    if(typeof time =='number')     messTimer=setTimeout('resetMess()',time*1000);
    else {$el.html(''); clearTimeout(messTimer);} 
  }
  $el.setMess=function(str,time,boRot){  
    $el.show();
    $el.html(str);  clearTimeout(messTimer); 
    if(typeof time=='number' && time>0)     messTimer=setTimeout('resetMess()',time*1000);
    if(boRot) $el.append($imgBusy);
  };
  var messTimer;
  //$el.addClass('message').css({'z-index':8100,position:'fixed'}); 
  $el.css({border:'black 1px solid',bottom:'0%',right:'0%',margin:'0',padding:'1px','background-color':'#F7F700','font-size':'0.8em','z-index':18100,position:'fixed'}); 
  $el.click(function(){$el.hide();});
  return $el;
}



/*******************************************************************************
 * pageView
 ******************************************************************************/
pageViewExtend=function($el){
"use strict"
  $el.toString=function(){return 'pageView';}
  $el.setDetail=function(){
    var strNR='',  str='';
    if(matVersion.length){
      var ver=arrVersionCompared[1], rev=ver-1;
      var r=matVersion[rev];
      strNR='v'+ver+'/'+nVersion;  str=r[1]+' <b><i>'+r[2]+'</i></b>';//+mySwedDate(r[0]);
    }
    $el.$spanNR.html(strNR);  $spanDetail.html(str);
  }
  $el.setFixedDivColor=function(boOR){   $el.$fixedDiv.css({background:boOR?'#fff':'lightgreen'});  }

    // menuB == versionMenu
  var $versionTableButton=$('<button>').append('Version list').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(function(){
    doHistPush({$view:$versionTable});
    $versionTable.setVis();
  });    
  var $diffButton=$('<button>').append('Diff').addClass('fixWidth').css({'margin-right':'1em'}).click(function(){
    //var arrVersionCompared=[bound(nVersion-iRow-1,1),nVersion-iRow];
    if(nVersion<2) return;
    arrVersionCompared[0]=arrVersionCompared[1]-1;
    if(arrVersionCompared[1]==1) arrVersionCompared=[2,1]; 
    var vec=[['pageCompare',{arrVersionCompared:arrVersionCompared }]];   majax(oAJAX,vec); 
    doHistPush({$view:$diffDiv});
    $diffDiv.setVis();
  });
  $el.$spanNR=$('<span>').css({margin:'0em 0.1em'});
  var $nextButton=$('<button>').append('⇧').addClass('fixWidth').click(function(){
    var iVer=arrVersionCompared[1]+1; if(iVer>nVersion) iVer=1;
    var vec=[['pageLoad',{version:iVer}]];   majax(oAJAX,vec); 
  });
  var $prevButton=$('<button>').append('⇩').addClass('fixWidth').css({'margin-left':'0.8em'}).click(function(){
    var iVer=arrVersionCompared[1]-1; if(iVer<1) iVer=nVersion;
    var vec=[['pageLoad',{version:iVer}]];   majax(oAJAX,vec); 
  });
  var $spanDetail=$('<span>').append('ggggggggggg').css({'margin-right':'0.5em', 'margin-left':'0.5em'});
  var $divUpper=$('<div>').append($prevButton,$el.$spanNR,$nextButton,$spanDetail,$diffButton).css({'line-height':'2em'});

  
  var $divLower=$('<div>').append($versionTableButton).css({margin:'.5em auto auto'});

  $el.$versionMenu=$('<div>').append($divUpper,$divLower).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.5em auto'});

 

  var boShowAdminButton=getItem('boShowAdminButton');  if(boShowAdminButton===null)  boShowAdminButton=false;
  var adminButtonToggleEventF=function(){
    var now=Date.now(); if(now>timeSpecialR+1000*10) {timeSpecialR=now; nSpecialReq=0;}    nSpecialReq++;
    if(nSpecialReq==3) { nSpecialReq=0;boShowAdminButton=!boShowAdminButton; $spanAdmin.toggle(boShowAdminButton);  setItem('boShowAdminButton',boShowAdminButton);  }
  }
  var timeSpecialR=0, nSpecialReq=0;
    // menuA

  var $tmpImg=$('<img>').prop({src:uBitcoin}).css({height:strSizeIcon,width:strSizeIcon,'vertical-align':'text-bottom'});
  var $tmpSpan=$('<span>').append('Pay/Donate');//.css({display:'inline-block','vertical-align':'text-bottom',height:strSizeIcon});  display:'inline-block',
  var $paymentButton=$('<button>').append($tmpSpan).addClass('fixWidth').css({'vertical-align':'bottom','margin-right':'1em','line-height':strSizeIcon}).click(function(){
    doHistPush({$view:$paymentDiv});
    $paymentDiv.setVis();
  }); if(ppStoredButt=='' && strBTC=='') $paymentButton.hide();
  $editButton.on('click', adminButtonToggleEventF);
  var $tmpImg=$('<img>').prop({src:uAdmin}).css({height:strSizeIcon,width:strSizeIcon,'vertical-align':'text-bottom'});
  var $adminButton=$('<button>').append($tmpImg).addClass('fixWidth').click(function(){
    doHistPush({$view:$adminDiv});
    $adminDiv.setVis();
  });
  var $spanAdmin=$('<span>').append($spanMod, $adminButton).css({'float':'right'})
  if(!boTouch) popupHoverM($adminButton,$('<div>').html('Administrator entry.'));
  $spanAdmin.toggle(boShowAdminButton);
  

  $commentButton.css({'margin-left':'1em','float':'right'});
  var $menuA=$('<div>').append($editButton,$paymentButton,$commentButton,$spanAdmin).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'});  //.css({margin:'1em 0','text-align':'center',position:'fixed',bottom:0,width:'100%'});

  $el.$fixedDiv=$('<div>').append($el.$versionMenu,$menuA).css(cssFixed);//.css({position:'static'});

  
  $el.append($el.$fixedDiv);

  return $el;
}

/*******************************************************************************
 * adminDiv
 ******************************************************************************/
adminDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'adminDiv';}
  $el.setUp=function(){
    if($editText.parent()[0]!==$el.$fixedDiv[0]) {
      $el.$fixedDiv.prepend($dragHR,$editText);
    }
    //$dragHR.after($editText);
  }
  $el.setAdminStat=function(){
    var boT=Boolean(boALoggedIn);
    $infoDiv.add($logoutButt).add($handyButton).toggle(boT);
    //$loginButt.add($password).add($password2).toggle(!boT);
    $password.add($password2).toggle(!boT);
  }
  var aPassF=function(){  
    var tmp=SHA1($password.val()+strSalt);
    var vec=[['aLogin',{pass:tmp}]];   majax(oAJAX,vec); 
    $password.val('');
  }
  //var $loginButt=$('<button>').append('Login').on('click',aPassF).hide();
  var $logoutButt=$('<button>').append('Logout').click(function(){
    var vec=[['aLogout',1]];   majax(oAJAX,vec); 
  }); 
  var $password=$('<input type=password placeholder="Login">').keypress( function(e){   if(e.which==13) { aPassF(); return false;}   }); 

  var aPass2F=function(){  
    var tmp=SHA1($password2.val()+strSalt); 
    var vec=[['aLogin',{pass:tmp}],['saveByReplace',{strEditText:$editText.val()}]];   majax(oAJAX,vec); 
    $password2.val('');
    $boLCacheObs.val(1);
  }
  var $handyButton=$('<button>').append('Overwrite').click(aPass2F); 
  var $password2=$('<input type=password  placeholder="Overwrite">').keypress( function(e){   if(e.which==13) {aPass2F(); return false;}   }); 
  var $imgH=$imgHelp.clone().css({margin:'0em 1em'}); popupHoverM($imgH,$('<div>').html('Write password for:<li>Login: logging in<li>Overwrite: A brutal but handy quick route for saving plus deleting all old versions.'));
  //var $handySpan=$('<span>').append();  
  var $aLoginDiv=$('<span>').append($imgH, $logoutButt, $password, ' ', $handyButton, $password2);
  $password.add($password2).css({width:'6em'});
  $aLoginDiv.css({"float":"right"});

  
  var $moreButton=$('<button>').append('More').addClass('fixWidth').click(function(){
    doHistPush({$view:$adminMoreDiv});
    $adminMoreDiv.setVis();
  }); 
    

  //var $infoDiv=$('<span>').append($pageListButton,$imageListButton,' ',$statLink,' ',$moreButton);
  var $infoDiv=$('<span>').append($moreButton); 


  //var $menuB=$('<div>').append($moreButton,$pageListButton,$imageListButton)
  var $menuB=$('<div>').append($infoDiv,$aLoginDiv).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'1em auto'});



    // menuA
  //var $buttonBack=$('<button>').append('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(doHistBack);
  //var $spanLabel=$('<span>').append('Admin').css({'float':'right',margin:'0.2em 0 0 0'});  
  //var $menuA=$('<div>').append($spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'});  //$buttonBack,

  $el.$spanClickOutside=$('<span>').append(strClickOutside).hide();
  $el.$fixedDiv=$('<div>').append($dragHR,$el.$spanClickOutside,$menuB).css(cssFixedDrag);  //,$menuA

  //$el.$menus=$menuA.add($menuB);
  $el.$menus=$menuB;
  $el.append($el.$fixedDiv);
  return $el;
}

adminMoreDivExtend=function($el){
  $el.toString=function(){return 'adminMoreDiv';}
  $el.setUp=function(){
    majax(oAJAX,[['getLastTMod',{},function(data){  $aBUFilesToComp.prop('title', swedTime(data.tLastMod) );  }]]);  
  }
  var strPublicRead='<span style="display:inline-block">'+charPublicRead+'</span>';
  var $imgH=$imgHelp.clone().css({'margin-left':'.5em','margin-right':'0.5em'}); popupHoverM($imgH,$('<div>').html(strPublicRead+' = public read access<br>'+charPublicWrite+' = public write access<br>'+charPromote+' = promote = include the page in sitemap.xml etc. (encourage search engines to list the page)'));
  $el.setMod=function(){
    setButMod.call($butModRead[0], objPage.boOR);
    setButMod.call($butModWrite[0], objPage.boOW);
    setButMod.call($butModSiteMap[0], objPage.boSiteMap);
  }
  
  var $butModRead=$('<button>').append(strPublicRead).prop('title','Public read access').click( function(){clickModF.call(this,'boOR');} );  
  var $butModWrite=$('<button>').append(charPublicWrite).prop('title','Public write access').click(function(){clickModF.call(this,'boOW');});
  var $butModSiteMap=$('<button>').append(charPromote).prop('title','Promote (include page in sitemap.xml)').click(function(){clickModF.call(this,'boSiteMap');});
    // Methods of the above buttons:
  var clickModF=function(strType){
    var $b=$(this), boOn=$b.hasClass('boxShadowOn'); boOn=!boOn;
    var o={File:[objPage.idPage]}; o[strType]=boOn;
    var vec=[['myChMod',o]];   majax(oAJAX,vec); 
    setButMod.call($b[0], boOn);
  }
  var setButMod=function(boOn){  var $b=$(this); $b.toggleClass('boxShadowOn', boOn).toggleClass('boxShadowOff', !boOn); }
  $butModRead.add($butModWrite).add($butModSiteMap).css({'margin-right':'0.4em', width:'1.5em', padding:0});   
     
  $el.setMod();
  
  var boIsGeneratorSupported=isGeneratorSupported();
  var $uploadAdminDiv='', $buttonDiffBackUpDiv='';
  if(boIsGeneratorSupported) {
    $uploadAdminDiv=uploadAdminDivExtend($('<span>')); 
    $buttonDiffBackUpDiv=$('<button>').append('Backup (diff)').click(function(){
      doHistPush({$view:$diffBackUpDiv});
      $diffBackUpDiv.setVis();
    });
  }

  var $statLink=$('<a>').prop({href:'stat.html'}).append('stat');
  var $pageListButton=$('<button>').append('List').addClass('fixWidth').click(function(){
    //var idTmp=objPage.idPage; if(isNaN(idTmp)) idTmp=null;
    var idTmp=objPage.idPage; if(typeof idTmp!='string' || idTmp.length==0) idTmp=null;
    $pageFilterDiv.Filt.setSingleParent(idTmp);  $pageList.histPush(); $pageList.loadTab();  $pageList.setVis();
  });    
  var $imageListButton=$('<button>').append('List').addClass('fixWidth').click(function(){
    //var idTmp=objPage.idPage; if(isNaN(idTmp)) idTmp=null;
    var idTmp=objPage.idPage; if(typeof idTmp!='string' || idTmp.length==0) idTmp=null;
    $imageFilterDiv.Filt.setSingleParent(idTmp);   $imageList.histPush();  $imageList.loadTab();  $imageList.setVis();  // $pageFilterDiv.Filt.filtClear();
  });

  var $imgHPrefix=$imgHelp.clone().css({'margin-left':'1em'}); popupHoverM($imgHPrefix,$('<div>').html('<p>Use prefix on default-site-pages:<p>Note that non-default-site-pages always gets the prefix added (to the filename in the zip-file).<p>Click the "Site table"-button below if you want to see or change the prefixes, and if you want to change which site is the default.'));  
  var boUsePrefix=getItem('boUsePrefixOnDefaultSitePages')||true;
  var $cb=$('<input type=checkbox>').prop('checked',boUsePrefix).click(function(){
    boUsePrefix=Number($cb.prop('checked')); 
    setItem('boUsePrefixOnDefaultSitePages',boUsePrefix);  
    $aBUFilesToComp.setUp(boUsePrefix);
  })

  //var $imgHDownload=$imgHelp.clone().css({'margin-left':'1em','margin-right':'1em'}); popupHoverM($imgHDownload,$('<div>').html('Put all pages (or images or videos) in a zip-file and download.'));
  var $aBUFilesToComp=$('<a>').prop({rel:'nofollow', download:''}).append('(pages).zip');
  $aBUFilesToComp.setUp=function(boUsePrefix){
    var tmpUrl='BUPage'+(boUsePrefix?'':'?{"boUsePrefixOnDefaultSitePages":0}'); $(this).prop({href:tmpUrl});
  };  $aBUFilesToComp.setUp(boUsePrefix);
  var $aBUImageToComp=$('<a>').prop({href:'BUImage', rel:'nofollow', download:''}).append('(images).zip');
  var $aBUVideoToComp=$('<a>').prop({href:'BUVideo', rel:'nofollow', download:''}).append('(vidoes).zip');
  var $aBUMeta=$('<a>').prop({href:'BUMeta', rel:'nofollow', download:''}).append('(MetaData).zip');
  var $aBUMetaSQL=$('<a>').prop({href:'BUMetaSQL', rel:'nofollow', download:''}).append('(MetaData).sql');
  var $imgHSql=$imgHelp.clone().css({'margin':'0 1em'}); popupHoverM($imgHSql,$('<div>').html('<p>Download "meta-data":<br>-extra data for pages/images (modification dates, access rights ...). <br>-redirect table.'));
  
  var $butBUPageServ=$('<button>').append('(pages).zip').click(  function(){    httpGetAsync('BUPageServ',function(str) {setMess(str,3);});    });
  var $butBUImageServ=$('<button>').append('(images).zip').click(function(){    httpGetAsync('BUImageServ',function(str) {setMess(str,3);});   });
  var $butBUMetaServ=$('<button>').append('(MetaData).zip').click(function(){      httpGetAsync('BUMetaServ',function(str) {setMess(str,3);});    });
  

  var $butLoadFromServer=$('<button>').append('Load from server-BU').click(function(){   var vec=[['uploadAdminServ',1]];   majax(oAJAX,vec);    });
  
  var $siteButton=$('<button>').append('Site table').addClass('fixWidth').click(function(){    doHistPush({$view:$siteTab}); $siteTab.setVis();   });
  var $redirectButton=$('<button>').append('Redirect table').addClass('fixWidth').click(function(){   doHistPush({$view:$redirectTab}); $redirectTab.setVis();   });

  var $imgHRename=$imgHelp.clone().css({'margin-left':'1em'}); popupHoverM($imgHRename,$('<div>').html('"Rename" will <b>not</b> rename any links to the page. (maybe something for future versions)'));  
  var $renameButton=$('<button>').append('Rename').css({'margin-left':'0.5em'}).click(function(){
    $renamePop.openFunc('page',null,objPage.idPage,queredPage);
  });
  var objBottomLine={'border-bottom':'gray solid 1px'};
  var $menuA=$('<div>').append($butModRead, $butModWrite, $butModSiteMap, $imgH, ' | ', $renameButton, $imgHRename).css(objBottomLine);
  var $menuB0=$('<div>').append("<b>BU download: </b>");
  var $menuB=$('<div>').append("<b>Page: </b>", $pageListButton, ' | ', $aBUFilesToComp, ', Use prefix on default-site-pages: ', $cb, $imgHPrefix);
  var $menuC=$('<div>').append("<b>Image: </b>", $imageListButton, ' | ', $aBUImageToComp, ' | ', $buttonDiffBackUpDiv).css({'background':'lightblue'});
  var $menuD=$('<div>').append("<b>Video: </b>", $aBUVideoToComp);
  var $menuE=$('<div>').append("<b>Other: </b>", $aBUMeta, $imgHSql, ' | ', $statLink, ' | ', $aBUMetaSQL).css(objBottomLine);
  var $menuF=$('<div>').append($uploadAdminDiv).css(objBottomLine);
  var $menuG=$('<div>').append($siteButton,$redirectButton).css(objBottomLine);
  var $menuH=$('<div>').append("<b>BU to server: </b>", $butBUPageServ,$butBUImageServ,$butBUMetaServ).css(objBottomLine);
  var $menuI=$('<div>').append($butLoadFromServer);
  var $Menu=$([]).push($menuA,$menuB0, $menuB,$menuC,$menuE,$menuF,$menuG, $menuH, $menuI).css({margin:'0.5em 0'}); //,$menuD

  $el.$divCont=$('<div>').append($Menu);
  $el.$divCont.css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'1em auto'});


    // menuBottom
  //var $buttonBack=$('<button>').append('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(doHistBack);
  var $spanLabel=$('<span>').append('adminMore').css({'float':'right',margin:'0.2em 0 0 0'});  
  var $menuBottom=$('<div>').append($spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'});  //$buttonBack,


  $el.$fixedDiv=$('<div>').append($menuBottom).css(cssFixed);

  $el.append($el.$divCont,$el.$fixedDiv);
  return $el;
}



  






dumpDivExtend=function($el){
  "use strict"
  $el.toString=function(){return 'dumpDiv';}
  return $el;
}

tabBUDivExtend=function($el){
  "use strict"
  $el.toString=function(){return 'tabBUDiv';}
  $el.setUp=function(arrStr,objFetch){
    $table.empty();
    var StrOld=arrStr[0], StrDeleted=arrStr[1], StrReuse=arrStr[2], StrFetch=arrStr[3], StrNew=arrStr[4];
    var nOld=StrOld.length, nDel=StrDeleted.length, nReuse=StrReuse.length, nFetch=StrFetch.length, nNew=StrNew.length;

    var $tha=$('<th>').append('Deleted ('+nDel+')').css({background:'orange'});
    var $thb=$('<th>').append('Reused ('+nReuse+')').css({background:'yellow'});
    var $thc=$('<th>').append('Fetch ('+nFetch+')').css({background:'lightgreen'});
    $table.append($('<tr>').append($tha,$thb,$thc));

    //var nMax=Math.max(nOld,nNew);
    var nMax=Math.max(nDel,nReuse,nFetch);
    for(var i=0;i<nMax;i++){
      var $r=$('<tr>');
      var $tda=$('<td>'), $tdb=$('<td>'), $tdc=$('<td>');
      var strNameA='', strColorA=''; if(i<nDel) {strNameA=StrDeleted[i]; strColorA='orange'; }

      var strNameB='', strColorB=''; if(i<nReuse) {strNameB=StrReuse[i]; strColorB='yellow'; }
      var strNameC='', strColorC='';
      if(i<nFetch){
        strNameC=StrFetch[i];
        if(strNameC in objFetch) {var tmp=objFetch[strNameC];
          if(tmp.dSize) strNameC+=', Δsize='+tmp.dSize; 
          if(tmp.dUnix) { var tTmp=getSuitableTimeUnit(tmp.dUnix);  strNameC+=',  Δt='+Math.round(tTmp[0])+' '+tTmp[1]; }
        }
        strColorC='lightgreen';
      }
      $tda.html(strNameA).css({background:strColorA}); 
      $tdb.html(strNameB).css({background:strColorB}); 
      $tdc.html(strNameC).css({background:strColorC}); 

      $r.append($tda,$tdb,$tdc);
      $table.append($r);
    }
    
  }
  var $table=$('<table>');
  $el.append($table);
  return $el;
}


tabBUSumExtend=function($el){
  $el.setUp=function(arrN){
    //var StrOld=arrStr[0], StrDeleted=arrStr[1], StrReuse=arrStr[2], StrFetch=arrStr[3], StrNew=arrStr[4];
    //var nOld=StrOld.length, nDel=StrDeleted.length, nReuse=StrReuse.length, nFetch=StrFetch.length, nNew=StrNew.length;
    for(var i=0;i<nRow;i++){
      var $r=$R.eq(i), jNn=1, leftMargin=0;
      //if(i%2==0){        jNn=1; leftMargin=0;      }else{        jNn=1; leftMargin=nReuse;      }
      var len=arrN[i];
      $r.find('td:eq('+jNn+')').html(len);
      $r.find('td:eq(2)>div').css({width:len+'px','margin-left':leftMargin+'px'});
      //var arrTmp; if(arrStr[i].length>10) arrTmp=arrStr[i].slice(0,10).concat('...'); else arrTmp=arrStr[i];
      //$DivPop.eq(i).html(arrTmp.join('<br>'));

    }
  }
  var StrLabel=['Old Zip','To be deleted','To be reused','To fetch (changed)','To fetch (new)','New Zip'], nRow=StrLabel.length;
  //var StrColor=['red','orange','yellow','lightgreen','lightgreen','lightblue'];
  var StrColor=['black','black','black','black','black','black'];
  var $DivPop=$([]); //, $Button=$([]);
  var $thead=$('<thead>').append("<tr><th></th><th>nFiles</th></tr>");
  var $tbody=$('<tbody>');
  $el.append($thead,$tbody);

  for(var i=0;i<nRow;i++){
    var $r=$('<tr>');
    for(var j=0;j<5;j++){
      var $td=$('<td>');  $r.append($td);
      if(j==2){
        var $div=$('<div>').css({'background':StrColor[i],'height':'20px'});
        $td.append($div);
      }
      if(j==0){    
        $td.append(StrLabel[i]);
      }
    }
    //var $divPop=$('<div>'); $DivPop.push($divPop);
    //popupHoverM($r,$divPop);
    $tbody.append($r);
  }
  var $R=$tbody.find('tr');
  $el.css({'border-collapse':'collapse'});
  return $el;
}


/*
tabBUSumExtend=function($el){
  $el.setUp=function(arrStr,objFetch){
    var StrOld=arrStr[0], StrDeleted=arrStr[1], StrReuse=arrStr[2], StrFetch=arrStr[3], StrNew=arrStr[4];
    var nOld=StrOld.length, nDel=StrDeleted.length, nReuse=StrReuse.length, nFetch=StrFetch.length, nNew=StrNew.length;
    for(var i=0;i<5;i++){
      var $r=$R.eq(i), jNn, leftMargin;
      if(i%2==0){
        jNn=1; leftMargin=0;
      }else{
        jNn=1; leftMargin=nReuse;
      }
      var len=arrStr[i].length;
      $r.find('td:eq('+jNn+')').html(len);
      $r.find('td:eq(2)>div').css({width:len+'px','margin-left':leftMargin+'px'});
      var arrTmp; if(arrStr[i].length>10) arrTmp=arrStr[i].slice(0,10).concat('...'); else arrTmp=arrStr[i];
      $DivPop.eq(i).html(arrTmp.join('<br>'));

    }
    $el.arrStr=arrStr;
  }
  var StrLabel=['Old Zip','Deleted','Reusable','To fetch','New Zip'];
  var StrColor=['red','orange','yellow','lightgreen','lightblue'];
  var $DivPop=$([]); //, $Button=$([]);
  var $thead=$('<thead>').append("<tr><th></th><th>nFiles</th></tr>");
  var $tbody=$('<tbody>');
  $el.append($thead,$tbody);

  for(var i=0;i<5;i++){
    var $r=$('<tr>');
    for(var j=0;j<5;j++){
      var $td=$('<td>');  $r.append($td);
      if(j==2){
        var $div=$('<div>').css({'background':StrColor[i],'height':'20px'});
        $td.append($div);
      }
      //if((j==0 && i%2==0) || (j==4 && i%2==1)){
      if(j==0){
        //var $but=$('<button>').data({'ind':i}).append(StrLabel[i]); $Button.push($but)
        
        $td.append(StrLabel[i]);
      }
    }
    var $divPop=$('<div>'); $DivPop.push($divPop);
    popupHoverM($r,$divPop);
    $tbody.append($r);
  }
  var $R=$tbody.find('tr');
  $el.css({'border-collapse':'collapse'});
  return $el;
}
*/

//try{  var myString = (function () {   /*  //123412341234
diffBackUpDivExtend=function($el){
  "use strict"
  $el.toString=function(){return 'diffBackUpDiv';}

  var onerror=function(message) {
    debugger
    alert(message);
  }
  var createTempFile=function(callback) {
    var tmpFilename="tmp.zip";
    requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(filesystem) {
      function create() {
        filesystem.root.getFile(tmpFilename, {
          create : true
        }, function(zipFile) {
          callback(zipFile);
        });
      }

      filesystem.root.getFile(tmpFilename, null, function(entry) {
        entry.remove(create, create);
      }, create);
    });
  }



  var inpSelChange=function*(){  
    $ul.empty().show();
    //$saveButton.prop("disabled",true);
    var arrOrg=this.files;  
    var file=arrOrg[0];
    EntryLocal={}; // Create EntryLocal
    
    var semCB=0, semY=0, zipReader;  // Create zipReader
    zip.createReader(new zip.BlobReader(file), function(zipReaderT) {
      zipReader=zipReaderT;
      if(semY) { flowDiff.next(); } semCB=1;
    }, onerror);
    if(!semCB) { semY=1; yield;}

    var semCB=0, semY=0, EntryTmp;   // Create EntryTmp
    zipReader.getEntries(function(EntryT) {
      EntryTmp=EntryT;
      if(semY) { flowDiff.next(); } semCB=1;
    }, onerror);
    if(!semCB) { semY=1; yield;}

    EntryTmp.forEach(function(entry) {
      EntryLocal[entry.filename]=entry;
    });  

    StrOld=Object.keys(EntryLocal); //var $li=$('<li>').append('Old zip-file has <b>'+nOld+'</b> files.'); $ul.append($li);
    majax(oAJAX,[['getImageInfo',{},function(data){ flowDiff=getImageInfoRet.call(this,data);  flowDiff.next();}]]);  
  }


  var getImageInfoRet=function*(data){
    var FileNewInfo=data.FileInfo, FileNew={};
    for(var i=0;i<FileNewInfo.length;i++){ FileNew[FileNewInfo[i].imageName]=FileNewInfo[i]; } 
    StrNew=Object.keys(FileNew);
  
    var writer;   // Create writer
    if(creationMethod == "Blob") {
      writer=new zip.BlobWriter();
    } else {
      var semCB=0, semY=0;
      createTempFile(function(fileEntryT) {
        zipFileEntry=fileEntryT;
        if(semY) { flowDiff.next(); } semCB=1;
      }, onerror);
      if(!semCB) { semY=1; yield;}
      writer=new zip.FileWriter(zipFileEntry);
    }
    var semCB=0, semY=0;  // Create zipWriter
    zip.createWriter(writer, function(writerT) {
      zipWriter=writerT;
      if(semY) { flowDiff.next(); } semCB=1;
    }, onerror);
    if(!semCB) { semY=1; yield;}


    StrDeleted=[]; StrReuse=[]; StrFetch=[]; objFetch={};   

    for(var key in EntryLocal){
      if(!(key in FileNew)){ StrDeleted.push(key); }
    }
  
    var $progress=$('<progress>'), iNew=0, $imgDoneLast=$imgDone.clone();
    var $li=$('<li>').append('Extracting meta data from the selected file (names, modification times and file-sizes): ', $progress, $imgDoneLast); $ul.append($li);
    
    for(var key in FileNew){  // Create StrReuse, StrFetch and objFetch
      if(key in EntryLocal){
        var entryLocal = EntryLocal[key], blob;
        var writer = new zip.BlobWriter(entryLocal);
        var semCB=0, semY=0;
        entryLocal.getData(writer, function(blobT) {
          blob=blobT;
          if(semY) { flowDiff.next(); } semCB=1;
        }, onprogress);
        if(!semCB) { semY=1; yield;}
        //var dateOld=new Date(entryLocal.lastModDate);
        var size=entryLocal.uncompressedSize;
        var dosRaw=entryLocal.lastModDateRaw, dosDate=dosRaw>>>16, dosTime=dosRaw&0xffff, dateOld=dosTime2tUTC(dosDate,dosTime);
        var dateOldUnix=dateOld.toUnix();
      
// local database 1411715164
        var dSize=FileNew[key].size-size, dUnix=FileNew[key].tMod-dateOldUnix;
        //if(FileNew[key].size==size && FileNew[key].tMod>>1==dateOldUnix>>1){  // Division by two (>>1) because zip uses microsoft time 
        if(dSize==0 && dUnix>>1==0){  // Division by two (>>1) because zip uses microsoft time 
          StrReuse.push(key);
        }else{
          StrFetch.push(key);
          objFetch[key]={dSize:dSize,dUnix:dUnix};
        }
      } else {
        StrFetch.push(key);
      }
      iNew++; $progress.attr({value:iNew,max:StrNew.length});
    }
    $imgDoneLast.show();

      // Display tab
    var ArrStr=[StrOld, StrDeleted, StrReuse, StrFetch, StrNew];
    var $tabBUSum=tabBUSumExtend($('<table>')), nChanged=Object.keys(objFetch).length;
    $tabBUSum.setUp([StrOld.length, StrDeleted.length, StrReuse.length, nChanged, StrFetch.length-nChanged, StrNew.length]);
    $tabBUDiv.setUp(ArrStr, objFetch);
    var $buttonDetail=$('<button>').append('Details').click(function(){
      doHistPush({$view:$tabBUDiv});
      $tabBUDiv.setVis();
    });
    var $li=$('<li>').append('Summary: ( ',$buttonDetail,' )',$tabBUSum); $ul.append($li);


      // Check if it is OK to abort
    if(StrFetch.length==0 && StrDeleted.length==0) {
      var $li=$('<li>').append('Aborting since your local files are (seem (based on filesizes/modTimes)) up to date.'); $ul.append($li); $progress.detach();
      return;
    }

    //if(confirm("Continue ?")) {} else {$progress.detach(); return;}
    var $buttonContinue=$('<button>').append('Continue').click(function(){
      flowDiff=continueFunc.call(this);  flowDiff.next(); $buttonContinue.prop("disabled",true);
    });
    var $li=$('<li>').append($buttonContinue); $ul.append($li); $progress.detach();
 
  }

  var continueFunc=function*(){    
    var $progress=$('<progress>')
      // Writing fresh files
    var iAdded=0, $imgDoneLast=$imgDone.clone();
    var $li=$('<li>').append('Reusing (adding) old images to new zip: ', $progress, $imgDoneLast); $ul.append($li);
    //for(var key in StrReuse){
    for(var i=0;i<StrReuse.length;i++){
      var key=StrReuse[i];
      var entryLocal = EntryLocal[key], blob;
      var writer = new zip.BlobWriter(entryLocal);
      var semCB=0, semY=0;
      entryLocal.getData(writer, function(blobT) {
        blob=blobT;
        if(semY) { flowDiff.next(); } semCB=1;
      }, onprogress);
      if(!semCB) { semY=1; yield;}
      var date=new Date(entryLocal.lastModDate), size=entryLocal.uncompressedSize;
    
      var semCB=0, semY=0;
      zipWriter.add(key, new zip.BlobReader(blob), function() {
        if(semY) { flowDiff.next(); } semCB=1;
      }, onprogress,  {lastModDate:date});
      if(!semCB) { semY=1; yield;}
      iAdded++;  $progress.attr({value:iAdded,max:StrReuse.length}); 
    }
    $imgDoneLast.show();

      // Fetching files
    var $imgDoneLast=$imgDone.clone();
    var $li=$('<li>').append('Fetching: ', $progress, $imgDoneLast); $ul.append($li);

    var progressHandlingFunction=function(e){      if(e.lengthComputable){   $progress.attr({value:e.loaded,max:e.total});      }      }
    var semCB=0, semY=0, dataFetched;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'BUimage', true);
    xhr.responseType = 'blob';
    xhr.addEventListener("progress", progressHandlingFunction, false);
    xhr.onload=function(e) {
      if(this.status!=200) { debugger; alert('error'); return;}
      dataFetched=this.response;
      if(semY) { flowDiff.next(); } semCB=1;
    };
    var jsonTmp=JSON.stringify({arrName:StrFetch});
    xhr.send(jsonTmp); 
    if(!semCB) { semY=1; yield;}
    $imgDoneLast.show();



    var semCB=0, semY=0, zipReader;  // Create zipReader
    zip.createReader(new zip.BlobReader(dataFetched), function(zipReaderT) {
      zipReader=zipReaderT;
      if(semY) { flowDiff.next(); } semCB=1;
    }, onerror);
    if(!semCB) { semY=1; yield;}

    var semCB=0, semY=0, EntryTmp;   // Create EntryTmp
    zipReader.getEntries(function(EntryT) {
      EntryTmp=EntryT;
      if(semY) { flowDiff.next(); } semCB=1;
    }, onerror);
    if(!semCB) { semY=1; yield;}

    var EntryFetched={};
    EntryTmp.forEach(function(entry) {
      EntryFetched[entry.filename]=entry;
    });

    var iAdded=0, $imgDoneLast=$imgDone.clone();
    var $li=$('<li>').append('Adding the fetched images to new zip: ', $progress, $imgDoneLast); $ul.append($li);
    for(var key in EntryFetched){
      var entry = EntryFetched[key], blob;
      
      var writer = new zip.BlobWriter(entry);
      var semCB=0, semY=0;
      entry.getData(writer, function(blobT) {
        blob=blobT;
        if(semY) { flowDiff.next(); } semCB=1;
      }, onprogress);
      if(!semCB) { semY=1; yield;}
      var date=new Date(entry.lastModDate);
      
      var semCB=0, semY=0;
      zipWriter.add(key, new zip.BlobReader(blob), function() {
        if(semY) { flowDiff.next(); } semCB=1;
      }, onprogress,  {lastModDate:date});
      if(!semCB) { semY=1; yield;}
      iAdded++; $progress.attr({value:iAdded,max:StrFetch.length});
    }
    var $saveButton=$('<button>').text('Save to disk').click(saveFun);  //.prop("disabled",true)
    var $li=$('<li>').append($saveButton); $ul.append($li);
    //$saveButton.prop("disabled",false);
    //$ul.hide();
    $imgDoneLast.show();
    $progress.hide();

  }

  var getBlobURL=function(callback) {
    zipWriter.close(function(blob) {
      var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
      callback(blobURL);
    });
  };
  var saveFun=function(){
    getBlobURL(function(blobURL) {
      var aSave = document.createElement("a");
      var outFileName=calcBUFileName(objSiteDefault.www,'image','zip'); // Todo: wwwCommon-variable should change after siteTabView changes
      aSave.download = outFileName;
      aSave.href = blobURL;
      var event = document.createEvent("MouseEvents");
      event.initMouseEvent(
        "click", true, false, window, 0, 0, 0, 0, 0
        , false, false, false, false, 0, null
      );
      aSave.dispatchEvent(event);
    });
    $ul.empty();
    //$saveButton.prop("disabled",true);
  
  }
  var StrOld, StrDeleted, StrReuse, StrFetch, StrNew, objFetch;
  var regTxt=RegExp('^(.*)\\.txt$');
  var regZip=RegExp(/\.zip$/i);

  var URL=window.mozURL || window.URL; // window.webkitURL || 
  var requestFileSystem=window.webkitRequestFileSystem || window.mozRequestFileSystem || window.requestFileSystem;

  //var creationMethod="File";
  var creationMethod="Blob";
  if(typeof requestFileSystem == "undefined") creationMethod="Blob";

  var zipFileEntry=null, zipWriter=null;

  var $imgDone=$('<span>').append('Done').css({'background':'lightgreen'}).hide();

  var $imgHHead=$imgHelp.clone().css({'margin-left':'1em'}); popupHoverM($imgHHead,$('<div>').html('<p>If the old files\' size and modification date match then they are considered up to date.'));
  var $head=$('<div>').append('Differential backup of images',$imgHHead).css({'font-weight':'bold'});
  var strTmpExt=StrImageExt.join(', ');
  var $imgHLoad=$imgHelp.clone().css({'margin-left':'1em'}); popupHoverM($imgHLoad,$('<div>').html('<p>Accepted file endings: '+strTmpExt+', or zip files containing these formats (no folders in the zip file)'));
  var $formFile=$('<form enctype="multipart/form-data">');
  var $inpFile=$('<input name="file" type="file" accept="application/zip" >').css({background:'lightgrey'}); //multiple
  var $ul=$('<ul>');//.hide();
  
  

  var EntryLocal, StrOld;
  var nFilesUpload;

  $formFile.append('<b>Select your old backup (zip) file:</b> ',$inpFile);   $formFile.css({display:'inline'});
  $el.append($head, $formFile, $imgHLoad, $ul);

  var flowDiff;
  $inpFile.change(function(e) {
    flowDiff=inpSelChange.call(this,e);  flowDiff.next();
    //inpSelChange.call(this,e);
  });

  return $el;
}


  
uploadAdminDivExtend=function($el){
"use strict"
  var progressHandlingFunction=function(e){      if(e.lengthComputable){   $progress.attr({value:e.loaded,max:e.total});      }      }
  var oAJAXL={
    url: leafBE,
    type: 'POST',
    xhr: function() {  // Custom XMLHttpRequest
      var myXhr = $.ajaxSettings.xhr();
      if(myXhr.upload){   myXhr.upload.addEventListener('progress',progressHandlingFunction, false);   }
      return myXhr;
    },
    beforeSend: function(){$progress.show();},
    success: function(){ $progress.attr({value:0});  $progress.hide();  },
    error: function(){ $progress.hide(); errorFunc.call(this,arguments);},//errorHandler=function(){setMess('error uploading');},
    //Options to tell jQuery not to process data or worry about content-type.
    cache: false,
    contentType: false,
    processData: false,
    headers:{'x-type':'multi'}
  }
  oAJAXL.boFormData=1;
  var onerror=function(message) {
    debugger; alert(message);
  }
  var regTxt=RegExp('^(.*)\\.txt$');
  var sendConflictCheck=function(arrName){
    var StrTxt={}, StrImage=[];
    var strKeyDefault=randomHash();
    for(var i=0;i<arrName.length;i++){
      var Match=regTxt.exec(arrName[i]);
      if(Match) { 
        var tmp=Match[1];
        var obj=parsePageNameHD(tmp);
        var siteName=obj.siteName, pageName=obj.pageName;
        if(siteName.length==0) siteName=strKeyDefault;
        if(!(siteName in StrTxt)) StrTxt[siteName]=[];
        //StrTxt[siteName].push(pageName);
        StrTxt[siteName].push(pageName.toLowerCase());
      }
      else{ StrImage.push(arrName[i]); }  
    }
    //for(var i=0;i<arrName.length;i++){
    //  var Match=regTxt.exec(arrName[i]); if(Match) { StrTxt.push(Match[1]); }else{ StrImage.push(arrName[i]); }  
    //}
    majax(oAJAX,[['getPageInfo',{objName:StrTxt, strKeyDefault:strKeyDefault},sendConflictCheckReturnA],['getImageInfo',{arrName:StrImage},sendConflictCheckReturnB]]);
  }
  var sendConflictCheckReturnA=function(data){ 
    var FileInfo=data.FileInfo, len=FileInfo.length;
    StrConflict=Array(len);
    for(var i=0;i<len;i++){ StrConflict[i]=FileInfo[i].pageName;  }     
  }
  var sendConflictCheckReturnB=function(data){ 
    var FileInfo=data.FileInfo, len=FileInfo.length;
    for(var i=0;i<len;i++){ StrConflict.push(FileInfo[i].imageName); } 
    if(StrConflict.length){
      var tmpLab='<b>WARNING!!! These files will be OVERWRITTEN (if you click "Upload")</b>';
      StrConflict.unshift(tmpLab);
      if(StrConflict.length>10) StrConflict.push(tmpLab);
      setMess(StrConflict.join('<br>'));
    }        
  }
  var verifyFun2=function(){ 
    nFilesUpload=arrFile.length;  
    $uploadButton.prop("disabled",!nFilesUpload);
    sendConflictCheck(arrName);
  }
  
  var verifyFun=function*(){    
    arrOrg=this.files; nOrg=arrOrg.length;
    //name = file.name; size = file.size; type = file.type;
    var regZip=RegExp(/\.zip$/i);
    arrName=[]; arrFile=[];
    for(var i=0;i<nOrg;i++){
      var file=arrOrg[i];
      if(regZip.test(file.name) ){ //arrOrg[i].name.match(/\.zip$/i)

        var semCB=0, semY=0, zipReader;
        zip.createReader(new zip.BlobReader(file), function(zipReaderT) {
          zipReader=zipReaderT;
          if(semY) { flowVerify.next(); } semCB=1;
        }, onerror);
        if(!semCB) { semY=1; yield;}

        var semCB=0, semY=0, Entry;
        zipReader.getEntries(function(EntryT) {
          Entry=EntryT;
          if(semY) { flowVerify.next(); } semCB=1;
        }, onerror);
        if(!semCB) { semY=1; yield;}

        Entry.forEach(function(entry) {
          arrName.push(entry.filename);
        });
        arrFile.push(file);  

      } else {
        arrFile.push(file);
        arrName.push(file.name);   
      }
    }
    verifyFun2();
  }
  var sendFun=function(){
    if(boFormDataOK==0) {alert("Your browser doesn't support FormData"); return; };
    var formData = new FormData();
    formData.append("type", 'multi');
    for(var i=0;i<arrFile.length;i++)  {
      formData.append("fileToUpload[]", arrFile[i]);
    }
    majax(oAJAXL,[['uploadAdmin',formData,function(){ 
      $progress.hide(); $uploadButton.prop("disabled",false);}]]);
    setMess('Uploading ...');
    $uploadButton.prop("disabled",true);
  
  }

  var strTmpExt=StrImageExt.join(', ');
  var $imgHUpload=$imgHelp.clone().css({'margin-left':'1em'}); popupHoverM($imgHUpload,$('<div>').html('Accepted file endings: '+strTmpExt+', txt or zips file containing these formats (no folders in the zip file)'));

  var $formFile=$('<form enctype="multipart/form-data">');
  var $inpFile=$('<input name="file" type="file" multiple>').css({background:'lightgrey'});
  //var $inpUploadButton=$('<input type="button" value="Upload">');
  var $uploadButton=$('<button>').text('Upload').prop("disabled",true);
  var $progress=$('<progress max=100, value=0>').hide();
  
  var arrOrg, arrName, arrFile, StrConflict;
  var nOrg, nFilesUpload;

  $formFile.append('<b>Upload:</b> ',$inpFile);   $formFile.css({display:'inline'});
  $el.append($formFile, $uploadButton, $imgHUpload, $progress);

  var flowVerify;
  $inpFile.change(function(e) {
    flowVerify=verifyFun.call(this,e);  flowVerify.next();
  }).click(function(){$uploadButton.prop("disabled",true);});
  $uploadButton.click(sendFun);

  return $el;
}
//  */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];    eval(myString);    }catch(err){}  //123412341234


uploadUserDivExtend=function($el){
  $el.toString=function(){return 'uploadUserDiv';}
  var progressHandlingFunction=function(e){      if(e.lengthComputable){   $progress.attr({value:e.loaded,max:e.total});      }      }
  var oAJAXL={
    url: leafBE,
    type: 'POST',
    xhr: function() {  // Custom XMLHttpRequest
      var myXhr = $.ajaxSettings.xhr();
      if(myXhr.upload){   myXhr.upload.addEventListener('progress',progressHandlingFunction, false);   }
      return myXhr;
    },
    beforeSend: function(){$progress.visible();},
    success: function(){    $progress.attr({value:0});  $progress.invisible();     },
    error: function(){ $progress.invisible(); errorFunc.call(this,arguments);},//errorHandler=function(){setMess('error uploading',5);},
    //Options to tell jQuery not to process data or worry about content-type.
    cache: false,
    contentType: false,
    processData: false,
    headers:{'x-type':'single'}
  }
  oAJAXL.boFormData=1;

  var setMess=function(str) {$divMess.html(str);}
  var clearMess=function() {$divMess.html('');}
  var toggleVerified=function(boT){ if(typeof boT=='undefined') boT=$divName.is('visible'); boT=Boolean(boT); $divName.toggle(boT);  $uploadButton.prop("disabled",!boT); }  //$divCaptcha.toggle(boT);
  var verifyFun=function(){  
    clearMess();
    var arrFile=this.files;
    if(arrFile.length>1) {setMess('Max 1 file',5); toggleVerified(0); return;}
    if(arrFile.length==0) {setMess('No file selected',5); toggleVerified(0); return;}
    objFile=arrFile[0];
    if(objFile.size==0){ setMess("objFile.size==0",5); toggleVerified(0); return; }
    var tmpMB=(objFile.size/(1024*1024)).toFixed(2);
    if(tmpMB>maxUserUploadSizeMB) {setMess('Max '+maxUserUploadSizeMB+'MB\nThe selected file is '+tmpMB+'MB',5);    toggleVerified(0);  return;}

    var strName=objFile.name;
    var Match=RegExp('^(.+)\\.(\\w{1,4})$').exec(strName);  
    if(!Match) {setMess('The file name should be in the form xxx.xxx',5); toggleVerified(0); return;}
    var strNameA=Match[1], strExtension=Match[2].toLowerCase();
    $inpName.val(strNameA);  $spanExtension.html('.'+strExtension); inpNameChange();

    toggleVerified(1);
  }
  var sendFun=function(){
    clearMess();
    if(boFormDataOK==0) {alert("Your browser doesn't support FormData"); return; };
    var formData = new FormData();
    formData.append("type", 'single');
    //formData.append("captcha", $inpCaptcha.val());
    formData.append("strName", $inpName.val()+$spanExtension.html());
    formData.append("fileToUpload[]", objFile);
    
    var strTmp=grecaptcha.getResponse();  if(!strTmp) {setMess("Captcha response is empty"); return; }   formData.append('g-recaptcha-response', strTmp);
     
    majax(oAJAXL,[['uploadUser',formData,function(data){if('strMessage' in data) setMess(data.strMessage); $progress.invisible(); $uploadButton.prop("disabled",false);}]]);
    setMess('Uploading ...');
    $uploadButton.prop("disabled",true);
  }
  $el.setVis=function(){
    $el.show();
    //$imgCaptcha.prop({src:'captcha.png'});
    
    $divName.after($divReCaptcha);
    $divReCaptcha.setUp();
    
    return true;
  }

  //$el=popUpExtend($el);  
  //$el.css({'max-width':'20em', padding: '0.3em 0.5em 1.2em 0.6em'});
  var maxUserUploadSizeMB=boDbg?0.5:1;

  var $head=$('<h3>').append('Upload Image: (max '+maxUserUploadSizeMB+'MB)').css({'font-weight':'bold'});
  var $formFile=$('<form enctype="multipart/form-data">');
  var $inpFile=$('<input type=file name=file id=file accept="image/*">').css({background:'lightgrey'});
  //var $inpUploadButton=$('<input type="button" value="Upload">');
  var $uploadButton=$('<button>').text('Upload').prop("disabled",true).css({'margin-right':'0.5em', 'float':'right'});
  var $progress=$('<progress max=100, value=0>').css({'display':'block','margin-top':'1em'}).invisible();
  var $divMess=$('<div>').css({'margin-top':'1.2em'});
  
  var objFile;
  $inpFile.change(verifyFun).click(function(){$uploadButton.prop("disabled",true);});
  $formFile.append($inpFile);   $formFile.css({display:'inline'});
   
  var inpNameChange=function(e){ 
    clearMess();
    var strNameA=$inpName.val(), strName=strNameA+$spanExtension.html(); 
    var boOK=strNameA.length>0; $spanOK.html(boOK?'&nbsp;':'Empty').css({color:'red'});   
    if(boOK) majax(oAJAX,[['getImageInfo',{arrName:[strName]},inpNameRet]]);
    else $uploadButton.prop("disabled",!boOK);
  }
  var inpNameRet=function(data){
    var boOK=data.FileInfo.length==0; $spanOK.html(boOK?'OK':'Exists').css({color:boOK?'green':'red'});  $uploadButton.prop("disabled",!boOK);    
  } 
  var $inpName=$('<input type=text>').on('input', inpNameChange);// .keypress( function(e){ if(e.which==13) {$inpCaptcha.focus();return false;}} );//.css({width:'15em'});
  var $spanExtension=$('<span>');
  var $spanOK=$('<span>').html('').css('margin-left', '0.3em');
  var $divNameInner=$("<div>").append($inpName, $spanExtension, $spanOK);
  var $divName=$("<div>").append('Name: ', $divNameInner).css({'margin-top':'1.2em','line-height':'2em'}).hide();

  //var $imgCaptcha=$('<img>').css({'display':'block'});
  //var $inpCaptcha=$('<input type=text name=captcha >').css({width:'6em'}).keypress( function(e){ if(e.which==13) {sendFun();return false;}} );
  //var $divCaptcha=$("<div>").append('Enter anti-spam-letters:', $imgCaptcha, $inpCaptcha).css({'margin-top':'1.2em'}).hide();

  var $closeButton=$('<button>').append('Close').click(doHistBack);
  var $menuBottom=$('<div>').append($closeButton, $uploadButton).css({'margin-top':'1.2em'});


  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').append($head, $formFile, $progress, $divName, $divMess,$menuBottom);  // , $divCaptcha
  $centerDiv.addClass("Center").css({'width':'20em', height:'26em', padding: '0.3em 0.5em 1.2em 0.6em'});
  $centerDiv.css({'box-sizing':'content-box'});
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); //
  

  $uploadButton.click(sendFun);
  return $el;
}





var PageFilterDiv=function(Prop, Label, StrOrderFilt, changeFunc, StrGroupFirst, StrGroup){   //  Note!! StrOrderFilt should not be changed by any clinet side plugins (as it is also used on the server)
"use strict"
  var $el=$('<div>'); 
  $el.toString=function(){return 'pageFilterDiv';}
  $el.setNFilt=function(arr){ var tmp=arr[0]+'/'+arr[1]; $infoWrap.html(tmp);  $pageList.$filterInfoWrap.html(tmp);  } 
  
  if(typeof StrGroupFirst=='undefined') StrGroupFirst=[];    if(typeof StrGroup=='undefined') StrGroup=[];
  $el.Prop=Prop; $el.Label=Label; $el.StrOrderFilt=StrOrderFilt; $el.changeFunc=changeFunc; $el.StrGroupFirst=StrGroupFirst; $el.StrGroup=StrGroup;
  $.extend($el,FilterDivProt);
  $el.$divCont=$('<div>').css({'max-width':menuMaxWidth+'px',margin:'0em auto','text-align':'left'}); //cssFixed

      // menuA
  var $buttClear=$('<button>').append('C').click(function(){$el.Filt.filtClear(); $pageList.histReplace(-1); $pageList.loadTab();});//.css({'float':'right'});
  var $infoWrap=$('<span>'),     $spanLabel=$('<span>').append('Page filter',' (',$infoWrap,')').css({'float':'right',margin:'0.2em 0 0 0.2em'});
  var $menuA=$('<div>').append($buttClear,$spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'});  // $buttonBack,
  
  $el.addClass('unselectable').prop({unselectable:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie

  $el.$fixedDiv=$('<div>').append($menuA).css(cssFixed);
  $el.css({'text-align':'center'});
  $el.append($el.$divCont, $el.$fixedDiv);
  return $el;
}

var ImageFilterDiv=function(Prop, Label, StrOrderFilt, changeFunc, StrGroupFirst, StrGroup){   //  Note!! StrOrderFilt should not be changed by any client side plugins (as it is also used on the server)
"use strict"
  var $el=$('<div>'); 
  $el.toString=function(){return 'imageFilterDiv';}
  $el.setNFilt=function(arr){ var tmp=arr[0]+'/'+arr[1]; $infoWrap.html(tmp);  $imageList.$filterInfoWrap.html(tmp);  } 
  
  if(typeof StrGroupFirst=='undefined') StrGroupFirst=[];    if(typeof StrGroup=='undefined') StrGroup=[];
  $el.Prop=Prop; $el.Label=Label; $el.StrOrderFilt=StrOrderFilt; $el.changeFunc=changeFunc; $el.StrGroupFirst=StrGroupFirst; $el.StrGroup=StrGroup;
  $.extend($el,FilterDivProt);
  $el.$divCont=$('<div>').css({'max-width':menuMaxWidth+'px',margin:'0em auto','text-align':'left'}); //cssFixed

      // menuA
  var $buttClear=$('<button>').append('C').click(function(){$el.Filt.filtClear(); $imageList.histReplace(-1); $imageList.loadTab()});
  var $infoWrap=$('<span>'),     $spanLabel=$('<span>').append('Image filter',' (',$infoWrap,')').css({'float':'right',margin:'0.2em 0 0 0.2em'});
  var $menuA=$('<div>').append($buttClear,$spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'});  //$buttonBack,

  $el.addClass('unselectable').prop({unselectable:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie

  $el.$fixedDiv=$('<div>').append($menuA).css(cssFixed).css({background:'lightblue'});
  $el.css({'text-align':'center'});
  $el.append($el.$divCont, $el.$fixedDiv);
  return $el;
}


var headExtend=function($el, $tableDiv, StrName, BoAscDefault, Label, strTR, strTD){  // $tableDiv must have a property $table, $tbody and nRowVisible (int)
"use strict"
  $el.setArrow=function(strName,dir){
    boAsc=dir==1;
    $sortImages.prop({src:uUnsorted});     var tmp=boAsc?uIncreasing:uDecreasing;  $el.children(strTH+'[name='+strName+']').children('img[data-type=sort]').prop({src:tmp});
  }
  $el.clearArrow=function(){
    thSorted=null, boAsc=false;  $sortImages.prop({src:uUnsorted});
  }
  var thClick=function() { 
    var $ele=$(this), strName=$ele.attr('name'); boAscDefault=$ele.data('boAscDefault');
    boAsc=(thSorted===this)?!boAsc:boAscDefault;  thSorted=this;
    $sortImages.prop({src:uUnsorted});     var tmp=boAsc?uIncreasing:uDecreasing;  $ele.children('img[data-type=sort]').prop({src:tmp});
    $tableDiv.$tbody.detach();
    var $tr=$tableDiv.$tbody.children(strTR+':lt('+$tableDiv.nRowVisible+')');
    var $tdNameSort =$tr.children(strTD+'[name='+strName+']'); 
    $tdNameSort.sortElements(function(aT, bT){               
      var $a=$(aT), $b=$(bT), a = $a.data('valSort'),  b = $b.data('valSort'),   dire=boAsc?1:-1;
      var boAStr=0,boBStr=0;
      var aN=Number(a); if(!isNaN(aN) && a!=='') {a=aN;} else {a=a.toLowerCase(); boAStr=1;}
      var bN=Number(b); if(!isNaN(bN) && b!=='') {b=bN;} else {b=b.toLowerCase(); boBStr=1;}
      if(boAStr!=boBStr) return ((boAStr<boBStr)?-1:1)*dire; 
      if(a==b) {return 0;} else return ((a<b)?-1:1)*dire; 
    }, function(){ return this.parentNode;  });
    $tableDiv.$table.append($tableDiv.$tbody);

  }
  strTR=strTR||'tr'; strTD=strTD||'td'; var strTH=strTD=='td'?'th':strTD;
  var boAsc=false, thSorted=null;

  for(var i=0;i<StrName.length;i++){
    var strName=StrName[i];  
    var $imgSort=$('<img data-type=sort>');
    var boAscDefault=(strName in BoAscDefault)?BoAscDefault[strName]:true;
    var label=(strName in Label)?Label[strName]:ucfirst(strName);
    var $h=$("<"+strTH+">").append($imgSort).addClass('unselectable').prop({UNSELECTABLE:"on"}).attr('name',strName).data('boAscDefault',boAscDefault).prop('title',label).click(thClick);
    $el.append($h);
  }

  var $th=$el.children(strTH);
  var $sortImages=$th.children('img[data-type=sort]').prop({src:uUnsorted});
  //$sortImages.css({zoom:1.5,'margin':'auto','margin-top':'0.3em','margin-bottom':'0.3em'}); // display:'block',
  $el.addClass('listHead');
  //$el.css({'font-family':'initial'});
  //$el.css({ position:'fixed'});
  
  return $el;
}

pageListExtend=function($el){ 
"use strict"
  $el.toString=function(){return 'pageList';}
  var condAddRows=function(){
    var $rows=$tbody.children('p');
    for(var i=$rows.length; i<File.length;i++){
      var $r=$('<p>');
      var $cb=$('<input type=checkbox>').click(cbClick); //.css({visibility:'hidden'});//.hide();
      //$cb.css({'margin-top':'0em','margin-bottom':'0em'});  //,'vertical-align':'bottom'
      //if(boAndroid) $cb.css({'-webkit-transform':'scale(2,2)'}); else $cb.css({width:'1.4em',height:'1.4em'});
      var $buttonNParent=$('<button>').append('<span></span>').click(function(){goToParentMethod.call(this,'page','page');});
      var $tdNParent=$('<span>').append($buttonNParent).attr('name','nParent').prop('title','Parents');
      var $tdCB=$('<span>').data('valSort',0).append($cb).attr('name','cb'); //.css({'margin-left':'0.15em'});
      //var $tmpImg=$('<img>').prop({src:uFlash}).prop('draggable',false).css({height:'1em',width:'1em','vertical-align':'text-bottom'});
      var $buttonExecute=$('<button>').append(charFlash).on(strMenuExecuteEvent,buttonExeSingleClick).addClass('unselectable').prop({UNSELECTABLE:"on"}) 
      var $tdExecute=$('<span>').data('valSort',0).append($buttonExecute).attr('name','execute'); 
      var $tdR=$('<span>').attr('name','boOR').html(charPublicRead).prop('title',Label.boOR), $tdW=$('<span>').attr('name','boOW').html(charPublicWrite).prop('title',Label.boOW), $tdP=$('<span>').attr('name','boSiteMap').html(charPromote).css({'margin-right':'0.15em'}).prop('title',Label.boSiteMap);
      var $tdVer=$('<span>').attr('name','version'); //.css({'margin-left':'0.15em'});
      var $tdDate=$('<span>').attr('name','date').prop('title',Label.date);
      var $tdSite=$('<span>').attr('name','siteName'); //.hide();
      var $aLink=$('<a>').prop({target:"_blank"});
      var $tdLink=$('<span>').attr('name','link').append($aLink); //.hide();
      var $tdSize=$('<span>').attr('name','size');
      var $buttonNChild=$('<button>').append('<span></span>').click(clickSetParentFilter);
      var $buttonNImage=$('<button>').click(clickSetParentFilterI);
      var $tdNChild=$('<span>').append($buttonNChild).attr('name','nChild').prop('title','Children'); 
      var $tdNImage=$('<span>').append($buttonNImage).attr('name','nImage').prop('title','Images');  
      $r.append($tdNParent, $tdCB, $tdExecute, $tdDate, $tdR, $tdW, $tdP, $tdSize, $tdNImage, $tdNChild, $tdVer, ' ', $tdSite,$tdLink);  //    , $tdName     ,$('<span>').append($bView)
      //$r.data({$tdCB:$tdCB, $tdDate:$tdDate, $tdR:$tdR, $tdW:$tdW, $tdP:$tdP, $tdLink:$tdLink, $tdVer:$tdVer, $tdSize:$tdSize, $tdNChild:$tdNChild, $tdNImage:$tdNImage});
      $tbody.append($r);
    }
  }
  var isAnyOn=function(){
    var boOn=false, $Tr=$tbody.children('p:lt('+$el.nRowVisible+')');     $Tr.find('input').each(function(){var boTmp=$(this).prop('checked'); if(boTmp) boOn=true;});   return boOn;
  }
  var isOneOn=function(){
    var $Tr=$tbody.children('p:lt('+$el.nRowVisible+')'), $checked=$Tr.find('input:checked'); return $checked.length==1;
  }
  var cbClick=function(){
    var $cb=$(this), boOn=Number($cb.prop('checked'));    $cb.parent().data('valSort',boOn);
    var boOn=isAnyOn();    $allButton.text(boOn?'None':'All');    $executeButton.toggle(boOn);
  }
  var fileArray2Div=function(){
    var nRT=File.length;
    var $rows=$tbody.children('p');   $rows.slice(nRT).hide();
    $myRows=$rows.slice(0,nRT); 
    //if($myRows.length==0) { return; }
    $myRows.show();
    $myRows.each(function(i,r){ 
      var $r=$(r).data({idPage:File[i].idPage, iFlip:i, pageName:File[i].pageName, nParent:File[i].nParent, idParent:File[i].idParent, nameParent:File[i].nameParent}); 
      $r.attr({idPage:File[i].idPage});
      var f=File[i];      
      var nParent=File[i].nParent, $buttonTmp=$r.children('span[name=nParent]').data('valSort',nParent).children('button');
        var boSingle=$pageFilterDiv.Filt.checkIfSingleParent();
        var strTitle;
        if(boSingle) {
          strTitle=nParent+' parents';
        }else{
          strTitle=nParent+' parents'; if(nParent==1) strTitle=File[i].nameParent; else if(!nParent) strTitle='orphan';
        }
        $buttonTmp.prop('title',strTitle);
        var boHide=boSingle && nParent<=1; 
        $buttonTmp.visibilityToggle(!boHide);
        //$buttonTmp.prop("disabled",boHide).css({opacity:boHide?0.5:''});
        $buttonTmp.children('span:eq(0)').html(nParent); 
      $r.children('span[name=cb]').data('valSort',0).children('input').prop({'checked':false}); 
      var tmp=File[i].boOR; $r.children('span[name=boOR]').data('valSort',tmp).css({visibility:tmp==1?'':'hidden'}); 
      var tmp=File[i].boOW; $r.children('span[name=boOW]').data('valSort',tmp).css({visibility:tmp==1?'':'hidden'}); 
      var tmp=File[i].boSiteMap; $r.children('span[name=boSiteMap]').data('valSort',tmp).css({visibility:tmp==1?'':'hidden'}); 
      var strVersion=''; if(Boolean(File[i].boOther)) strVersion='v'+(Number(File[i].lastRev)+1);   
      //$r.children('span[name=version]').toggle(Boolean(File[i].boOther)).html(strVersion);
      $r.children('span[name=version]').data('valSort',strVersion).visibilityToggle(Boolean(File[i].boOther)).html(strVersion);
      var tmp=File[i].tMod; $r.children('span[name=date]').data('valSort',-tmp.valueOf()).html(mySwedDate(tmp)).prop('title','Last Mod:\n'+UTC2JS(tmp));    
      var size=File[i].size, sizeDisp=size, pre=''; if(size>=1024) {sizeDisp=Math.round(size/1024); pre='k';} if(size>=1048576) { sizeDisp=Math.round(size/1048576); pre='M';}
      var $tmp=$r.children('span[name=size]').data('valSort',size).html(sizeDisp+'<b>'+pre+'</b>'); var strTitle=pre.length?'Size: '+size:''; $tmp.prop('title',strTitle);   //$tmp.css({weight:pre=='M'?'bold':'',color:pre==''?'grey':''}); 
      var tmp=File[i].nChild, $buttonTmp=$r.children('span[name=nChild]').data('valSort',tmp).children('button'); $buttonTmp.children('span:eq(0)').html(tmp); $buttonTmp.css({visibility:tmp?'':'hidden'});   
      var tmp=File[i].nImage; $r.children('span[name=nImage]').data('valSort',tmp).children('button').html(tmp).css({visibility:tmp?'':'hidden'});  
      var tmp=File[i].siteName; $r.children('span[name=siteName]').data('valSort',tmp).text(tmp).prop('title',File[i].www);
      var tmp=File[i].pageName, strS=Number(File[i].boTLS)?'s':''; $r.children('span[name=link]').data('valSort',tmp).children('a').prop({href:'http'+strS+'://'+File[i].www+'/'+tmp}).text(tmp);    
    });
    $tbody.find('span[name=cb] input').prop({'checked':false}); 
  }
  $el.setCBStat=function(boOn){
    boOn=Boolean(boOn);$allButton.html('All');
    $executeButton.toggle(false);
    //if(typeof $myRows=='undefined') return;
    $tbody.find('span input').prop({'checked':false});
  }
  var restExecuteButton=function(){   $allButton.html('All');  $executeButton.hide();  }
  $el.loadTab=function(){
    var oF=$pageFilterDiv.gatherFiltData();
    var vec=[['setUpPageListCond',oF],['getPageList',1,getListRet],['getPageHist',1,histRet]]; 
    //var boSingleParentFilter=$pageFilterDiv.Filt.checkIfSingleParent();
    var boWhite=$pageFilterDiv.Filt.isWhite();
    var StrParentsOn=$pageFilterDiv.Filt.getParentsOn();
    var nParentsOn=$pageFilterDiv.Filt.getNParentsOn();
    if(boWhite){
      if(nParentsOn==1) {
        var idParent=$pageFilterDiv.Filt.getSingleParent();
        //var siteName=$pageFilterDiv.Filt.getSingleSite();
        //vec.push(['getExtraPageStat',{idPage:idParent},getExtraPageStatRet]);  // If filtering for single parent then also get the "grandparents"
        vec.push(['getParent',{idPage:idParent},getParentRet],['getSingleParentExtraStuff',{idPage:idParent},getSingleParentExtraStuffRet]);  // If filtering for single parent then also get the "grandparents"

        var boOrphan=idParent==null;
        if(boOrphan) $spanSingleFilter.html('orphans (roots)').css({color:'grey'}); else $spanSingleFilter.empty().append($aSingleFilter).css({color:''});
        $buttPI.prop('title',boOrphan?'Orphan images':'Images');
      }else {
        $spanGrandParent.setUpClear(); $spanGrandParentI.setUpClear();
        var strTmp='('+nParentsOn+' parents on)';
        var StrTmp=StrParentsOn.slice(0,5), indT=StrTmp.indexOf(null); if(indT!=-1) StrTmp[indT]='(orphans)';
        var strTitle=StrTmp.join('\n');
        $spanSingleFilter.html(strTmp).css({color:'grey'}).prop('title',strTitle);
      }
    }else{
      $spanGrandParent.setUpClear(); $spanGrandParentI.setUpClear();
      $spanSingleFilter.html('').css({color:'grey'}).prop('title','');
    }
    //$spanSingleFilter.toggle(boSingleParentFilter);
    $buttPI.toggle(nParentsOn==1);
    majax(oAJAX,vec);
    setMess('... fetching pages ... ',5,true);
    $head.clearArrow(); restExecuteButton();
  }
  var getParentRet=function(data){
    if('tab' in data) { var Parent=tabNStrCol2ArrObj(data); $spanGrandParent.setUp(Parent);   $spanGrandParentI.setUp(Parent); }
  }
  var getSingleParentExtraStuffRet=function(data){
    if('nImage' in data) {      $buttPI.empty().append(data.nImage);    }
    if('pageName' in data) {
      var strS=Number(data.boTLS)?'s':'', strUrl='http'+strS+'://'+data.www+'/'+data.pageName, text=data.pageName; if(data.nSame>1) text=data.siteName+':'+text;
      $aSingleFilter.prop('href',strUrl).html(text);
    }
  }
  var getListRet=function(data){
    var nCur;  //, TabTmp, StrCol;
    var tmp=data.NFilt;   if(typeof tmp!="undefined") { $pageFilterDiv.setNFilt(tmp); } 
    File.length=0; if('tab' in data) File=tabNStrCol2ArrObj(data);
    $el.nRowVisible=File.length;
    condAddRows(); fileArray2Div();
  }
  var histRet=function(data){
    var tmp, HistPHP;
    var HistPHP=data.Hist||[];
    
      // If there are pages with the same "pageName" (on different sites) then use siteName:pageName (when the page is listed). 
    ParentName=[]; if('ParentName' in data) ParentName=tabNStrCol2ArrObj(data.ParentName);  
    IndParentName={}; var objOne={}, objMult={};
    for(var i=0;i<ParentName.length;i++) {
      var row=ParentName[i];
      if(row.pageName in objOne) objMult[row.pageName]=1; else objOne[row.pageName]=1;
      IndParentName[row.idPage]=ParentName[i];
    }
    for(var i=0;i<ParentName.length;i++) {
      var row=ParentName[i];
      if(row.pageName in objMult) row.text=row.siteName+':'+row.pageName; else row.text=row.pageName;
    }

    $pageFilterDiv.interpretHistPHP(HistPHP);
    $pageFilterDiv.update();
    //$pageList.setCBStat(0);
  }
  
    // Methods of clicked button
  var clickSetParentFilter=function(){
    var idPage=$(this).parent().parent().data('idPage');  $pageFilterDiv.Filt.setSingleParent(idPage); $pageList.histPush(); $pageList.loadTab();
  }
  var clickSetParentFilterI=function(){
    //changeHist({$view:$imageList});
    $imageList.setVis();
    var idPage=$(this).parent().parent().data('idPage');   $imageFilterDiv.Filt.setSingleParent(idPage); $imageList.histPush(); $imageList.loadTab(); 
  }
  
    // Methods of resp row
  var getRenameData=function(){
    var $r=$(this), iTab=$r.index(), idPage=$r.data('idPage'), strName=$r.data('pageName');    return [iTab,idPage,strName];  }
  var changeModOfSingle=function(strName,boVal){
    var $r=$(this), $span=$r.children('span[name='+strName+']'), boValO=$span.data('valSort');
    if(typeof boVal=='undefined') boVal=1-boValO;
 
    var o={File:[$r.data('idPage')]}; o[strName]=boVal;
    var vec=[['myChMod',o]];   majax(oAJAX,vec);
    $span.data('valSort',Number(boVal)).css({visibility:boVal?'':'hidden'});
  }
  
  var getChecked=function(){
    var $Tr=$tbody.children('p:lt('+$el.nRowVisible+')'), $checked=$Tr.find('input:checked'), FileTmp=[]; $checked.each(function(){var tmp=$(this).parent().parent().data('idPage'); FileTmp.push(tmp);});
    return FileTmp;
  }
  var changeModOfChecked=function(strName,boVal){
    var $Tr=$tbody.children('p:lt('+$el.nRowVisible+')');
    $Tr.find('input:checked').each(function(i){var $cb=$(this); $cb.parent().parent().children('span[name='+strName+']').data('valSort',Number(boVal)).css({visibility:boVal?'':'hidden'}); });
  }
  $el.changeName=function(iTab,strNewName){
    var $r=$myRows.eq(iTab);
    var $Tr=$tbody.children('p:lt('+$el.nRowVisible+')');
    var $r=$Tr.eq(iTab), iFlip=$r.data('iFlip');
    File[iFlip].pageName=strNewName;
    var www=File[iFlip].www, strS=Number(File[iFlip].boTLS)?'s':'';
    $r.data('pageName',strNewName).children('span[name=link]').data('valSort',strNewName).children('a').prop({href:'http'+strS+'://'+www+'/'+strNewName}).text(strNewName);
  }
  $el.deleteF=function(FileDelete){
    var oF=$pageFilterDiv.gatherFiltData();    
    var vec=[['deletePage',{File:FileDelete}],['setUpPageListCond',oF],['getPageList',1,getListRet],['getPageHist',1,histRet]];
    restExecuteButton();  majax(oAJAX,vec);
  }
  
  var funPopped=function(stateMyPopped){ 
    $pageFilterDiv.frStored(stateMyPopped);
    $el.loadTab();
  }
  $el.histPush=function(){
    var o=$pageFilterDiv.toStored();
    doHistPush({$view:$pageList, Filt:o, fun:funPopped}); //
  }
  $el.histReplace=function(indDiff){
    var o=$pageFilterDiv.toStored();
    doHistReplace({$view:$pageList, Filt:o, fun:funPopped}, indDiff); // 
  }


  var ParentName, IndParentName;
  PropPage.parent.setRowButtF=function($span,val,boOn){
    var text=''; if(val in IndParentName) text=IndParentName[val].text;
    else if(val===null) text='(no parent)';
    $span.html(text);
  }

  var $myRows; 
  var $tbody=$el.$tbody=$("<div>").addClass('listBody');
  $el.$table=$("<div>").append($tbody).css({width:'100%',position:'relative'});
  $el.$divCont=$("<div>").append($el.$table).css({margin:'3em auto 1em','text-align':'left',display:'inline-block'});//
  //$el.$divCont.on('mouseover','button[name=nChild]',function(){console.log('gg');});

  var StrCol=['nParent','cb','execute','date','boOR','boOW','boSiteMap','size','nImage','nChild','version','siteName', 'link'], BoAscDefault={cb:0,boOR:0,boOW:0,boSiteMap:0,nImage:0,nChild:0,nParent:0,version:0,size:0};
  var Label={nParent:'Parents / Alternatve parents', cb:'Select',date:'Last Modified',boOR:'Public read access', boOW:'Public write access', boSiteMap:'Promote (include in Sitemap.xml etc)', nImage:'Images', nChild:'Child pages', version:'Supplied by user / mult versions'};
  //var $spanFill=$('<span>').css({height:'calc(1.5*8px + 0.6em)'});
  //var $headFill=$('<p>').append().css({background:'white',margin:'0px',height:'calc(12px + 1.2em)'});
  var $head=headExtend($('<p>'),$el,StrCol,BoAscDefault,Label,'p','span');
  $head.css({background:'white', width:'inherit',height:'calc(12px + 1.2em)'});
  $el.$table.prepend($head); //,$headFill


    // menuA
  var $allButton=$('<button>').append('All').addClass('fixWidth').css({'margin-right':'1em'}).click(function(){  //'margin-left':'0.8em'
    var boOn=$allButton.text()=='All';
    var $Tr=$tbody.children('p:lt('+$el.nRowVisible+')');
    $Tr.find('input').prop({'checked':boOn});
    $allButton.text(boOn?'None':'All');
    $executeButton.toggle(boOn);
  });

  var strMenuExecuteEvent='mousedown'; if(boTouch) strMenuExecuteEvent='click';
  var strEvent='mouseup'; if(boTouch) strEvent='click';


  var strPublicRead='<span style="display:inline-block">'+charPublicRead+'</span> (pulic read)';
  var strPublicWrite=charPublicWrite+' (pulic write)';
  var strPromote=charPromote+' (promote)';

    // menuSingle
  var $buttonDownload=$('<div>').html('Download');
  var $buttonRename=$('<div>').append('Rename').on(strEvent,function(){
    var $b=$(this).parent().data('$button'), $r=$b.parent().parent(),  FileTmp=[$r.data('idPage')],  arrTmp=getRenameData.call($r[0]); arrTmp.unshift('page'); $renamePop.openFunc.apply(null,arrTmp);    });
  var $buttonRTog=$('<div>').append('Toggle '+strPublicRead).on(strEvent,function(){  var $b=$(this).parent().data('$button'), $r=$b.parent().parent();   changeModOfSingle.call($r[0],'boOR');   });
  var $buttonWTog=$('<div>').append('Toggle '+strPublicWrite).on(strEvent,function(){  var $b=$(this).parent().data('$button'), $r=$b.parent().parent();  changeModOfSingle.call($r[0],'boOW');    });
  var $buttonPTog=$('<div>').append('Toggle '+strPromote).on(strEvent,function(){  var $b=$(this).parent().data('$button'), $r=$b.parent().parent();   changeModOfSingle.call($r[0],'boSiteMap');   });
  var $buttonDelete=$('<div>').append('Delete').on(strEvent,function(){
    var $b=$(this).parent().data('$button'), $r=$b.parent().parent(),  FileTmp=[$r.data('idPage')], strLab='Are sure you want to delete this page'; 
    $areYouSurePop.openFunc(strLab,function(){$el.deleteF(FileTmp);}); });


  
  //var $itemSingle=$([]).push($buttonGoToParent, $buttonRename, $buttonROn, $buttonROff, $buttonWOn, $buttonWOff, $buttonPOn, $buttonPOff, $buttonDelete);
  var $itemSingle=$([]).push($buttonRename, $buttonRTog, $buttonWTog, $buttonPTog, $buttonDelete);
  var $menuSingle=menuExtend($('<div>')).css({'text-align':'left'});
  var buttonExeSingleClick=function(e){ 
    var $button=$(this); 
    $menuSingle.data('$button',$button);     $menuSingle.openFunc(e,$button,$itemSingle);
  }

    // menuMult
  var $buttonDownload=$('<div>').html('Download');
  var $buttonROn=$('<div>').append(strPublicRead+' on').on(strEvent,function(){  var FileTmp=getChecked(),   vec=[['myChMod',{boOR:1,File:FileTmp}]];   majax(oAJAX,vec);   changeModOfChecked('boOR',1);   });
  var $buttonROff=$('<div>').append(strPublicRead+' off').on(strEvent,function(){  var FileTmp=getChecked(),   vec=[['myChMod',{boOR:0,File:FileTmp}]];   majax(oAJAX,vec);   changeModOfChecked('boOR',0);   });
  var $buttonWOn=$('<div>').append(strPublicWrite+' on').on(strEvent,function(){  var FileTmp=getChecked(),   vec=[['myChMod',{boOW:1,File:FileTmp}]];   majax(oAJAX,vec);   changeModOfChecked('boOW',1);   });
  var $buttonWOff=$('<div>').append(strPublicWrite+' off').on(strEvent,function(){  var FileTmp=getChecked(),   vec=[['myChMod',{boOW:0,File:FileTmp}]];   majax(oAJAX,vec);   changeModOfChecked('boOW',0);   });
  var $buttonPOn=$('<div>').append(strPromote+' on').on(strEvent,function(){  var FileTmp=getChecked(),   vec=[['myChMod',{boSiteMap:1,File:FileTmp}]];   majax(oAJAX,vec);   changeModOfChecked('boSiteMap',1);   });
  var $buttonPOff=$('<div>').append(strPromote+' off').on(strEvent,function(){  var FileTmp=getChecked(),   vec=[['myChMod',{boSiteMap:0,File:FileTmp}]];   majax(oAJAX,vec);   changeModOfChecked('boSiteMap',0);   });
  var $buttonDelete=$('<div>').append('Delete').on(strEvent,function(){   var FileTmp=getChecked(), strLab='Are sure you want to delete these pages';   $areYouSurePop.openFunc(strLab,function(){$el.deleteF(FileTmp);}); });
  
  //var $tmpImg=$('<img>').prop({src:uFlash}).prop('draggable',false).css({height:'1em',width:'1em','vertical-align':'text-bottom'});   
  var $executeButton=$('<button>').append(charFlash).addClass('fixWidth').addClass('unselectable').prop({UNSELECTABLE:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie;
  var $itemMulti=$([]).push($buttonROn, $buttonROff, $buttonWOn, $buttonWOff, $buttonPOn, $buttonPOff, $buttonDelete);
  var $menuMult=menuExtend($('<div>')).css({'text-align':'left'});
  var buttonExeMultClick=function(e){ 
    var $button=$(this);  //$itemMulti.eq(0).toggle(isOneOn());
    //if(boTouch){ doHistPush({$view:$menuDiv});     $menuDiv.setUp($itemMulti);   $menuDiv.setVis();    }else{   }
    $menuMult.openFunc(e,$button,$itemMulti); 
  }
  $executeButton.on(strMenuExecuteEvent,buttonExeMultClick); 

  
  var File=[]; $el.nRowVisible=0;

  //var $buttonBack=$('<button>').append('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(doHistBack);
  var $spanTmp=$('<span>').append(strFastBackSymbol).css({'font-size':'0.7em'});
  var $buttonFastBack=$('<button>').append($spanTmp).addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(function(){history.fastBack($adminMoreDiv);});
  //var $spanLabel=$('<span>').append('Pages').css({'float':'right',margin:'0.2em 0 0 0'});  
  var $buttPI=$('<button>').css({'line-height':'normal','min-width':'1.4em', 'background-image':'url("stylesheets/buttonRightBlue1.png")'}).click(function(){  
    var idParent=$pageFilterDiv.Filt.getSingleParent();
    $imageFilterDiv.Filt.setSingleParent(idParent);   $imageList.histPush(); $imageList.loadTab(); $imageList.setVis();
  }); //background:'lightblue',
  var $buttPIW=$('<span>').append($buttPI).css({'float':'right','margin-right':'0.6em'});
  var $tmpImg=$('<img>').prop({src:uFilter}).css({height:'1em',width:'1em','vertical-align':'text-bottom'});
  $el.$filterInfoWrap=$('<span>');
  var $buttFilter=$('<button>').append($tmpImg,' (',$el.$filterInfoWrap,')').addClass('flexWidth').css({'float':'right','margin-right':'0.2em'}).click(function(){ doHistPush({$view:$pageFilterDiv}); $pageFilterDiv.setVis();});
  var $buttClear=$('<button>').append('C').click(function(){$pageFilterDiv.Filt.filtClear(); $pageList.histPush(); $pageList.loadTab()}).css({'float':'right','margin-right':'1em'});
  var $spanTmp=$('<span>').append('(orphans)').css({'font-size':'0.8em'});
  var $buttOrphan=$('<button>').append($spanTmp).click(function(){$pageFilterDiv.Filt.setSingleParent(null);  $pageList.histPush(); $pageList.loadTab()}).css({'float':'right','margin-right':'1em'});
  //var $spanGrandParent=new SpanGrandParent(); $spanGrandParent.css({'margin-right':'0em'});
  var $spanGrandParent=new SpanGrandParent('page','page').css({'margin-right':'0.6em'});
  var $spanGrandParentI=new SpanGrandParent('page','image');
  var $aSingleFilter=$('<a>').prop({target:"_blank"}).css({'font-weight':'bold'}), $spanSingleFilter=$('<span>').css({'margin-right':'0.5em', 'margin-top':'0.7em'});  //.hide()
  //var $spanSingleFilterW=$('<span>').append();

  var $menuA=$('<div>').append($buttonFastBack, $allButton, $executeButton, $buttFilter, $buttClear, $buttOrphan);  // $buttonBack, 
  $menuA.css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'});
  var $menuTop=$('<div>').append($spanGrandParent, $spanSingleFilter, $buttPIW).addClass('divMenuTop');  // , $spanGrandParentI     
  $menuTop.css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em', 'line-height':'2.7em'});

  $el.addClass('pageList');
  $el.$fixedTop=$('<div>').append($menuTop).css(cssFixedTop);
  $el.$fixedDiv=$('<div>').append($menuA).css(cssFixed);
  $el.css({'text-align':'center'});
  $el.append($el.$divCont,$el.$fixedTop,$el.$fixedDiv);
  return $el;
}




renamePopExtend=function($el){
"use strict"
  $el.toString=function(){return 'renamePop';}
  var save=function(){ 
    resetMess();  
    var strNewName=$inpName.val().trim(); $inpName.val(strNewName); if(strNewName.length==0) {setMess('name can not be empty',5); return; }
    strNewName.replace(RegExp(' ','g'),'_');
    var o1={strNewName:strNewName,id:idDB};
    var vec=[['rename'+ucfirst(strType),o1,saveRet]];   majax(oAJAX,vec);

    setMess('',null,true);  
  }
  var saveRet=function(data){
    var boOK=false;
    var tmp=data.boOK;   if(typeof tmp!="undefined")  boOK=tmp;
    if(iTab!==null){
      var $par=strType=='page'?$pageList:$imageList;
      if(boOK) { $par.changeName(iTab, $inpName.val()); doHistBack();}  
    }
  }
  $el.openFunc=function(strTypeT,iTabT,idDBT,strName){
    strType=strTypeT; iTab=iTabT; idDB=idDBT; $type.html(strType); $inpName.val(strName).focus();
    doHistPush({$view:$renamePop});
    $el.setVis();
  }
  $el.setVis=function(){
    $el.show();   return true;
  }

  var iTab, idDB, strType='';
 
  var $type=$('<span>'); 
  var $head=$('<h3>').append('Rename ',$type);
  var $nameLab=$('<div>').append('New name: ');
  var $inpName=$('<input>').css({display:'block',width:'100%'}).keypress( function(e){ if(e.which==13) {save();return false;}} );

  var $saveButton=$('<button>').append('Save').click(save).css({'margin-top':'1em'});
  var $cancelButton=$('<button>').append('Cancel').click(doHistBack).css({'margin-top':'1em'});
  $el.append($head,$nameLab,$inpName,$cancelButton,$saveButton); //.css({padding:'0.1em'}); 

  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').addClass("Center").append($head,$nameLab,$inpName,$cancelButton,$saveButton).css({height:'12em', 'min-width':'17em', 'max-width':'30em', padding: '0.3em 0.5em 1.2em 1.2em'});
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); 
  
  return $el;
}

calcStrLen=function(Str, lenFix){ return Str.length*lenFix+Str.join().length;}


var goToParentMethod=function(strTypeCur, strTypeGoal){
  var $b=$(this), $r=$b.parent().parent(), nParent=$r.data('nParent'), idParent=$r.data('idParent');
  var FiltGoal=strTypeGoal=='page'?$pageFilterDiv.Filt:$imageFilterDiv.Filt;
  var $listGoal=strTypeGoal=='page'?$pageList:$imageList;
  if(nParent<=1){
    FiltGoal.setSingleParent(idParent);  $listGoal.histPush(); $listGoal.loadTab(); if(strTypeGoal!=strTypeCur) {    $listGoal.setVis(); }
  } else {
    if(strTypeCur=='page'){      var strGetParentFunc='getParent', objTmp={idPage:$r.data('idPage')};    }else{      var strGetParentFunc='getParentOfImage', objTmp={idImage:$r.data('idImage')};    }
    var vec=[[strGetParentFunc,objTmp,function(data){
      /*var Parent=[], StrCol=data.StrCol||[], TabTmp=data.tab||[]; 
      for(var i=0;i<TabTmp.length;i++){
        for(var j=0;j<StrCol.length;j++){  var name=StrCol[j]; Parent[i][name]=TabTmp[i][j];  }
      }*/
      var Parent=[]; if('tab' in data) Parent=tabNStrCol2ArrObj(data);  
      $grandParentSelPop.openFunc(Parent,strTypeCur,strTypeGoal);
    }]];
    majax(oAJAX,vec);     
  }
}

var SpanGrandParent=function(strTypeCur, strTypeGoal){
  var $el=$('<span>'); $.extend($el,SpanGrandParent.tmpPrototype);
  $el.boSame=strTypeCur==strTypeGoal;
  $el.strTypeCur=strTypeCur;  $el.strTypeGoal=strTypeGoal;
  $el.strColor=$el.strTypeGoal=='page'?'':'Blue';
  $el.GrandParent=[];
  $el.$buttPop=$('<button>').css({'background-image':'url("stylesheets/buttonLeft'+$el.strColor+'1.png")'}).click(function(){$grandParentSelPop.openFunc($el.GrandParent,strTypeCur,strTypeGoal);}).hide();
  $el.$buttOrphan=$('<button>').append('(orphans)').css({'background-image':'url("stylesheets/buttonLeft'+$el.strColor+'3.png")'}).click(function(){ $el.clickFunc(null); }).hide();
  $el.$spanButt=$('<span>').on('click','button',function(){var ind=$(this).data('ind'); $el.clickFunc($el.GrandParent[ind]);});

  $el.append($el.$buttPop, $el.$buttOrphan, $el.$spanButt); //  'Up: ',    .click(function(){$el.clickFunc();}); 
  return $el;
}
SpanGrandParent.tmpPrototype={};
SpanGrandParent.tmpPrototype.setUpClear=function(){   this.$spanButt.empty(); this.$buttPop.hide();  this.$buttOrphan.hide();  }
SpanGrandParent.tmpPrototype.setUp=function(GrandParent){
  this.GrandParent=GrandParent; 
  var len=GrandParent.length;
  var boPop=len>2; this.$buttPop.toggle(boPop).html(len);
  //this.$buttOrphan.toggle(!len);
  this.$spanButt.empty();
  if(!boPop){
    for(var i=0;i<len;i++){
      var lenMax=10
      var str=GrandParent[i].pageName; if(str.length>lenMax) str=str.substr(0,lenMax-2)+'...';
      var $butt=$('<button>').append(str).prop('title',GrandParent[i].pageName).data({ind:i});       this.$spanButt.append($butt);
      var intSize=1; if(str.length>6) intSize=3;  else if(str.length>3) intSize=2;
      $butt.css({'background-image':'url("stylesheets/buttonLeft'+this.strColor+intSize+'.png")'});
    }
    //if(len>1) this.$spanButt.prepend('(').append(')');
  }
  var $filterDiv=this.strTypeCur=='page'?$pageFilterDiv:$imageFilterDiv;
  //var On=$filterDiv.Filt[0][1], boOrphanFiltering=Boolean(On.length==1 && On[0]==null), boShow=!boOrphanFiltering && len==0;  this.$buttOrphan.toggle(boShow); // this.toggle(boShow);
  //var On=$filterDiv.Filt[0][1], boOrphanFiltering=Boolean(On.length==1 && On[0]==null), boShow=!boOrphanFiltering && len==0;  this.$buttOrphan.toggle(boShow); // this.toggle(boShow);
  var On=$filterDiv.Filt.getParentsOn(), boOrphanFiltering=Boolean(On.length==1 && On[0]==null), boShow=!boOrphanFiltering && len==0;  this.$buttOrphan.toggle(boShow); // this.toggle(boShow);

}
SpanGrandParent.tmpPrototype.clickFunc=function(parent){ 
  var strListGoal=this.strTypeGoal+'List';
  var $filterDivGoal=this.strTypeGoal=='page'?$pageFilterDiv:$imageFilterDiv;
  var idTmp=null; if(parent) idTmp=parent.idPage; $filterDivGoal.Filt.setSingleParent(idTmp); 
  var $listGoal=this.strTypeGoal=='page'?$pageList:$imageList;
  $listGoal.histPush(); $listGoal.loadTab();    if(!this.boSame) { $listGoal.setVis(); }  
  //changeHist({$view:$pageList}); $pageList.loadTab(); $pageList.setVis();  
}



var grandParentSelPopExtend=function($el){
"use strict"
  $el.toString=function(){return 'grandParentSelPop';}
  var buttonPress=function(){
    var $b=$(this), idPage=$b.data('idPage');
    if(['page','image'].indexOf(strTypeGoal)==-1) throw 'err';
    var FiltT=strTypeGoal=='page'?$pageFilterDiv.Filt:$imageFilterDiv.Filt;
    FiltT.setSingleParent(idPage);
    //changeHist({$view:$listGoal});
    $listGoal.histReplace(); $listGoal.loadTab(); $listGoal.setVis();
     
    //doHistBack();
    //history.funOverRule=function(){ changeHist({$view:$listGoal}); $listGoal.loadTab(); $listGoal.setVis(); }
    //history.go(-1);
  }


  $el.openFunc=function(GrandParent, strTypeCurrent, strTypeGoalT){
    strTypeGoal=strTypeGoalT;
    var FiltT=strTypeCurrent=='page'?$pageFilterDiv.Filt:$imageFilterDiv.Filt;
    $listGoal=strTypeGoal=='page'?$pageList:$imageList;
    var idParent=FiltT.getSingleParent()
    
    $div.empty();
    var len=GrandParent.length, tmpS=len==1?'':'s';
    $head.html(len+' parent'+tmpS+':');
    for(var i=0;i<len;i++) {  
      var idPage=GrandParent[i].idPage, name=GrandParent[i].pageName;
      var boCur=idPage===idParent;
      var $but=$('<button>').css({display:'block'}).data({idPage:idPage}).html(name).click(buttonPress).prop('disabled', boCur); 
      $div.append($but);
    }
    doHistPush({$view:$grandParentSelPop});
    $el.setVis();  
  }
  $el.closeFunc=function(){   doHistBack();    }
  $el.setVis=function(){
    $el.show(); return 1;
  }
  
  //$el=popUpExtend($el);  
  //$el.css({'max-width':'20em', padding: '0.5em 0.5em 1.2em 1.2em'});  
  var strTypeGoal, $listGoal;

  //var $spanNParent=$('<span>');
  var $head=$('<span>').css({'font-weight':'bold','margin-right':'1em'}); //.append($spanNParent,' Parents')

  var $div=$('<div>');
  var $cancel=$('<button>').click(function(){doHistBack();}).html('Cancel').css({'float':'right','margin-top':'1em'}); 
 
  //$el.append($head,$div,$cancel);
  //$el.css({'text-align':'left'});

  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').addClass("Center").append($head,$div,$cancel).css({height:'22em', 'max-width':'20em', padding: '0.5em 0.5em 1.2em 1.2em'});
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); 
  

  return $el;
}

areYouSurePopExtend=function($el){
"use strict"
  $el.toString=function(){return 'areYouSurePop';}
  var continueA=function(){ 
    continueB();   doHistBack();
  }
  $el.openFunc=function(strLab,continueT){
    $labPageName.html(strLab);
    doHistPush({$view:$areYouSurePop});
    $el.setVis();
    continueB=continueT;
  }
  $el.setVis=function(){
    $el.show(); return 1;
  }
 
  var continueB;
  //$el=popUpExtend($el);  
  //$el.css({'max-width':'20em', padding: '1.2em 0.5em 1.2em 1.2em'}); 

  var $labPageName=$('<div>');
  var $buttonCancel=$('<button>').append('Cancel').click(doHistBack).css({'margin-top':'1em'});
  var $buttonContinue=$('<button>').append('Yes').click(continueA).css({'margin-top':'1em'});
  var $divBottom=$('<div>').append($buttonCancel,$buttonContinue);
  //$el.append($labPageName,$divBottom);

  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').addClass("Center").append($labPageName,$divBottom).css({height:'8em', 'max-width':'20em', padding: '1.2em 0.5em 1.2em 1.2em'});
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); 
  
  return $el;
}


imageListExtend=function($el){ 
  $el.toString=function(){return 'imageList';}
  var imageClick=function(){
    var $Tr=$tbody.children('p:lt('+$el.nRowVisible+')'); 
    var StrImg=[], $Caption=$([]); 
    $Tr.each(function(i,p){ 
      var $tr=$(this), imageName=$tr.data('imageName'), i=$tr.data('iFlip');
      //var size=$tr.data('$tdSize'), tMod=$tr.data('$tdCreated').data, boOther=$tr.data('$tdBoOther')
      //var size=$tr.children('span[name=size]').text(), tMod=$tr.children('span[name=tMod]').text(), boOther=$tr.children('span[name=boOther]').text();
      var size=File[i].size, tMod=mySwedDate(File[i].tMod), boOther=File[i].boOther;
      StrImg.push(imageName);
      //var str='<p>'+imageName+'<p>Size: '+File[i].size+'<p>Mod: '+mySwedDate(File[i].tMod); if(File[i].boOther) str+='<p style="color:red">Others Upload</p>'
      var str='<p>'+imageName+'<p>Size: '+size+'<p>tMod: '+tMod; if(Number(boOther)) str+='<p style="color:red">Uploaded by user</p>'
      var $cap=$('<div>').append(str);
      $Caption.push($cap);    
    });
    var iCur=$(this).parent().parent().index();
    $slideShow.setUp(StrImg,$Caption,iCur);
    doHistPush({$view:$slideShow});
    $slideShow.setVis(); 
  }
  var condAddRows=function(){
    var $rows=$tbody.children('p');
    for(var i=$rows.length; i<File.length;i++){
      var $r=$('<p>');
      var $cb=$('<input type=checkbox>').click(cbClick); //.css({visibility:'hidden'});//.hide();
      //$cb.css({'margin-top':'0em','margin-bottom':'0em'}); //'vertical-align':'bottom'
      //if(boAndroid) $cb.css({'-webkit-transform':'scale(2,2)'}); else $cb.css({width:'1.4em',height:'1.4em'});
      var $buttonNParent=$('<button>').append('<span></span>').click(function(){goToParentMethod.call(this,'image','page');});
      var $tdNParent=$('<span>').append($buttonNParent).attr('name','nParent').prop('title','Parents'); 
      var $buttonNParentI=$('<button>').append('<span></span>').click(function(){goToParentMethod.call(this,'image','image');});
      var $tdNParentI=$('<span>').append($buttonNParentI).attr('name','nParentI').prop('title','Parents'); 
      var $tdCB=$('<span>').data('valSort',0).append($cb).attr('name','cb');
      //var $tmpImg=$('<img>').prop({src:uFlash}).prop('draggable',false).css({height:'1em',width:'1em','vertical-align':'text-bottom'}); 
      var $buttonExecute=$('<button>').append(charFlash).on(strMenuExecuteEvent,buttonExeSingleClick).addClass('unselectable').prop({UNSELECTABLE:"on"});
      var $tdExecute=$('<span>').data('valSort',0).append($buttonExecute).attr('name','execute'); 
      var $tdDate=$('<span>').attr('name','date').prop('title',Label.date);  //.css({margin:'auto 0.3em'})
      var $img=$('<img>').click(imageClick);//.css({'margin-right':'0.1em','max-width':'50px','max-height':'50px'});
      var $tdImg=$('<span>').attr('name','image').append($img);
      var $tdBoOther=$('<span>').html('user').attr('name','boOther');
      //var $tdName=$('<span>').attr('name','imageName'); //.hide();
      var $aLink=$('<a>').prop({target:"_blank"});
      var $tdLink=$('<span>').append($aLink).attr('name','link');
      var $tdSize=$('<span>').attr('name','size');  //.css({'margin-left':'1em'})
      $r.append($tdNParent, $tdNParentI, $tdCB, $tdExecute, $tdDate, $tdImg, $tdSize, $tdBoOther, $tdLink);  //  $tdName  ,$('<span>').append($bView)
      //$r.data({$tdCB:$tdCB, $tdDate:$tdDate, $tdImg:$tdImg, $tdLink:$tdLink, $tdBoOther:$tdBoOther, $tdSize:$tdSize});
      $tbody.append($r);
    }
  }
  var isAnyOn=function(){
    var boOn=false, $Tr=$tbody.children('p:lt('+$el.nRowVisible+')');     $Tr.find('input').each(function(){var boTmp=$(this).prop('checked'); if(boTmp) boOn=true;});   return boOn;
  }
  var isOneOn=function(){
    var $Tr=$tbody.children('p:lt('+$el.nRowVisible+')'), $checked=$Tr.find('input:checked'); return $checked.length==1;
  }
  var cbClick=function(){
    var $cb=$(this), boOn=Number($cb.prop('checked'));    $cb.parent().data('valSort',boOn);
    var boOn=isAnyOn();    $allButton.text(boOn?'None':'All');    $executeButton.toggle(boOn);
  }
  var fileArray2Div=function(){
    var nRT=File.length;
    var $rows=$tbody.children('p');   $rows.slice(nRT).hide();
    $myRows=$rows.slice(0,nRT); 
    //if($myRows.length==0) return;
    $myRows.show();
    $myRows.each(function(i,r){ 
      var $r=$(r).data({idImage:File[i].idImage, iFlip:i, imageName:File[i].imageName, nParent:File[i].nParent, idParent:File[i].idParent, nameParent:File[i].nameParent}); 
      var nParent=File[i].nParent;
      var $buttonTmp=$r.children('span[name=nParent]').data('valSort',nParent).children('button');
      var $buttonITmp=$r.children('span[name=nParentI]').data('valSort',nParent).children('button');
        var boSingle=$imageFilterDiv.Filt.checkIfSingleParent();
        var strTitle;
        if(boSingle) {
          strTitle=nParent+' parents';
        }else{
          strTitle=nParent+' parents'; if(nParent==1) strTitle=File[i].nameParent; else if(!nParent) strTitle='orphan';
        }
        var boHide=boSingle && nParent<=1; 
        $buttonTmp.prop('title',strTitle);   $buttonTmp.children('span:eq(0)').html(nParent);   $buttonTmp.visibilityToggle(!boHide);
        $buttonITmp.prop('title',strTitle);  $buttonITmp.children('span:eq(0)').html(nParent);  $buttonITmp.visibilityToggle(!boHide);
        
      $r.children('span[name=cb]').data('valSort',0).children('input').prop({'checked':false});
      var tmp=File[i].imageName; $r.children('span[name=image]').data('valSort',tmp).children('img').prop({src:'50apx-'+tmp});
      var tmp=File[i].boOther; $r.children('span[name=boOther]').data('valSort',tmp).visibilityToggle(tmp==1);      
      var tmp=File[i].tMod; $r.children('span[name=date]').data('valSort',-tmp.valueOf()).html(mySwedDate(tmp)).prop('title','Mod time:\n'+UTC2JS(tmp));    
      var size=File[i].size, sizeDisp=size, pre=''; if(size>=1024) {sizeDisp=Math.round(size/1024); pre='k';} if(size>=1048576) { sizeDisp=Math.round(size/1048576); pre='M';}
      var $tmp=$r.children('span[name=size]').data('valSort',size).html(sizeDisp+'<b>'+pre+'</b>'); var strTitle=pre.length?'Size: '+size:''; $tmp.prop('title',strTitle);   //$tmp.css({weight:pre=='M'?'bold':'',color:pre==''?'grey':''}); 
      var tmp=File[i].imageName; $r.children('span[name=link]').data('valSort',tmp).children('a').prop({href:uCommon+'/'+tmp}).text(tmp);
    });
    $tbody.find('input').prop({'checked':false}); 
  }
  $el.setCBStat=function(boOn){
    boOn=Boolean(boOn);$allButton.html('All');
    $executeButton.toggle(false);
    if(typeof $myRows=='undefined') return;
    var $Tr=$tbody.children('p:lt('+$el.nRowVisible+')');
    $Tr.find('input').prop({'checked':false});
  }
  var restExecuteButton=function(){   $allButton.html('All');  $executeButton.hide();  }
  $el.loadTab=function(){
    var oF=$imageFilterDiv.gatherFiltData();
    var vec=[['setUpImageListCond',oF],['getImageList',1,getListRet],['getImageHist',1,histRet]];
    //var boSingleParentFilter=$imageFilterDiv.Filt.checkIfSingleParent();
    var boWhite=$imageFilterDiv.Filt.isWhite();
    var StrParentsOn=$imageFilterDiv.Filt.getParentsOn();
    var nParentsOn=$imageFilterDiv.Filt.getNParentsOn();
    if(boWhite){
      if(nParentsOn==1) {
        var idParent=$imageFilterDiv.Filt.getSingleParent();
        //vec.push(['getExtraPageStat',{idPage:idParent},getExtraPageStatRet]);  // If filtering for single parent then also get the "grandparents"
        vec.push(['getParent',{idPage:idParent},getParentRet],['getSingleParentExtraStuff',{idPage:idParent},getSingleParentExtraStuffRet]);  // If filtering for single parent then also get the "grandparents"
        var boOrphan=idParent===null;
        if(boOrphan) $spanSingleFilter.html('(orphans)').css({color:'grey'}); else $spanSingleFilter.empty().append($aSingleFilter).css({color:''});
        $buttPI.prop('title',boOrphan?'Orphan pages':'Children');
      }else {
        $spanGrandParent.setUpClear(); $spanGrandParentI.setUpClear();
        var strTmp='('+nParentsOn+' parents on)';
        var StrTmp=StrParentsOn.slice(0,5), indT=StrTmp.indexOf(null); if(indT!=-1) StrTmp[indT]='(orphans)';
        var strTitle=StrTmp.join('\n');
        $spanSingleFilter.html(strTmp).css({color:'grey'}).prop('title',strTitle);
        
      }
    }else{
      $spanGrandParent.setUpClear(); $spanGrandParentI.setUpClear();
      $spanSingleFilter.html('').css({color:'grey'}).prop('title','');
    }
    //$spanSingleFilter.toggle(boSingleParentFilter);
    $buttPI.toggle(nParentsOn==1);
    majax(oAJAX,vec);
    setMess('... fetching image list ... ',5,true);
    $head.clearArrow(); restExecuteButton();
  }
  var getParentRet=function(data){
    if('tab' in data) { var Parent=tabNStrCol2ArrObj(data); $spanGrandParent.setUp(Parent);   $spanGrandParentI.setUp(Parent); }
  }
  var getSingleParentExtraStuffRet=function(data){
    if('nSub' in data) {      $buttPI.empty().append(data.nSub);    }
    if('pageName' in data) {
      var strS=Number(data.boTLS)?'s':'',  strUrl='http'+strS+'://'+data.www+'/'+data.pageName, text=data.pageName; if(data.nSame>1) text=data.siteName+':'+text;
      $aSingleFilter.prop('href',strUrl).html(text);
    }
  }
  var getListRet=function(data){
    var nCur;  //, TabTmp, StrCol=[];
    var tmp=data.NFilt;   if(typeof tmp!="undefined") { $imageFilterDiv.setNFilt(tmp); } 
    /*
    File.length=0;
    var tmp=data.StrCol;   if(typeof tmp!="undefined")  StrCol=tmp;
    var tmp=data.tab;   if(typeof tmp!="undefined")  TabTmp=tmp;
    for(var i=0;i<TabTmp.length;i++){
      if(typeof File[i] =='undefined') File[i]={};
      for(var j=0;j<StrCol.length;j++){  var name=StrCol[j]; File[i][name]=TabTmp[i][j];  }
    }*/
    File.length=0;
    if('tab' in data) File=tabNStrCol2ArrObj(data);
    $el.nRowVisible=File.length;
    condAddRows(); fileArray2Div();
  }
  var histRet=function(data){
    var tmp, HistPHP;
    tmp=data.Hist;   if(typeof tmp=="undefined") tmp=[];     HistPHP=tmp;
    ParentName=[]; if('ParentName' in data) ParentName=tabNStrCol2ArrObj(data.ParentName);  
    IndParentName={}; var objOne={}, objMult={};
    for(var i=0;i<ParentName.length;i++) {
      var row=ParentName[i];
      if(row.pageName in objOne) objMult[row.pageName]=1; else objOne[row.pageName]=1;
      IndParentName[row.idPage]=ParentName[i];
    }
    for(var i=0;i<ParentName.length;i++) {
      var row=ParentName[i];
      if(row.pageName in objMult) row.text=row.siteName+':'+row.pageName; else row.text=row.pageName;
    }

    $imageFilterDiv.interpretHistPHP(HistPHP);
    $imageFilterDiv.update();         
    //$imageList.setCBStat(0); 
  }
  var getChecked=function(){
    var $Tr=$tbody.children('p:lt('+$el.nRowVisible+')'), $checked=$Tr.find('input:checked'), FileTmp=[]; $checked.each(function(){var tmp=$(this).parent().parent().data('idImage'); FileTmp.push(tmp);});
    return FileTmp;
  }
  
    // Methods of resp row
  var getRenameData=function(){
    var $r=$(this), iTab=$r.index(), idImage=$r.data('idImage'), strName=$r.data('imageName');    return [iTab,idImage,strName];  }
  var changeModOfSingleI=function(strName,boVal){
    var $r=$(this), $span=$r.children('span[name='+strName+']'), boValO=$span.data('valSort');
    if(typeof boVal=='undefined') boVal=1-boValO;
 
    var o={File:[$r.data('idImage')]}; o[strName]=boVal;
    var vec=[['myChModImage',o]];   majax(oAJAX,vec);
    $span.data('valSort',Number(boVal)).css({visibility:boVal?'':'hidden'}); 
  }
  
  
  $el.changeName=function(iTab,strNewName){
    var $Tr=$tbody.children('p:lt('+$el.nRowVisible+')');
    var $r=$Tr.eq(iTab), iFlip=$r.data('iFlip');
    File[iFlip].imageName=strNewName;
    $r.data('imageName',strNewName).children('span[name=link]').data('valSort',strNewName).children('a').prop({href:uCommon+'/'+strNewName}).text(strNewName);
  }
  $el.deleteF=function(FileDelete){
    var oF=$imageFilterDiv.gatherFiltData();    
    var vec=[['deleteImage',{File:FileDelete}],['setUpImageListCond',oF],['getImageList',1,getListRet],['getImageHist',1,histRet]];
    restExecuteButton();  majax(oAJAX,vec)
  }
  
  var funPopped=function(statePopped){ 
    $imageFilterDiv.frStored(statePopped);
    $el.loadTab();
  }
  $el.histPush=function(){
    var o=$imageFilterDiv.toStored();
    doHistPush({$view:$imageList, Filt:o, fun:funPopped});
  }
  $el.histReplace=function(indDiff){
    var o=$imageFilterDiv.toStored();
    doHistReplace({$view:$imageList, Filt:o, fun:funPopped}, indDiff); //
  }

  var ParentName, IndParentName;
  PropImage.parent.setRowButtF=function($span,val,boOn){
    var text=''; if(val in IndParentName) text=IndParentName[val].text;
    else if(val===null) text='(no parent)';
    $span.html(text);
  }


  var $myRows;
  var $tbody=$el.$tbody=$("<div>").addClass('listBody');
  $el.$table=$("<div>").append($tbody).css({width:'100%',position:'relative'});
  $el.$divCont=$("<div>").append($el.$table).css({'margin':'3em auto 1em','text-align':'left',display:'inline-block'});//
  
  var strTmp='Parents / Alternatve parents';
  var StrCol=['nParent','nParentI','cb','execute','date','image','size','boOther','link'], BoAscDefault={cb:0,boOther:0,size:0}, Label={nParent:strTmp, nParentI:strTmp, cb:'Select',date:'tMod',boOther:'Supplied by user'};
  //var $headFill=$('<p>').append().css({background:'white',margin:'0px',height:'calc(12px + 1.2em)'});
  var $head=headExtend($('<p>'),$el,StrCol,BoAscDefault,Label,'p','span');
  $head.css({background:'white', width:'inherit',height:'calc(12px + 1.2em)'});
  $el.$table.prepend($head); //,$headFill


    // menuA
  var $allButton=$('<button>').append('All').addClass('fixWidth').css({'margin-right':'1em'}).click(function(){  //, 'margin-left':'0.8em'
    var boOn=$allButton.text()=='All';
    var $Tr=$tbody.children('p:lt('+$el.nRowVisible+')');
    $Tr.find('input').prop({'checked':boOn}); 
    $allButton.text(boOn?'None':'All');
    $executeButton.toggle(boOn);
  });

  var strMenuExecuteEvent='mousedown'; if(boTouch) strMenuExecuteEvent='click';
  var strEvent='mouseup'; if(boTouch) strEvent='click';



    // menuSingle
  var $buttonDownload=$('<div>').html('Download');
  var $buttonRename=$('<div>').append('Rename').on(strEvent,function(){
    var $b=$(this).parent().data('$button'), $r=$b.parent().parent(),  arrTmp=getRenameData.call($r[0]); arrTmp.unshift('image'); $renamePop.openFunc.apply(null,arrTmp);
  });
  var $buttonDelete=$('<div>').append('Delete').on(strEvent,function(){
     var $b=$(this).parent().data('$button'), $r=$b.parent().parent(),  FileTmp=[$r.data('idImage')], strLab='Are sure you want to delete this image'; 
    $areYouSurePop.openFunc(strLab,function(){$el.deleteF(FileTmp);});
  });
  var $buttonBoOtherTog=$('<div>').append('Toggle boOther').on(strEvent,function(){ var $b=$(this).parent().data('$button'), $r=$b.parent().parent();   changeModOfSingleI.call($r[0],'boOther'); });
  
  //var $itemSingle=$([]).push($buttonGoToParent, $buttonRename, $buttonDelete);
  var $itemSingle=$([]).push($buttonRename, $buttonDelete, $buttonBoOtherTog);
  var $menuSingle=menuExtend($('<div>')).css({'text-align':'left'});
  var buttonExeSingleClick=function(e){ 
    var $button=$(this); //, $r=$button.parent().parent(), nParent=$r.data('nParent'), strParent=$r.data('nameParent');

    $menuSingle.data('$button',$button);   $menuSingle.openFunc(e,$button,$itemSingle);
  }
  

    // menuMult
  var $buttonDownload=$('<div>').html('Download');
  var $buttonDelete=$('<div>').append('Delete').on(strEvent,function(){  var FileTmp=getChecked(), strLab='Deleting '+FileTmp.length+' image(s).';   $areYouSurePop.openFunc(strLab,function(){$el.deleteF(FileTmp);}); });
  
  //var $tmpImg=$('<img>').prop({src:uFlash}).prop('draggable',false).css({height:'1em',width:'1em','vertical-align':'text-bottom'});
  var $executeButton=$('<button>').append(charFlash).addClass('fixWidth').addClass('unselectable').prop({UNSELECTABLE:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie;
  var $itemMulti=$([]).push( $buttonDelete);
  //var menuExtender=menuExtend; if(boTouch) menuExtender=menuStickyExtend;
  var $menuMult=menuExtend($('<div>')).css({'text-align':'left'});
  var buttonExeMultClick=function(e){ 
    var $button=$(this);  //$itemMulti.eq(0).toggle(isOneOn());
    //if(boTouch){      doHistPush({$view:$menuDiv});     $menuDiv.setUp($itemMulti);   $menuDiv.setVis();    }else{    }
    $menuMult.openFunc(e,$button,$itemMulti);
  }
  $executeButton.on(strMenuExecuteEvent,buttonExeMultClick); 




  var File=[]; $el.nRowVisible=0;

  //var $buttonBack=$('<button>').append('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(doHistBack);
  var $spanTmp=$('<span>').append(strFastBackSymbol).css({'font-size':'0.7em'});
  var $buttonFastBack=$('<button>').append($spanTmp).addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(function(){history.fastBack($adminMoreDiv);});
  //var $spanLabel=$('<span>').append('Images').css({'float':'right',margin:'0.2em 0 0 0'}); 
  var $buttPI=$('<button>').css({'line-height':'normal','min-width':'1.4em', 'background-image':'url("stylesheets/buttonRight1.png")'}).click(function(){  //.append($tmpImg)
    var idParent=$imageFilterDiv.Filt.getSingleParent();
    $pageFilterDiv.Filt.setSingleParent(idParent);
    $pageList.histPush(); $pageList.loadTab(); $pageList.setVis();});
  var $buttPIW=$('<span>').append($buttPI).css({'float':'right','margin-right':'0.6em'});
  var $tmpImg=$('<img>').prop({src:uFilter}).css({height:'1em',width:'1em','vertical-align':'text-bottom'});
  $el.$filterInfoWrap=$('<span>');
  var $buttFilter=$('<button>').append($tmpImg,' (',$el.$filterInfoWrap,')').addClass('flexWidth').css({'float':'right','margin-right':'0.2em'}).click(function(){ doHistPush({$view:$imageFilterDiv}); $imageFilterDiv.setVis();});
  var $buttClear=$('<button>').append('C').click(function(){$imageFilterDiv.Filt.filtClear(); $imageList.histPush(); $imageList.loadTab()}).css({'float':'right','margin-right':'1em'});
  var $spanTmp=$('<span>').append('(orphans)').css({'font-size':'0.8em'});
  var $buttOrphan=$('<button>').append($spanTmp).click(function(){$imageFilterDiv.Filt.setSingleParent(null);  $imageList.histPush(); $imageList.loadTab()}).css({'float':'right','margin-right':'1em'});
  var $spanGrandParent=new SpanGrandParent('image','page').css({'margin-left':'0.6em'});
  var $spanGrandParentI=new SpanGrandParent('image','image').css({'margin-right':'0.6em'});
  var $aSingleFilter=$('<a>').prop({target:"_blank"}).css({'font-weight':'bold'}), $spanSingleFilter=$('<span>').css({'margin-right':'0.5em', 'margin-top':'0.7em'});  //.hide()
  //var $spanSingleFilterW=$('<span>').append();
  var $menuA=$('<div>').append($buttonFastBack, $allButton, $executeButton, $buttFilter, $buttClear, $buttOrphan);  // $buttonBack, 
  $menuA.css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'});
  var $menuTop=$('<div>').append($spanGrandParent, $spanGrandParentI, $spanSingleFilter, $buttPIW).addClass('divMenuTop'); // 'Parent Filter: ',
  $menuTop.css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em', 'line-height':'2.7em'});

  $el.addClass('imageList');
  $el.$fixedTop=$('<div>').append($menuTop).css(cssFixedTop).css({'background':'lightblue'});
  $el.$fixedDiv=$('<div>').append($menuA).css(cssFixed).css({'background':'lightblue'});
  $el.css({'text-align':'center'});
  $el.append($el.$divCont,$el.$fixedTop,$el.$fixedDiv);
  return $el;
}



/*******************************************************************************
 * editDiv
 ******************************************************************************/
divReCaptchaExtend=function($el){
"use strict"
  $el.setUp=function(){
    if($el.is(':empty')){    grecaptcha.render($el[0], {sitekey:strReCaptchaSiteKey});    }
  }
  return $el;
}

editDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'editDiv';}
  $el.setUp=function(){
    if($editText.parent()[0]!==$el.$fixedDiv[0]) {
      $el.$fixedDiv.prepend($dragHR,$editText);
    }
    
    $el.$spanSave.prepend($divReCaptcha);
    $divReCaptcha.setUp();
  }
  
    // menuB
  $el.$spanSave=spanSaveExtend($('<span>'));
  var $templateButton=$('<button>').append('Template list').addClass('fixWidth').css({'margin-right':'1em'}).click(function(){
    doHistPush({$view:$templateList});
    $templateList.setVis();
  });    
  $el.$templateButton=$templateButton;
  //var $upLoadButton=$('<button>').append('Upload image').click(function(){$uploadUserDiv.openFunc();}).css({'float':'right'});
  var $upLoadButton=$('<button>').append('Upload image').click(function(){  doHistPush({$view:$uploadUserDiv}); $uploadUserDiv.setVis();}).css({'float':'right'});
  $el.$spanLastMod=$('<span>');  
  var $spanLastModW=$('<span>').append('Last mod: ', $el.$spanLastMod).css({'float':'right',margin:'0.2em .5em 0 0'});  
  var $menuB=$('<div>').append($el.$spanSave,$templateButton,' ',$upLoadButton).addClass('fixWidth').css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'1em auto'});

    // menuA
  //var $buttonBack=$('<button>').append('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(doHistBack);
  var $spanLabel=$('<span>').append('Edit').css({'float':'right',margin:'0.2em 0 0 0'});  
  var $menuA=$('<div>').append($spanLastModW).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'});  //$buttonBack, ,$spanLabel

  $el.$spanClickOutside=$('<span>').append('Click outside the textarea when ready.').hide();
  $el.$fixedDiv=$('<div>').append($el.$spanClickOutside,$menuB,$menuA).css(cssFixedDrag);

  $el.$menus=$menuA.add($menuB);
  $el.append($el.$fixedDiv);
  return $el;
}


editButtonExtend=function($el){
  $el.setImg=function(boOW){ 
    $imgOW.prop({src:boOW?uPen:uPenNot});
    //$imgOW.toggle(boOW); $imgOWNot.toggle(1-boOW);
    $divHov.html(boOW?'Edit the page.':'See wiki text.')
  }
  var $divHov=$('<div>');  if(!boTouch) { popupHoverM($el,$divHov);  };
  
  var $imgOW=$('<img>').prop({src:uPen}).css({height:strSizeIcon,width:strSizeIcon,'vertical-align':'text-bottom'});
  //var $imgOWNot=$('<img>').prop({src:uPenNot}).css({height:'1em',width:'1em','vertical-align':'text-bottom'}).hide();
  //var $imgOWNot=$('<span>').append('src').hide();
  $el.append($imgOW);
  return $el;
}
spanModExtend=function($el){
  var strPublicRead='<span style="display:inline-block">'+charPublicRead+'</span>';
  $el.setup=function(data){   $el.html((data.boOR?strPublicRead:' ') + (data.boOW?charPublicWrite:' ') + (data.boSiteMap?charPromote:' '));  }
  return $el;
}

dragHRExtend=function($el){
"use strict"
  var myMousedown= function(e){
    var e = e || window.event; if(e.which==3) return;
    $el.css({position:'relative',opacity:0.55,'z-index':'auto',cursor:'move'}); 
    hStart=$editText.height();
    if(boTouch) {e.preventDefault(); var orig=e.originalEvent;  mouseXStart=orig.changedTouches[0].pageX; mouseYStart=orig.changedTouches[0].pageY;}
    else {mouseXStart=e.pageX; mouseYStart=e.pageY;}

    if(boTouch){      $(document).on('touchmove',myMousemove).on('touchend',$el.myMouseup);  }
    else{   $(document).on('mousemove',myMousemove).on('mouseup',$el.myMouseup);    }
    //setMess('Down',5);
  } 
  $el.myMouseup= function(e){ 
    $el.css({position:'relative',opacity:1,'z-index':'auto',top:'0px',cursor:'row-resize'});
    if(boTouch) $(document).off('touchmove',myMousemove).off('touchend',$el.myMouseup);
    else $(document).off('mousemove').off('mouseup'); 
    //setMess(print_r($el.myGet(),1));
  }
  
  var myMousemove= function(e){
    var mouseX,mouseY;
    if(boTouch) {e.preventDefault(); var orig=e.originalEvent;  mouseX=orig.changedTouches[0].pageX; mouseY=orig.changedTouches[0].pageY;}
    else {mouseX=e.pageX; mouseY=e.pageY;}

    var hNew=hStart-(mouseY-mouseYStart); 
    $editText.height(hNew);
  };
  var hStart,mouseXStart,mouseYStart;
  if(boTouch) $el.on('touchstart',myMousedown); else $el.on('mousedown',myMousedown);
  $el.addClass('unselectable').prop({UNSELECTABLE:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie;
  $el.css({cursor:'row-resize'});
  return $el;
}



editTextExtend=function($el){
"use strict"
  var hDefault=160;
  var hEditText=getItem('hEditText');  if(hEditText===null)  hEditText=hDefault;      
  if(boTouch) hEditText=hDefault;
  $el.css({width:'80%',height:hEditText+'px',display:'block',resize:'none'}).prop({autocomplete:"off"});//,wrap:"virtual"//,'margin-left':'40px','margin-right':'10px's
  var clickBlurFunc=function(e){
    var boOn=e.type=='click';
    //if(!boOn) return;
    if(boTouch){//boTouch
      var $parent=$el.parent();
      if(boOn) {        
        $parent.css({top:'0px',bottom:''});
      } else { 
        $parent.css({top:'',bottom:'0px'});
      }
      var $toHideAtTouch=$pageText.add($editDiv.$menus).add($adminDiv.$menus);
      $toHideAtTouch.toggle(!Boolean(boOn));
      $editDiv.$spanClickOutside.toggle(Boolean(boOn));
      $adminDiv.$spanClickOutside.toggle(Boolean(boOn));
    }
  }
  $el.on('click',clickBlurFunc);  
  $el.on('blur',clickBlurFunc);
  return $el;
}


spanSaveExtend=function($el){
"use strict"
  var $summary=$("<input type=text placeholder=Summary>").css({width:'5em'}); //$spanSummary=$('<span>').append('Summary: ',$summary).css({'white-space':'nowrap'});
  var $signature=$("<input type=text placeholder=Signature>").css({width:'5em'}); //$spanSignature=$('<span>').append('Signature: ',$signature).css({'white-space':'nowrap'});
  if(boIE && versionIE<10) { 
    var tmpf=function(){$(this).css({background:'#fff'});}
    var tmpSu='url('+uSummary+') no-repeat scroll 0 50% #fff'; $summary.css({background: tmpSu}).focusin(tmpf).focusout(function(){$(this).css({background:tmpSu});});
    var tmpSi='url('+uSignature+') no-repeat scroll 0 50% #fff'; $signature.css({background: tmpSi}).focusin(tmpf).focusout(function(){$(this).css({background:tmpSi});});
  }
  var $save=$('<button>').append('Save').click(function(){
    if(!$summary.val() || !$signature.val()) { setMess('Summary- or signature- field is empty',5); return;}
    
    var strTmp=grecaptcha.getResponse(); if(!strTmp) {setMess("Captcha response is empty"); return; }
    var o={strEditText:$editText.val(), summary:$summary.val(), signature:$signature.val(),  'g-recaptcha-response': grecaptcha.getResponse()};
    
    var vec=[['saveByAdd',o]];   majax(oAJAX,vec); 
    $summary.val(''); $signature.val('');
    $boLCacheObs.val(1);
  });
  var $preview=$('<button>').append('Show preview').click(function(){
    var vec=[['getPreview',{strEditText:$editText.val()}]];   majax(oAJAX,vec); 
  });

  $el.append($summary,' ',$signature,' ',$save,' ',$preview);
  return $el;
}


templateListExtend=function($el){
"use strict"
  $el.toString=function(){return 'templateList';}
  $el.setUp=function(obj){
    $div.empty(); 
    for(var key in obj) {  
      var str="template:"+key;   var $a=$('<a>').prop({href:'/'+str}).html(str).css({display:'block'}); $div.append($a);
      if( obj[key]==0) $a.addClass("stub");
    }
    //if(tab.length) $el.prepend('<h3>Templates</h3>');
    $editDiv.$templateButton.toggle(!$.isEmptyObject(obj));
  }
  var $div=$('<div>');
      // menuA
  // var $buttonBack=$('<button>').append('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(doHistBack);
  var $spanLabel=$('<span>').append('Template list').css({'float':'right',margin:'0.2em 0 0 0'});  
  var $menuA=$('<div>').append($spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'}); // $buttonBack,


  var $fixedDiv=$('<div>').append($menuA).css(cssFixed);

  $el.append($div,$fixedDiv);
  return $el;
}



/*******************************************************************************
 * versionTable
 ******************************************************************************/
versionTableExtend=function($el){
"use strict"
  $el.toString=function(){return 'versionTable';}
  function cbCompareWPrev(){ 
    var iVer=$(this).parent().parent().data('iMy');  arrVersionCompared=[bound(iVer-1,1),iVer];
    var vec=[['pageCompare',{arrVersionCompared:arrVersionCompared }]];   majax(oAJAX,vec); 
    doHistPush({$view:$diffDiv}); $diffDiv.setVis();
    return false;
  }
  function cbVersionView(){
    var iVer=$(this).parent().data('iMy');
    var vec=[['pageLoad',{version:iVer}]];   majax(oAJAX,vec); 
    doHistBack();
  }
  /*
  function cbRowClick(){ 
    var iRow=$(this).parent().index();
    if(iRow==nVersion-1) { var vec=[['pageLoad',{version:nVersion-iRow}]];   majax(oAJAX,vec);   }
    else{
      arrVersionCompared=[bound(nVersion-iRow-1,1),nVersion-iRow];
      var vec=[['pageCompare',{arrVersionCompared:arrVersionCompared }]];   majax(oAJAX,vec); 
    }
    return false;
  }*/
  function redClick(){ 
    var verR=$(this).parent().parent().data('iMy'), verGT=arrVersionCompared[1]; verGT=verGT<=verR?verR+1:verGT; verGT=Math.min(verGT,nVersion);
    arrVersionCompared=[verR, verGT]; 
    var vec=[['pageCompare',{arrVersionCompared:arrVersionCompared }]];   majax(oAJAX,vec); 
    doHistPush({$view:$diffDiv}); $diffDiv.setVis();
    return false;
  }
  function greenClick(){ 
    var verG=$(this).parent().parent().data('iMy'),  verRT=arrVersionCompared[0]; verRT=verRT>=verG?verG-1:verRT; verRT=Math.max(verRT,1);
    arrVersionCompared=[verRT, verG];
    var vec=[['pageCompare',{arrVersionCompared:arrVersionCompared }]];   majax(oAJAX,vec); 
    doHistPush({$view:$diffDiv}); $diffDiv.setVis();
    return false;
  }  
  $el.setTable=function(){
    $el.condAddRows(); $el.versionTable2TBody();
    //boMultVersion=Number(matVersion.length>1); 
    
    $pageView.$versionMenu.add($el.$table).add($warningDiv).toggle(matVersion.length>1);
    //if(matVersion.length==1) {$tHead.children('th:gt(3)').hide();}  else {$tHead.children('th:gt(3)').show();}
  }
  
  $el.condAddRows=function(){
    var $rows=$tBody.children('tr'), n=matVersion.length;
    //var diff=n-$rows.length;
    for(var i=$rows.length; i<n;i++){
      var $r=$('<tr>'); $r.css({cursor:'pointer'});
      //if(!boTouch) {  $r.on('mouseover',function(){$(this).children('td').css({background:'#8f8'});}).on('mouseout',function(){$(this).children('td').css({background:''});});  }
      /*if(!boTouch) { var tmp='td:lt(3)';
        $r.on('mouseover',tmp,function(){$(this).parent().children(tmp).css({background:'#8f8',cursor:'pointer'});});
        $r.on('mouseout',tmp,function(){$(this).parent().children(tmp).css({background:'',cursor:''});});
      }*/
      //var $bView=$('<button>').html('View').click(cbVersionView);
      var $bEdit=$('<button>').html('Diff').click(cbCompareWPrev).css({position:'relative',top:'1.25em'});
      var $bRed=$('<button>').css({width:'1.5em'}).html('&nbsp;').click(redClick);
      var $bGreen=$('<button>').css({width:'1.5em'}).html('&nbsp;').click(greenClick);
      var $tInd=$('<td>').attr('name','ind');
      var $tDate=$('<td>').attr('name','date');
      var $tSummary=$('<td>').attr('name','summary');
      $r.append($tInd,$tDate,$tSummary,$('<td>').css({'vertical-align':'bottom'}).append($bEdit),$('<td>').append($bRed),$('<td>').append($bGreen));  //,$('<td>').append($bView)
      
      $tBody.append($r);
    }
  }
  $el.versionTable2TBody=function(){
    nVersion=matVersion.length;
    var nRT=matVersion.length;
    $tBody.find('button').show();
    $tBody.children('tr').css({"background-color":""});
    $tBody.find('button').css({"background-color":""});
    //$tBody.children('tr:eq('+nRT+'), gt('+nRT'+)').hide();
    //$tBody.children('tr:lt('+nRT'+)').show();
    //var $myRows=$tBody.children('tr:lt('+nRT'+)');
    var $rows=$tBody.children('tr');   $rows.slice(nRT).hide();
    var $myRows=$rows.slice(0,nRT); 
    if($myRows.length==0) return;
    $myRows.show();
    $myRows.each(function(i,tr){ $(tr).data({iMy:nRT-i}); });
    $myRows.find('td:nth-child(1)').each(function(i,td){      $(td).html(nRT-i);  });
    $myRows.find('td:nth-child(2)').each(function(i,td){      $(td).html(mySwedDate(matVersion[nRT-1-i][0]));  });
    $myRows.find('td:nth-child(3)').each(function(i,td){    $(td).empty();  $(td).append(matVersion[nRT-1-i][1], ' / ', matVersion[nRT-1-i][2]);  });

    var $rEarliest=$myRows.eq(nRT-1);  $rEarliest.find('button:eq('+jBEdit+')').hide(); // Hide earliest edit-button
    $rEarliest.find('button:eq('+jBGreen+')').hide(); // Hide earliest green-button
    var $rLatest=$myRows.eq(0);  $rLatest.find('button:eq('+jBRed+')').hide(); // Hide latest red-button

    if(arrVersionCompared[0]!==null){
      var iRowRedT=nVersion-arrVersionCompared[0];      $tBody.children('tr:eq('+iRowRedT+')').css({"background-color":'#faa'}); // rowRed
      $tBody.children('tr:eq('+iRowRedT+')').find('button:eq('+jBRed+')').css({"background-color":'red'}); // buttRed
    } 
    var iRowVerT=nVersion-arrVersionCompared[1];     $tBody.children('tr:eq('+iRowVerT+')').css({"background-color":"#afa"}); // rowGreen
    $tBody.children('tr:eq('+iRowVerT+')').find('button:eq('+jBGreen+')').css({"background-color":'green'}); // buttGreen
  
  }
  var jBEdit=0,jBRed=1,jBGreen=2;
  var $spanDiff=$('<span>').append('Diff').css({position:'absolute',top:'0em',right:'0.9em'});
  //var $spanSumSign=$('<span>').append('sum/sign').css({position:'absolute',top:'-1.1em',left:'-1em'});
  //var $spanSumSign=$('<span>').append('sum/sign').css({position:'absolute',top:'0em',left:'-1em','white-space':'nowrap'});
  //display:'inline-block'
  //var $colgroup=$("<colgroup>").append($('<col>'),$('<col>'),$('<col>'),$('<col>'),$('<col>'),$('<col>').css({}),$('<col>'));
  //.css({'overflow':'visible',position:'relative'})
  var $tHead=$("<thead>").append($('<th>'),$('<th>').append('&nbsp;'),$('<th>').append('Sum/Sign'),$('<th>'),
      $('<th>').css({'background':'#faa'}), $('<th>').css({'max-width':'10px',background:'lightgreen',overflow:'visible',position:'relative'}).append($spanDiff) );
  var $tBody=$("<tbody>").css({border:'1px solid #000'});
  var tmp='[name=ind],[name=date],[name=summary]';
  $tBody.on('click',tmp,cbVersionView);
  $el.$table=$("<table>").append($tHead,$tBody).css({"border-collapse":"collapse",'margin':'1em auto'}); 
  $el.append($el.$table); //'<h3>Versions</h3>',
  //$tBody.find('td').css({border:'1px #000 soild'});

      // menuA
  // var $buttonBack=$('<button>').append('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(doHistBack);
  var $spanLabel=$('<span>').append('Version list').css({'float':'right',margin:'0.2em 0 0 0'});  
  var $menuA=$('<div>').append($spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'});  //$buttonBack,

  $el.$fixedDiv=$('<div>').append($menuA).css(cssFixed);

  $el.append($el.$table,$el.$fixedDiv);
  return $el;
}

diffDivExtend=function($el){  
"use strict"
  $el.toString=function(){return 'diffDiv';}  
  $el.setUp=function(strHtml){
    $el.$divCont.html(strHtml);  $el.$divCont.find('td').css({border:'1px #fff'});  $el.$divCont.find('td:nth-child(2):not(:first)').css({background:'#ddd'});
    $el.$divCont.find('td:nth-child(1)').css({background:'pink'});
    $el.$divCont.find('td:nth-child(3)').css({background:'lightgreen'});
    $el.$divCont.children('table').css({'margin':'1em auto'});

    var strNR='', str='';
    if(matVersion.length>0){
      var ver=arrVersionCompared[1], rev=ver-1;
      var r=matVersion[rev];
      strNR='v'+ver;   str=r[1]+' <b><i>'+r[2]+'</i></b> '+mySwedDate(r[0]);
    }
    $versionNew.html(strNR); $detailNew.html(str);  
    var strNR='', str='', ver=arrVersionCompared[0];
    if(ver){  // ver is 1-indexed
      var rev=ver-1;
      var r=matVersion[rev];
      strNR='v'+ver;   str=r[1]+' <b><i>'+r[2]+'</i></b> '+mySwedDate(r[0]);
    }
    $versionOld.html(strNR); $detailOld.html(str); 

    $prevButton.add($nextButton).toggle(matVersion.length>2);
  }


  $el.$divCont=$('<div>');

        // menuC
  var $nextButtonNew=$('<button>').append('⇧').addClass('fixWidth').click(function(){
    arrVersionCompared[1]++;   if(arrVersionCompared[1]>nVersion) {arrVersionCompared[1]=nVersion;}
    var vec=[['pageCompare',{arrVersionCompared:arrVersionCompared }]];   majax(oAJAX,vec); 
  });
  var $prevButtonNew=$('<button>').append('⇩').addClass('fixWidth').click(function(){
    arrVersionCompared[1]--; if(arrVersionCompared[0]==arrVersionCompared[1]) arrVersionCompared[0]--;
    if(arrVersionCompared[0]==0) {arrVersionCompared=[nVersion-1,nVersion];}
    var vec=[['pageCompare',{arrVersionCompared:arrVersionCompared }]];   majax(oAJAX,vec);  
  });
  var $versionNew=$('<span>').css({'background':'#afa'}), $detailNew=$('<span>'); 
  

        // menuB
  var $nextButtonOld=$('<button>').append('⇧').addClass('fixWidth').click(function(){
    arrVersionCompared[0]++; if(arrVersionCompared[0]==arrVersionCompared[1]) arrVersionCompared[1]++;
    if(arrVersionCompared[1]>nVersion) {arrVersionCompared=[1,2];}
    var vec=[['pageCompare',{arrVersionCompared:arrVersionCompared }]];   majax(oAJAX,vec);
  });
  var $prevButtonOld=$('<button>').append('⇩').addClass('fixWidth').click(function(){
    arrVersionCompared[0]--;   if(arrVersionCompared[0]==0) {arrVersionCompared[0]=1;}
    var vec=[['pageCompare',{arrVersionCompared:arrVersionCompared }]];   majax(oAJAX,vec); 
  });
  var $versionOld=$('<span>').css({'background':'#faa'}), $detailOld=$('<span>'); 

  $versionNew.add($versionOld).css({'margin':'auto 0.3em'});
  $detailNew.add($detailOld).css({'margin':'auto 0.3em'});
  $prevButtonNew.add($prevButtonOld).css({'margin-left':'0.8em'});

  //$prevButtonNew,$versionNew,$nextButtonNew   $prevButtonOld,$versionOld,$nextButtonOld
  var $menuC=$('<div>').append($versionNew,$detailNew).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'});
  var $menuB=$('<div>').append($versionOld,$detailOld).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'});



        // menuA
  var $nextButton=$('<button>').append('⇧').addClass('fixWidth').css({'margin-right':'1em'}).click(function(){
    arrVersionCompared[0]++; arrVersionCompared[1]++;
    if(arrVersionCompared[1]>nVersion) {arrVersionCompared=[1,2];}
    var vec=[['pageCompare',{arrVersionCompared:arrVersionCompared }]];   majax(oAJAX,vec);
  });
  var $prevButton=$('<button>').append('⇩').addClass('fixWidth').css({'margin-right':'1em'}).click(function(){
    arrVersionCompared[0]--; arrVersionCompared[1]--; 
    if(arrVersionCompared[0]==0) {arrVersionCompared=[nVersion-1,nVersion];}
    var vec=[['pageCompare',{arrVersionCompared:arrVersionCompared }]];   majax(oAJAX,vec);  
  });
  // var $buttonBack=$('<button>').append('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(doHistBack);
  var $spanLabel=$('<span>').append('Diff').css({'float':'right',margin:'0.2em 0 0 0'});  
  var $menuA=$('<div>').append($prevButton,$nextButton,$spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'}); //$buttonBack,

  $el.$fixedDiv=$('<div>').append($menuC,$menuB,$menuA).css(cssFixed);

  $el.append($el.$divCont,$el.$fixedDiv);
  return $el;
}


var formPPExtend=function($el){
"use strict"
  //var urlPaypalButton="https://www.paypal.com/en_US/i/btn/btn_paynowCC_LG.gif";
  //var urlPaypalButton="https://www.paypalobjects.com/webstatic/en_US/btn/btn_paynow_cc_144x47.png";
  //var urlPaypalButton="https://www.paypalobjects.com/webstatic/en_US/btn/btn_pponly_142x27.png";
  if(boDbg) urlPaypalButton='';
  $el.empty();   $el.prop({action:urlPayPal,method:'post'}).css({display:"inline","vertical-align":"-6px"});
  var $input0=$('<input>').prop({type:"hidden",name:"cmd", value:"_s-xclick"});
  var $input1=$('<input>').prop({type:"hidden",name:"hosted_button_id", value:ppStoredButt});
  var $inputImg=$('<input type="image" src="'+urlPaypalButton+'" border="0" name="submit" alt="PayPal — The safer, easier way to pay online.">');
  $el.append($input0,$input1,$inputImg);
  return $el;
}

paymentDivExtend=function($el){  
"use strict"
  $el.toString=function(){return 'paymentDiv';}
    // menuB
  var $formPP=formPPExtend($('<form>')),     $divPP=$('<div>').append($formPP).css({'margin-top':'1em'}); if(ppStoredButt.length==0) $divPP.hide();  //'Paypal: ',
  var $strBTC=$('<span>').append(strBTC).css({'font-size':'0.70em'}),    $divBC=$('<div>').append('฿: ',$strBTC); if(strBTC.length==0) $divBC.hide();
  var $menuB=$('<div>').append($divBC,$divPP).css({'text-align':'center'}).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'center',margin:'1em auto'});

    // menuA
  // var $buttonBack=$('<button>').append('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(doHistBack);
  var $spanLabel=$('<span>').append('Pay/Donate').css({'float':'right',margin:'0.2em 0 0 0'}); 
  $spanLabel.addClass('unselectable').prop({UNSELECTABLE:"on"}); // class: needed by firefox, prop: needed by opera, firefox and ie 
  var $menuA=$('<div>').append($spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'}); //$buttonBack,

  $el.$fixedDiv=$('<div>').append($menuB,$menuA).css(cssFixed);


  $el.append($el.$fixedDiv);
  return $el;
}



function calcLimitingDim(wFrame,hFrame,wOld,hOld){
"use strict"
  var scale,hNew,wNew;
  if(wFrame==0) {hNew=hFrame; scale=hFrame/hOld; wNew=floor(scale*wOld);}
  else if(hFrame==0) {wNew=wFrame; scale=wFrame/wOld; hNew=floor(scale*hOld);} 
  else { // Watch out for rounding errors:   x!==floor((x/xOrg)*xOrg)    (Which might lead to that another size is cached)
    var arrScale=[wFrame/wOld, hFrame/hOld]; var tmp=closest2Val(arrScale, 0); scale=tmp[0]; var k=tmp[1];
    if(k==0) {wNew=wFrame; hNew=Math.floor(scale*hOld);   }
    else {wNew=Math.floor(scale*wOld); hNew=hFrame;} 
  }
  return [k,scale];
}


var slideShowExtend=function($el){
"use strict"
  $el.toString=function(){return 'slideShow';}
  var touchesOld=[];
  var getStoredTouch=function(identifier) {
    for (var i=0; i<touchesOld.length; i++) {
      if(touchesOld[i].identifier == identifier) { return touchesOld[i]; }
    }
 //debugger
    //alert('Touch not found, touchesOld.length:'+touchesOld.length+', touchesOld[0].identifier: '+touchesOld[0].identifier+', idNew:'+identifier);
    return -1;
  }

  var handleStart=function(evt) {
    var Tou = evt.targetTouches, mode=Tou.length;
          
    //var strEvent=evt.timeStamp+' '+evt.type; if('targetTouches' in evt && evt.targetTouches.length) strEvent+=' '+evt.targetTouches.length+' '+evt.targetTouches[0].identifier;  console.log(strEvent);
    //if(evt.cancelable) evt.preventDefault(); 
    storeTouches(Tou);
  }
  var storeTouches=function(Tou){
    touchesOld=[];
    for(var i=0; i<Tou.length; i++) { var t=Tou[i]; touchesOld[i]={pageX:t.pageX, pageY:t.pageY, identifier:t.identifier};}
  }
  var getCorresponingTouchesOld=function(Tou){return [getStoredTouch(Tou[0].identifier), getStoredTouch(Tou[1].identifier)];}

  var leftCur=0;
  var panNZoom=function(evt){
    //var strEvent=evt.timeStamp+' '+evt.type; if('targetTouches' in evt && evt.targetTouches.length) strEvent+=' '+evt.targetTouches.length+' '+evt.targetTouches[0].identifier;  console.log(strEvent);
    if(nImg==1) return;
    var Tou=evt.targetTouches;
    var mode=Tou.length;
    if(mode==1){
      
      var viewportScale = screen.width / window.innerWidth;  //console.log(viewportScale);
      if(viewportScale>1.1) return;
      if(evt.cancelable) evt.preventDefault(); 
      var pos=$board.position(); leftCur=pos.left;
      var tAL=getStoredTouch(Tou[0].identifier), xAL, yAL, xavgL=xAL=tAL.pageX, yavgL=yAL=tAL.pageY;
      var tA=Tou[0], xA, yA, xavg=xA=tA.pageX, yavg=yA=tA.pageY;
      var dXScreen=xavg-xavgL;    leftCur+=dXScreen;
      var dYScreen=yavg-yavgL;    //topCur+=dYScreen;
      $board.css({transition:'','left':leftCur});
    }
    else if(mode==0){
      var leftCurA=Math.abs(leftCur);
      var dir=sign(-leftCur), boShift=leftCurA>window.innerWidth/8; if(!boShift) dir=0;
      var distA=leftCurA;  if(boShift) distA=window.innerWidth-leftCurA;
      leftCur=0;
      
      $board.animate({'left':(-dir*window.innerWidth)},distA,function(){
        if(boShift){          shiftFunc(dir);        }
      });
    }
    storeTouches(Tou);
  }
  var arrowPressF=function(e){ 
    e.stopPropagation();
    if(!Boolean($el.is(':visible'))) return;
    if(e.which==37) {shiftFunc(-1);return false;}else if(e.which==39) {shiftFunc(1);return false;}
  }
  var shiftFunc=function(dir){
    if(nImg==1) return;
    iCur+=dir;  iCur=(iCur+nImg)%nImg
    var iNext=(iCur+1+nImg)%nImg, iPrev=(iCur-1+nImg)%nImg;
    var $Img=$board.children('div');
    //if(dir==1) {var $imgT=$Img.eq(0).detach(); $imgT.prop({src:StrImgUrl[iNext]}); $board.append($imgT);}
    //else if(dir==-1) {var $imgT=$Img.eq(2).detach(); $imgT.prop({src:StrImgUrl[iPrev]}); $board.prepend($imgT);}
    if(dir==1) {var $imgT=$Img.eq(0).detach(); $imgT.css({'background-image':'url("'+StrImgUrl[iNext]+'")'}); $board.append($imgT);}
    else if(dir==-1) {var $imgT=$Img.eq(2).detach(); $imgT.css({'background-image':'url("'+StrImgUrl[iPrev]+'")'}); $board.prepend($imgT);}
    var $Img=$board.children('div');
    $Img.eq(0).css({left:'-100%'}); $Img.eq(1).css({left:'0%'}); $Img.eq(2).css({left:'100%'});
    $board.css({'left':leftCur});
    $divCaptionCont.empty().append($Caption.eq(iCur).clone());
  }
  var handleMove=function(evt) {
    panNZoom(evt);
  }
  var handleEnd=function(evt) {
    panNZoom(evt); 
    //return false;
  }
  var handleCancel=function(evt) {
    panNZoom(evt); 
    var strMess=' handleCancel: '+evt.targetTouches.length;
    setMess(strMess);
  }
  var handleLeave=function(evt) {
    panNZoom(evt); 
    var strMess=' handleLeave: '+evt.targetTouches.length;
    setMess(strMess);
  }
  $el.setUp=function(StrImgUrlT, $CaptionT, iCurT){
    StrImgUrl=StrImgUrlT;  $Caption=$CaptionT;  iCur=iCurT;
    nImg=StrImgUrl.length; var $Img=$([]);
    if(!boTouch) $Arrow.toggle(nImg!=1);
    for(var i=0;i<3;i++){  //StrImgUrl.length
      //var $img=$('<img>').prop({src:StrImgUrl[i]});
      var iTmp=(iCur+i-1+nImg)%nImg;
      var $img=$('<div>').css({'background-image':'url("'+StrImgUrl[iTmp]+'")'}); //.click($winCaption.openFunc);
      $Img.push($img);
    }
    $Img.eq(0).css({left:'-100%'});
    $Img.eq(2).css({left:'100%'});  
    
    $Img.css({width:'100%', height:'100%',  margin:'auto',position:'absolute',  'box-sizing':'border-box', border:'#fff 10px solid', display:'block'});  //,transition:'left 1s'
    $Img.css({'background-size':'contain', 'background-repeat':'no-repeat', 'background-position':'center'});    
    $board.empty().append($Img);
    $document.on('keydown',arrowPressF);
    $winCaption.css({width:'',left:'0px',top:$window.height()/3+'px'});
    $divCaptionCont.empty().append($Caption.eq(iCur).clone());  $winCaption.openFunc(); 
    
  } 
  $el.addClass('unselectable').prop({UNSELECTABLE:"on"}).css({height:'100%',width:'100%'}); // class: needed by firefox, attr: needed by opera, firefox and ie 
  $el.keydown( arrowPressF); 
  var StrImgUrl, $Caption, iCur, nImg;
  
  var $board=$('<div>').css({'left':leftCur});
  $board.css({position:'relative',width:'100vw',height:'100vh'}); //
  $el.css({position:'relative',width:'100vw',height:'100vh', overflow:'hidden'});
  $el.append($board);

  if(boTouch){
    $el[0].addEventListener("click", function(){ $winCaption.toggleFunc();}, true);
  }else{
    var intArrowSize=20, strColor='blue';
    var $arrowLeft=$('<div>').css({'border-right': intArrowSize+'px solid '+strColor}),  $arrowRight=$('<div>').css({'border-left': intArrowSize+'px solid '+strColor});
    var $Arrow=$arrowLeft.add($arrowRight).css({width:'0px', height:'0px', 'border-top':intArrowSize+'px solid transparent', 'border-bottom': intArrowSize+'px solid transparent', opacity:0.3});
  //, margin:'auto'
  /*
    var $divLeft=$('<div>').append($arrowLeft).css({left:'0px'}).click(function(){shiftFunc(-1);}),  $divRight=$('<div>').append($arrowRight).css({right:'0px'}).click(function(){shiftFunc(1);});
    $divLeft.add($divRight).css({height:'100%', width:'33%', position:'absolute', right:'0px', top:'0px', display:'flex', 'justify-content':'center','align-items':'center'});
    $divLeft.add($divRight).mouseover(function(){$(this).children('div').css({opacity:1});}).mouseout(function(){$(this).children('div').css({opacity:0.3});});
    if(!boTouch) $el.append($divLeft,$divRight);
  */

    var $divAreaParent=$('<div>').css({position:'absolute', width:'100vw', height:'100vh', top:'0px', left:'0px',display:'flex'}); 
    var $divLeft=$('<div>').append($arrowLeft).css({left:'0px'}).click(function(){shiftFunc(-1);}),  $divRight=$('<div>').append($arrowRight).css({right:'0px'}).click(function(){shiftFunc(1);});
    $divLeft.add($divRight).css({height:'100%', display:'flex', 'justify-content':'center','align-items':'center', flex:'1 1 auto'});
    $divLeft.add($divRight).mouseover(function(){$(this).children('div').css({opacity:1});}).mouseout(function(){$(this).children('div').css({opacity:0.3});});
    var $divCenter=$('<div>').css({flex:'1 1 auto'}).click(function(){$winCaption.toggleFunc();});
    $divAreaParent.append($divLeft,$divCenter,$divRight);
    $el.append($divAreaParent);
  }

  var $divCaptionCont=$('<div>');//.css({padding:'0.1em'});
  var $winCaption=$('<div>').append($divCaptionCont);
  //var $divPopParent=$('<div>').css({position:'absolute', width:'100vw', height:'100vh', top:'0px', left:'0px'}); $el.prepend($divPopParent);
  popupDragExtendM($('<div>'),$winCaption,'',$el).css({left:'3px',top:'200px'}); 


  var el = $board[0];
  el.addEventListener("touchstart", handleStart, false);
  el.addEventListener("touchend", handleEnd, false);
  el.addEventListener("touchcancel", handleCancel, false);
  el.addEventListener("touchleave", handleLeave, false);
  el.addEventListener("touchmove", handleMove, false);

 
  return $el;
}



function pageTextExtend($el){
"use strict"
  var clickFun=function(){
    //var $li=$(this).parent(), iCur=$li.index(); //, StrImg=$li.parent().data('StrImg'), $Caption=$li.parent().data('$Caption');
    //alert(iCur+' '+print_r(StrImg)); 
    var $a=$(this), iCur=$a.data('iCur');
    $slideShow.setUp($el.StrImg,$el.$Caption,iCur);
    doHistPush({$view:$slideShow});
    $slideShow.setVis(); 
    return false;
  }
  $el.modStuff=function(){
    var $galleries=$el.find('.gallery');
    $galleries.each(function(i,el){ 
      var $ele=$(el), $li=$ele.children('li');
      $li.each(function(j,l){
        var $a=$(l).children('a:eq(0)'); $a.click(clickFun);  $a.data({iCur:$el.StrImg.length});  $el.StrImg.push($a.prop('href')); $el.$Caption.push($a.next());
      });
    });
    var $imgThumbimage=$el.find('.thumbimage');
    $imgThumbimage.each(function(i,el){ 
      var $a=$(el).parent(); 
      if($a.next().hasClass('thumbcaption')){ 
        $a.click(clickFun);  $a.data({iCur:$el.StrImg.length});  $el.StrImg.push($a.prop('href')); $el.$Caption.push($a.next());
      }
    });
  }
  $el.StrImg=[];
  $el.$Caption=$([]);
  return $el;
}

redirectSetPopExtend=function($el){
"use strict"
  $el.toString=function(){return 'redirectSetPop';}
  var save=function(){
    r.idSiteOld=r.idSite; r.pageNameOld=r.pageName;
    r.idSite=$selSite.val(); var rS=$redirectTab.indexSiteTabById[r.idSite]; r.siteName=rS.siteName; r.www=rS.www;
    r.pageName=$inpPageName.val(); if(r.pageName.length==0){ setMess('empty page name',2);  return;}
    r.url=$inpURL.val();  if(r.url.length==0){ setMess('empty url',2);  return;}
    //if(RegExp('^https?:\/\/$').test(url)) { setMess('empty domain',2);  return;}
    //if(!RegExp('^https?:\/\/').test(url)){  url="http://"+url;   }
    var objTmp=$.extend({boUpd:boUpd},r);
    var vec=[['redirectTabSet', objTmp, saveRet]];   majax(oAJAX,vec);
  }
  var saveRet=function(data){
    if(!data.boOK) return;
    //if(boUpd) {  $redirectTab.myEdit(r); } //r.idSite=idSite;
    //else {r.tCreated=r.tMod=r.tLastAccess=unixNow(); t.nAccess=0; $redirectTab.myAdd(r); }
    var RowT=tabNStrCol2ArrObj(data), rowT=RowT[0]; for(var k in rowT) r[k]=rowT[k];
    if(boUpd) {  $redirectTab.myEdit(r); } //r.idSite=idSite;
    else {r.tCreated=r.tMod=r.tLastAccess=unixNow(); t.nAccess=0; $redirectTab.myAdd(r); }
    //$redirectTab.setUp();
    doHistBack();
  }
  $el.setUp=function(){
    var $Opt=$([]); siteTab=$redirectTab.siteTab;
    for(var i=0;i<siteTab.length;i++) {var $optT=$('<option>').text(siteTab[i].siteName).val(siteTab[i].idSite); $Opt.push($optT); }
    $selSite.empty().append($Opt);    var tmpVal=(typeof r.idSite!='undefined')?r.idSite:$redirectTab.idSiteDefault;    $selSite.val(tmpVal);
    $inpPageName.val(r.pageName); $inpURL.val(r.url); $inpPageName.focus();  return true;
  }
  $el.openFunc=function(boUpdT,boGotData){
    boUpd=boUpdT;
    if(boGotData){
      var $r=$(this).parent().parent();
      r=$r.data('r');
    } else {r=rDefault;}
    //$divInsOrUpd.toggle(boUpd); $vippInsOrUpd.setStat(0);
    //$selSite.push($inpPageName).prop('disabled',boUpd);
    doHistPush({$view:$redirectSetPop});
    $el.setVis();
    $el.setUp();
  }
  $el.setVis=function(){
    $el.show(); return 1;
  }
 
  var rDefault={siteName:'', www:'', pageName:'', url:''};
  var siteTab, boUpd, r; 
  

  var $labSite=$('<b>').append('siteName');
  var $selSite=$('<select>').css({display:'block'});
  var $labPageName=$('<b>').append('pageName');
  var $inpPageName=$('<input type=text>');
  var $labURL=$('<b>').append('Redirect to (pageName or url)');
  var $inpURL=$('<input type=text>');;


  var $Lab=$([]).push($labSite, $labPageName, $labURL).css({'margin-right':'0.5em'});
  var $Inp=$([]).push($inpPageName, $inpURL).css({display:'block',width:'100%'}).keypress( function(e){ if(e.which==13) {save();return false;}} );
  var $inpNLab=$([]).push($labSite, $selSite, $labPageName, $inpPageName, $labURL, $inpURL);


  var $buttonSave=$('<button>').append('Save').click(save).css({'margin-top':'1em'});
  var $divBottom=$('<div>').append($buttonSave);  //$buttonCancel,

  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').addClass("Center").append($inpNLab,$divBottom).css({height:'18em', 'min-width':'17em','max-width':'30em', padding: '1.2em 0.5em 1.2em 1.2em'});
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); 
   
  return $el;
}


redirectDeletePopExtend=function($el){
"use strict"
  $el.toString=function(){return 'redirectDeletePop';}
  var $ok=$('<button>').html('OK').css({'margin-top':'1em'}).click(function(){    
    var pageName=$r.attr('pageName'), idSite=$r.attr('idSite'), vec=[['redirectTabDelete',{idSite:idSite,pageName:pageName},okRet]];   majax(oAJAX,vec);    
  });
  var okRet=function(data){
    if(!data.boOK) return;
    $redirectTab.myRemove($r);
    doHistBack();
  }
  $el.openFunc=function(){
    $r=$(this).parent().parent(); $spanPage.text($r.data('r').siteName+':'+$r.attr('pageName'));
    doHistPush({$view:$redirectDeletePop});
    $el.setVis();
    $ok.focus();
  }
  $el.setVis=function(){
    $el.show(); return 1;
  }
 
  var $r;
  var $head=$('<h3>').append('Delete');
  var $spanPage=$('<span>');//.css({'font-weight': 'bold'});
  var $p=$('<div>').append($spanPage);

  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').addClass("Center").append($head,$p,$ok).css({height:'10em', 'min-width':'17em','max-width':'25em', padding:'0.1em'}); //,$cancel
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); 
 
  return $el; 
}

regHttp=/^https?:\/\//;
redirectTabExtend=function($el){
"use strict"
  $el.toString=function(){return 'redirectTab';}
  var funcTTimeTmp=function(t){ var arrT=getSuitableTimeUnit(unixNow()-t);  $(this).text(Math.round(arrT[0])+arrT[1]);  }
  var funcLinkTmp=function(url, r){  var rS=$el.indexSiteTabById[r.idSite], urlLink=url; if(!regHttp.test(url)) urlLink='http'+(rS.boTLS?'s':'')+'://'+rS.www+'/'+url; $(this).children('a').prop({href:urlLink}).html(url);  }
  var TDProt={
    url:{ mySetVal:funcLinkTmp },
    tCreated:{ mySetVal:funcTTimeTmp },
    tLastAccess:{ mySetVal:funcTTimeTmp },
    tMod:{ mySetVal:funcTTimeTmp }
  }
  var TDConstructors={
    url:function(){ var $a=$('<a>').prop({target:"_blank"}),$el=$('<td>').append($a);  $.extend($el[0],TDProt.url);  return $el;  },
    tCreated:function(){ var $el=$('<td>');  $.extend($el[0],TDProt.tCreated);  return $el;  },
    tLastAccess:function(){ var $el=$('<td>');  $.extend($el[0],TDProt.tLastAccess);  return $el;  },
    tMod:function(){ var $el=$('<td>');  $.extend($el[0],TDProt.tMod);  return $el;  }
  }
  $el.myAdd=function(r){
    var $Td=$([]);  for(var i=0;i<StrCol.length;i++) { 
      var name=StrCol[i], val=r[name], $td; if(name in TDConstructors) {$td=new TDConstructors[name](); }   else $td=$('<td>');   $Td.push($td.attr('name',name));
      if('mySetVal' in $td[0]) { $td[0].mySetVal(val, r);}   else $td.append(val);
      if('mySetSortVal' in $td[0]) { $td[0].mySetSortVal(val);}   else $td.data('valSort',val);
    }
    var $buttEdit=$('<button>').attr('name','buttonEdit').append('Edit').click(function(){
      $redirectSetPop.openFunc.call(this,1,1);
    });
    var $buttCopy=$('<button>').attr('name','buttonCopy').append('Copy').click(function(){
      $redirectSetPop.openFunc.call(this,0,1);
    });
    var $buttDelete=$('<button>').attr('name','buttonDelete').css({'margin-right':'0.2em'}).append($imgDelete.clone()).click($redirectDeletePop.openFunc);
    var $tEdit=$('<td>').append($buttEdit), $tCopy=$('<td>').append($buttCopy), $tDelete=$('<td>').append($buttDelete); 
    var $r=$('<tr>').append($Td, $tEdit, $tCopy, $tDelete); $r.attr({idSite:r.idSite,pageName:r.pageName}).data('r',r);
    $tbody.append($r); 
    $el.nRowVisible=$tbody.children('tr').length;
    return $el;
  }
  $el.myRemove=function($r){
    $r.remove();  
    $el.nRowVisible=$tbody.children('tr').length;
    return $el; 
  }
  $el.myEdit=function(r){
    var $r=$tbody.children('[idSite='+r.idSiteOld+'][pageName='+r.pageNameOld+']');
    $r.attr({idSite:r.idSite,pageName:r.pageName}).data('r',r);
    for(var i=0;i<StrCol.length;i++) { var name=StrCol[i], val=r[name], $td=$r.children('td:eq('+i+')'); if($td[0].mySetVal) $td[0].mySetVal(val); else $td.text(val); }
    return $el;
  }
  $el.setUp=function(){
    if($el.boStale) {
      var vec=[['siteTabGet',1,setUpRetA], ['redirectTabGet',1,setUpRetB]];   majax(oAJAX,vec);
      $el.boStale=0;
    }
  }
  var setUpRetA=function(data){
    $el.siteTab=data.tab||[];
    var StrCol=data.StrCol;
    $el.indexSiteTabById={};
    for(var i=0; i<$el.siteTab.length; i++) {
      var r={}; for(var j=0;j<StrCol.length;j++){ r[StrCol[j]]=$el.siteTab[i][j];}
      $el.siteTab[i]=r;
      $el.indexSiteTabById[r.idSite]=r;
      if(r.boDefault) $el.idSiteDefault=r.idSite;
    }
  }
  var setUpRetB=function(data){
    var tab=data.tab||[];
    var StrCol=data.StrCol; var nEntry=data.nEntry;
    $tbody.empty(); 
    for(var i=0;i<tab.length;i++) {  
      var r={}; for(var j=0;j<StrCol.length;j++){ r[StrCol[j]]=tab[i][j];}
      $el.myAdd(r);      
    }
    var plurEnding=nEntry==1?'y':'ies'; setMess('Got '+nEntry+' entr'+plurEnding,3);
    $el.nRowVisible=tab.length;
  }
  $el.boStale=1;

  var $tbody=$el.$tbody=$("<tbody>");
  $el.$table=$("<table>").append($tbody); //.css({width:'100%',position:'relative'});
  $el.$divCont=$("<div>").append($el.$table).css({'margin':'1em auto','text-align':'left',display:'inline-block'});

  var StrCol=['siteName','pageName','url', 'tCreated', 'tMod', 'nAccess', 'tLastAccess'], BoAscDefault={tCreated:0};
  var Label={tCreated:'Age'};
  var $thead=headExtend($('<thead>'),$el,StrCol,BoAscDefault,Label);
  $thead.css({background:'white', width:'inherit'});  //,height:'calc(12px + 1.2em)'
  $el.$table.prepend($thead);
  $el.nRowVisible=0;

  var $imgDelete=$imgProt.clone().prop({src:uDelete});
      // menuA
  var $buttonAdd=$("<button>").append('Add').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(function(){
    $redirectSetPop.openFunc.call({},0,0);
    //$redirectSetPop.openFunc.call({boButtonIns:1});
  });
  var $buttonClearNAccess=$("<button>").append('Clear nAccess').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(function(){
    var vec=[['redirectTabResetNAccess', {}, function(){$el.boStale=1; $el.setUp();}]];   majax(oAJAX,vec);
  });
  var $spanLabel=$('<span>').append('Redirect').css({'float':'right',margin:'0.2em 0 0 0'});  
  var $menuA=$('<div>').append($buttonAdd,$buttonClearNAccess,$spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'}); 

  $el.addClass('redirectTab');
  $el.$fixedDiv=$('<div>').append($menuA).css(cssFixed);
  $el.css({'text-align':'center'});
  $el.append($el.$divCont, $el.$fixedDiv);
  return $el;
}


siteSetPopExtend=function($el){
"use strict"
  $el.toString=function(){return 'siteSetPop';}
  var save=function(){ 
    r.boTLS=Number($selBoTLS.val());
    r.siteName=$inpName.val(); if(r.siteName.length==0){ setMess('empty siteName',2);  return;}
    r.www=$inpWWW.val();  if(r.www.length==0){ setMess('empty www',2);  return;}
    r.googleAnalyticsTrackingID=$inpGog.val();
    r.urlIcon16=$inpURLIcon16.val();
    r.urlIcon200=$inpURLIcon200.val();
    var objTmp=$.extend({boUpd:boUpd},r);
    var vec=[['siteTabSet', objTmp, saveRet]];   majax(oAJAX,vec);
  }
  var saveRet=function(data){
    if(!data.boOK) return;
    var idSiteOld=r.idSite; r.idSite=data.idSite;
    if(boUpd) { $siteTab.myEdit(idSiteOld, r); } //r.idSite=idSite;
    else {r.tCreated=unixNow(); $siteTab.myAdd(r); }    
    //$siteTab.setUp();
    doHistBack();
  }
  $el.setUp=function(){
    if(typeof r.boTLS=='undefined') r.boTLS=0;
    $selBoTLS.val(Number(r.boTLS)); $inpName.val(r.siteName); $inpWWW.val(r.www); $inpGog.val(r.googleAnalyticsTrackingID); $inpURLIcon16.val(r.urlIcon16); $inpURLIcon200.val(r.urlIcon200);
    $inpName.focus();  return true;
  }
  $el.openFunc=function(boUpdT,boGotData){
    boUpd=boUpdT;
    if(boGotData){
      var $r=$(this).parent().parent();
      r=$r.data('r');
    } else {r=rDefault;}
    if(!boUpd) r.boDefault=0;
    doHistPush({$view:$siteSetPop});
    $el.setVis();
    $el.setUp();
  }
  $el.setVis=function(){
    $el.show(); return 1;
  }
 
  var rDefault={idSite:'', siteName:'', www:'', googleAnalyticsTrackingID:'', urlIcon16:'', urlIcon200:''};
  var boUpd, r; 
  var $selBoTLS=$('<select><option value=0 selected>http</option><option value=1>https</option></select>').css({display:'block'}); 
  var $labName=$('<b>').append('Name (used as prefix when backing up...)');
  var $inpName=$('<input type=text>');
  var $imgHWWW=$imgHelp.clone().css({margin:'0em 1em'}); popupHoverM($imgHWWW,$('<div>').html('<p>Ex:<p>www.example.com<p>127.0.0.1:5000<p>localhost:5000'));
  var $labWWW=$('<b>').append('www', $imgHWWW);
  var $inpWWW=$('<input type=text>');
  var $labGog=$('<b>').append('googleAnalyticsTrackingID');
  var $inpGog=$('<input type=text>');
  var $labURLIcon16=$('<b>').append('urlIcon16');
  var $inpURLIcon16=$('<input type=text>');
  var $labURLIcon200=$('<b>').append('urlIcon200');
  var $inpURLIcon200=$('<input type=text>');
 
  var $Lab=$([]).push($labName, $labWWW, $labGog, $labURLIcon16, $labURLIcon200).css({'margin-right':'0.5em'});
  var $Inp=$([]).push($inpName, $inpWWW, $inpGog, $inpURLIcon16, $inpURLIcon200).css({display:'block',width:'100%'}).keypress( function(e){ if(e.which==13) {save();return false;}} );
  var $inpNLab=$([]).push($selBoTLS, $labName, $inpName, $labWWW, $inpWWW, $labGog, $inpGog, $labURLIcon16, $inpURLIcon16, $labURLIcon200, $inpURLIcon200);

  //var $buttonCancel=$('<button>').append('Cancel').click(doHistBack).css({'margin-top':'1em'});
  var $buttonSave=$('<button>').append('Save').click(save).css({'margin-top':'1em'});
  var $divBottom=$('<div>').append($buttonSave);  //$buttonCancel,

  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').addClass("Center").append($inpNLab,$divBottom).css({height:'24em', 'min-width':'17em','max-width':'30em', padding: '1.2em 0.5em 1.2em 1.2em'}); 
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); 
   
  return $el;
}

siteDeletePopExtend=function($el){
"use strict"
  $el.toString=function(){return 'siteDeletePop';}
  var $ok=$('<button>').html('OK').css({'margin-top':'1em'}).click(function(){    
    var vec=[['siteTabDelete',{siteName:siteName},okRet]];   majax(oAJAX,vec);    
  });
  var okRet=function(data){
    if(!data.boOK) return;
    $siteTab.myRemove($r);
    doHistBack();
  }
  $el.openFunc=function(){
    $r=$(this).parent().parent(); siteName=$r.data('r').siteName; $spanSite.text(siteName);
    doHistPush({$view:$siteDeletePop});
    $el.setVis();
    $ok.focus();
  }
  $el.setVis=function(){
    $el.show(); return 1;
  }
 
  var $r, siteName;
  var $head=$('<h3>').append('Delete');
  var $spanSite=$('<span>');//.css({'font-weight': 'bold'});
  var $p=$('<div>').append($spanSite);
  //var $cancel=$('<button>').html("Cancel").click(doHistBack).css({'margin-top':'1em'});

  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').addClass("Center").append($head,$p,$ok).css({height:'10em', 'min-width':'17em','max-width':'25em', padding:'0.1em'});  //,$cancel
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); 
 
  return $el;
}

siteTabExtend=function($el){
"use strict"
  $el.toString=function(){return 'siteTab';}

  var TDProt={
    boDefault:{
      mySetVal:function(boOn){  var $td=$(this), $b=$td.children(), strCol=''; if(boOn) strCol='green'; $b.css('background',strCol);  }
    },
    boTLS:{
      mySetVal:function(boOn){  $(this).text(boOn?'s':'');  }
    },
    www:{
      mySetVal:function(strText){
        var $td=$(this), strS=Number($td.parent().data('r').boTLS)?'s':'', $a=$td.children().prop('href','http'+strS+'://'+strText).text(strText);
      }
    },
    tCreated:{
      mySetVal:function(tCreated){      var $td=$(this), arrT=getSuitableTimeUnit(unixNow()-tCreated);  $td.text(Math.round(arrT[0])+arrT[1]);  }
    },
    urlIcon16:{
      mySetVal:function(url){      $(this).children().prop({src:url, title:url});    }
    },
    urlIcon200:{
      mySetVal:function(url){      $(this).children().prop({src:url, title:url});   }
    }
  }
  var TDConstructors={
    boDefault:function(){ var $b=$('<button>').css('width','1.2em').click(setDefault), $el=$('<td>').css('text-align','center').append($b);  $.extend($el[0],TDProt.boDefault);  return $el;  },
    boTLS:function(){ var $el=$('<td>'); $.extend($el[0],TDProt.boTLS);  return $el;  },
    www:function(){ var $a=$('<a>').prop({target:"_blank"}),  $el=$('<td>').append($a);  $.extend($el[0],TDProt.www);  return $el;  },
    tCreated:function(){ var $el=$('<td>');  $.extend($el[0],TDProt.tCreated);  return $el;  },
    urlIcon16:function(){ var $i=$('<img>').css({'vertical-align':'middle'}), $el=$('<td>').append($i); $.extend($el[0],TDProt.urlIcon16);  return $el;  },
    urlIcon200:function(){ var $i=$('<img>').css({'vertical-align':'middle', 'max-width':'50px', 'max-height':'50px'}), $el=$('<td>').append($i); $.extend($el[0],TDProt.urlIcon200);  return $el;  }
  }
  $el.myAdd=function(r){
    var $r=$('<tr>'); $r.attr({idSite:r.idSite}).data('r',r);
    for(var i=0;i<StrCol.length;i++) { 
      var name=StrCol[i], val=r[name], $td; if(name in TDConstructors) {$td=new TDConstructors[name](); }   else $td=$('<td>');   $r.append($td.attr('name',name));
      if('mySetVal' in $td[0]) { $td[0].mySetVal(val);}   else $td.append(val);
      if('mySetSortVal' in $td[0]) { $td[0].mySetSortVal(val);}   else $td.data('valSort',val);
    }
    var $buttEdit=$('<button>').attr('name','buttonEdit').append('Edit').click(function(){
      $siteSetPop.openFunc.call(this,1,1);
    });
    var $buttCopy=$('<button>').attr('name','buttonCopy').append('Copy').click(function(){
      $siteSetPop.openFunc.call(this,0,1);
    });
    var $buttDelete=$('<button>').attr('name','buttonDelete').css({'margin-right':'0.2em'}).append($imgDelete.clone()).click($siteDeletePop.openFunc);
    var $tEdit=$('<td>').append($buttEdit), $tCopy=$('<td>').append($buttCopy), $tDelete=$('<td>').append($buttDelete); 
    $r.append($tEdit, $tCopy, $tDelete);
    $tbody.append($r); 
    $el.nRowVisible=$tbody.children('tr').length;
    return $el;
  }
  $el.myRemove=function($r){
    $r.remove();
    $el.nRowVisible=$tbody.children('tr').length;
    return $el; 
  }
  $el.myEdit=function(idSiteOld, r){
    var $r=$tbody.children('[idSite='+idSiteOld+']');
    $r.attr({idSite:r.idSite});
    for(var i=0;i<StrCol.length;i++) { var name=StrCol[i], val=r[name], $td=$r.children('td:eq('+i+')'); if($td[0].mySetVal) $td[0].mySetVal(val); else $td.text(val); }
    return $el;
  }
  $el.setUp=function(){
    if($el.boStale) {
      var vec=[['siteTabGet',1,setUpRet]];   majax(oAJAX,vec);
      $el.boStale=0;
    }
  }
  var setUpRet=function(data){
    var tab=data.tab||[];
    StrCol=data.StrCol;
    $tbody.empty(); 
    for(var i=0;i<tab.length;i++) {  
      var obj={}; for(var j=0;j<StrCol.length;j++){ obj[StrCol[j]]=tab[i][j];}
      tab[i]=obj;
      //$el.myAdd(idSite, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, tCreated);  
      $el.myAdd(tab[i]);      
    }
    $el.nRowVisible=tab.length;
  }
  var setDefault=function(){
    var $r=$(this).parent().parent(), r=$r.data('r');
    var vec=[['siteTabSetDefault',{idSite:r.idSite},function(){
      var $Row=$tbody.children('tr');
      $Row.each(function(i,el){
        var $rowA=$(this), rA=$rowA.data('r'), idA=rA.idSite;
        var $td=$rowA.children('[name=boDefault]'); $td[0].mySetVal(idA==r.idSite);
      })
    }]];   majax(oAJAX,vec);
  }
  //$el.boRefreshNeeded; // The parent view of this view ($siteTab) should set this to 1
  $el.boStale=1; 
  var StrCol;


  var $tbody=$el.$tbody=$("<tbody>");
  $el.$table=$("<table>").append($tbody); //.css({width:'100%',position:'relative'});
  $el.$divCont=$("<div>").append($el.$table).css({'margin':'1em auto','text-align':'left',display:'inline-block'});

  var StrColHead=['boDefault','secure (TLS)', 'idSite','siteName','www','googleAnalyticsTrackingID','urlIcon16','urlIcon200','tCreated','nPage'], BoAscDefault={boDefault:0,boTLS:0,tCreated:0,nPage:0};
  var Label={boDefault:'Default',siteName:'siteName/prefix', gog:'gog...', tCreated:'Age', nPage:'#page'};
  var $thead=headExtend($('<thead>'),$el,StrColHead,BoAscDefault,Label);
  $thead.css({background:'white', width:'inherit'});  //,height:'calc(12px + 1.2em)'
  $el.$table.prepend($thead);
  $el.nRowVisible=0;


  var $imgDelete=$imgProt.clone().prop({src:uDelete});
      // menuA
  var $buttonAdd=$("<button>").append('Add').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(function(){
    $siteSetPop.openFunc.call({},0,0);
  });
  var $spanLabel=$('<span>').append('SiteTab').css({'float':'right',margin:'0.2em 0 0 0'});  
  var $menuA=$('<div>').append($buttonAdd,$spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'}); //$buttonBack,

  $el.addClass('siteTab');
  $el.$fixedDiv=$('<div>').append($menuA).css(cssFixed);
  $el.css({'text-align':'center'});
  $el.append($el.$divCont, $el.$fixedDiv);
  return $el;
}


majax=function(oAJAX,vecIn){  // Each argument of vecIn is an array: [serverSideFunc, serverSideFuncArg, returnFunc]
"use strict"
  var makeRetF=function(vecT){ return function(data,textStatus,jqXHR){
      var dataArr=data.dataArr;  // Each argument of dataArr is an array, either [argument] or [altFuncArg,altFunc]
      delete data.dataArr;
      beRet(data,textStatus,jqXHR);
      for(var i=0;i<dataArr.length;i++){
        var r=dataArr[i];
        if(r.length==1) {var f=vecT[i][2]; if(f) f(r[0]);} else { window[r[1]].call(window,r[0]);   }
      }
    };
  }

  var oOut=$.extend(true, [], oAJAX);
  if('boFormData' in oAJAX && oAJAX.boFormData){
    var formData=vecIn[0][1]; vecIn[0][1]=0; // First element in vecIn contains the formData object. Rearrange it as "root object" and add the remainder to a property 'vec'
    var vecMod=$.extend(true, [], vecIn);
    for(var i=0; i<vecMod.length; i++){delete vecMod[i][2];}
    vecMod.push(['page',queredPage],['tMod',tMod],['CSRFCode',CSRFCode]);  
    oOut.data=formData; oOut.data.append('vec', JSON.stringify(vecMod));
  }else{
    var vecMod=$.extend(true, [], vecIn);
    for(var i=0; i<vecMod.length; i++){delete vecMod[i][2];}
    vecMod.push(['page',queredPage],['tMod',tMod]);
    if(oAJAX!==oAJAXCacheable){   vecMod.push(['CSRFCode',CSRFCode]);   }  
    oOut.data=JSON.stringify(vecMod);
  }
  oOut.success=makeRetF(vecIn);    $.ajax(oOut);
  $busyLarge.show();
}


beRet=function(data,textStatus,jqXHR){
"use strict"
  if(typeof jqXHR!='undefined') var tmp=jqXHR.responseText;
  for(var key in data){
    window[key].call(this,data[key]); 
  }
  $busyLarge.hide();
}

GRet=function(data){
"use strict"
  var tmp;
  tmp=data.boALoggedIn;   if(typeof tmp!="undefined") boALoggedIn=tmp;
  tmp=data.boVLoggedIn;   if(typeof tmp!="undefined") { boVLoggedIn=tmp;  }
  //tmp=data.idPage;   if(typeof tmp!="undefined") { idPage=tmp;  }
  tmp=data.objRev;   if(typeof tmp!="undefined") {
    objRev=tmp; 
    tMod=objRev.tMod; $editDiv.$spanLastMod.html(mySwedDate(tMod));
  }
  //tmp=data.tMod;   if(typeof tmp!="undefined") { tMod=tmp; $editDiv.$spanLastMod.html(mySwedDate(tMod)); }
  tmp=data.objPage;   if(typeof tmp!="undefined") {
    overwriteProperties(objPage, tmp);
    //objPage=tmp; 
    $editButton.setImg(objPage.boOW);  $editDiv.$spanSave.toggle(Boolean(objPage.boOW));
    $adminMoreDiv.setMod();
  }
  $spanMod.setup(objPage);
  $pageView.setFixedDivColor(objPage.boOR);

  tmp=data.arrVersionCompared;   if(typeof tmp!="undefined") arrVersionCompared=tmp;

  tmp=data.matVersion;   if(typeof tmp!='undefined') {  nVersion=tmp.length;  matVersion=tmp; $versionTable.setTable(); $pageView.setDetail(); }

  tmp=data.strDiffText;   if(typeof tmp!="undefined") {$diffDiv.setUp(tmp);  }  
  tmp=data.strHtmlText;   if(typeof tmp!="undefined") {$pageText.html(tmp); $pageText.modStuff();}
  tmp=data.strEditText;   if(typeof tmp!="undefined") $editText.val(tmp);
  //tmp=data.templateHtml;   if(typeof tmp!="undefined") $templateList.empty().append(tmp);
  tmp=data.objTemplateE;   if(typeof tmp!="undefined") $templateList.setUp(tmp);
  tmp=data.strMessageText;   if(typeof tmp!="undefined") setMess(tmp,15);
  tmp=data.boTalkExist;   if(typeof tmp!="undefined") $commentButton.setUp(tmp);
  //tmp=data.strMessageText;   if(typeof tmp!="undefined") setMess(tmp,5);
  tmp=data.CSRFCode;   if(typeof tmp!="undefined") CSRFCode=tmp;
  $viewDiv.toggle(Boolean(boVLoggedIn || objPage.boOR));
  $vLoginDiv.myToggle(!Boolean(boVLoggedIn || objPage.boOR));  

  //$adminButton.setStat();
  $adminDiv.setAdminStat();

  
  if(timerALogout) { clearTimeout(timerALogout); }
  timerALogout=setTimeout(function(){
    boALoggedIn=0; //histGoTo('adminDiv');
    $adminDiv.setAdminStat();
  },maxAdminUnactivityTime*1000);
  
}




timerALogout=null;

langHtml={
  histsRem:'trunc',
  All:'All',
  None:'None'
};
langHtml.label={
parent:'Parent name',
size:'Size',
boOR:'Public read access',
boOW:'Public write access',
boSiteMap:'On sitemap',
boTalk:'Talk page',
boTemplate:'Template',
boOther:'Supplied by user',
tMod:'Modification age',
tModCache:'Cache age',
tCreated:'Created'
}
helpBub={}

setUp1=function(){


  $body=$('body');  $html=$('html');
  $bodyNHtml=$body.add($html);  
  $body.css({margin:'0px'});
  $document=$(document);
  $window=$(window);
  
  boTouch = Boolean('ontouchstart' in document.documentElement);
  //boTouch=1;

  $boLCacheObs=$('#boLCacheObs'); if($boLCacheObs.val().length) { $boLCacheObs.val(""); location.reload(); return} //$boLCacheObs.val(1);

  browser=getBrowser();
  var intBrowserVersion=parseInt(browser.version.slice(0, 2));


  var ua=navigator.userAgent, uaLC = ua.toLowerCase(); //alert(ua);
  boAndroid = uaLC.indexOf("android") > -1;
  boFF = uaLC.indexOf("firefox") > -1; 
  //boIE = uaLC.indexOf("msie") > -1; 
  versionIE=detectIE();
  boIE=versionIE>0; if(boIE) browser.brand='msie';

  boChrome= /chrome/i.test(uaLC);
  boIOS= /iPhone|iPad|iPod/i.test(uaLC);
  boEpiphany=/epiphany/.test(uaLC);    if(boEpiphany && !boAndroid) boTouch=false;  // Ugly workaround

  boOpera=RegExp('OPR\\/').test(ua); if(boOpera) boChrome=false; //alert(ua);



  boSmallAndroid=0;
  
  if(boTouch){
    if(boIOS) {      } 
    else {
      //var h=screen.height, w=screen.width;
      var h=window.innerHeight, w=window.innerWidth;
      //alert(window.devicePixelRatio+' '+ screen.height+' '+screen.width);
      if(boTouch && h*w>230400) $body.css({'font-size':'120%'}); // between 320*480=153600 and 480*640=307200
      if(boTouch && h*w<115200) { $body.css({'font-size':'85%'}); boSmallAndroid=1;} // between 240*320=76800 and 320*480=153600
    }
  } 

  if(boIOS  || boIE) charBackSymbol='◄'; else charBackSymbol='◀';
  strFastBackSymbol=charBackSymbol+charBackSymbol;
  charFlash='⚡';//⚡↯
  charPublicRead='͡°'; //☉͡°
  charPublicRead='<span style="font-family:courier">͡°</span>'; //☉͡°
  charPublicRead='<span class=eye>(∘)</span>'; //☉͡° ·
  charPublicRead='👀&#xFE0E;'; //☉͡° ·
  charPublicRead='r'; //☉͡° ·
  charPublicWrite='✎&#xFE0E;'; //✎
  charPublicWrite='w'; //✎
  charPromote='&#1f62e;&#10006;';  //😱😭😮&#xFE0E;
  charPromote='📣&#xFE0E;';  //😱😭😮&#xFE0E;
  charPromote='p';  //😱😭😮&#xFE0E;
  charDelete='✖'; //x, ❌, X, ✕, ☓, ✖, ✗, ✘
  charLink='☞'; //☞🔗
  charThumbsUp='☝'; //👍☝
  charThumbsDown='☟'; //👎☟
  charSpeechBaloon='💬'; //💬
  charCamera='📷'; //📷
  
  // ♿⚠⌂☞
  
  //cssEye={'font-family':'courier', 'font-size':'90%', 'letter-spacing':'-.5em', transform:'rotate(90deg)', display:'inline-block','vertical-align':'.4em'}
  
  //boHistPushOK='pushState' in history && 'state' in history;
  boHistPushOK='pushState' in history;
  if(!boHistPushOK) { console.log('This browser does not support history'); return;}
  boStateInHistory='state' in history;
  if(!boStateInHistory) { console.log('This browser does not support history.state'); return;}


  boIsGeneratorSupported=isGeneratorSupported();
  boFormDataOK=1;  if(typeof FormData=='undefined') {  boFormDataOK=0;  }

  //if(boIE && intBrowserVersion<10) return;

  if(!(typeof sessionStorage=='object' && sessionStorage.getItem)) {console.log("Your browser doesn't support sessionStorage"); return;}

  menuMaxWidth=500;
  boImgCreationOK=1;


  urlPayPal='https://www.paypal.com/cgi-bin/webscr';

  iEdit=0, iPay=1, iVersion=2;
  colButtonOn='#aaa'; colButtonOff='#eee'; 
  cssFixedTop={margin:'0em 0','text-align':'center',position:'fixed',top:0,width:'100%','border-top':'3px #aaa solid',background:'#fff'}; //,'z-index':5
  cssFixed={margin:'0em 0','text-align':'center',position:'fixed',bottom:0,width:'100%','border-top':'3px #aaa solid',background:'#fff'}; //,'z-index':5
  cssFixedDrag={margin:'0em 0','text-align':'center',position:'fixed',bottom:0,width:'100%',background:'#fff'}; //,'z-index':5
  if(boTouch) cssFixedDrag=cssFixed;
  sizeIcon=1.5; strSizeIcon=sizeIcon+'em';
 


  indexAssign();
  CSRFCode=typeof CSRFCode!=='undefined'?CSRFCode:'';  boVLoggedIn=typeof boVLoggedIn!=='undefined'?boVLoggedIn:'';     boALoggedIn=typeof boALoggedIn!=='undefined'?boALoggedIn:'';
  nVersion=matVersion.length;
  assignCommonJS();
  //assignWWWJS();


  KeyColPage=Object.keys(PropPage);  KeyColImage=Object.keys(PropImage);


  if(typeof objPage=='undefined') objPage={boOR:1, boOW:1, boSiteMap:1, idPage:''}; 
  if(typeof objRev=='undefined') objRev={tMod:0}; 
  tMod=objRev.tMod;

  //colsFlip=array_flip(KeyCol);
  //StrOrderFiltFlip=array_flip(StrOrderFilt);
  var strScheme='http'+(objSite.boTLS?'s':''),    strSchemeLong=strScheme+'://';    uSite=strSchemeLong+objSite.www;
  var strScheme='http'+(objSiteDefault.boTLS?'s':''),    strSchemeLong=strScheme+'://';       uCommon=strSchemeLong+objSiteDefault.www;
  uBE=uSite+"/"+leafBE;
  uCanonical=uSite+'/'+queredPage;
  if(queredPage=='start') uCanonical=uSite;



 

  wcseLibImageFolder='/'+flLibImageFolder+'/';
  uLibImageFolder=uCommon+wcseLibImageFolder;

  //uImCloseW=uLibImageFolder+'triangleRightW.png';
  //uImOpenW=uLibImageFolder+'triangleDownW.png';
  //uImCloseB=uLibImageFolder+'triangleRight.png';
  //uImOpenB=uLibImageFolder+'triangleDown.png';


  uHelpFile=uLibImageFolder+'help.png';

  //uVipp0=uLibImageFolder+'vipp0.png';
  //uVipp1=uLibImageFolder+'vipp1.png';

  //uFB=uLibImageFolder+'fb.png';
  //uFBFacebook=uLibImageFolder+'fbFacebook.png';
  uIncreasing=uLibImageFolder+'increasing.png';
  uDecreasing=uLibImageFolder+'decreasing.png';
  uUnsorted=uLibImageFolder+'unsorted.png';

  //uAnon=uLibImageFolder+'anon.png';
  //uHeart=uLibImageFolder+'heart20.png';
  //uOpenId=uLibImageFolder+'openid-inputicon.gif';
  //uOID22=uLibImageFolder+'oid22.png';
  uBusy=uLibImageFolder+'busy.gif';
  uBusyLarge=uLibImageFolder+'busyLarge.gif';
  uSummary=uLibImageFolder+'summary.png';
  uSignature=uLibImageFolder+'signature.png';

  uPen=uLibImageFolder+'pen.png';
  uPenNot=uLibImageFolder+'penNot.png';
  uBitcoin=uLibImageFolder+'bitcoin.png';
  uAdmin=uLibImageFolder+'admin.png';
  uComment=uLibImageFolder+'comment.png';
  //uSave=uLibImageFolder+'save.png';
  uFlash=uLibImageFolder+'flash.png';
  uFilter=uLibImageFolder+'filter.png';
  //uZoom=uLibImageFolder+'zoom.png';
  urlPaypalButton=uLibImageFolder+"btn_pponly_142x27.png";
  

  uDelete=uLibImageFolder+'delete.png';
  uDelete1=uLibImageFolder+'delete1.png';


  $imgHelp=$('<img>').prop({src:uHelpFile}).css({'vertical-align':'-0.4em'});

  sizeIcon=1.5; strSizeIcon=sizeIcon+'em';
  $imgProt=$('<img>').css({height:strSizeIcon,width:strSizeIcon,'vertical-align':'text-bottom'}); 

  zip.workerScriptsPath = flFoundOnTheInternetFolder+'/';

  

  strHistTitle=queredPage;
  histList=[];
  stateLoaded=history.state; 
  var tmpi=stateLoaded?stateLoaded.ind:0;    stateLoadedNew={hash:randomHash(), ind:tmpi};
  history.replaceState(stateLoadedNew,'',uCanonical);
  stateTrans=stateLoadedNew;
  history.StateMy=[];


  window.addEventListener('popstate', function(event) {
    var dir=history.state.ind-stateTrans.ind;
    if(Math.abs(dir)>1) alert('dir=',dir);
    var boSameHash=history.state.hash==stateTrans.hash;
    if(boSameHash){
      var tmpObj=history.state;
      if('boResetHashCurrent' in history && history.boResetHashCurrent) {
        tmpObj.hash=randomHash();
        history.replaceState(tmpObj,'',uCanonical);
        history.boResetHashCurrent=false;
      }

      var stateMy=history.StateMy[history.state.ind];
      if(typeof stateMy!='object' ) {var tmpStr=window.location.href +" Error: typeof stateMy: "+(typeof stateMy); if(!boEpiphany) alert(tmpStr); else  console.log(tmpStr); return; }
      var $view=stateMy.$view;
      $view.setVis();
      if(typeof $view.getScroll=='function') {
        var scrollT=$view.getScroll();
        setTimeout(function(){$window.scrollTop(scrollT);},1);
      } else {
        //var scrollT=stateMy.scroll;  setTimeout(function(){  $window.scrollTop(scrollT);},1);
      }

      if('funOverRule' in history && history.funOverRule) {history.funOverRule(); history.funOverRule=null;}
      else{
        if('fun' in stateMy && stateMy.fun) {var fun=stateMy.fun(stateMy); }
      }

      stateTrans=$.extend({},tmpObj);
    }else{
      stateTrans=history.state; $.extend(stateTrans,{hash:randomHash()}); history.replaceState(stateTrans,'',uCanonical);
      history.go(sign(dir));
    }
  }); 

  
  if(boFF){
    $(window).on('beforeunload', function(){   });
  } 

  if(!boTouch){
    $(window).on('beforeunload',function(){
      setItem('hEditText',$editText.height()); 
    })
  }

  errorFunc=function(jqXHR, textStatus, errorThrown){
    setMess('responseText: '+jqXHR.responseText+', textStatus: '+' '+textStatus+', errorThrown: '+errorThrown);     throw 'bla';
  }
  //oAJAX={url:uBE, crossDomain:false, contentType:'application/json', error: errorFunc, type: "POST",dataType:'json', processData:false,success: beRet};
  oAJAX={url:uBE, crossDomain:false, contentType:false, error: errorFunc, type: "POST", processData:false,success: beRet};  
  oAJAXCacheable={url:uBE, crossDomain:false, error: errorFunc, type: "GET", dataType:'json', processData:false, success: beRet};


  //versionC.sel=createChildInd(versionC.backSel);
  //versionC.vis=createChildInd(versionC.backVis);    var tmp=createColJIndexNamesObj(versionC.KeyCol); $.extend(versionC,tmp);

  //$top=$('html');  str=$top[0].outerHTML;  alert(str);  

  strClickOutside='Click outside the textarea to get back the buttons';

  $warningDiv=$('<div>').append("The page has unconfirmed changes. Use the buttons below to see older versions.").css({'background':'yellow','padding':'0.2em','text-align':'center','font-weight':'bold','font-size':'0.9em'}).hide();
  $warningDivW=$('<div>').append($warningDiv);
  
  $viewDiv=$('<div>');
  $pageText=$('#pageText').detach();
  $pageText=pageTextExtend($pageText).css({'overflow-y': 'hidden'});   $pageText.modStuff();
  $imgBusy=$('<img>').prop({src:uBusy});
  $messageText=messExtend($("<span>"));  window.setMess=$messageText.setMess;  window.resetMess=$messageText.resetMess;   $body.append($messageText); 
   
  $busyLarge=$('<img>').prop({src:uBusyLarge}).css({position:'fixed',top:'50%',left:'50%','margin-top':'-42px','margin-left':'-42px','z-index':'1000',border:'black solid 1px'}).hide();
  $body.append($busyLarge);
  //$loginInfo=loginInfoExtend($('<div>')); $body.prepend($loginInfo);
  
  
  //$commentButton=commentButtonExtend($('<a>')).css({'margin-left':'1em'});
  $commentButton=commentButtonExtend($('<span>')).css({'margin-left':''});
  boEditDivVis=getItemS('boEditDivVis');  if(boEditDivVis===null)  boEditDivVis=0;
  $editButton=editButtonExtend($('<button>')).addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(function(){
    doHistPush({$view:$editDiv});
    $editDiv.setVis();
  });
  $spanMod=spanModExtend($('<span>')).css({'margin-right':'0.5em','font-family':'monospace'});

  //$paymentButton=$('<button>').append('Pay/Donate');
  //$versionButton=$('<button>').append('Versions');

  
  $commentButton.setUp(boTalkExist);

  $dragHR=dragHRExtend($('<hr>')); $dragHR.css({height:'0.3em',background:'grey',margin:0});
  if(boTouch) $dragHR="";
  $divReCaptcha=divReCaptchaExtend($('<div>'));
  $editText=editTextExtend($('<textarea>'));

  $pageView=pageViewExtend($('<div>')); 
  $editDiv=editDivExtend($('<div>')).css({width:'100%'}); $editDiv.$spanLastMod.html(mySwedDate(tMod));
  $templateList=templateListExtend($('<div>'));



  $adminDiv=adminDivExtend($('<div>')).css({width:'100%'});  
  $adminDiv.setAdminStat();

  $adminMoreDiv=adminMoreDivExtend($('<div>'));
  $uploadUserDiv=uploadUserDivExtend($('<div>')); //$body.append($uploadUserDiv);
  $pageList=pageListExtend($('<div>'));
  $imageList=imageListExtend($('<div>'));
  
  $renamePop=renamePopExtend($('<div>'));
  $grandParentSelPop=grandParentSelPopExtend($('<div>'));
  $areYouSurePop=areYouSurePopExtend($('<div>'));


  $paymentDiv=paymentDivExtend($('<div>')); 

      //filter colors
  colButtAllOn='#9f9', colButtOn='#0f0', colButtOff='#ddd', colFiltOn='#bfb', colFiltOff='#ddd', colFontOn='#000', colFontOff='#777', colActive='#65c1ff', colStapleOn='#f70', colStapleOff='#bbb';  
  maxStaple=20;

  $.extend(Filt.tmpPrototype,MmmWikiFiltExtention);
  $pageFilterDiv=PageFilterDiv(PropPage, langHtml.label, StrOrderFiltPage, function(){ $pageList.histReplace(-1); $pageList.loadTab();}); 
  $imageFilterDiv=ImageFilterDiv(PropImage, langHtml.label, StrOrderFiltImage, function(){ $imageList.histReplace(-1); $imageList.loadTab();});  



      // apply "plugin changes"
  var StrCompact=['boOR', 'boOW', 'boSiteMap', 'boTalk', 'boTemplate', 'boOther'];
  var tmpRowButtf=function($span,val,boOn){   $span.html(Number(val)?'Yes':'No');   };
  for(var i=0;i<StrCompact.length;i++) {
    var strName=StrCompact[i];
    $.extend(PropPage[strName], {    setRowButtF:tmpRowButtf  });
  }
  $.extend(PropImage.boOther, {    setRowButtF:tmpRowButtf  });

  $pageFilterDiv.createDivs();   
  $imageFilterDiv.createDivs();   



  
  //$editorLoginDiv=loginDivExtend($('<div>'),'editor');
  $vLoginDiv=vLoginDivExtend($('<div>'));


  $versionTable=versionTableExtend($('<div>')).css({'margin-top':'2em','text-align':'center'});   $versionTable.setTable();  $pageView.setDetail();
  $diffDiv=diffDivExtend($('<div>')).css({'text-align':'center'});
  //$versionDiv=$('<div>').append($versionTable,$diffDiv).css({clear:'both'});

  $slideShow=slideShowExtend($('<div>'));

  $redirectSetPop=redirectSetPopExtend($("<div>"));
  $redirectDeletePop=redirectDeletePopExtend($('<div>'));
  $redirectTab=redirectTabExtend($('<div>'));
  $siteSetPop=siteSetPopExtend($("<div>"));
  $siteDeletePop=siteDeletePopExtend($('<div>'));
  $siteTab=siteTabExtend($('<div>'));
  
  $diffBackUpDiv=$('<div>');
  if(boIsGeneratorSupported) {
    $diffBackUpDiv=diffBackUpDivExtend($('<div>'));
  }
  $dumpDiv=dumpDivExtend($('<div>'));
  $tabBUDiv=tabBUDivExtend($('<div>'));

 

  if(typeof StrMainDiv=='undefined') StrMainDiv=[];
  StrMainDiv=['warningDivW', 'pageText', 'pageView', 'adminDiv', 'adminMoreDiv', 'pageList', 'imageList', 'editDiv', 'templateList', 'versionTable', 'diffDiv', 'paymentDiv', 'slideShow', 'pageFilterDiv', 'imageFilterDiv', 'uploadUserDiv', 'renamePop', 'grandParentSelPop', 'areYouSurePop', 'redirectTab', 'redirectSetPop', 'redirectDeletePop', 'siteTab', 'siteSetPop', 'siteDeletePop', 'diffBackUpDiv', 'dumpDiv', 'tabBUDiv'];  //, 'menuDiv'


  MainDiv=[];  for(var i=0;i<StrMainDiv.length;i++){    var key=StrMainDiv[i], $el=window['$'+key];   MainDiv[i]=$el;  };
  $MainDiv=$([]); $MainDiv.push.apply($MainDiv,MainDiv); 

  $MainDiv.hide();
  $viewDiv.append($MainDiv);


  history.StateMy[history.state.ind]={$view:$pageView};

  $bodyHtmlSlide= $bodyNHtml.add($slideShow);
  //$mainDivsTogglable=$editDiv.add($controlDiv).add($paymentDiv).add($versionDiv);
  $mainDivsTogglable=$MainDiv;
  
  $pageView.setVis=function(){
    var $tmp=this;    $tmp.push($warningDivW, $pageText);        $mainDivsTogglable.not($tmp).hide(); $tmp.show();  //if(!boTouch)
    //$pageText.css({'margin-bottom':285+'px'});
    fillScreenF(false);
    return true;
  }
  $adminDiv.setVis=function(){
    var $tmp=this;    $tmp.push($pageText);        $mainDivsTogglable.not($tmp).hide(); $tmp.show();  //if(!boTouch)
    $tmp.setUp();
    $pageText.css({'margin-bottom':285+'px'});  
    fillScreenF(false);
    return true;
  }
  $adminMoreDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $tmp.setUp();
    $tmp.$divCont.css({'margin-bottom':285+'px'});
    fillScreenF(false); $redirectTab.boStale=1; $siteTab.boStale=1;
    return true; 
  }
  $pageList.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $tmp.setCBStat(0); 
    $tmp.$divCont.css({'margin-bottom':285+'px'});
    fillScreenF(false);
    return true;
  }
  $imageList.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    //$tmp.setCBStat(0);
    $tmp.$divCont.css({'margin-bottom':285+'px'});
    fillScreenF(false);
    return true;
  }
  
  $editDiv.setVis=function(){
    var $tmp=this;    $tmp.push($pageText);        $mainDivsTogglable.not($tmp).hide(); $tmp.show();   //if(!boTouch)
    $pageText.css({'margin-bottom':285+'px'});
    fillScreenF(false);
    $tmp.setUp();
  }
  $templateList.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $pageText.css({'margin-bottom':285+'px'});
    fillScreenF(false);
    return true;
  }

  $versionTable.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $tmp.$table.css({'margin-bottom':285+'px'});
    fillScreenF(false);
    return true;
  }
  $diffDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $tmp.$divCont.css({'margin-bottom':285+'px'});
    fillScreenF(false);
    return true;
  }
  $paymentDiv.setVis=function(){
    var $tmp=this;  $tmp.push($pageText);    $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $pageText.css({'margin-bottom':285+'px'});
    fillScreenF(false);
  }
  $slideShow.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    fillScreenF(true);
  } 
/*
  $menuDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    fillScreenF(false);
    return true;
  }
*/
  $pageFilterDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();   return true;
  }
  $imageFilterDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();   return true;
  }
  $diffBackUpDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();   return true;
  }
  $dumpDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();   return true;
  }
  $tabBUDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();   return true;
  }
  $redirectTab.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $tmp.setUp();
    fillScreenF(false);
    return true;
  }
  $siteTab.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $tmp.setUp();
    fillScreenF(false); $redirectTab.boStale=1;
    return true;
  }
  fillScreenF=function(boFill){    
    if(boIOS) $bodyHtmlSlide.toggleClass('fillScreen',boFill);
    //$bodyNHtml.toggleClass('fillScreen',boFill);
  }
  
  
  var setScroll=function(x){ $pageText.intScroll=x;}
  var getScroll=function(){ return $pageText.intScroll;}
  $pageView.setScroll=$adminDiv.setScroll=$editDiv.setScroll=$paymentDiv.setScroll=setScroll;
  $pageView.getScroll=$adminDiv.getScroll=$editDiv.getScroll=$paymentDiv.getScroll=getScroll;
  

  $body.append($viewDiv,$vLoginDiv);
  

  //$controlDiv.setVis(boEditDivVis);
  

  $editText.val(strEditText);  $templateList.setUp(objTemplateE);  
  

  $editButton.setImg(objPage.boOW);
  $spanMod.setup(objPage);
  $pageView.setFixedDivColor(objPage.boOR);
  
  $editDiv.$spanSave.toggle(Boolean(objPage.boOW));

  boMakeFirstScroll=1;
  //if(!boChrome) 
  $pageView.setVis();
  if(objPage.boOR==0) { 
    $viewDiv.hide();
    if(boVLoggedIn){ 
      $vLoginDiv.hide();
      var vec=[['pageLoad',1]];   majax(oAJAXCacheable,vec);
    } 
    else {    $vLoginDiv.myToggle(true);  }   
  } else {  
    $vLoginDiv.hide();
    var vec=[['specSetup',1]];   majax(oAJAX,vec);  
  } 
  
  var $fixedDivsCoveringPageText=$pageView.$fixedDiv.add($editDiv.$fixedDiv).add($adminDiv.$fixedDiv).add($paymentDiv.$fixedDiv);
  setBottomMargin=function() { // This is not very beautiful. But how should one else make a fixed div at the bottom without hiding the bottom of the scrollable content behind??
    if($pageText.is(':visible')){
      var $tmp=$fixedDivsCoveringPageText.filter(":visible"); $pageText.css({'margin-bottom':$tmp.height()+'px'});
    }
    else if($versionTable.$table.is(':visible')){$versionTable.$table.css({'margin-bottom':$versionTable.$fixedDiv.height()+'px'});}
    else if($diffDiv.$divCont.is(':visible')){$diffDiv.$divCont.css({'margin-bottom':$diffDiv.$fixedDiv.height()+'px'});}
    else if($pageList.$divCont.is(':visible')){
      $pageList.$divCont.css({'margin-bottom':$pageList.$fixedDiv.height()+'px'});
      $pageList.$divCont.css({'margin-top':$pageList.$fixedTop.height()+'px'});
    }
    else if($imageList.$divCont.is(':visible')){
      $imageList.$divCont.css({'margin-bottom':$imageList.$fixedDiv.height()+'px'});
      $imageList.$divCont.css({'margin-top':$imageList.$fixedTop.height()+'px'});
    }
    else if($redirectTab.$divCont.is(':visible')){$redirectTab.$divCont.css({'margin-bottom':$redirectTab.$fixedDiv.height()+'px'});}
    else if($siteTab.$divCont.is(':visible')){$siteTab.$divCont.css({'margin-bottom':$siteTab.$fixedDiv.height()+'px'});}
    //else if($menuDiv.$divCont.is(':visible')){$menuDiv.$divCont.css({'margin-bottom':$menuDiv.$fixedDiv.height()+'px'});}
    else if($pageFilterDiv.$divCont.is(':visible')){$pageFilterDiv.$divCont.css({'margin-bottom':$pageFilterDiv.$fixedDiv.height()+'px'});}
    else if($imageFilterDiv.$divCont.is(':visible')){$imageFilterDiv.$divCont.css({'margin-bottom':$imageFilterDiv.$fixedDiv.height()+'px'});}
    else if($adminMoreDiv.$divCont.is(':visible')){$adminMoreDiv.$divCont.css({'margin-bottom':$adminMoreDiv.$fixedDiv.height()+'px'});}
  }
  if(boFF) window.addEventListener("DOMMouseScroll", setBottomMargin, false); else   $(window).bind('mousewheel', setBottomMargin);
  $(window).scroll(setBottomMargin);
  $body.click(setBottomMargin);


  $(window).scroll(function(){ 
    var stateMy=history.StateMy[history.state.ind];
    var $view=stateMy.$view;
    var scrollT=$window.scrollTop(); 
    if('boFirstScroll' in history && history.boFirstScroll){
    //if(false){
      history.boFirstScroll=false;
      if(typeof $view.getScroll=='function') {
        var scrollT=$view.getScroll();
        setTimeout(function(){
          $window.scrollTop(scrollT);},1);
      } else {
        //var scrollT=stateMy.scroll;  setTimeout(function(){  $window.scrollTop(scrollT);},1);
      }      
    } else {
      if(typeof $view.setScroll=='function') $view.setScroll(scrollT); else stateMy.scroll=scrollT;  //$view.intScroll=scrollT;
    }    
  });

}



//window.onload=function(){  setUp1(); };
$(function(){  setUp1(); });

})();



