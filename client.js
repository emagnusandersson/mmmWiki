


//🗝 👵👴👶🌳🌲

"use strict"
const funLoad=async function(){
console.log('load');
var MmmWikiFiltExtention={
  setSingleParent:function(idParent){
    var tmpFilt=this[this.iParent]; array_mergeM(tmpFilt[0],tmpFilt[1]); var ind=tmpFilt[0].indexOf(idParent); if(ind!=-1)  mySplice1(tmpFilt[0],ind);  tmpFilt[1]=[idParent]; tmpFilt[2]=1;
  },
  checkIfSingleParent:function(){
    var tmpFilt=this[this.iParent]; return (tmpFilt[1].length==1 && tmpFilt[2]==1);
  },
  getParentsOn:function(){
    var tmpFilt=this[this.iParent];  return tmpFilt[1];
  },
  getParentsOff:function(){
    var tmpFilt=this[this.iParent];  return tmpFilt[0];
  },
  getNParentsOn:function(){
    var tmpFilt=this[this.iParent];  return tmpFilt[1].length;
  },
  getNParentsOff:function(){
    var tmpFilt=this[this.iParent];  return tmpFilt[0].length;
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
    var tmpFilt=this[this.iSiteName]; array_mergeM(tmpFilt[0],tmpFilt[1]); var ind=tmpFilt[0].indexOf(siteName); if(ind!=-1)  mySplice1(tmpFilt[0],ind);  tmpFilt[1]=[siteName]; tmpFilt[2]=1;
  }
}


  //
  // History stuff
  //

app.histGoTo=function(view){}
app.historyBack=function(){  history.back();}
app.doHistPush=function(obj){
    // Set "scroll" of stateNew  (If the scrollable div is already visible)
  var view=obj.view;
  var scrollT=window.scrollTop();
  if(typeof view.setScroll=='function') view.setScroll(scrollT); else history.StateMy[history.state.ind].scroll=scrollT;  //view.intScroll=scrollT;

  if((boChrome || boOpera) && !boTouch)  history.boFirstScroll=true;

  var indNew=history.state.ind+1;
  stateTrans={hash:history.state.hash, ind:indNew};  // Should be called stateLast perhaps
  stateTrans={hash:history.state.hash, ind:indNew, f:(function(a){console.log('hello: '+a);}).toString()};  // Should be called stateLast perhaps
  history.pushState(stateTrans, strHistTitle, uCanonical);
  history.StateMy=history.StateMy.slice(0, indNew);
  obj.tDate=new Date();
  history.StateMy[indNew]=obj;
}
app.doHistReplace=function(obj, indDiff=0){
  obj.tDate=new Date();
  history.StateMy[history.state.ind+indDiff]=obj;
}
//app.changeHist=function(obj){
  //obj.tDate=new Date();
  //history.StateMy[history.state.ind]=obj;
//}
app.getHistStatName=function(){
  return history.StateMy[history.state.ind].view.toString();
}
history.distToGoal=function(viewGoal){
  var ind=history.state.ind;
  var indGoal;
  for(var i=ind; i>=0; i--){
    var obj=history.StateMy[i];
    var view; if(typeof obj=='object') view=obj.view; else continue;
    if(view===viewGoal) {indGoal=i; break;}
  }
  var dist; if(typeof indGoal!='undefined') dist=indGoal-ind;
  return dist;
}
history.fastBack=function(viewGoal, boRefreshHash){
  var dist=history.distToGoal(viewGoal);
  if(dist) {
    if(typeof boRefreshHash!='undefined') history.boResetHashCurrent=boRefreshHash;
    history.go(dist);
  }
}


  //
  // divReCaptchaExtend
  //

var divReCaptchaExtend=function(el){
  el.loadScript=function(){
    var scriptRecaptcha=createElement("script").prop({src:uRecaptcha});
    document.head.myAppend(scriptRecaptcha);
  }
  el.setUp=function(){
    //if(boDbg) return;
    if(typeof grecaptcha=='undefined') {const tmp="typeof grecaptcha=='undefined'"; setMess(tmp); console.log(tmp); return; }
    if(!('render' in grecaptcha)) {const tmp="!('render' in grecaptcha)"; setMess(tmp); console.log(tmp); return; }
    if(el.children.length==0){    grecaptcha.render(el, {sitekey:strReCaptchaSiteKey});    } else grecaptcha.reset();
  }
  el.isLoaded=function(){
    if(typeof grecaptcha=='undefined' || !('render' in grecaptcha)) { return false; } return true;
  }
  el.addClass("g-recaptcha");
  
  return el;
}


var commentButtonExtend=function(el){
  el.setUp=function(boTalkExist){
    if(boTalkExist) {
      a.css({color:""}); if(a.prop('rel')) a.prop({rel:''});
    } else a.css({color:"#ee0000"}).prop({rel:'nofollow'});
  } 
  var matches=objPage.pageName.match(/^ *(talk:|template:|template_talk:|) *(.*)/)
  var kind=matches[1].replace(/:/,'');
  var _page=matches[2].replace(/ /,'_');
  //elBody.css({'line-height':'100%'});
  var url='',boShallHave=0;
  if(kind=='template') { url=uSite+'/template_talk:'+_page; boShallHave=1; }
  else if(kind=='') { url=uSite+'/talk:'+_page; boShallHave=1;}
  
  var a=createElement('a').prop({href:url});

  if(boSmallAndroid){
    
    var tmpImg=createElement('img').prop({src:uComment, alt:"comment"}).css({display:'inline-block',height:'1em',width:'1em',position:'absolute',left:'0em',top:'0em',border:'0px'});
    a.myAppend("██",tmpImg).css({'font-size':'1.5em',position:'absolute',left:'0em',top:'0em'});  //██⬛
    //var divAbs=createElement('div').myAppend(a).css({position:'relative',display:'inline-block',height:'1.6em',width:'1.6em','vertical-align':'baseline',top:'0em'});
    el.myAppend(a).css({position:'relative',display:'inline-block',height:'1.5em',width:'1.5em',overflow:'hidden','vertical-align':'baseline',cursor:'pointer'});
    el.on('click',function(){window.location.assign(url)});
    
/*
    var strSpeechBubble="💬";
    a.myText(strSpeechBubble);
    el.myAppend(a).css({'font-size':'0.88em','vertical-align':'text-bottom','line-height':strSizeIcon,'display':'inline-block'});
*/
  }else {
    a.myText('Comments');
    el.myAppend(a).css({'font-size':'0.88em','vertical-align':'text-bottom','line-height':strSizeIcon,'display':'inline-block'});
  }
  el.toggle(Boolean(boShallHave));
  //if(boShallHave) el.css({display:''}); else {el.hide(); }  //el.show(); // el.show() => display:block in Firefox !!!!!
  return el;
}

var aRLoginDivExtend=function(el){
  var vPassF=async function(){  
    //var tmp=SHA1(aRPass.value+strSalt);
    if(typeof SHA1 == 'undefined') { setMess(strSha1NotLoaded); return;}
    var data=aRPass.value+strSalt; for(var i=0;i<nHash;i++) data=SHA1(data);
    //var data=aRPass.value+strSalt; for(var i=0;i<nHash;i++) data=Sha256.hash(data);
    if(data.substr(0,2)!=aRPasswordStart) {setMess('Wrong pw'); return;}
    var vec=[['aRLogin',{pass:data}]];   await myFetch('POST',vec);  
    aRPass.value='';

    if(!boARLoggedIn) return;
    pageView.setVis();
    var vec=[['pageLoad',{}]];   await myFetch('GET',vec);

    //if(!boARLoggedIn) return;
    //var vec=[['getLoginBoolean',{}]];  await myFetch('POST',vec);
  }

  var aRPass=createElement('input').prop('type', 'password').on('keypress',  function(e){ if(e.which==13) {vPassF();return false;} });     
  var vPassButt=createElement('button').myText('Login').on('click',vPassF);
  el.aRPass=aRPass;
  el.addClass('aRPassword').myAppend(aRPass, vPassButt);

  return el;
}



var createChildInd=function(arrI){
  var tmp=[]; for(var i=0;i<arrI.length;i++){  var itmp=arrI[i];  tmp[itmp]=i;  }  return tmp;
}

var createColJIndexNamesObj=function(arrName){
  var o={};
  for(var i=0;i<arrName.length;i++){ 
    var tmp="j"+arrName[i][0].toUpperCase()+arrName[i].substr(1);       o[tmp]=i;
  }
  return o;
}



var divMessageTextCreate=function(){
  var spanInner=createElement('span');
  var imgBusyLoc=imgBusy.cloneNode().css({zoom:'65%','margin-left':'0.4em'}).hide();
  var el=createElement('div').myAppend(spanInner, imgBusyLoc);
  el.resetMess=function(time){
    clearTimeout(messTimer);
    if(time) { messTimer=setTimeout(resetMess, time*1000); return; }
    spanInner.myText(' ');
    imgBusyLoc.hide();
  }
  el.setMess=function(str='',time,boRot){
    spanInner.myText(str);
    clearTimeout(messTimer);
    if(time)     messTimer=setTimeout(resetMess, time*1000);
    imgBusyLoc.toggle(Boolean(boRot));
  };
  el.setHtml=function(str='',time,boRot){
    spanInner.myHtml(str);
    clearTimeout(messTimer);
    if(time)     messTimer=setTimeout(resetMess, time*1000);
    imgBusyLoc.toggle(Boolean(boRot));
  };
  var messTimer;
  el.addClass('message');
  return el;
}

/*******************************************************************************
 * pageView
 ******************************************************************************/

var editButtonExtend=function(el){
  el.setImg=function(boOW){ 
    //imgOW.prop({src:boOW?uPen:uPenNot});
    imgOW.prop({srcset:boOW?srcsetPen:srcsetPenNot});
    var txt=boOW?'Edit the page.':'See wiki text.'
    el.prop({'aria-label':txt});
    //if(!boIOS) el.css({'text-decoration':boOW?'none':'line-through'});
    //spanOWStrike.toggle(!boOW);
    el.title=txt;
  }

  // var spanOW=createElement('span').css({'user-select':'none', 'line-height':'2.4em', display:'inline-block', position:'relative'});
  // var spanOWPen=createElement('span').myAppend('🖉').css({'user-select':'none', 'font-size':'135%'});
  // var spanOWStrike=createElement('span').myAppend('\\').css({'user-select':'none', position:'absolute', display:'inline', left:'.14em', top:'0em', color:'red', 'font-size':'250%'});
  // spanOW.myAppend(spanOWPen, spanOWStrike);
  
  var imgOW=createElement('img').prop({srcset:srcsetPen, alt:"pen"}).css({height:strSizeIcon,width:strSizeIcon,'vertical-align':'text-bottom'}).addClass('undraggable');
  //var strPen="🖉"; //🖊✎
  //if(boIOS) el.append(imgOW); else el.append(spanOW);
  el.append(imgOW);
  //alert(document.fonts.check("12px verdana, arial, helvetica", "🖉"))
  return el;
}
var spanModExtend=function(el){
  el.setup=function(data){   el.myHtml((data.boOR?charPublicRead:' ') + (data.boOW?charPublicWrite:' ') + (data.boSiteMap?charPromote:' '));  }
  return el;
}
var pageViewExtend=function(el){
  el.toString=function(){return 'pageView';}
  
  el.setUp=function(){
    var {tMod, tCreated}=objPage; el.spanLastMod.myText(date2ToSuitableString(tMod)).prop('title','Last Modified:\n'+tMod);
    el.spanCreated.myText(date2ToSuitableString(tCreated)).prop('title','Created:\n'+tCreated);
    divLastModW.toggle(Boolean(tMod));
    divCreatedW.toggle(tCreated>1000); // tCreated==1000 means that it is unknown (and should be hidden)
    
  }
  el.setDetail=function(){
    var strNR='',  str='';
    if(matVersion.length){
      var ver=arrVersionCompared[1], rev=ver-1;
      //var r=matVersion[rev];  strNR='v'+ver+'/'+nVersion;  str=r[1]+' <b><i>'+r[2]+'</i></b>';//+mySwedDate(r[0]);
      var {summary, signature}=matVersion[rev];
      strNR='v'+ver+'/'+nVersion;  str=summary+' <b><i>'+signature+'</i></b>';//+mySwedDate(r[0]);
    }
    el.spanNR.myHtml(strNR);  spanDetail.myHtml(str);
  }
  el.setFixedDivColor=function(boOR){   el.fixedDiv.css({background:boOR?'#fff':'lightgreen'});  }

    // versionMenu
  var versionTableButton=createElement('button').myText('Version list').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',function(){
    doHistPush({view:versionTable});
    versionTable.setVis();
  });    
  var diffButton=createElement('button').myText('Diff').addClass('fixWidth').css({'margin-right':'1em'}).on('click',function(){
    //var arrVersionCompared=[bound(nVersion-iRow-1,1),nVersion-iRow];
    if(nVersion<2) return;
    arrVersionCompared[0]=arrVersionCompared[1]-1;
    if(arrVersionCompared[1]==1) arrVersionCompared=[2,1]; 
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec); 
    doHistPush({view:diffDiv});
    diffDiv.setVis();
  });
  el.spanNR=createElement('span').css({margin:'0em 0.1em'});
  var nextButton=createElement('button').myText('⇧').addClass('fixWidth').on('click',function(){
    var iVer=arrVersionCompared[1]+1; if(iVer>nVersion) iVer=1;
    var vec=[['pageLoad',{version:iVer}]];   myFetch('GET',vec); 
  });
  var prevButton=createElement('button').myText('⇩').addClass('fixWidth').css({'margin-left':'0.8em'}).on('click',function(){
    var iVer=arrVersionCompared[1]-1; if(iVer<1) iVer=nVersion;
    var vec=[['pageLoad',{version:iVer}]];   myFetch('GET',vec); 
  });
  var spanDetail=createElement('span').myText('ggggggggggg').css({'margin-right':'0.5em', 'margin-left':'0.5em'});
  var divUpper=createElement('div').myAppend(prevButton,el.spanNR,nextButton,spanDetail,diffButton).css({'line-height':'2em'});

  
  var divLower=createElement('div').myAppend(versionTableButton).css({margin:'.5em auto auto'});

  el.versionMenu=createElement('div').myAppend(divUpper,divLower).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.5em auto'});

 
    // menuA

    // boShowAdminButton
  var boShowAdminButton=getItem('boShowAdminButton');  if(boShowAdminButton===null)  boShowAdminButton=false;
  var adminButtonToggleEventF=function(){
    var now=Date.now(); if(now>timeSpecialR+1000*10) {timeSpecialR=now; nSpecialReq=0;}    nSpecialReq++;
    if(nSpecialReq==3) { nSpecialReq=0;boShowAdminButton=!boShowAdminButton; setItem('boShowAdminButton',boShowAdminButton); ElAdmin.forEach(ele=>ele.toggle(boShowAdminButton));    }
  }
  var timeSpecialR=0, nSpecialReq=0;

    // paymentButton
  var tmpSpan=createElement('span').myText('Pay/Donate');//.css({display:'inline-block','vertical-align':'text-bottom',height:strSizeIcon});  display:'inline-block',
  var paymentButton=createElement('button').myAppend(tmpSpan).addClass('fixWidth').css({'vertical-align':'bottom','margin-right':'1em','line-height':strSizeIcon}).on('click',function(){
    doHistPush({view:paymentDiv});
    paymentDiv.setVis();
  }); if(ppStoredButt=='' && strBTC=='') paymentButton.hide();
  
    // editButton
  el.editButton=editButtonExtend(createElement('button')).addClass('fixWidth').prop({"aria-label":"edit"}).css({'margin-left':'0.8em','margin-right':'1em'}).on('click',function(){
    doHistPush({view:editDiv});
    editDiv.setVis();
  });
  el.editButton.on('click', adminButtonToggleEventF);
  var tmpImg=createElement('img').prop({src:uAdmin, alt:"admin"}).css({height:strSizeIcon,width:strSizeIcon,'vertical-align':'text-bottom'}).addClass('undraggable');    //var strAdmin='👤🔑';
  var adminButton=createElement('button').myAppend(tmpImg).addClass('fixWidth').prop({title:"Administrator entry."}).on('click',function(){
    doHistPush({view:adminDiv});
    adminDiv.setVis();
  });
  //if(!boTouch) popupHover(adminButton,createElement('div').myText('Administrator entry.'));
  
    // spanMod
  el.spanMod=spanModExtend(createElement('span')).css({'margin-right':'0.5em','font-family':'monospace'});
  var ElAdmin=[el.spanMod, adminButton];
  //var spanAdmin=createElement('span').myAppend(el.spanMod, adminButton).css({'margin-left':'auto'});  // 'float':'right'
  //spanAdmin.toggle(boShowAdminButton);
  ElAdmin.forEach(ele=>ele.toggle(boShowAdminButton));
  
    // commentButton
  commentButton.css({'margin-left':'1em'}); //,'float':'right'
  
    // spanTModNCreated
  el.spanCreated=createElement('span');   el.spanLastMod=createElement('span');
  var divCreatedW=createElement('div').myAppend('Created: ', el.spanCreated);
  var divLastModW=createElement('div').myAppend('Last mod: ', el.spanLastMod);
  var spanTModNCreated=createElement('span').myAppend(divCreatedW, divLastModW)
  //.css({display:'block', position:'absolute', bottom:'.0em', width:'100%', 'text-align':'center', 'font-size':'70%'});
  .css({display:'block', 'font-size':'12px', 'margin-right':'auto'});
  //.css({'float':'right',margin:'0.2em .5em 0 0', 'font-size':'70%'});


  var menuA=createElement('div').myAppend(el.editButton,paymentButton,spanTModNCreated,butARLogout,...ElAdmin,commentButton).css({padding:'0 0.3em 0.6em 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.2em auto 0em'});  //.css({margin:'1em 0','text-align':'center',position:'fixed',bottom:0,width:'100%'});
  menuA.css({'box-sizing':'border-box', position:'relative', display:'flex', 'align-items':'center', 'justify-content':'space-between'});
  
  el.fixedDiv=createElement('div').myAppend(el.versionMenu,menuA).css(cssFixed);//.css({position:'static'});
  
  el.myAppend(el.fixedDiv);

  return el;
}

/*******************************************************************************
 * adminDiv
 ******************************************************************************/
var adminDivExtend=function(el){
  el.toString=function(){return 'adminDiv';}
  el.setUp=function(){
    if(editText.parentNode!==el.fixedDiv) {
      el.fixedDiv.prepend(dragHR,editText);
    }
    //dragHR.after(editText);
  }
  el.setUpButtons=function(boAWLoggedInT){
    var boT=Boolean(boAWLoggedInT);
    [moreButton, butAWLogout, handyButton].forEach(ele=>ele.toggle(boT));
    [password, password2].forEach(ele=>ele.toggle(!boT));
  }
  var aPassF=function(){
    if(typeof SHA1 == 'undefined') { setMess(strSha1NotLoaded); return;}
    //var tmp=SHA1(password.value);
    //var tmp=Sha256.hash(password.value+strSalt);
    var data=password.value+strSalt; for(var i=0;i<nHash;i++) data=SHA1(data);
    //var data=password.value+strSalt; for(var i=0;i<nHash;i++) data=Sha256.hash(data);
    
    
    //var txt=password.value+strSalt;
    //function hexString(buffer) {
      //const byteArray = new Uint8Array(buffer);

      //const hexCodes = [...byteArray].map(value => {
        //const hexCode = value.toString(16);
        //const paddedHexCode = hexCode.padStart(2, '0');
        //return paddedHexCode;
      //});

      //return hexCodes.join('');
    //}
    //var digestMessage=function(message) {
      //const encoder = new TextEncoder();
      //const data = encoder.encode(message);
      //return window.crypto.subtle.digest('SHA-1', data);
    //}

    //digestMessage(txt).then(digestValue => {
      ////console.log(digestValue.byteLength);
      //console.log(hexString(digestValue));
    //});
    if(data.substr(0,2)!=aWPasswordStart) {setMess('Wrong pw'); return;}
    var vec=[['aWLogin',{pass:data}], ['getAWRestrictedStuff',{}]];   myFetch('POST',vec); 
    password.value='';
  }
  //var loginButt=createElement('button').myText('Login').on('click',aPassF).hide();
  var butAWLogout=createElement('button').myText('Logout (W)').prop({title:'Logout (write-access only)'}).on('click',function(){
    var vec=[['aWLogout',{}]];   myFetch('POST',vec); 
  }); 
  var password=createElement('input').prop({type:'password', placeholder:"Login (W)", title:'Login (write-access)'}).on('keypress',  function(e){   if(e.which==13) { aPassF(); return false;}   }); 

  var aPass2F=function(){  
    if(typeof SHA1 == 'undefined') { setMess(strSha1NotLoaded); return;}
    //var tmp=SHA1(password2.value+strSalt); 
    //var tmp=Sha256.hash(password2.value+strSalt);
    var data=password2.value+strSalt; for(var i=0;i<nHash;i++) data=SHA1(data);
    //var data=password2.value+strSalt; for(var i=0;i<nHash;i++) data=Sha256.hash(data);
    if(data.substr(0,2)!=aWPasswordStart) {setMess('Wrong pw'); return;}
    var vec=[['aWLogin',{pass:data}], ['saveByReplace',{strEditText:editText.value}], ['getAWRestrictedStuff',{}]];   myFetch('POST',vec); 
    password2.value='';
    boLCacheObs.value=1;
  }
  var handyClickF=function(){  
    var vec=[['saveByReplace',{strEditText:editText.value}]];   myFetch('POST',vec); 
    boLCacheObs.value=1;
  }
  var handyButton=createElement('button').myText('Overwrite').on('click',handyClickF); 
  var password2=createElement('input').prop({type:'password', placeholder:"Overwrite", title:'Login (write-access) and overwrite'}).on('keypress',  function(e){   if(e.which==13) {aPass2F(); return false;}   }); 
  var imgH=imgHelp.cloneNode(1).css({margin:'0em 1em'}); popupHover(imgH,createElement('div').myHtml('Write password for:<li>Login (W): logging in with write-access<li>Overwrite: A brutal but handy quick route for saving plus deleting all old versions.'));
  //var handySpan=createElement('span').myAppend();  
  var aWLoginDiv=createElement('span').myAppend(imgH, butAWLogout, password, ' ', handyButton, password2);
  [password, password2].forEach(ele=>ele.css({width:'6em'}));
  aWLoginDiv.css({"float":"right"});

  
  var moreButton=createElement('button').myText('More').addClass('fixWidth').on('click',function(){
    doHistPush({view:adminMoreDiv});
    adminMoreDiv.setVis();
  }); 
    

  //var infoDiv=createElement('span').myAppend(moreButton); 


  //var menuB=createElement('div').myAppend(moreButton,pageListButton,imageListButton)
  var menuB=createElement('div').myAppend(moreButton,aWLoginDiv).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'1em auto'});



    // menuA
  //var buttonBack=createElement('button').myText('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',historyBack);
  //var spanLabel=createElement('span').myText('Admin').css({'float':'right',margin:'0.2em 0 0 0'});  
  //var menuA=createElement('div').myAppend(spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});  //buttonBack,

  el.spanClickOutside=createElement('span').myText(strClickOutside).hide();
  el.fixedDiv=createElement('div').myAppend(dragHR,el.spanClickOutside,menuB).css(cssFixedDrag);  //,menuA
  
  el.fixedDiv.css({background:'rgb(255, 255, 255, 0.8)'});
  //el.menus=menuA.add(menuB);
  el.menus=menuB;
  el.append(el.fixedDiv);
  return el;
}
class ButtonToggle extends HTMLElement{
  constructor(){ super(); }
  getState(){return this.hasClass('boxShadowOn');}
  mySet(boOn){  boOn=Boolean(boOn); this.toggleClass('boxShadowOn', boOn).toggleClass('boxShadowOff', !boOn); }
  myToggle(){var boOn=!this.getState(); this.mySet(boOn); return boOn;}
}
customElements.define('button-toggle', ButtonToggle);

var adminMoreDivExtend=function(el){
  el.toString=function(){return 'adminMoreDiv';}
  el.setBUNeededInfo=function(){
    var {tModLast, pageTModLast, tLastBU}=objSetting;
    //if(!(tLastBU instanceof Date)) tLastBU=new Date(tLastBU);
    var boBUNeeded=tModLast>tLastBU,     strTmp='tLastBU: '+swedTime(tLastBU)+', tModLast: '+swedTime(tModLast)+' ('+pageTModLast+')';
    aBUFilesToComp.prop('title', strTmp).css({'background':boBUNeeded?'red':''});
  }
  var strPublicRead='<span style="display:inline-block">'+charPublicRead+'</span>';
  var imgH=imgHelp.cloneNode(1).css({'margin-left':'.5em','margin-right':'0.5em'}); popupHover(imgH,createElement('div').myHtml(strPublicRead+' = public read access<br>'+charPublicWrite+' = public write access<br>'+charPromote+' = promote = include the page in sitemap.xml etc. (encourage search engines to list the page)'));
  el.setMod=function(){
    butModRead.mySet(objPage.boOR);
    butModWrite.mySet(objPage.boOW);
    butModSiteMap.mySet(objPage.boSiteMap);
  }

    // Methods of the below buttons:
  var clickModF=function(){
    var strType=this.strType;
    var b=this, boOn=b.myToggle();
    var o={Id:[objPage.idPage]}; o[strType]=boOn;
    //var vec=[['myChMod',o]]; myFetch('POST',vec).then(a=>{var [e,r]=a; if(e) setMess(e.message);}).catch(err=> {setMEss('ee');});
    var vec=[['myChMod',o]]; myFetch('POST',vec);
    //setButMod.call(b, boOn);
  }
  var butModRead=createElement('button-toggle').myHtml(strPublicRead).prop({title:'Public read access', strType:'boOR'}).on('click', clickModF );  
  var butModWrite=createElement('button-toggle').myText(charPublicWrite).prop({title:'Public write access', strType:'boOW'}).on('click',clickModF);
  var butModSiteMap=createElement('button-toggle').myText(charPromote).prop({title:'Promote (include page in sitemap.xml)',strType:'boSiteMap'}).on('click',clickModF);
  var Tmp=[butModRead, butModWrite, butModSiteMap]; Tmp.forEach(ele=>ele.css({'margin-right':'0.4em', width:'1.5em', padding:0}));   
     
  el.setMod();
  
  var boIsGeneratorSupported=isGeneratorSupported();
  var uploadAdminDiv='', buttonDiffBackUpDiv='';
  if(boIsGeneratorSupported) {
    uploadAdminDiv=uploadAdminDivExtend(createElement('span')); 
    buttonDiffBackUpDiv=createElement('button').myText('Backup (diff)').on('click',function(){
      doHistPush({view:diffBackUpDiv});
      diffBackUpDiv.setVis();
    });
  }

  var statLink=createElement('a').prop({href:'stat.html'}).myText('stat');
  var pageListButton=createElement('button').myText('pageList').addClass('fixWidth').on('click',function(){
    //var idTmp=objPage.idPage; if(isNaN(idTmp)) idTmp=null;
    var idTmp=objPage.idPage; if(typeof idTmp=='string' && idTmp.length==0) idTmp=null;
    pageFilterDiv.Filt.setSingleParent(idTmp);  pageList.histPush(); pageList.loadTab();  pageList.setVis();
  });    
  var imageListButton=createElement('button').myText('imageList').addClass('fixWidth').css({'background':'lightblue'}).on('click',function(){
    //var idTmp=objPage.idPage; if(isNaN(idTmp)) idTmp=null;
    var idTmp=objPage.idPage; if(typeof idTmp=='string' && idTmp.length==0) idTmp=null;
    imageFilterDiv.Filt.setSingleParent(idTmp);   imageList.histPush();  imageList.loadTab();  imageList.setVis();  // pageFilterDiv.Filt.filtAll();
  });

  var imgHPrefix=imgHelp.cloneNode(1).css({'margin-left':'1em'}); popupHover(imgHPrefix,createElement('div').myHtml('<p>Use prefix on default-site-pages:<p>Note that non-default-site-pages always gets the prefix added (to the filename in the zip-file).<p>Click the "Site table"-button below if you want to see or change the prefixes, and if you want to change which site is the default.'));  
  var boUsePrefix=getItem('boUsePrefixOnDefaultSitePages')||true;
  var cb=createElement('input').prop({type:'checkbox', checked:boUsePrefix}).on('click',function(){
    boUsePrefix=Number(cb.prop('checked')); 
    setItem('boUsePrefixOnDefaultSitePages',boUsePrefix);  
    aBUFilesToComp.setUp(boUsePrefix);
  })

  //var imgHDownload=imgHelp.cloneNode(1).css({'margin-left':'1em','margin-right':'1em'}); popupHover(imgHDownload,createElement('div').myText('Put all pages (or images or videos) in a zip-file and download.'));
  var aBUFilesToComp=createElement('a').prop({rel:'nofollow', download:''}).myText('(...)page.zip');
  aBUFilesToComp.setUp=function(boUsePrefix){
    var tmpUrl='BUPage'+(boUsePrefix?'':'?{"boUsePrefixOnDefaultSitePages":0}'); this.prop({href:tmpUrl});
  };  aBUFilesToComp.setUp(boUsePrefix);
  var aBUImageToComp=createElement('a').prop({href:'BUImage', rel:'nofollow', download:''}).myText('(...)image.zip');
  var aBUVideoToComp=createElement('a').prop({href:'BUVideo', rel:'nofollow', download:''}).myText('(...)video.zip');
  var aBUMeta=createElement('a').prop({href:'BUMeta', rel:'nofollow', download:''}).myText('(...)meta.zip');
  var aBUMetaSQL=createElement('a').prop({href:'BUMetaSQL', rel:'nofollow', download:''}).myText('(...)meta.sql');
  var imgHSql=imgHelp.cloneNode(1).css({'margin':'0 1em'}); popupHover(imgHSql,createElement('div').myHtml('<p>Download "meta-data":<br>-extra data for pages/images (modification dates, access rights ...). <br>-redirect table.<br>-site table.'));
  
  var butBUPageServ=createElement('button').myText('page.zip').on('click',  function(){    httpGetAsync('BUPageServ',function(err, str) {setMess(str,3);});    });
  var butBUImageServ=createElement('button').myText('image.zip').on('click',function(){    httpGetAsync('BUImageServ',function(err, str) {setMess(str,3);});   });
  var butBUMetaServ=createElement('button').myText('meta.zip').on('click',function(){      httpGetAsync('BUMetaServ',function(err, str) {setMess(str,3);});    });
  
  var strOverwrite='This will overwrite data in the db?';
  var butLoadFromServerP=createElement('button').myText('page.zip').on('click',function(){  if(confirm(strOverwrite)==0) return; var vec=[['loadFrBUOnServ',{File:['page.zip']}]];   myFetch('POST',vec);    });
  var butLoadFromServerI=createElement('button').myText('image.zip').on('click',function(){  if(confirm(strOverwrite)==0) return; var vec=[['loadFrBUOnServ',{File:['image.zip']}]];   myFetch('POST',vec);    });
  var butLoadFromServerM=createElement('button').myText('meta.zip').on('click',function(){  if(confirm(strOverwrite)==0) return; var vec=[['loadFrBUOnServ',{File:['meta.zip']}]];   myFetch('POST',vec);    });
  
  var siteButton=createElement('button').myText('Site table').addClass('fixWidth').on('click',function(){    doHistPush({view:siteTab}); siteTab.setVis();   });
  var redirectButton=createElement('button').myText('Redirect table').addClass('fixWidth').on('click',function(){   doHistPush({view:redirectTab}); redirectTab.setVis();   });

  var renameButton=createElement('button').myText('Rename').css({'margin-left':'0.5em'}).on('click',function(){
    renamePop.openFunc('page', objPage);
  });
  var spanStrLang=createElement('span').myText(objPage.strLang);
  var butSetStrLang=createElement('button').myAppend('Set lang code (', spanStrLang, ')').css({'margin-left':'0.5em'}).on('click',function(){
    setStrLangPop.openFunc(objPage.strLang, [objPage.idPage], strT=>spanStrLang.myText(strT));
  });
  var butSetSiteOfPage=createElement('button').myAppend('Set site').css({'margin-left':'0.5em'}).on('click',function(){
    setSiteOfPagePop.openFunc(objPage.idSite, [objPage.idPage]);
  });
  var objBottomLine={'border-bottom':'gray solid 1px'};
  var menuA0=createElement('div').myAppend(pageListButton, imageListButton).css(objBottomLine);
  var menuA=createElement('div').myAppend(butModRead, butModWrite, butModSiteMap, imgH, ' | ', renameButton, butSetStrLang, butSetSiteOfPage).css(objBottomLine);
  var menuB0=createElement('div').myHtml("<b>BU download: </b>");
  var menuB=createElement('div').myAppend(aBUFilesToComp, ', Use prefix on default-site-pages: ', cb, imgHPrefix);
  var menuC=createElement('div').myAppend(aBUImageToComp, ' | ', buttonDiffBackUpDiv).css({'background':'lightblue'});
  //var menuD=createElement('div').myAppend(aBUVideoToComp);
  var menuE=createElement('div').myAppend(aBUMeta, imgHSql).css(objBottomLine);  // , ' | ', aBUMetaSQL
  var menuF=createElement('div').myHtml("Save to server-BU-Folder: ").myAppend(butBUPageServ,butBUImageServ,butBUMetaServ).css(objBottomLine);
  var menuG=createElement('div').myAppend(uploadAdminDiv).css(objBottomLine);
  var menuH=createElement('div').myAppend(siteButton,redirectButton).css(objBottomLine);
  //var menuI=createElement('div').myHtml("<b>Load from server-BU-Folder: </b>").myAppend(butLoadFromServerP, butLoadFromServerI, butLoadFromServerM).css(objBottomLine);
  var menuJ=createElement('div').myAppend('DB: '+strDBType, ' | ', statLink);
  var Menu=[menuA0, menuA, menuB0, menuB,menuC,menuE,menuF,menuG, menuH, menuJ]; Menu.forEach(ele=>ele.css({margin:'0.5em 0'})); //,menuD , menuI

  el.divCont=createElement('div').myAppend(...Menu);
  el.divCont.css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'1em auto'});


    // menuBottom
  //var buttonBack=createElement('button').myText('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',historyBack);
  var spanLabel=createElement('span').myText('adminMore').css({'float':'right',margin:'0.2em 0 0 0'});  
  var menuBottom=createElement('div').myAppend(spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});  //buttonBack,


  el.fixedDiv=createElement('div').myAppend(menuBottom).css(cssFixed);

  el.myAppend(el.divCont,el.fixedDiv);
  return el;
}



  






var dumpDivExtend=function(el){
  el.toString=function(){return 'dumpDiv';}
  return el;
}

var tabBUDivExtend=function(el){
  el.toString=function(){return 'tabBUDiv';}
  el.setUp=function(arrStr,objFetchChanged){
    table.empty();
    var StrOld=arrStr[0], StrDeleted=arrStr[1], StrReuse=arrStr[2], StrFetchChanged=arrStr[3], StrFetchNew=arrStr[4], StrNew=arrStr[5];
    var nOld=StrOld.length, nDel=StrDeleted.length, nReuse=StrReuse.length, nFetchChanged=StrFetchChanged.length, nFetchNew=StrFetchNew.length, nNew=StrNew.length;

    var tha=createElement('th').myText('Deleted ('+nDel+')').css({background:'orange'});
    var thb=createElement('th').myText('Reused ('+nReuse+')').css({background:'yellow'});
    var thc=createElement('th').myText('Fetch Changed ('+nFetchChanged+')').css({background:'lightgreen'});
    var thd=createElement('th').myText('Fetch New ('+nFetchNew+')').css({background:'lightblue'});
    table.myAppend(createElement('tr').myAppend(tha,thb,thc,thd));

    //var nMax=Math.max(nOld,nNew);
    var nMax=Math.max(nDel,nReuse,nFetchChanged, nFetchNew);
    for(var i=0;i<nMax;i++){
      var r=createElement('tr');
      var tda=createElement('td'), tdb=createElement('td'), tdc=createElement('td'), tdd=createElement('td');
      var strNameA='', strColorA=''; if(i<nDel) {strNameA=StrDeleted[i]; strColorA='orange'; }

      var strNameB='', strColorB=''; if(i<nReuse) {strNameB=StrReuse[i]; strColorB='yellow'; }
      var strNameC='', strColorC='';
      if(i<nFetchChanged){
        strNameC=StrFetchChanged[i];
        if(strNameC in objFetchChanged) {var {dSize,dateNew,dateOld,dUnix}=objFetchChanged[strNameC];
          if(dSize) strNameC+=', Δsize='+dSize; 
          if(dUnix) { 
            var strT=getSuitableTimeUnitStr(dUnix);  strNameC+=',  Δt='+strT; 
            tdc.prop('title','Old: '+dateOld+"\u000d"+'New: '+dateNew);
          }
        }
        strColorC='lightgreen';
      }
      var strNameD='', strColorD=''; if(i<nFetchNew) {strNameD=StrFetchNew[i]; strColorD='lightblue'; }
      tda.myText(strNameA).css({background:strColorA}); 
      tdb.myText(strNameB).css({background:strColorB}); 
      tdc.myText(strNameC).css({background:strColorC}); 
      tdd.myText(strNameD).css({background:strColorD}); 

      r.myAppend(tda, tdb, tdc, tdd);
      table.myAppend(r);
    }
    
  }
  var table=createElement('table').addClass('tableSticky');
  el.append(table);
  return el;
}


var tabBUSumExtend=function(el){
  el.setUp=function(nOld,nNew,arrN){
    var iToFetchNew=3, iToBeDeleted=0;
    for(var i=0;i<nAction;i++){
      var len=arrN[i];
      var lenT=len; if(i==iToFetchNew) lenT=0;   tdOld.children[i].css({width:lenT+'px'});
      var lenT=len; if(i==iToBeDeleted) lenT=0;   tdNew.children[i].css({width:lenT+'px'});
      tdColor.children[i*3+2].myText(len);
      tdOldNum.myText(nOld);
      tdNewNum.myText(nNew);
    }
  }
  var StrAction=['toBeDeleted','toBeReused','toFetchChanged','toFetchNew'], nAction=StrAction.length;
  var StrActionLabel=['To be deleted','To be reused','To fetch (changed)','To fetch (new)'];
  var StrActionColor=['orange','yellow','lightgreen','lightblue'];
  var tdOld=createElement('td'), tdNew=createElement('td'), tdColor=createElement('td').attr({colspan:"3"});
  for(var i=0;i<nAction;i++){
    var divAction=createElement('div').css({'background':StrActionColor[i],'height':'20px', width:'25%', display:'inline-block'});
    tdOld.myAppend(divAction);
    tdNew.myAppend(divAction.cloneNode());
    var divColor=createElement('span').css({'background':StrActionColor[i],'height':'1em', width:'1em', display:'inline-block', 'margin-right':'0.1em'});
    var spanColor=createElement('span').myText(StrActionLabel[i]+": ");
    var spanN=createElement('span').css({'margin-right':'0.6em', 'font-weight':'bold'});
    tdColor.myAppend(divColor, spanColor, spanN);
  }

  var tdOldNum=createElement('td'), tdNewNum=createElement('td');
  var trOld=createElement('tr').myHtml("<td>Old Zip</td>").myAppend(tdOldNum, tdOld);
  var trNew=createElement('tr').myHtml("<td>New Zip</td>").myAppend(tdNewNum, tdNew);
  var trColor=createElement('tr').myAppend(tdColor);

  //var DivPop=[]; //, Button=([]);
  var tHead=createElement('thead').myHtml("<tr><th></th><th>nFiles</th></tr>");
  var tBody=createElement('tbody');
  tBody.myAppend(trOld, trNew, trColor);
  el.myAppend(tHead, tBody);

  el.css({'border-collapse':'collapse'});
  return el;
}




//try{  var myString = (function () {   /*  //123412341234
var diffBackUpDivExtend=function(el){
  el.toString=function(){return 'diffBackUpDiv';}

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



  var inpSelChange=async function(arrOrg){ 
    ul.empty().show();
    //saveButton.prop("disabled",true);
    var file=arrOrg[0];
    EntryLocal={}; // Create EntryLocal

    var blobReader=new zip.BlobReader(file);
    var [err, zipReader]=await new Promise(resolve=>{   zip.createReader(blobReader, zipReaderT=>resolve([null,zipReaderT]), err=>resolve([err]));   }); 
    if(err) return [err];

    var [err, EntryTmp]=await new Promise(resolve=>{   zipReader.getEntries( EntryT=>resolve([null,EntryT]), err=>resolve([err]));    });   if(err) return [err];


    EntryTmp.forEach(function(entry){  EntryLocal[entry.filename]=entry;   });  

    StrOld=Object.keys(EntryLocal); //var li=createElement('li').myAppend('Old zip-file has <b>'+nOld+'</b> files.'); ul.append(li);

    var [err, data]=await new Promise(resolve=>{ myFetch('POST',[['getImageInfo',{},data=>resolve([null,data]) ]]);  });
    if(err) return [err];

    var FileNewInfo=data.FileInfo, FileNew={};
    for(var i=0;i<FileNewInfo.length;i++){ FileNew[FileNewInfo[i].imageName]=FileNewInfo[i]; } 
    StrNew=Object.keys(FileNew);
  
    var writer;   // Create writer
    if(creationMethod == "Blob") {
      writer=new zip.BlobWriter();
    } else {

      var [err, zipFileEntryT]=await new Promise(resolve=>{   createTempFile(fileEntryT=>resolve([null, fileEntryT]), err=>resolve([err]));   });
      if(err) return [err];
      zipFileEntry=zipFileEntryT;

      writer=new zip.FileWriter(zipFileEntry);
    }

      // Create zipWriter
    var [err, zipWriterT]=await new Promise(resolve=>{   zip.createWriter(writer, writerT=>resolve([null,writerT]), err=>resolve([err])); }); if(err) return [err];
    zipWriter=zipWriterT;

    StrDeleted=[]; StrReuse=[]; StrFetchAll=[]; StrFetchChanged=[]; StrFetchNew=[]; objFetchChanged={};   

    for(var key in EntryLocal){
      if(!(key in FileNew)){ StrDeleted.push(key); }
    }
  
    var progress=createElement('progress'), iNew=0, imgDoneLast=imgDone.cloneNode();
    var li=createElement('li').myText('Extracting meta data from the selected file (names, modification dates and file-sizes): ').myAppend(progress, imgDoneLast); ul.append(li);
    
    for(var key in FileNew){  // Create StrReuse, StrFetchChanged, StrFetchNew and objFetchChanged
      if(key in EntryLocal){
        var entryLocal = EntryLocal[key];
        var writer = new zip.BlobWriter(entryLocal);

        //var [err, blob]=await new Promise(resolve=>{   entryLocal.getData(writer, blobT=>resolve([null,blobT]), onprogress); }); if(err) return [err];

        //var dateOld=new Date(entryLocal.lastModDate);
        var size=entryLocal.uncompressedSize;
        var dosRaw=entryLocal.lastModDateRaw, dosDate=dosRaw>>>16, dosTime=dosRaw&0xffff, dateOld=dosTime2tUTC(dosDate,dosTime);
        //var dateOldUnix=dateOld.toUnix();
      
// local database 1411715164
        var dSize=FileNew[key].size-size, dateNew=FileNew[key].tCreated, dUnix=dateNew-dateOld; dUnix=dUnix/1000;
        //if(FileNew[key].size==size && FileNew[key].tCreated>>1==dateOldUnix>>1){  // Division by two (>>1) because zip uses microsoft time 
        if(dSize==0 && dUnix>>1==0){  // Division by two (>>1) because zip uses microsoft time 
          StrReuse.push(key);
        }else{
          objFetchChanged[key]={dSize,dUnix,dateNew,dateOld};
          StrFetchChanged.push(key);
        }
      } else {
        StrFetchNew.push(key);
      }
      iNew++; progress.attr({value:iNew,max:StrNew.length});
    }
    imgDoneLast.show();

      // Display tab
    var ArrStr=[StrOld, StrDeleted, StrReuse, StrFetchChanged, StrFetchNew, StrNew];
    var tabBUSum=tabBUSumExtend(createElement('table'));
    tabBUSum.setUp(StrOld.length, StrNew.length, [StrDeleted.length, StrReuse.length, StrFetchChanged.length, StrFetchNew.length]);
    tabBUDiv.setUp(ArrStr, objFetchChanged);
    var buttonDetail=createElement('button').myText('Details').on('click',function(){
      doHistPush({view:tabBUDiv});
      tabBUDiv.setVis();
    });
    var li=createElement('li').myAppend('Summary: ( ',buttonDetail,' )',tabBUSum); ul.append(li);

    StrFetchAll=StrFetchChanged.concat(StrFetchNew);
      // Check if it is OK to abort
    if(StrFetchAll.length==0 && StrDeleted.length==0) {
      var strMess='Aborting since your local files are up to date.';
      var li=createElement('li').myText(strMess); ul.append(li); progress.detach();
      return [null];
    }

    //if(confirm("Continue ?")) {} else {progress.detach(); return;}
    var buttonContinue=createElement('button').myText('Continue').on('click',async function(){
      var [err]=await continueFunc(); if(err) return [err];
      buttonContinue.prop("disabled",true);
    });
    var li=createElement('li').myAppend(buttonContinue); ul.append(li); progress.detach();
    return [null];
  }

  var continueFunc=async function(){
    var progress=createElement('progress')
      // Writing fresh files
    var iAdded=0, imgDoneLast=imgDone.cloneNode();
    var li=createElement('li').myText('Reusing (adding) old images to new zip: ').myAppend(progress, imgDoneLast); ul.append(li);
    for(var i=0;i<StrReuse.length;i++){
      var key=StrReuse[i];
      var entryLocal = EntryLocal[key];
      var writer = new zip.BlobWriter(entryLocal);

      var [err, blob]=await new Promise(resolve=>{   entryLocal.getData(writer, blobT=>resolve([null,blobT]), onprogress); }); if(err) return [err];

      var date=new Date(entryLocal.lastModDate), size=entryLocal.uncompressedSize;

      var blobReader=new zip.BlobReader(blob);
      var [err]=await new Promise(resolve=>{   zipWriter.add(key, blobReader, ()=>resolve([null]), onprogress, {lastModDate:date}); }); if(err) return [err];

      iAdded++;  progress.attr({value:iAdded,max:StrReuse.length}); 
      return [null];
    }
    imgDoneLast.show();

      // Fetching files
    var imgDoneLast=imgDone.cloneNode();
    var li=createElement('li').myAppend('Fetching: ', progress, imgDoneLast); ul.append(li);

    var progressHandlingFunction=function(e){      if(e.lengthComputable){   progress.attr({value:e.loaded,max:e.total});      }      }


    var semCB=0, semY=0, dataFetched;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'BUimage', true);
    xhr.setRequestHeader('X-Requested-With','XMLHttpRequest'); 
    xhr.responseType = 'blob';
    xhr.addEventListener("progress", progressHandlingFunction, false);
    var jsonTmp=JSON.stringify({arrName:StrFetchAll});

    var [err, dataFetched]=await new Promise(resolve=>{   
      xhr.onload=function(e) {
        if(this.status!=200) resolve([new Error('this.status!=200')]);
        resolve([null, this.response]);
      };
      xhr.send(jsonTmp); 
    }); if(err) return [err];

    
    // var headers={'X-Requested-With':'XMLHttpRequest'};
    // var jsonTmp=JSON.stringify({arrName:StrFetchAll});
    // var argFetch={method:'POST', headers, body:jsonTmp}
    // var [err, response]=await fetch('BUimage', argFetch).toNBP(); if(err) return [err];

    // //tmp.on('data',progressHandlingFunction);
    // var [err, dataFetched]=await response.blob().toNBP(); if(err) return [err];

    imgDoneLast.show();

    var blobReader=new zip.BlobReader(dataFetched);
    var [err, zipReader]=await new Promise(resolve=>{   zip.createReader(blobReader, zipReaderT=>resolve([null,zipReaderT]), err=>resolve([err]));   }); 
    if(err) return [err];

    var [err, EntryTmp]=await new Promise(resolve=>{   zipReader.getEntries( EntryT=>resolve([null,EntryT]), err=>resolve([err]));    });   if(err) return [err];

    var EntryFetched={};
    EntryTmp.forEach(function(entry) {  EntryFetched[entry.filename]=entry;  });

    var iAdded=0, imgDoneLast=imgDone.cloneNode();
    var li=createElement('li').myAppend('Adding the fetched images to new zip: ', progress, imgDoneLast); ul.append(li);
    for(var key in EntryFetched){
      var entry = EntryFetched[key];
      
      var writer = new zip.BlobWriter(entry);

      var [err, blob]=await new Promise(resolve=>{   entry.getData(writer, blobT=>resolve([null,blobT]), onprogress); }); if(err) return [err];

      var date=new Date(entry.lastModDate);

      var blobReader=new zip.BlobReader(blob);
      var [err]=await new Promise(resolve=>{   zipWriter.add(key, blobReader, ()=>resolve([null]), onprogress, {lastModDate:date}); }); if(err) return [err];

      iAdded++; progress.attr({value:iAdded,max:StrFetchAll.length});
    }
    var saveButton=createElement('button').myText('Save to disk').on('click',saveFun);  //.prop("disabled",true)
    var li=createElement('li').myAppend(saveButton); ul.append(li);
    //saveButton.prop("disabled",false);
    //ul.hide();
    imgDoneLast.show();
    progress.hide();

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
      //var outFileName=calcBUFileName(objSiteDefault.www,'image','zip'); // Todo: wwwCommon-variable should change after siteTabView changes
      var outFileName=objSiteDefault.siteName+'_'+swedDate(unixNow())+'_image.zip'; // Todo: wwwCommon-variable should change after siteTabView changes
      aSave.download = outFileName;
      aSave.href = blobURL;
      var event = document.createEvent("MouseEvents");
      event.initMouseEvent(
        "click", true, false, window, 0, 0, 0, 0, 0
        , false, false, false, false, 0, null
      );
      aSave.dispatchEvent(event);
    });
    ul.empty();
    //saveButton.prop("disabled",true);
  
  }
  var StrOld, StrDeleted, StrReuse, StrFetchAll, StrFetchChanged, StrFetchNew, StrNew, objFetchChanged;
  var regTxt=RegExp('^(.*)\\.txt$');
  var regZip=RegExp(/\.zip$/i);

  var URL=window.mozURL || window.URL; // window.webkitURL || 
  var requestFileSystem=window.webkitRequestFileSystem || window.mozRequestFileSystem || window.requestFileSystem;

  //var creationMethod="File";
  var creationMethod="Blob";
  if(typeof requestFileSystem == "undefined") creationMethod="Blob";

  var zipFileEntry=null, zipWriter=null;

  var imgDone=createElement('span').myText('Done').css({'background':'lightgreen'}).hide();

  var imgHHead=imgHelp.cloneNode(1).css({'margin-left':'1em'}); popupHover(imgHHead,createElement('div').myHtml('<p>If the old files\' size and modification date match then they are considered up to date.'));
  var head=createElement('div').myAppend('Differential backup of images',imgHHead).css({'font-weight':'bold'});
  var imgHLoad=imgHelp.cloneNode(1).css({'margin-left':'1em'}); popupHover(imgHLoad,createElement('div').myHtml('<p>Accepted file endings: '+strImageExtWComma+', or zip files containing these formats (no folders in the zip file)'));
  var formFile=createElement('form').prop({enctype:"multipart/form-data"});
  var inpFile=createElement('input').prop({name:"file", type:"file", accept:"application/zip"}).css({background:'lightgrey'}); //multiple
  var ul=createElement('ul');//.hide();
  
  var EntryLocal, StrOld;

  formFile.myHtml('<b>Select your old backup (zip) file:</b> ').myAppend(inpFile);   formFile.css({display:'inline'});
  el.append(head, formFile, imgHLoad, ul);

  inpFile.on('change', async function(e) {
    var [err]=await inpSelChange(this.files); if(err) {setMess(err); return;}
  });

  return el;
}


  
var uploadAdminDivExtend=function(el){
  var progressHandlingFunction=function(e){      if(e.lengthComputable){   progress.attr({value:e.loaded,max:e.total});      }      }
  var regTxt=RegExp('^(.*)\\.txt$');
  var sendConflictCheck=function(arrName){
    var IdPage=[], StrImageT=[];
    var strKeyDefault=randomHash();
    for(var i=0;i<arrName.length;i++){
      var Match=regTxt.exec(arrName[i]);
      if(Match) { 
        var idPagetmp=Match[1], {siteName, pageName}=parsePageNameHD(idPagetmp);
        var idPagetmpN;  if(siteName.length==0) {siteName=strKeyDefault; idPagetmpN=siteName+":"+pageName;} else idPagetmpN=idPagetmp;
        IdPage.push(idPagetmpN.toLowerCase());
        //if(!(siteName in StrTxt)) StrTxt[siteName]=[];
        //StrTxt[siteName].push(pageName);
        //StrTxt[siteName].push(pageName.toLowerCase());
      }
      else{ StrImageT.push(arrName[i]); }  
    }
    myFetch('POST',[['getPageInfo',{IdPage},sendConflictCheckReturnA],['getImageInfo',{arrName:StrImageT},sendConflictCheckReturnB]]);  // {objName:StrTxt, strKeyDefault}
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
      var tmpLab='WARNING!!! These files will be OVERWRITTEN (if you click "Upload")';
      StrConflict.unshift(tmpLab);
      if(StrConflict.length>10) StrConflict.push(tmpLab);
      divMessageText.setHtml(StrConflict.join('<br>'));
    }        
  }
  
  var verifyFun=async function(arrOrg){
    var nOrg=arrOrg.length;
    //name = file.name; size = file.size; type = file.type;
    var regZip=RegExp(/\.zip$/i);
    arrName=[]; arrFile=[];
    for(var i=0;i<nOrg;i++){
      var file=arrOrg[i];
      if(regZip.test(file.name) ){ //arrOrg[i].name.match(/\.zip$/i)

        var blobReader=new zip.BlobReader(file);
        var [err, zipReader]=await new Promise(resolve=>{   zip.createReader(blobReader, zipReaderT=>resolve([null,zipReaderT]), err=>resolve([err]));   }); 
        if(err) return [err];

        var [err, Entry]=await new Promise(resolve=>{   zipReader.getEntries( EntryT=>resolve([null,EntryT]), err=>resolve([err]));    });   if(err) return [err];

        Entry.forEach(function(entry) {   arrName.push(entry.filename);   });
        arrFile.push(file);  
      } else {
        arrFile.push(file);
        arrName.push(file.name);   
      }
    }
    var boEmpty=arrFile.length==0;    uploadButton.prop("disabled",boEmpty);
    sendConflictCheck(arrName);
    return [null];
  }
  var sendFun=function(){
    if(boFormDataOK==0) {alert("This browser doesn't support FormData"); return; };
    var formData = new FormData();
    formData.append("type", 'multi');
    for(var i=0;i<arrFile.length;i++)  {
      formData.append("fileToUpload[]", arrFile[i]);
    }
    
    
    var vecIn=[['uploadAdmin', {}], ['page',objPage.pageName], ['tMod',objPage.tMod], ['CSRFCode',getItem('CSRFCode')]];
    var arrRet=[function(){  progress.hide(); uploadButton.prop("disabled",false);}];
    
    formData.append('vec', JSON.stringify(vecIn));
    var xhr = new XMLHttpRequest();
    xhr.open('POST', uBE, true);
    xhr.setRequestHeader('X-Requested-With','XMLHttpRequest'); 
    var dataOut=formData;
    xhr.setRequestHeader('x-type','multi');
    
    progress.attr({value:0}); progress.show(); 
    xhr.onprogress=progressHandlingFunction;
    xhr.onload=function() {
      var dataFetched=this.response;
      //var data; try{ data=JSON.parse(this.response); }catch(e){ setMess(e); debugger; return; }
      var data=deserialize(this.response);
      
      var dataArr=data.dataArr;  // Each element of dataArr looks like [argument] or [altFuncArg,altFunc]
      delete data.dataArr;
      beRet(data);
      for(var i=0;i<dataArr.length;i++){
        var r=dataArr[i];
        if(typeof r=="undefined") continue;
        //if(r.length!=1) { window[r[1]].call(window,r[0]);   }
        if(r.length==1) {var f=arrRet[i]; if(f) f(r[0]);} else { window[r[1]].call(window,r[0]);   }
      }
    }
    xhr.onerror=function(e){ progress.hide(); uploadButton.prop("disabled",false); var tmp='statusText : '+xhr.statusText;  setMess(tmp); console.log(tmp);   throw 'bla';}
    
    xhr.send(dataOut); 
    busyLarge.show();
    
    setMess('Uploading ...');
    uploadButton.prop("disabled",true);
  
  }

  app.strImageExtWComma=StrImageExt.join(', ');
  var imgHUpload=imgHelp.cloneNode(1).css({'margin-left':'1em'}); popupHover(imgHUpload,createElement('div').myText('Accepted file endings: '+strImageExtWComma+', txt or zip files containing these formats (no folders in the zip file)'));


  var formFile=createElement('form').prop({enctype:"multipart/form-data"});
  var inpFile=createElement('input').prop({name:"file", type:"file", multiple:true}).css({background:'lightgrey'});
  //var inpUploadButton=createElement('input type="button" value="Upload"');
  var uploadButton=createElement('button').myText('Upload').prop("disabled",true);
  var progress=createElement('progress').prop({max:100, value:0}).hide();
  
  var arrName, arrFile, StrConflict;  //arrOrg, 

  formFile.myHtml('<b>Upload:</b> ').myAppend(inpFile).css({display:'inline'});
  el.append(formFile, uploadButton, imgHUpload, progress);

  //var flowVerify;
  inpFile.on('change', async function(e) {
    //flowVerify=verifyFun.call(this,e);  flowVerify.next();
    var [err]=await verifyFun(this.files); if(err) {setMess(err); return;}
  }).on('click',function(){inpFile.value=""; uploadButton.prop("disabled",true);});
  uploadButton.on('click',sendFun);

  return el;
}
//  */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];    eval(myString);    }catch(err){}  //123412341234


var uploadUserDivExtend=function(el){
  el.toString=function(){return 'uploadUserDiv';}
  var progressHandlingFunction=function(e){      if(e.lengthComputable){   progress.attr({value:e.loaded,max:e.total});      }      }
  var setMess=function(str) {divMess.myHtml(str);}
  var clearMess=function() {divMess.myHtml('');}
  var toggleVerified=function(boT){ if(typeof boT=='undefined') boT=divName.style.display!='none'; boT=Boolean(boT); divName.toggle(boT);  uploadButton.prop("disabled",!boT); }
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
    inpName.value=strNameA;  spanExtension.myText('.'+strExtension); inpNameChange();

    toggleVerified(1);
  }
  var sendFun=function(){
    clearMess();
    if(boFormDataOK==0) {alert("This browser doesn't support FormData"); return; };
    var formData = new FormData();
    formData.append("type", 'single');
    formData.append("strName", inpName.value+spanExtension.myText());
    formData.append("fileToUpload[]", objFile);
    
    var strTmp=grecaptcha.getResponse(); if(!strTmp) {setMess("Captcha response is empty"); return; }   formData.append('g-recaptcha-response', strTmp);
    
    
    
    var vecIn=[['uploadUser', {}], ['page',objPage.pageName], ['tMod',objPage.tMod], ['CSRFCode',getItem('CSRFCode')]];
    var arrRet=[function(data){if('strMessage' in data) setMess(data.strMessage); progress.invisible(); uploadButton.prop("disabled",false);}];
    formData.append('vec', JSON.stringify(vecIn));
    var xhr = new XMLHttpRequest();
    xhr.open('POST', uBE, true);
    xhr.setRequestHeader('X-Requested-With','XMLHttpRequest'); 
    var dataOut=formData;
    xhr.setRequestHeader('x-type','single');
    
    progress.attr({value:0}); progress.visible(); //progress.visible();
    xhr.onprogress=progressHandlingFunction;
    xhr.onload=function() {
      var dataFetched=this.response;
      //var data; try{ data=JSON.parse(this.response); }catch(e){ setMess(e); debugger; return; }
      var data=deserialize(this.response);
      
      var dataArr=data.dataArr;  // Each element of dataArr looks like [argument] or [altFuncArg,altFunc]
      delete data.dataArr;
      beRet(data);
      for(var i=0;i<dataArr.length;i++){
        var r=dataArr[i];
        if(typeof r=="undefined") continue;
        //if(r.length) { if('strMessage' in r[0]) setMess(r[0].strMessage);   }
        if(r.length==1) {var f=arrRet[i]; if(f) f(r[0]);} else { window[r[1]].call(window,r[0]);   }
      }
    }
    xhr.onerror=function(e){ progress.invisible(); errorFunc.call(this,arguments); }
    
    xhr.send(dataOut); 
    busyLarge.show();
    

    setMess('Uploading ...');
    uploadButton.prop("disabled",true);
  }
  el.setVis=function(){
    el.show();
    
    
    return true;
  }

  //el=popUpExtend(el);  
  //el.css({'max-width':'20em', padding: '0.3em 0.5em 1.2em 0.6em'});
  var maxUserUploadSizeMB=boDbg?0.5:1;

  var head=createElement('h3').myAppend('Upload Image: (max '+maxUserUploadSizeMB+'MB)').css({'font-weight':'bold'});
  var formFile=createElement('form').prop({enctype:"multipart/form-data"});
  var inpFile=createElement('input').prop({name:"file", type:"file", id:'file', accept:"image/*"}).css({background:'lightgrey'});
  //var inpUploadButton=createElement('input type="button" value="Upload"');
  var uploadButton=createElement('button').myText('Upload').prop("disabled",true).css({'margin-right':'0.5em', 'float':'right'});
  var progress=createElement('progress').prop({max:100, value:0}).css({'display':'block','margin-top':'1em'}).invisible();
  var divMess=createElement('div').css({'margin-top':'1.2em'});
  
  var objFile;
  inpFile.on('change', verifyFun).on('click',function(){this.value=''; uploadButton.prop("disabled",true);});
  formFile.append(inpFile);   formFile.css({display:'inline'});
   
  var inpNameChange=function(e){ 
    clearMess();
    var strNameA=inpName.value, strName=strNameA+spanExtension.myText(); 
    //var boOK=strNameA.length>0; spanOK.myText(boOK?' ':'Empty').css({color:'red'});  
    var boOK=strNameA.length>0; spanOK.myText(boOK?'Checking':'Empty').css({color:boOK?'brown':'red'});   
    //var boOK=strNameA.length>0; if(boOK) spanOK.myText('Checking').css({color:'yellow'}); else spanOK.myText('Empty').css({color:'red'}); 
    if(boOK) myFetch('POST',[['getImageInfo',{arrName:[strName]},inpNameRet]]);
    else uploadButton.prop("disabled",!boOK);
  }
  var inpNameRet=function(data){
    var boOK=data.FileInfo.length==0; spanOK.myText(boOK?'OK':'Exists').css({color:boOK?'green':'red'});  uploadButton.prop("disabled",!boOK);    
  } 
  var inpName=createElement('input').prop({type:'text'}).on('input', inpNameChange); //,placeholder:'Name'
  var spanExtension=createElement('span').css({'font-size':'0.8em'});
  var spanOK=createElement('span').myText('').css({'margin-left':'0.3em',  width:'3em', display:'inline-block', 'font-size':'0.8em'});
  var divNameInner=createElement('div').myAppend(inpName, spanExtension);
  var divName=createElement('div').myAppend('Select name: ', divNameInner, spanOK).css({'margin-top':'1.2em','line-height':'1,3em', background:'lightgrey'}).hide();
  

  var closeButton=createElement('button').myText('Close').on('click',historyBack);
  var menuBottom=createElement('div').myAppend(closeButton, uploadButton).css({'margin-top':'1.2em'});


  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').myAppend(head, formFile, divName, divMess, progress, menuBottom);  
  centerDiv.addClass("Center").css({padding: '0.3em 0.2em 1.2em 0.3em', 'box-sizing':'content-box'}); // 'width':'20em', height:'26em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); //
  

  uploadButton.on('click',sendFun);
  return el;
}





var PageFilterDiv=function(Prop, Label, StrOrderFilt, changeFunc, StrGroupFirst=[], StrGroup=[]){   //  Note!! StrOrderFilt should not be changed by any clinet side plugins (as it is also used on the server)
  var el=createElement('div'); 
  el.toString=function(){return 'pageFilterDiv';}
  el.setNFilt=function(arr){ var tmp=arr[0]+'/'+arr[1]; infoWrap.myText(tmp);  pageList.filterInfoWrap.myText(tmp);  } 
  
  //el.Prop=Prop; el.Label=Label; el.StrOrderFilt=StrOrderFilt; el.changeFunc=changeFunc; el.StrGroupFirst=StrGroupFirst; el.StrGroup=StrGroup;
  //$.extend(el,FilterDivProt);
  
  //el.divCont=createElement('div').css({'max-width':menuMaxWidth,margin:'0em auto','text-align':'left'}); //cssFixed
  var objArg={Prop, Label, StrOrderFilt, changeFunc, StrGroupFirst, StrGroup, helpBub, objSetting:objFilterSetting};
  //objArg.StrProp=oRole.filter.StrProp;

  el.divCont=filterDivICreator(objArg, changeFunc).addClass('contDiv').css({'max-width':menuMaxWidth,margin:'0em auto','text-align':'left'});

      // menuA
  var buttClear=createElement('button').myText('C').on('click',function(){el.Filt.filtAll(); pageList.histReplace(-1); pageList.loadTab();}).css({'margin-left':'1em'});
  var infoWrap=createElement('span'),     spanLabel=createElement('span').myAppend('Page filter',' (',infoWrap,')').css({'float':'right',margin:'0.2em 0 0 0.2em'});
  var menuA=createElement('div').myAppend(buttClear,spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});  // buttonBack,
  
  el.addClass('unselectable').prop({unselectable:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie

  el.fixedDiv=createElement('div').myAppend(menuA).css(cssFixed);
  el.css({'text-align':'center'});
  el.append(el.divCont, el.fixedDiv);
  return el;
}

var ImageFilterDiv=function(Prop, Label, StrOrderFilt, changeFunc, StrGroupFirst=[], StrGroup=[]){   //  Note!! StrOrderFilt should not be changed by any client side plugins (as it is also used on the server)
  var el=createElement('div'); 
  el.toString=function(){return 'imageFilterDiv';}
  el.setNFilt=function(arr){ var tmp=arr[0]+'/'+arr[1]; infoWrap.myText(tmp);  imageList.filterInfoWrap.myText(tmp);  } 
  
  //el.Prop=Prop; el.Label=Label; el.StrOrderFilt=StrOrderFilt; el.changeFunc=changeFunc; el.StrGroupFirst=StrGroupFirst; el.StrGroup=StrGroup;
  //$.extend(el,FilterDivProt);
  //el.divCont=createElement('div').css({'max-width':menuMaxWidth,margin:'0em auto','text-align':'left'}); //cssFixed
  var objArg={Prop, Label, StrOrderFilt, changeFunc, StrGroupFirst, StrGroup, helpBub, objSetting:objFilterSetting};
  //objArg.StrProp=oRole.filter.StrProp;
  
  el.divCont=filterDivICreator(objArg, changeFunc).addClass('contDiv').css({'max-width':menuMaxWidth,margin:'0em auto','text-align':'left'});
  
      // menuA
  var buttClear=createElement('button').myText('C').on('click',function(){el.Filt.filtAll(); imageList.histReplace(-1); imageList.loadTab()}).css({'margin-left':'1em'});
  var infoWrap=createElement('span'),     spanLabel=createElement('span').myAppend('Image filter',' (',infoWrap,')').css({'float':'right',margin:'0.2em 0 0 0.2em'});
  var menuA=createElement('div').myAppend(buttClear,spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});  //buttonBack,

  el.addClass('unselectable').prop({unselectable:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie

  el.fixedDiv=createElement('div').myAppend(menuA).css(cssFixed).css({background:'lightblue'});
  el.css({'text-align':'center'});
  el.append(el.divCont, el.fixedDiv);
  return el;
}


var headExtend=function(el, tableDiv, StrName, BoAscDefault, Label, strTR='tr', strTD='td'){  // tableDiv must have a property table, tBody and nRowVisible (int)
  el.setArrow=function(strName,dir){
    boAsc=dir==1;
    arrImgSort.forEach(function(ele){ele.prop({src:uUnsorted}) });
    var tmp=boAsc?uIncreasing:uDecreasing;
    el.querySelector(strTH+'[name='+strName+']').querySelector('img[data-type=sort]').prop({src:tmp});
  }
  el.clearArrow=function(){
    thSorted=null, boAsc=false;
    arrImgSort.forEach(function(ele){ele.prop({src:uUnsorted}) });
  }
  var thClick=function() {
    var ele=this, strName=ele.attr('name'), boAscDefault=Boolean(ele.boAscDefault); //??0
    boAsc=(thSorted===this)?!boAsc:boAscDefault;  thSorted=this;
    arrImgSort.forEach(function(ele){ele.prop({src:uUnsorted}) });
    var tmp=boAsc?uIncreasing:uDecreasing;  ele.querySelector('img[data-type=sort]').prop({src:tmp});
    var tBody=tableDiv.tBody;
    var arrT=[...tBody.querySelectorAll(strTR)];
    var arrToSort=arrT.slice(0, tableDiv.nRowVisible);
    var iChild=ele.myIndex();
    var comparator=function(aT, bT){
      var a = aT.children[iChild].valSort,  b = bT.children[iChild].valSort,   dire=boAsc?1:-1; 
      var boAStr=0,boBStr=0;
      var aN=Number(a); if(!isNaN(aN) && a!=='') {a=aN;} else {a=a.toLowerCase(); boAStr=1;}
      var bN=Number(b); if(!isNaN(bN) && b!=='') {b=bN;} else {b=b.toLowerCase(); boBStr=1;}
      if(boAStr!=boBStr) return ((boAStr<boBStr)?-1:1)*dire;
      if(a==b) {return 0;} else return ((a<b)?-1:1)*dire;
    }
    var arrToSortN=msort.call(arrToSort,comparator);
    tBody.prepend.apply(tBody,arrToSortN);
  }

  var strTH=strTD=='td'?'th':strTD;
  var boAsc=false, thSorted=null;
  var len=StrName.length;
  var Th=Array(len), arrImgSort=Array(len);
  for(var i=0;i<len;i++){
    var strName=StrName[i];  
    var imgSort=createElement('img').attr('data-type', 'sort').prop({src:uUnsorted, alt:"sort"});
    var boAscDefault=(strName in BoAscDefault)?BoAscDefault[strName]:true;
    var label=(strName in Label)?Label[strName]:ucfirst(strName);
    var h=createElement(strTH).myAppend(imgSort).addClass('unselectable').prop({UNSELECTABLE:"on"}).attr('name',strName).prop('boAscDefault',boAscDefault).prop('title',label).on('click',thClick);
    Th[i]=h;
    arrImgSort[i]=imgSort;
  }

  el.append(...Th);
  el.addClass('listHead');
  return el;
}



  // Methods of clicked button
var clickSetParentFilter=function(){
  var idPage=this.parentNode.parentNode.idPage;  pageFilterDiv.Filt.setSingleParent(idPage); pageList.histPush(); pageList.loadTab();
  if(pageList.style.display=='none') pageList.setVis();
}
var clickSetParentFilterI=function(){
  //changeHist({view:imageList});
  //imageList.setVis();
  var idPage=this.parentNode.parentNode.idPage;   imageFilterDiv.Filt.setSingleParent(idPage); imageList.histPush(); imageList.loadTab(); 
  if(imageList.style.display=='none') imageList.setVis();
}


var PageRowLabel={nParent:'Parents / Alternative parents', cb:'Select',tCreated:'Created',tMod:'Last Modified',tLastAccess:'Last Access', nAccess:'nAccess',boOR:'Public read access', boOW:'Public write access', boSiteMap:'Promote (include in Sitemap.xml etc)', nImage:'Images on page', nChild:'Child pages', version:'Supplied by user / mult versions', strLang:'Language code', siteName:'Site'};
  
  
var pageListExtend=function(el){ 
  el.toString=function(){return 'pageList';}
  var condAddRows=function(){
    var Row=tBody.childNodes;
    for(var i=Row.length; i<File.length;i++){
      var r=createElement('p');
      var cb=createElement('input').prop('type','checkbox').on('click',cbClick);
      //var buttonNParent=createElement('button').myHtml('<span></span>').on('click',function(e){goToParentMethod.call(this,e,'page');});
      var buttonNParent=createElement('button').addClass('aArrow','aArrowLeft').prop({strType:'page'}).on('click',goToParentMethod);
      var tdNParent=createElement('span').myAppend(buttonNParent).attr('name','nParent').prop('title','Parents');
      var tdCB=createElement('span').prop('valSort',0).myAppend(cb).attr('name','cb'); //.css({'margin-left':'0.15em'});
      //var tmpImg=createElement('img').prop({src:uFlash}).prop('draggable',false).css({height:'1em',width:'1em','vertical-align':'text-bottom'});
      var buttonExecute=createElement('button').myAppend(charFlash).on(strMenuOpenEvent,menuPageSingle.buttonExeSingleClick).addClass('unselectable').prop({UNSELECTABLE:"on"});
      var tdExecute=createElement('span').prop('valSort',0).myAppend(buttonExecute).attr('name','execute');
      var tdR=createElement('span').attr('name','boOR').myText(charPublicRead).prop('title',PageRowLabel.boOR), tdW=createElement('span').attr('name','boOW').myText(charPublicWrite).prop('title',PageRowLabel.boOW), tdP=createElement('span').attr('name','boSiteMap').myText(charPromote).css({'margin-right':'0.15em'}).prop('title',PageRowLabel.boSiteMap);
      var tdVer=createElement('span').attr('name','version'); //.css({'margin-left':'0.15em'});
      var tdTCreated=createElement('span').attr('name','tCreated').prop('title',PageRowLabel.tCreated);
      var tdTMod=createElement('span').attr('name','tMod').prop('title',PageRowLabel.tMod);
      var tdTLastAccess=createElement('span').attr('name','tLastAccess').prop('title',PageRowLabel.tLastAccess);
      var tdNAccess=createElement('span').attr('name','nAccess').prop('title',PageRowLabel.nAccess);
      var tdStrLang=createElement('span').attr('name','strLang').prop('title','Language code');
      var tdSite=createElement('span').attr('name','siteName').prop('title','Site'); //.hide();
      var aLink=createElement('a').prop({target:"_blank", rel:"noopener"});
      var tdLink=createElement('span').attr('name','link').myAppend(aLink).css({display:'inline-block'}); //.hide();
      var tdSize=createElement('span').attr('name','size');
      var buttonNChild=createElement('button').addClass('aArrow','aArrowRight').on('click',clickSetParentFilter);
      var buttonNImage=createElement('button').addClass('aArrow','aArrowRight').on('click',clickSetParentFilterI);
      var tdNChild=createElement('span').myAppend(buttonNChild).attr('name','nChild').prop('title','Children'); 
      var tdNImage=createElement('span').myAppend(buttonNImage).attr('name','nImage').prop('title','Images');  
      r.append(tdNParent, tdCB, tdExecute, tdTCreated, tdTMod, tdTLastAccess, tdNAccess, tdR, tdW, tdP, tdSize, tdNImage, tdNChild, tdVer, tdStrLang, tdSite,tdLink);  //    , tdName     ,createElement('span').append(bView)
      //r.data({tdCB, tdTMod, tdR, tdW, tdP, tdLink, tdVer, tdSize, tdNChild, tdNImage});
      tBody.append(r);
    }
  }
  var isAnyOn=function(){
    //var boOn=false, Tr=tBody.children('p:lt('+el.nRowVisible+')');     Tr.find('input').forEach(function(){var boTmp=this.prop('checked'); if(boTmp) boOn=true;});   return boOn;
    var boOn=false, Tr=[...tBody.childNodes].slice(0, el.nRowVisible);     Tr.forEach(ele=>{var inp=ele.querySelector('input'); if(inp.checked) boOn=true;});   return boOn;
  }
  var isOneOn=function(){
    //var Tr=tBody.children('p:lt('+el.nRowVisible+')'), checked=Tr.find('input:checked'); return checked.length==1;
    var Tr=[...tBody.childNodes].slice(0, el.nRowVisible), cOn=0; Tr.forEach(ele=>{var inp=ele.querySelector('input'); if(inp.checked) cOn++;});  return cOn==1;
  }
  var cbClick=function(){
    var cb=this, boOn=Number(cb.prop('checked'));    cb.parentNode.valSort=boOn;
    var boOn=isAnyOn();    allButton.myText(boOn?'None':'All');    buttonExecuteMult.toggle(boOn);
  }
  var fileArray2Div=function(){
    var nRT=File.length;
    //var rows=tBody.children('p');
    var Row=[...tBody.childNodes];
    Row.slice(nRT).forEach(ele=>ele.hide());
    var myRows=Row.slice(0,nRT); 
    myRows.forEach(function(r, i){ 
      r.show();
      r.prop(File[i]);  r.prop({iFlip:i}); 
      var {nParent, idPage, parent, boOR, boOW, boSiteMap, boOther, lastRev, tCreated, tMod, tLastAccess, nAccess, size, nChild, nImage, strLang, boTLS, siteName, www, pageName}=File[i];  
      r.attr({idPage});    
      var aTmp=r.querySelector('span[name=nParent]').prop('valSort',nParent).querySelector('button');
        var boSingleFiltered=pageFilterDiv.Filt.checkIfSingleParent();
        var strTitle=nParent+' parents';
        if(!boSingleFiltered) {
           if(nParent==1) strTitle=parent; else if(nParent==0) strTitle='orphan';
        }
        aTmp.prop('title',strTitle);
        var boCurNSingle=boSingleFiltered && nParent<=1;  
        //var boShow=!boSingleFiltered || nParent>1; 
        //aTmp.visibilityToggle(boShow);
        aTmp.prop({disabled:boCurNSingle});
        aTmp.myText(boCurNSingle?"cur":nParent);
      r.querySelector('span[name=cb]').prop('valSort',0).querySelector('input').prop({'checked':false}); 
      r.querySelector('span[name=boOR]').prop('valSort',boOR).visibilityToggle(boOR); 
      r.querySelector('span[name=boOW]').prop('valSort',boOW).visibilityToggle(boOW);
      r.querySelector('span[name=boSiteMap]').prop('valSort',boSiteMap).visibilityToggle(boSiteMap);
      var strVersion=''; if(Boolean(boOther)) strVersion='v'+(Number(lastRev)+1);   
      //r.querySelector('span[name=version]').toggle(Boolean(boOther)).myText(strVersion);
      r.querySelector('span[name=version]').prop('valSort',strVersion).visibilityToggle(Boolean(boOther)).myText(strVersion);
      r.querySelector('span[name=tCreated]').prop('valSort',-tCreated.valueOf()).myText(mySwedDate(tCreated)).prop('title','Created:\n'+tCreated);  
      r.querySelector('span[name=tMod]').prop('valSort',-tMod.valueOf()).myText(mySwedDate(tMod)).prop('title','Last Mod:\n'+tMod);  
      r.querySelector('span[name=tLastAccess]').prop('valSort',-tLastAccess.valueOf()).myText(mySwedDate(tLastAccess)).prop('title','Last Access:\n'+tLastAccess);  
      r.querySelector('span[name=nAccess]').prop('valSort',nAccess).myText(nAccess).prop('title','nAccess:\n'+nAccess);    
      var sizeDisp=size, pre=''; if(size>=1024) {sizeDisp=Math.round(size/1024); pre='k';} if(size>=1048576) { sizeDisp=Math.round(size/1048576); pre='M';}
      var tmp=r.querySelector('span[name=size]').prop('valSort',size).myHtml(sizeDisp+'<b>'+pre+'</b>'); var strTitle=pre.length?'Size: '+size:''; tmp.prop('title',strTitle);   //tmp.css({weight:pre=='M'?'bold':'',color:pre==''?'grey':''}); 
      //var  buttonTmp=r.querySelector('span[name=nChild]').prop('valSort',nChild).querySelector('button'); buttonTmp.querySelector('span:nth-of-type(1)').myText(nChild); buttonTmp.visibilityToggle(nChild); 
      r.querySelector('span[name=nChild]').prop('valSort',nChild).querySelector('button').myText(nChild).visibilityToggle(nChild);    
      r.querySelector('span[name=nImage]').prop('valSort',nImage).querySelector('button').myText(nImage).visibilityToggle(nImage);
      r.querySelector('span[name=strLang]').prop('valSort',strLang).myText(strLang);
      r.querySelector('span[name=siteName]').prop('valSort',siteName).myText(siteName).prop('title',www);
      var url=createUrlFrPageData({boTLS,www,pageName});
      r.querySelector('span[name=link]').prop('valSort',pageName).querySelector('a').prop({href:url}).myText(pageName);    
    });
    var Tmp=[...tBody.querySelectorAll('input')]; Tmp.forEach(ele=>ele.prop({'checked':false})); // span[name=cb]
  }
  el.setCBStat=function(boOn){
    boOn=Boolean(boOn);allButton.myText('All');
    buttonExecuteMult.toggle(false);
    //tBody.find('span input').prop({'checked':false});
    var Tmp=[...tBody.querySelectorAll('input')]; Tmp.forEach(ele=>ele.prop({'checked':false}));
  }
  var resetExecuteButton=function(){   allButton.myText('All');  buttonExecuteMult.hide();  }
  el.loadTab=function(){
    var Filt=pageFilterDiv.divCont.gatherFiltData();
    var vec=[['setUpPageListCond',{Filt}],['getPageList',{},getListRet],['getPageHist',{},histRet]]; 
    //var boSingleParentFilter=pageFilterDiv.Filt.checkIfSingleParent();
    var boWhite=pageFilterDiv.Filt.isWhite(),     nParentsOn=pageFilterDiv.Filt.getNParentsOn();
    if(boWhite && nParentsOn==1){  // If filtering for single parent then also get the "grandparents"
      var idParent=pageFilterDiv.Filt.getSingleParent();
      vec.push(['getParent',{idPage:idParent},function(data){divRowParent.getParentRet(data);}],
         ['getPageInfoById',{idPage:idParent},function(data){divRowParent.getPageInfoByIdRet(data);}]);
    }
    divRowParent.setUpPreAJAX(idParent);
    myFetch('POST',vec);
    setMess('... fetching pages ... ',5,true);
    head.clearArrow(); resetExecuteButton();
  }
  var getListRet=function(data){
    var nCur;  //, TabTmp, StrCol;
    var tmp=data.NFilt;   if(typeof tmp!="undefined") { pageFilterDiv.setNFilt(tmp); } 
    File.length=0; if('tab' in data) File=tabNStrCol2ArrObj(data);
    el.nRowVisible=File.length;
    condAddRows(); fileArray2Div();
  }
  var histRet=function(data){
    var tmp, HistPHP=data.Hist||[];
    
    pageFilterDiv.divCont.interpretHistPHP(HistPHP);

      // Create TextByParentId
      // If there are pages (parents) with the same "pageName" (on different sites) then use siteName:pageName (when the page is listed). 
    var StrOrderFiltPageFlip=array_flip(StrOrderFiltPage);
    var IdParent=pageFilterDiv.divCont.Hist[StrOrderFiltPageFlip.parent][0];
    TextByParentId={}; var len=IdParent.length, objCount={}, ObjParentInfo=Array(len);
    for(var i=0;i<len;i++) {
      var idParent=IdParent[i]; if(idParent===null) continue;
      var ind=idParent.indexOf(":"); ObjParentInfo[i]={siteName:idParent.substr(0,ind), pageName:idParent.substr(ind+1)};
      if(pageName in objCount) objCount[pageName]++; else objCount[pageName]=1;
    }
    for(var i=0;i<len;i++) {
      var idParent=IdParent[i]; if(idParent===null) continue;
      var {pageName,siteName}=ObjParentInfo[i];
      TextByParentId[idParent]=(objCount[pageName]>1)?siteName+':'+pageName:pageName;
    }


    pageFilterDiv.divCont.update();
    //pageList.setCBStat(0);
  }
  
  var getChecked=function(){
    var Tr=[...tBody.childNodes].slice(0, el.nRowVisible), RowTmp=[]; Tr.forEach(ele=>{
      var inp=ele.querySelector('input:checked'); if(inp) { RowTmp.push(ele);}
    });
    return RowTmp;
  }
  var getCheckedId=function(){
    var RowTmp=getChecked(), Id=Array(RowTmp.length);
    Id=RowTmp.map(ele=>{ return ele.idPage; });
    return Id;
  }
  var changeModOfChecked=function(strName,boVal){
    //var Tr=tBody.children('p:lt('+el.nRowVisible+')');
    //Tr.find('input:checked').forEach(function(ele,i){var cb=ele; cb.parentNode.parentNode.children('span[name='+strName+']').prop('valSort',Number(boVal)).visibilityToggle(boVal); });
    var Tr=[...tBody.childNodes].slice(0, el.nRowVisible);
    Tr.forEach(ele=>{
      var inp=ele.querySelector('input:checked'); if(inp) inp.parentNode.parentNode.querySelector('span[name='+strName+']').prop('valSort',Number(boVal)).visibilityToggle(boVal);
    });
  }
  el.changeName=function(r,strNewName){
    if(r.iFlip!==null){
      var iFlip=r.iFlip;
      File[iFlip].pageName=strNewName;
      var {boTLS, www, pageName}=File[iFlip];
      var url=createUrlFrPageData({boTLS,www,pageName});
      r.prop('pageName',pageName); var td=r.querySelector('span[name=link]').prop('valSort',pageName); td.querySelector('a').prop({href:url}).myText(pageName);
    }
  }
  el.changeStrLang=function(r,strLang){
    if(r.iFlip!==null){
      var iFlip=r.iFlip;
      File[iFlip].strLang=strLang;
      r.prop('strLang',strLang); var td=r.querySelector('span[name=strLang]').prop('valSort',strLang); td.myText(strLang);
    }
  }
  el.deleteF=function(Id, histBackFun){
    var vec=[['deletePage',{Id}, histBackFun]];
    resetExecuteButton();  myFetch('POST', vec);
  }
  el.setStrLangF=function(Id, histBackFun){
    var vec=[['deletePage',{Id}, histBackFun]];
    resetExecuteButton();  myFetch('POST', vec);
  }
  
  var funPopped=function(stateMyPopped){ 
    pageFilterDiv.divCont.frStored(stateMyPopped);
    el.loadTab();
  }
  el.histPush=function(){
    var o=pageFilterDiv.divCont.toStored();
    doHistPush({view:pageList, Filt:o, fun:funPopped}); //
  }
  el.histReplace=function(indDiff){
    var o=pageFilterDiv.divCont.toStored();
    doHistReplace({view:pageList, Filt:o, fun:funPopped}, indDiff); // 
  }


  //var IndSiteName, 
  var TextByParentId;
  PropPage.siteName.setFilterButtF=function(span,val,boOn){
    // var text=''; if(val in IndSiteName) text=IndSiteName[val].siteName;
    // else if(val===null) text='(null!?!)';
    var text=(val===null)?text='(null!?!)':val;
    span.myText(text);
  }
  PropPage.parent.setFilterButtF=function(span,val,boOn){
    var text=''; if(val in TextByParentId) text=TextByParentId[val];
    else if(val===null) text='(no parent)';
    span.myText(text);
  }
  // PropPage.child.setFilterButtF=function(span,val,boOn){
  //   //var text=''; if(val in TextByChildId) text=TextByChildId[val];
  //   //else if(val===null) text='(no child)';
  //   var text=(val===null)?text='(no child)':val;
  //   span.myText(text);
  // }
  // PropPage.image.setFilterButtF=function(span,val,boOn){
  //   var text=(val===null)?text='(no image)':val;
  //   span.myText(text);
  // }

  //var myRows;
  var tBody=el.tBody=createElement('div').addClass('pageList', 'listBody'); //.addClass('listBody')
  el.table=createElement('div').myAppend(tBody).css({width:'100%',position:'relative'});
  el.divCont=createElement('div').myAppend(el.table).css({margin:'0em auto 1em','text-align':'left',display:'inline-block'});//
  //el.divCont.on('mouseover','button[name=nChild]',function(){console.log('gg');});

  var StrCol=['nParent','cb','execute','tCreated','tMod','tLastAccess','nAccess','boOR','boOW','boSiteMap','size','nImage','nChild','version','strLang','siteName', 'link'];
  var BoAscDefault={cb:0,boOR:0,boOW:0,boSiteMap:0,nImage:0,nChild:0,nParent:0,version:0,nAccess:0,size:0}; // Default is 1
  //var spanFill=createElement('span').css({height:'calc(1.5*8px + 0.6em)'});
  //var headFill=createElement('p').append().css({background:'white',margin:'0px',height:'calc(12px + 1.2em)'});
  var head=headExtend(createElement('p'),el,StrCol,BoAscDefault,PageRowLabel,'p','span').addClass('pageList');
  head.css({background:'white', width:'inherit',height:'calc(12px + 1.2em)'});     // , position:'sticky', top:'57px', 'z-index':'1', margin:'0px'
  el.headW=createElement('div').myAppend(head).css({background:'white', width:'inherit', position:'sticky', top:'0px', 'z-index':'1', margin:'0px'});     
  el.table.prepend(el.headW); //,headFill


    // menuA
  var allButton=createElement('button').myText('All').addClass('fixWidth').css({'margin-right':'1em'}).on('click',function(){  //'margin-left':'0.8em'
    var boOn=allButton.myText()=='All';
    //var Tr=tBody.children('p:lt('+el.nRowVisible+')');
    //Tr.find('input').prop({'checked':boOn});
    var Tr=[...tBody.childNodes].slice(0, el.nRowVisible);
    Tr.forEach(ele=>{ var inp=ele.querySelector('input'); if(inp) inp.prop({'checked':boOn}); });
    allButton.myText(boOn?'None':'All');
    buttonExecuteMult.toggle(boOn);
  });

  var strEvent='mouseup'; if(boTouch) strEvent='click';


  var strPublicRead='<span style="display:inline-block">'+charPublicRead+'</span> (public read)';
  var strPublicWrite=charPublicWrite+' (public write)';
  var strPromote=charPromote+' (promote)';


    // menuMult
  var buttonDownload=createElement('div').myText('Download');
  var buttonROn=createElement('div').myHtml(strPublicRead+' on').on(strEvent,function(){  var Id=getCheckedId(),   vec=[['myChMod',{boOR:1,Id}]];   myFetch('POST',vec);   changeModOfChecked('boOR',1);   });
  var buttonROff=createElement('div').myHtml(strPublicRead+' off').on(strEvent,function(){  var Id=getCheckedId(),   vec=[['myChMod',{boOR:0,Id}]];   myFetch('POST',vec);   changeModOfChecked('boOR',0);   });
  var buttonWOn=createElement('div').myText(strPublicWrite+' on').on(strEvent,function(){  var Id=getCheckedId(),   vec=[['myChMod',{boOW:1,Id}]];   myFetch('POST',vec);   changeModOfChecked('boOW',1);   });
  var buttonWOff=createElement('div').myText(strPublicWrite+' off').on(strEvent,function(){  var Id=getCheckedId(),   vec=[['myChMod',{boOW:0,Id}]];   myFetch('POST',vec);   changeModOfChecked('boOW',0);   });
  var buttonPOn=createElement('div').myText(strPromote+' on').on(strEvent,function(){  var Id=getCheckedId(),   vec=[['myChMod',{boSiteMap:1,Id}]];   myFetch('POST',vec);   changeModOfChecked('boSiteMap',1);   });
  var buttonPOff=createElement('div').myText(strPromote+' off').on(strEvent,function(){  var Id=getCheckedId(),   vec=[['myChMod',{boSiteMap:0,Id}]];   myFetch('POST',vec);   changeModOfChecked('boSiteMap',0);   });
  var buttonDelete=createElement('div').myText('Delete').on(strEvent,function(){
    var Id=getCheckedId(), strLab='Are sure you want to delete these pages';   areYouSurePop.openFunc(strLab, function(){el.deleteF(Id, historyBack);}, historyBack);
  });
  var buttonSetStrLang=createElement('div').myText('Set language code').on(strEvent,function(){
    var Row=getChecked(); if(Row.length==0) {setMess('Row.length==0'); return;} var strLang=Row[0].strLang; 
    //var Id=Array(Row.length); Id=Row.map(r=>{return r.idPage;});
    var Id=getCheckedId();   setStrLangPop.openFunc(strLang,Id);
  });
  var buttonSetSiteOfPage=createElement('div').myText('Change site').on(strEvent,function(){
    var Row=getChecked(); if(Row.length==0) {setMess('Row.length==0'); return;} var idSite=Row[0].idSite; 
    //var Id=Array(Row.length); Id=Row.map(r=>{return r.idPage;});
    var Id=getCheckedId();   setSiteOfPagePop.openFunc(idSite,Id);
  });
  
  //var tmpImg=createElement('img').prop({src:uFlash}).prop('draggable',false).css({height:'1em',width:'1em','vertical-align':'text-bottom'});   
  var buttonExecuteMult=createElement('button').myText(charFlash).addClass('fixWidth').addClass('unselectable').prop({UNSELECTABLE:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie;
  var itemMulti=[buttonROn, buttonROff, buttonWOn, buttonWOff, buttonPOn, buttonPOff, buttonDelete, buttonSetStrLang];
  var menuMult=createElement('div').css({'text-align':'left', 'line-height':'1.3em'});  menuExtend(menuMult);
  var buttonExeMultClick=function(e){ 
    //var button=this;  //itemMulti[0].toggle(isOneOn());
    //if(boTouch){ doHistPush({view:menuDiv});     menuDiv.setUp(itemMulti);   menuDiv.setVis();    }else{   }
    //menuMult.openFunc(e,button,itemMulti); 
    //var fragItems=jQueryObjToFragment(itemMulti);
    menuMult.openFunc(e,this,itemMulti);
  }
  buttonExecuteMult.on(strMenuOpenEvent,buttonExeMultClick); 
  

  var File=[]; el.nRowVisible=0;

  //var buttonBack=createElement('button').myText('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',historyBack);
  var spanTmp=createElement('span').myText(strFastBackSymbol).css({'font-size':'0.7em'});
  var buttonFastBack=createElement('button').myAppend(spanTmp).addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',function(){history.fastBack(adminMoreDiv);});
  //var spanLabel=createElement('span').append('Pages').css({'float':'right',margin:'0.2em 0 0 0'});  

  var tmpImg=createElement('img').prop({src:uFilter, alt:"filter"}).css({height:'1em',width:'1em','vertical-align':'text-bottom'}).addClass('undraggable');
  el.filterInfoWrap=createElement('span');
  var buttFilter=createElement('button').myAppend(tmpImg,' (',el.filterInfoWrap,')').addClass('flexWidth').css({'float':'right','margin-right':'0.2em'}).on('click',function(){ doHistPush({view:pageFilterDiv}); pageFilterDiv.setVis();});
  var buttClear=createElement('button').myText('C').on('click',function(){pageFilterDiv.Filt.filtAll(); pageList.histPush(); pageList.loadTab()}).css({'float':'right','margin-right':'1em'});
  var spanTmp=createElement('span').myText('orp­hans').css({'font-size':'0.8em'});
  var buttOrphan=createElement('button').myText('orp­hans').on('click',function(){pageFilterDiv.Filt.setSingleParent(null);  pageList.histPush(); pageList.loadTab()}).css({'float':'right','margin-right':'1em'});

  var menuA=createElement('div').myAppend(buttonFastBack, allButton, buttonExecuteMult, buttFilter, buttClear, buttOrphan);  // buttonBack, 
  menuA.css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});

  el.fixedDiv=createElement('div').myAppend(menuA).css(cssFixed);
  el.css({'text-align':'center'});
  el.append(el.divCont,el.fixedDiv);  //,el.fixedTop
  return el;
}


var pageListRowMethods={
  changeModOfSingle:function(strName,boVal){
    var r=this;
    var boValO=r[strName];
    if(typeof boVal=='undefined') boVal=1-boValO;
 
    var o={Id:[r.idPage]}; o[strName]=boVal;
    var vec=[['myChMod',o]];   myFetch('POST',vec);
    r.prop(strName,boVal);
    //var span=r.children('span[name='+strName+']');  span.prop('valSort',Number(boVal)).visibilityToggle(boVal);
    var span=r.querySelector('span[name='+strName+']');  span.prop('valSort',Number(boVal)).visibilityToggle(boVal);
  }
}

var menuPageSingleExtend=function(menuSingle){ // The menu that appears when one clicks "execute" on a single row or parent filter row. (not the "multi"-menu)
  var strPublicRead='<span style="display:inline-block">'+charPublicRead+'</span> (public read)';
  var strPublicWrite=charPublicWrite+' (public write)';
  var strPromote=charPromote+' (promote)';
  
  var strEvent='mouseup'; if(boTouch) strEvent='click';

        // menuSingle
  var buttonDownload=createElement('div').myText('Download');
  var buttonRename=createElement('div').myText('Rename').on(strEvent,function(){
    renamePop.openFunc('page', this.parentElement.r, 1);
  });
  var buttonSetStrLang=createElement('div').myText('Set strLang').on(strEvent,function(){
    var r=this.parentElement.r;
    setStrLangPop.openFunc(r.strLang, [r.idPage]); //, 1
  });
  var buttonSetSiteOfPage=createElement('div').myText('Change site').on(strEvent,function(){
    var r=this.parentElement.r;
    setSiteOfPagePop.openFunc(r.idSite,[r.idPage]);
  });
  var buttonRTog=createElement('div').myHtml('Toggle '+strPublicRead).on(strEvent,function(){  pageListRowMethods.changeModOfSingle.call(this.parentElement.r,'boOR');   });
  var buttonWTog=createElement('div').myHtml('Toggle '+strPublicWrite).on(strEvent,function(){  pageListRowMethods.changeModOfSingle.call(this.parentElement.r,'boOW');   });
  var buttonPTog=createElement('div').myText('Toggle '+strPromote).on(strEvent,function(){  pageListRowMethods.changeModOfSingle.call(this.parentElement.r,'boSiteMap');   });
  var buttonDelete=createElement('div').myText('Delete').on(strEvent,function(){
    var r=this.parentElement.r,  Id=[r.idPage], strLab='Are sure you want to delete this page'; 
    areYouSurePop.openFunc(strLab, function(){pageList.deleteF(Id, historyBack);}, historyBack);
  });
  
  var itemSingle=[buttonRename, buttonSetStrLang, buttonSetSiteOfPage, buttonRTog, buttonWTog, buttonPTog, buttonDelete];
  menuSingle.css({'text-align':'left', 'line-height':'1.3em'});  menuExtend(menuSingle);
  menuSingle.buttonExeSingleClick=function(e){ 
    var button=this; 
    menuSingle.r=button.parentElement.parentElement;
    //var fragItems=jQueryObjToFragment(itemSingle);
    menuSingle.openFunc(e,this,itemSingle);
  }
  return menuSingle;
}



   //
   // SpanGrandParent, DivRowParentT
   //

var SpanGrandParent=function(){
  var el=createElement('span'); extend(el,SpanGrandParent.tmpPrototype);
  el.GrandParent=[];
  el.objParent={};
  //.css({'background-image':'url("stylesheets/buttonLeft1.png")'})
  //.css({'background-image':'url("stylesheets/buttonLeft3.png")'})
  el.buttPop=createElement('button').addClass('aArrow','aArrowLeft').on('click',function(){
    //el[0].parentElement.parentElement.parentElement.parentElement.parentElement==imageList[0]
    parentSelPop.setUp(el.GrandParent, el.objParent); parentSelPop.setVis(); doHistPush({view:parentSelPop}); 
  }).hide();
  el.buttOrphan=createElement('button').myText('(orphans)').addClass('aArrow','aArrowLeft').on('click',function(){ el.clickFunc(null); }).hide();
  el.spanButt=createElement('span').on('click',function(e){
    var ele=e.target;
    if(ele.nodeName!='BUTTON') return;
    var ind=ele.ind;
    //parentSelPop.setUp([el.GrandParent[ind]]);
    el.clickFunc(el.GrandParent[ind]);
  });

  el.myAppend(el.buttPop, el.buttOrphan, el.spanButt); //  'Up: ',    .on('click',function(){el.clickFunc();}); 
  return el;
}
SpanGrandParent.tmpPrototype={};
SpanGrandParent.tmpPrototype.setUpClear=function(){   this.spanButt.empty(); this.buttPop.hide();  this.buttOrphan.hide();  }
SpanGrandParent.tmpPrototype.setUp=function(GrandParent){
  var strTypeCurrent=imageList.style.display=='none'?'page':'image';
  this.GrandParent=GrandParent; 
  var nGrandParent=GrandParent.length, lenMax=10;;
  var boPop=nGrandParent>2; this.buttPop.toggle(boPop).myText(nGrandParent);
  //this.buttOrphan.toggle(!nGrandParent);
  this.spanButt.empty();
  if(!boPop){
    for(var i=0;i<nGrandParent;i++){
      var {pageName}=GrandParent[i], str=pageName;   if(str.length>lenMax) str=str.substr(0,lenMax-2)+'...';
      var butt=createElement('button').myText(str).prop('title', pageName).prop({ind:i});       this.spanButt.append(butt);
      //var intSize=1; if(str.length>6) intSize=3;  else if(str.length>3) intSize=2; // Determine size of background image
      //butt.css({'background-image':'url("stylesheets/buttonLeft'+intSize+'.png")'}); //+this.strColor
      butt.addClass('aArrow','aArrowLeft');
    }
  }
  var filterDiv=strTypeCurrent=='page'?pageFilterDiv:imageFilterDiv;
  var On=filterDiv.Filt.getParentsOn(), boOrphanFiltering=Boolean(On.length==1 && On[0]==null), boShow=!boOrphanFiltering && nGrandParent==0;  this.buttOrphan.toggle(boShow); // this.toggle(boShow);
}
SpanGrandParent.tmpPrototype.clickFunc=function(parent){ 
  var idPage=parent?parent.idPage:null;
  //var {idPage=null}=parent;
  pageFilterDiv.Filt.setSingleParent(idPage); 
  pageList.histPush(); pageList.loadTab();    if(pageList.style.display=='none') { pageList.setVis(); }  
}
   
var DivRowParentT=function(){
  var el=createElement('div'); extend(el,DivRowParentT.tmpPrototype);
  var setParentFilter=function(){
    var boImageCur=pageList.style.display=='none',  boImageGoal=this==el.buttonNImage;
    var divCur=boImageCur?imageFilterDiv:pageFilterDiv;
    var divGoal=boImageGoal?imageFilterDiv:pageFilterDiv;
    var listGoal=boImageGoal?imageList:pageList;
    
    var idPage=divCur.Filt.getSingleParent();
    divGoal.Filt.setSingleParent(idPage); listGoal.histPush(); listGoal.loadTab();
    if(listGoal.style.display=='none') listGoal.setVis();
  }
  
  el.spanGrandParent=new SpanGrandParent().css({'margin-right':'0.6em'}).attr('name','nParent');

  var buttonExecute=createElement('button').myText(charFlash).on(strMenuOpenEvent, menuPageSingle.buttonExeSingleClick).addClass('unselectable').prop({UNSELECTABLE:"on"}) 
  el.tdExecute=createElement('span').prop('valSort',0).myAppend(buttonExecute).attr('name','execute'); 
  el.tdR=createElement('span').attr('name','boOR').myText(charPublicRead).prop('title',PageRowLabel.boOR); el.tdW=createElement('span').attr('name','boOW').myText(charPublicWrite).prop('title',PageRowLabel.boOW); el.tdP=createElement('span').attr('name','boSiteMap').myText(charPromote).css({'margin-right':'0.15em'}).prop('title',PageRowLabel.boSiteMap);
  el.tdVer=createElement('span').attr('name','version').css({'min-width':'1.5em', background:'red'}); //, 'float':'right'  .css({'margin-left':'0.15em'});
  el.tdTCreated=createElement('span').attr('name','tCreated').prop('title',PageRowLabel.tCreated);
  el.tdTMod=createElement('span').attr('name','tMod').prop('title',PageRowLabel.tMod);
  el.tdTLastAccess=createElement('span').attr('name','tLastAccess').prop('title',PageRowLabel.tLastAccess);
  el.tdNAccess=createElement('span').attr('name','nAccess').prop('title',PageRowLabel.nAccess);
  el.tdSite=createElement('span').attr('name','siteName');
  el.tdOrphan=createElement('span').css({color:'grey'});
  el.aLink=createElement('a').prop({target:"_blank", rel:"noopener"});
  el.tdStrLang=createElement('span').attr('name','strLang').prop('title','Language code');;  //.css({'float':'right'});
  el.tdLink=createElement('span').attr('name','link').myAppend(el.aLink);
  el.tdSize=createElement('span').attr('name','size');  //.css({'float':'right'});
  el.buttonNChild=createElement('button').addClass('aArrow','aArrowRight').on('click',setParentFilter);
  el.buttonNImage=createElement('button').addClass('aArrow','aArrowRight').on('click',setParentFilter).prop('title','Images');
  el.tdNChild=createElement('span').myAppend(el.buttonNChild).attr('name','nChild');//.css({'float':'right'}); 
  el.tdNImage=createElement('span').myAppend(el.buttonNImage).attr('name','nImage');//.css({'float':'right'});  
  
  el.append(el.spanGrandParent, el.tdExecute, el.tdTCreated, el.tdTMod, el.tdTLastAccess, el.tdNAccess, el.tdR, el.tdW, el.tdP, el.tdSize, el.tdNImage, el.tdNChild, el.tdVer, el.tdStrLang, el.tdSite, el.tdLink, el.tdOrphan);
  
  el.css({'line-height':'2.7em'});  // ,'max-width':menuMaxWidth
  el.addClass('pageList');
  return el;
}
DivRowParentT.tmpPrototype={};
DivRowParentT.tmpPrototype.setUpPreAJAX=function(idParent){  
  var boWhite=pageFilterDiv.Filt.isWhite();
  var nParentsOn=pageFilterDiv.Filt.getNParentsOn();
  var nParentsOff=pageFilterDiv.Filt.getNParentsOff();
  //if(typeof iParent!='undefined') this.idPage=idParent;
  if(!boWhite || nParentsOn!=1){
    this.spanGrandParent.setUpClear();
    //this.children().hide();
    [...this.childNodes].forEach(ele=>ele.hide());
    this.tdOrphan.show();
  
    if(boWhite) { var strTmp='('+nParentsOn+' parents on)', StrTmp=pageFilterDiv.Filt.getParentsOn(); } 
    else { 
      if(nParentsOff){ var strTmp='('+nParentsOff+' parents off)', StrTmp=pageFilterDiv.Filt.getParentsOff(); }
      else {var strTmp='(No parent filter)', StrTmp=[];}
    }
    var StrTmp=StrTmp.slice(0,5), indT=StrTmp.indexOf(null); if(indT!=-1) StrTmp[indT]='(orphans)';
    var strTitle=StrTmp.join('\n');
    this.tdOrphan.myText(strTmp).css({color:'grey'}).prop('title',strTitle);
    return;
  } 
}
DivRowParentT.tmpPrototype.getParentRet=function(data){
  if('tab' in data) { var Parent=tabNStrCol2ArrObj(data); this.spanGrandParent.setUp(Parent);  } 
}
DivRowParentT.tmpPrototype.getPageInfoByIdRet=function(data){
  var {nParent, idPage, parent, boOR, boOW, boSiteMap, boOther, lastRev, tCreated, tMod, tLastAccess, nAccess, size, nChild, nImage, strLang, boTLS, siteName, www, pageName}=data;
  Object.assign(this.spanGrandParent.objParent, data);
  var boImageList=imageList.style.display!='none', boPageList=!boImageList;
  this.buttonNChild.myText(boPageList?"cur":nChild).prop("disabled",boPageList).visibilityToggle(nChild);
  this.buttonNImage.myText(boImageList?"cur":nImage).prop("disabled",boImageList).visibilityToggle(nImage);
  
  if(idPage==null) {
    //this.children().hide();
    [...this.childNodes].forEach(ele=>ele.hide());  this.tdNChild.show(); this.tdNImage.show();
    this.tdOrphan.show().myText('orphans'+(boPageList?' (roots)':'')); this.aLink.myText('');
  } else {
    //this.children().show();
    [...this.childNodes].forEach(ele=>ele.show());
    this.tdOrphan.myText('');
    this.prop(data);  this.prop({iFlip:null}); 
    
    //var text=siteName+':'+pageName; //if(nSame>1) text=siteName+':'+text;

    var sizeDisp=size, pre=''; if(size>=1024) {sizeDisp=Math.round(size/1024); pre='k';} if(size>=1048576) { sizeDisp=Math.round(size/1048576); pre='M';}
      this.tdSize.myHtml(sizeDisp+'<b>'+pre+'</b>'); var strTitle=pre.length?'Size: '+size:''; this.tdSize.prop('title',strTitle); 
    var strVersion=Boolean(boOther)?'v'+(Number(lastRev)+1):'';  
      this.tdVer.visibilityToggle(Boolean(boOther)).myText(strVersion);
    this.tdR.visibilityToggle(Boolean(boOR)); this.tdW.visibilityToggle(Boolean(boOW)); this.tdP.visibilityToggle(Boolean(boSiteMap));
    this.tdTCreated.myText(mySwedDate(tCreated)).prop('title','Created:\n'+tCreated);   
    this.tdTMod.myText(mySwedDate(tMod)).prop('title','Last Mod:\n'+tMod);   
    this.tdTLastAccess.myText(mySwedDate(tLastAccess)).prop('title','Last Access:\n'+tLastAccess);   
    this.tdNAccess.myText(nAccess).prop('title','nAccess:\n'+nAccess);   
    this.tdStrLang.myText(strLang); 
    this.tdSite.myText(siteName).prop('title',www); 
    var url=createUrlFrPageData({boTLS,www,pageName});  this.aLink.prop({href:url}).myText(pageName);   
  }
}



  // Method of buttonNParent
var goToParentMethod=function(e){
  var {strType}=this, r=this.parentNode.parentNode,  {idPage, idImage, nParent, idParent, boTLS, www, parent}=r;
  var FiltGoal=strType=='page'?pageFilterDiv.Filt:imageFilterDiv.Filt;
  var listGoal=strType=='page'?pageList:imageList;
  var boUseSelPop=nParent>1;
  if(adminMoreDiv.boUseSelPopForSinglParent && nParent==1) boUseSelPop=true;
  if(e.shiftKey && nParent==1) boUseSelPop=true;
  if(boUseSelPop){ 
    parentSelPop.setUp({idPage, idImage}, strType); parentSelPop.setVis();  doHistPush({view:parentSelPop});
  }else{ // ... go directly to parent 
    //if(!e.shiftKey) {var url=createUrlFrPageData({boTLS, www, pageName:parent}); window.open(url); return false; }
    FiltGoal.setSingleParent(idParent);  listGoal.histPush(); listGoal.loadTab(); 
  } 
}

var parentSelPopExtend=function(el){
  el.toString=function(){return 'parentSelPop';}
  var cbGotoList=function(){
    var {idPage,strType}=this;
    var FiltT=strType=='page'?pageFilterDiv.Filt:imageFilterDiv.Filt;
    var listGoal=strType=='page'?pageList:imageList;
    FiltT.setSingleParent(idPage);
    //changeHist({view:listGoal});
    listGoal.histReplace(); listGoal.loadTab(); listGoal.setVis();
  }
  var cbChange=function(){
    var {idPage}=this;
    el.setUp({idPage}, 'page');
  }

  el.setUp=async function(){  //arg0, arg1='page'
    if(arguments[0] instanceof Array) { var [Parent, objPageL]=arguments, strType='page';}
    else{
      var [{idPage, idImage}, strType]=arguments;
      //var {idPage, idImage}=arg3;
      if(strType=='page'){ var vec=[['getParent', {idPage}], ['getPageInfoById',{idPage}]]; }
      else{ var vec=[['getParentOfImage', {idImage}], ['getImageInfoById',{idImage}]]; }
      var [err,dataArr]=await myFetch('POST',vec,1); if(err){setMess(err); return;}
      var data=dataArr[0][0], Parent=[]; if('tab' in data) Parent=tabNStrCol2ArrObj(data); 
      var data=dataArr[1][0];
    }
    var FiltT=strType=='page'?pageFilterDiv.Filt:imageFilterDiv.Filt;
    var idPageList=FiltT.getSingleParent();
    if(strType=='page'){
      var {nParent, idPage, parent, boOR, boOW, boSiteMap, boOther, lastRev, tCreated, tMod, tLastAccess, nAccess, size, nChild, nImage, strLang, boTLS, siteName, www, pageName}=data;
      var butP=createElement('button').prop({disabled:1}).myText("cur").addClass('aArrow', 'aArrowLeft'); //nParent
      var butC=createElement('button').prop({idPage, strType:'page'}).myText(nChild).on('click',cbGotoList).visibilityToggle(nChild);
      var butI=createElement('button').prop({idPage, strType:'image'}).myText(nImage).on('click',cbGotoList).css({background:'lightblue'}).visibilityToggle(nImage);
      var spanSite=createElement('span').myText(siteName);
      var url=createUrlFrPageData({boTLS, www, pageName});
      var a=createElement('a').prop({href:url, target:"_blank", rel:"noopener"}).myText(pageName).css({display:'inline-block'});
      var ElTmp=[butC, butI]; ElTmp.forEach(ele=>ele.addClass('aArrow', 'aArrowRight'));
      ElTmp=[butP, ...ElTmp, spanSite]; ElTmp.forEach(ele=>ele.css({'margin-right':"0.4em"}));
      child.empty().myAppend(...ElTmp, a);
    }else{
      var {idImage, imageName, boOther, tCreated, strHash, size, widthSkipThumb, width, height, extension, tLastAccess, nAccess, tMod, hash, nParent}=data;
      var butP=createElement('button').prop({disabled:1}).myText("cur").addClass('aArrow', 'aArrowLeft'); // nParent
      var url=createUrlFrPageData({boTLS, www, imageName});
      var img=createElement('img').prop({src:'50apx-'+imageName, alt:"thumb"}).css({'vertical-align':'middle', 'max-width':'50px', 'max-height':'50px'}).on('click',function(){window.open(imageName);});
      var a=createElement('a').prop({href:url, target:"_blank", rel:"noopener"}).myText(imageName).css({display:'inline-block'});
      ElTmp=[butP]; ElTmp.forEach(ele=>ele.css({'margin-right':"0.4em"}));
      child.empty().myAppend(...ElTmp, img, a);
    }
    
    div.empty();
    for(var i=0;i<Parent.length;i++) {  
      var {boTLS, siteName, www, idPage, pageName, nChild, nImage, size, strLang, boOR, boOW, boSiteMap, nParent, tCreated, tMod, tLastAccess, nAccess}=Parent[i];
      //var idPage=Parent[i].idPage, name=Parent[i].pageName, siteName=Parent[i].siteName;
      var boCur=idPage===idPageList;
      var cbTmp=nParent==0?cbGotoList:cbChange;
      var butP=createElement('button').prop({idPage, strType:'page'}).myText(nParent).addClass('aArrow', 'aArrowLeft').on('click',cbTmp);
      var boDisabled=boCur && strType=='page';
      var butC=createElement('button').prop({idPage, strType:'page', disabled:boDisabled}).myText(boDisabled?"cur":nChild).on('click',cbGotoList).visibilityToggle(nChild);
      var boDisabled=boCur && strType=='image';
      var butI=createElement('button').prop({idPage, strType:'image', disabled:boDisabled}).myText(boDisabled?"cur":nImage).on('click',cbGotoList).css({background:'lightblue'}).visibilityToggle(nImage);
      var spanSite=createElement('span').myText(siteName);
      var url=createUrlFrPageData({boTLS, www, pageName});
      var a=createElement('a').prop({href:url, target:"_blank", rel:"noopener"}).myText(pageName).css({display:'inline-block'});
      var ElTmp=[butC, butI]; ElTmp.forEach(ele=>ele.addClass('aArrow', 'aArrowRight'));
      ElTmp=[butP, ...ElTmp, spanSite]; ElTmp.forEach(ele=>ele.css({'margin-right':"0.4em"}));
      //if(!boEqual) r.prepend(siteName+' ');
      var r=createElement('p').css({display:'block'}).myAppend(...ElTmp, a);
      div.append(r);
    }  
  }
  el.closeFunc=function(){   historyBack();    }
  el.setVis=function(){
    el.show(); return 1;
  }
  
  //el=popUpExtend(el);  
  //el.css({'max-width':'20em', padding: '0.5em 0.5em 1.2em 1.2em'});  

  //var spanNParent=createElement('span');


  var div=createElement('div').css({ overflow: 'auto'}); //'overflow-y':'scroll'     
  var close=createElement('button').myText(charClose).css({'align-self': 'flex-end'}).on('click',function(){historyBack();}); 
  var child=createElement('div').css({'font-weight':'bold', background:'#aaa', flex:2}); // ,'margin-left':'1em'  .myAppend(spanNParent,' Parents')
  var foot=createElement('div').css({display:'flex', 'align-items':'center'}).myAppend(child); //close,   .myAppend(spanNParent,' Parents')
 
  //el.append(head,div,close);
  //el.css({'text-align':'left'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").css({background:'#ccc'}).myAppend(close, div, foot).css({'max-width':'95%', 'max-height':'98%', padding: '0.5em 0.5em 1.2em 0.5em', display:'flex', 'flex-direction':'column'});  // height:'22em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
  
  return el;
}


var renamePopExtend=function(el){
  el.toString=function(){return 'renamePop';}
  var save=function(){ 
    resetMess();  
    var strNewName=inpName.value.trim(); inpName.value=strNewName; if(strNewName.length==0) {setMess('name can not be empty',5); return; }
    strNewName.replace(RegExp(' ','g'),'_');
    var id=row['id'+ucfirst(strType)], o1={strNewName,id};
    var vec=[['rename'+ucfirst(strType),o1,saveRet]];   myFetch('POST',vec);

    setMess('',null,true);  
  }
  var saveRet=function(data){
    var boOK=false;
    var tmp=data.boOK;   if(typeof tmp!="undefined")  boOK=tmp;
    if(boCallFrList){
      var par=strType=='page'?pageList:imageList;
      if(boOK) { par.changeName(row, inpName.value); }  
    }
    historyBack();
  }
  el.openFunc=function(strTypeT, rowT, boCallFrListT=0){
    strType=strTypeT; row=rowT; boCallFrList=boCallFrListT;
    var strName=row[strType+'Name'];  
    type.myText(strType); inpName.prop('value',strName);
    doHistPush({view:renamePop});
    el.setVis();
    inpName.focus();
  }
  var row, strType='', boCallFrList;

  el.setVis=function(){  el.show();   return true; }

 
  var type=createElement('span'); 
  var head=createElement('h3').myAppend('Rename ',type);
  var nameLab=createElement('div').myText('New name: ');
  var inpName=createElement('input').css({display:'block',width:'100%'}).on('keypress',  function(e){ if(e.which==13) {save();return false;}} );

  var saveButton=createElement('button').myText('Save').on('click',save).css({'margin-top':'1em'});
  var cancelButton=createElement('button').myText('Cancel').on('click',historyBack).css({'margin-top':'1em'});
  //el.append(head,nameLab,inpName,cancelButton,saveButton); //.css({padding:'0.1em'}); 

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").myAppend(head,nameLab,inpName,cancelButton,saveButton).css({'min-width':'17em', 'max-width':'30em', padding: '0.3em 0.5em 1.2em 1.2em'}); // height:'12em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
  
  return el;
}

var setStrLangPopExtend=function(el){
  el.toString=function(){return 'setStrLangPop';}
  var save=function(){ 
    resetMess();  
    strLang=inpStrLang.value.trim(); inpStrLang.value=strLang;
    var o1={strLang,Id};
    var vec=[['setStrLang',o1,saveRet]];   myFetch('POST',vec);
    setMess('',null,true);  
  }
  var saveRet=function(data){
    var boOK=false;
    var tmp=data.boOK;   if(typeof tmp!="undefined")  boOK=tmp;
    if(cbDone) cbDone(strLang)
    historyBack();
  }
  el.openFunc=function(strLangStart, IdT, cbDoneT){
    Id=IdT; cbDone=cbDoneT;
    if(IdT.length==0) {setMess('IdT is empty'); return}
    inpStrLang.prop('value', strLangStart);
    doHistPush({view:setStrLangPop});
    el.setVis();
    inpStrLang.focus();
  }
  el.setVis=function(){ el.show();   return true; }

  var Id, strLang, cbDone;
 
  var head=createElement('h3').myAppend('Set iso 639-1 language code');
  var nameLab=createElement('div').myText('Language code:');
  var intL=11, inpStrLang=createElement('input').css({display:'block'}).attr({maxlength:intL, title:'ISO 639-1 Language Code', size:intL}).on('keypress',  function(e){ if(e.which==13) {save();return false;}} );

  var saveButton=createElement('button').myText('Save').on('click',save).css({'margin-top':'1em'});
  var cancelButton=createElement('button').myText('Cancel').on('click',historyBack).css({'margin-top':'1em'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").myAppend(head,nameLab,inpStrLang,cancelButton,saveButton).css({'min-width':'17em', 'max-width':'30em', padding: '0.3em 0.5em 1.2em 1.2em'}); // height:'12em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
  
  return el;
}

var setSiteOfPagePopExtend=function(el){
  el.toString=function(){return 'setSiteOfPagePop';}
  var save=function(){ 
    resetMess();  
    idSite=selSite.value;
    var o1={idSite,Id}, vec=[['setSiteOfPage',o1,saveRet]];   myFetch('POST',vec);
    setMess('',null,true);  
  }
  var saveRet=function(data){
    var boOK=false;
    var tmp=data.boOK;   if(typeof tmp!="undefined")  boOK=tmp;
    if(cbDone) cbDone(idSite)
    historyBack();
  }
  el.openFunc=function(idSiteStart, IdT, cbDoneT){
    Id=IdT; cbDone=cbDoneT;
    if(IdT.length==0) {setMess('IdT is empty'); return}
    //selSite.value=idSiteStart;
    doHistPush({view:setSiteOfPagePop});
    el.setVis();
    divCollision.empty();
    el.setUpSelSite().then(result=>selSite.prop('value', idSiteStart));
    selSite.focus();
  }
  var cbTestForCollision=function(){ 
    resetMess();  
    idSite=selSite.value;
    var o1={idSite,Id}, vec=[['collisionTestForSetSiteOfPage',o1,cbTestForCollisionRet]];   myFetch('POST',vec);
    setMess('',null,true);  
  }
  var cbTestForCollisionRet=function(data){
    var tabCollision=tabNStrCol2ArrObj(data.tabCollision), len=tabCollision.length;
    var StrT=Array(len); tabCollision.forEach((it,ind)=>{StrT[ind]=it.pageName;});
    var strT=StrT.join(', '); if(len) strT='Page(s) that will collide: '+strT;
    divCollision.myText(strT);
  }
  el.setVis=function(){ el.show();   return true; }
  el.setUpSelSite=async function(){
    if(!siteTab.boUpToDate) {await siteTab.setUp();}
    var ObjSite=siteTab.ObjSite;
    var Opt=[];
    for(var i=0;i<ObjSite.length;i++) {
      var strT=ObjSite[i].idSite+' ('+ObjSite[i].www+')';
      var optT=createElement('option').myText(strT).prop('value',ObjSite[i].idSite); Opt.push(optT);
    }
    selSite.empty().myAppend(...Opt);
  }

  var Id, idSite, cbDone;
 
  var head=createElement('h3').myAppend('Set site of page(s)');
  var nameLab=createElement('div').myText('Site:');
  var selSite=createElement('select').css({display:'block'}).attr({title:'Set site of page(s)'}).on('change',  function(e){ cbTestForCollision();} );

  var divCollision=createElement('div');
  

  var saveButton=createElement('button').myText('Save').on('click',save).css({'margin-top':'1em'});
  var cancelButton=createElement('button').myText('Cancel').on('click',historyBack).css({'margin-top':'1em'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").myAppend(head,nameLab,selSite,cancelButton,saveButton, divCollision).css({'min-width':'17em', 'max-width':'30em', padding: '0.3em 0.5em 1.2em 1.2em'}); // height:'12em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
  
  return el;
}



var areYouSurePopExtend=function(el){
  el.toString=function(){return 'areYouSurePop';}
  el.openFunc=function(strLab, continueClick, cancelClick){ // continueClick(finFun): called when the user clicks the continue button. It takes a callback-argument which closes the areYouSurePop.
    labPageName.myText(strLab);
    doHistPush({view:areYouSurePop});
    el.setVis();
    continueClickLoc=continueClick;
    cancelClickLoc=cancelClick;
  }
  el.setVis=function(){
    el.show(); return 1;
  }
 
  var continueClickLoc, cancelClickLoc;
  //el=popUpExtend(el);  
  //el.css({'max-width':'20em', padding: '1.2em 0.5em 1.2em 1.2em'}); 

  var labPageName=createElement('div');
  var buttonCancel=createElement('button').myText('Cancel').on('click',function(){ cancelClickLoc(); }).css({'margin-top':'1em'});
  var buttonContinue=createElement('button').myText('Yes').on('click',function(){  continueClickLoc();  }).css({'margin-top':'1em'});
  var divBottom=createElement('div').myAppend(buttonCancel,buttonContinue);
  //el.append(labPageName,divBottom);

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").myAppend(labPageName,divBottom).css({'max-width':'20em', padding: '1.2em 0.5em 1.2em 1.2em'});  // height:'8em', '
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
  
  return el;
}


var imageListExtend=function(el){ 
  el.toString=function(){return 'imageList';}
  var imageClick=function(){
    //var Tr=tBody.children('p:lt('+el.nRowVisible+')'); 
    var Tr=[...tBody.childNodes].slice(0,el.nRowVisible);
    var StrImg=[], Caption=[]; 
    Tr.forEach(function(p,i){ 
      var tr=p, imageName=tr.imageName, i=tr.iFlip;
      //var size=tr.tdSize, tCreated=tr.tdCreated.data, boOther=tr.tdBoOther
      //var size=tr.children('span[name=size]').myText(), tCreated=tr.children('span[name=tCreated]').myText(), boOther=tr.children('span[name=boOther]').myText();
      var {size,tCreated,tLastAccess,nAccess,boOther}=File[i];
      tCreated=mySwedDate(tCreated); tLastAccess=mySwedDate(tLastAccess);
      StrImg.push(imageName);
      //var str='<p>'+imageName+'<p>Size: '+File[i].size+'<p>Mod: '+mySwedDate(File[i].tCreated); if(File[i].boOther) str+='<p style="color:red">Others Upload</p>'
      var str='<p>'+imageName+'<p>Size: '+size+'<p>Created: '+tCreated+'<p>Last Access: '+tLastAccess+'<p>nAccess: '+nAccess; if(Number(boOther)) str+='<p style="color:red">Uploaded by user</p>'
      var cap=createElement('div').myHtml(str);
      Caption.push(cap);    
    });
    var iCur=this.parentNode.parentNode.myIndex();
    slideShow.setUp(StrImg,Caption,iCur);
    doHistPush({view:slideShow});
    slideShow.setVis(); 
  }
  var condAddRows=function(){
    //var rows=tBody.children('p');
    var rows=[...tBody.childNodes];
    for(var i=rows.length; i<File.length;i++){
      var r=createElement('p');
      var cb=createElement('input').prop('type', 'checkbox').on('click',cbClick);
      //cb.css({'margin-top':'0em','margin-bottom':'0em'}); //'vertical-align':'bottom'
      //if(boAndroid) cb.css({'-webkit-transform':'scale(2,2)'}); else cb.css({width:'1.4em',height:'1.4em'});
      var buttonNParentI=createElement('button').addClass('aArrow', 'aArrowLeft').prop({strType:'image'}).on('click',goToParentMethod);
      var tdNParentI=createElement('span').myAppend(buttonNParentI).attr('name','nParentI').prop('title','Parents'); 
      var tdCB=createElement('span').prop('valSort',0).myAppend(cb).attr('name','cb');
      //var tmpImg=createElement('img').prop({src:uFlash}).prop('draggable',false).css({height:'1em',width:'1em','vertical-align':'text-bottom'}); 
      var buttonExecute=createElement('button').myText(charFlash).on(strMenuOpenEvent,buttonExeSingleClick).addClass('unselectable').prop({UNSELECTABLE:"on"});
      var tdExecute=createElement('span').prop('valSort',0).myAppend(buttonExecute).attr('name','execute'); 
      var tdTCreated=createElement('span').attr('name','tCreated').prop('title',Label.tCreated);  //.css({margin:'auto 0.3em'})
      var tdTLastAccess=createElement('span').attr('name','tLastAccess').prop('title',Label.tLastAccess);
      var tdNAccess=createElement('span').attr('name','nAccess').prop('title',Label.nAccess);
      var img=createElement('img').prop({alt:"thumb"}).on('click',imageClick);//.css({'margin-right':'0.1em','max-width':'50px','max-height':'50px'});
      var tdImg=createElement('span').attr('name','image').myAppend(img);
      var tdBoOther=createElement('span').myText('user').attr('name','boOther');
      //var tdName=createElement('span').attr('name','imageName'); //.hide();
      var aLink=createElement('a').prop({target:"_blank", rel:"noopener"});
      var tdLink=createElement('span').myAppend(aLink).attr('name','link');
      var tdSize=createElement('span').attr('name','size');  //.css({'margin-left':'1em'})
      r.append(tdNParentI, tdCB, tdExecute, tdTCreated, tdTLastAccess, tdNAccess, tdImg, tdSize, tdBoOther, tdLink);  //  tdName  ,createElement('span').myAppend(bView)  tdNParent, 
      //r.data({tdCB, tdTCreated, tdImg, tdLink, tdBoOther, tdSize});
      tBody.append(r);
    }
  }
  var isAnyOn=function(){
    //var boOn=false, Tr=tBody.children('p:lt('+el.nRowVisible+')');     Tr.find('input').forEach(ele=>{var boTmp=ele.prop('checked'); if(boTmp) boOn=true;});   return boOn;
    var boOn=false, Tr=[...tBody.childNodes].slice(0, el.nRowVisible);     Tr.forEach(ele=>{var inp=ele.querySelector('input'); if(inp.checked) boOn=true;});   return boOn;
  }
  var isOneOn=function(){
    //var Tr=tBody.children('p:lt('+el.nRowVisible+')'), checked=Tr.find('input:checked'); return checked.length==1;
    var Tr=[...tBody.childNodes].slice(0, el.nRowVisible), cOn=0; Tr.forEach(ele=>{var inp=ele.querySelector('input'); if(inp.checked) cOn++;});  return cOn==1;
  }
  var cbClick=function(){
    var cb=this, boOn=Number(cb.prop('checked'));    cb.parentNode.valSort=boOn;
    var boOn=isAnyOn();    allButton.myText(boOn?'None':'All');    buttonExecuteMult.toggle(boOn);
  }
  var fileArray2Div=function(){
    var nRT=File.length;
    //var rows=tBody.children('p');
    var rows=[...tBody.childNodes];
    rows.slice(nRT).forEach(ele=>ele.hide());
    var myRows=rows.slice(0,nRT); 
    //if(myRows.length==0) return;
    myRows.forEach(function(r,i){ 
      r.show();
      //var r=(r).data({idImage:File[i].idImage, iFlip:i, imageName:File[i].imageName, nParent:File[i].nParent, idParent:File[i].idParent, nameParent:File[i].parent}); 
      r.prop(File[i]);  r.prop({iFlip:i}); 
      var nParent=File[i].nParent;
      //var buttonTmp=r.children('span[name=nParent]').prop('valSort',nParent).children('button');
      //var buttonITmp=r.children('span[name=nParentI]').prop('valSort',nParent).children('button');
      var buttonITmp=r.querySelector('span[name=nParentI]').prop('valSort',nParent).querySelector('button');
        var boSingleFiltered=imageFilterDiv.Filt.checkIfSingleParent();
        var strTitle=nParent+' parents';;
        if(!boSingleFiltered) {
          if(nParent==1) strTitle=File[i].parent; else if(!nParent) strTitle='orphan';
        }
        var boCurNSingle=boSingleFiltered && nParent<=1; 
        //var boShow=!boSingleFiltered || nParent>1; 
        buttonITmp.prop('title',strTitle);
        buttonITmp.myText(boCurNSingle?"cur":nParent);
        //buttonITmp.visibilityToggle(boShow);
        buttonITmp.prop({disabled:boCurNSingle});
        
      r.querySelector('span[name=cb]').prop('valSort',0).querySelector('input').prop({'checked':false});
      var tmp=File[i].imageName; r.querySelector('span[name=image]').prop('valSort',tmp).querySelector('img').prop({src:'50apx-'+tmp});
      var tmp=File[i].boOther; r.querySelector('span[name=boOther]').prop('valSort',tmp).visibilityToggle(tmp==1);      
      var tmp=File[i].tCreated; r.querySelector('span[name=tCreated]').prop('valSort',-tmp.valueOf()).myText(mySwedDate(tmp)).prop('title','Created:\n'+tmp);       
      var tmp=File[i].tLastAccess; r.querySelector('span[name=tLastAccess]').prop('valSort',-tmp.valueOf()).myText(mySwedDate(tmp)).prop('title','Last Access:\n'+tmp);       
      var tmp=File[i].nAccess; r.querySelector('span[name=nAccess]').prop('valSort',tmp).myText(tmp).prop('title','nAccess:\n'+tmp);    
      var size=File[i].size, sizeDisp=size, pre=''; if(size>=1024) {sizeDisp=Math.round(size/1024); pre='k';} if(size>=1048576) { sizeDisp=Math.round(size/1048576); pre='M';}
      var tmp=r.querySelector('span[name=size]').prop('valSort',size).myHtml(sizeDisp+'<b>'+pre+'</b>'); var strTitle=pre.length?'Size: '+size:''; tmp.prop('title',strTitle);   //tmp.css({weight:pre=='M'?'bold':'',color:pre==''?'grey':''}); 
      var tmp=File[i].imageName; r.querySelector('span[name=link]').prop('valSort',tmp).querySelector('a').prop({href:uSiteCommon+'/'+tmp}).myText(tmp);
    });
    //tBody.find('input').prop({'checked':false}); 
    var Tmp=[...tBody.querySelectorAll('input')]; Tmp.forEach(ele=>ele.prop({'checked':false}));
  }
  el.setCBStat=function(boOn){
    boOn=Boolean(boOn);allButton.myText('All');
    buttonExecuteMult.toggle(false);
    //if(typeof myRows=='undefined') return;
    //var Tr=tBody.children('p:lt('+el.nRowVisible+')');
    var Tr=[...tBody.childNodes].slice(0, el.nRowVisible);
    Tr.forEach(ele=>ele.querySelector('input').prop({'checked':false}));
  }
  var resetExecuteButton=function(){   allButton.myText('All');  buttonExecuteMult.hide();  }
  el.loadTab=function(){
    var Filt=imageFilterDiv.divCont.gatherFiltData();
    var vec=[['setUpImageListCond',{Filt}],['getImageList',{},getListRet],['getImageHist',{},histRet]];
    //var boSingleParentFilter=imageFilterDiv.Filt.checkIfSingleParent();
    var boWhite=imageFilterDiv.Filt.isWhite(),     nParentsOn=imageFilterDiv.Filt.getNParentsOn();
    
    if(boWhite && nParentsOn==1){  // If filtering for single parent then also get the "grandparents"
      var idParent=imageFilterDiv.Filt.getSingleParent();
      vec.push(['getParent',{idPage:idParent},function(data){divRowParent.getParentRet(data);}],
         ['getPageInfoById',{idPage:idParent},function(data){divRowParent.getPageInfoByIdRet(data);}]);
    }
    divRowParent.setUpPreAJAX(idParent);
    myFetch('POST',vec);
    setMess('... fetching image list ... ',5,true);
    head.clearArrow(); resetExecuteButton();
  }
  var getListRet=function(data){
    var nCur;  //, TabTmp, StrCol=[];
    var tmp=data.NFilt;   if(typeof tmp!="undefined") { imageFilterDiv.setNFilt(tmp); } 
    File.length=0;
    if('tab' in data) File=tabNStrCol2ArrObj(data);
    el.nRowVisible=File.length;
    condAddRows(); fileArray2Div();
  }
  var histRet=function(data){
    var tmp, HistPHP=data.Hist||[];

    imageFilterDiv.divCont.interpretHistPHP(HistPHP);

      // Create TextByParentId
      // If there are pages (parents) with the same "pageName" (on different sites) then use siteName:pageName (when the page (parent) is written). 
    var StrOrderFiltImageFlip=array_flip(StrOrderFiltImage);
    var IdParent=imageFilterDiv.divCont.Hist[StrOrderFiltImageFlip.parent][0];
    TextByParentId={}; var len=IdParent.length, objCount={}, ObjParentInfo=Array(len);
    for(var i=0;i<len;i++) {
      var idParent=IdParent[i]; if(idParent===null) continue;
      var ind=idParent.indexOf(":"); ObjParentInfo[i]={siteName:idParent.substr(0,ind), pageName:idParent.substr(ind+1)};
      if(pageName in objCount) objCount[pageName]++; else objCount[pageName]=1;
    }
    for(var i=0;i<len;i++) {
      var idParent=IdParent[i]; if(idParent===null) continue;
      var {pageName,siteName}=ObjParentInfo[i];
      TextByParentId[idParent]=(objCount[pageName]>1)?siteName+':'+pageName:pageName;
    }

    imageFilterDiv.divCont.update();         
    //imageList.setCBStat(0); 
  }

  var changeModOfSingleI=function(strName,boVal){
    var r=this;
    var boValO=r.prop(strName);
    if(typeof boVal=='undefined') boVal=1-boValO;
 
    var o={Id:[r.idImage]}; o[strName]=boVal;
    var vec=[['myChModImage',o]];   myFetch('POST',vec);
    r.prop(strName,boVal);
    //var span=r.children('span[name='+strName+']');
    var span=r.querySelector('span[name='+strName+']');
    span.prop('valSort',Number(boVal)).visibilityToggle(boVal); 
  }
  

  var getChecked=function(){
    var Tr=[...tBody.childNodes].slice(0, el.nRowVisible), RowTmp=[]; Tr.forEach(ele=>{
      var inp=ele.querySelector('input:checked'); if(inp) { RowTmp.push(ele);}
    });
    return RowTmp;
  }
  var getCheckedId=function(){
    var RowTmp=getChecked(), Id=Array(RowTmp.length);
    Id=RowTmp.map(ele=>{ return ele.idImage; });
    return Id;
  }


  el.changeName=function(r,strNewName){
    var iFlip=r.iFlip;
    File[iFlip].imageName=strNewName;
    r.imageName=strNewName;
    //var td=r.children('span[name=link]').prop('valSort',strNewName);
    var td=r.querySelector('span[name=link]').prop('valSort',strNewName);
    td.querySelector('a').prop({href:uSiteCommon+'/'+strNewName}).myText(strNewName);
  }
  
  el.deleteF=function(Id, histBackFun){
    var vec=[['deleteImage',{Id}, histBackFun]];
    resetExecuteButton();  myFetch('POST',vec);
  }
  
  
  var funPopped=function(statePopped){ 
    imageFilterDiv.divCont.frStored(statePopped);
    el.loadTab();
  }
  el.histPush=function(){
    var o=imageFilterDiv.divCont.toStored();
    doHistPush({view:imageList, Filt:o, fun:funPopped});
  }
  el.histReplace=function(indDiff){
    var o=imageFilterDiv.divCont.toStored();
    doHistReplace({view:imageList, Filt:o, fun:funPopped}, indDiff); //
  }

  //var IndSiteName,
  var TextByParentId;
  PropImage.siteName.setFilterButtF=function(span,val,boOn){
    //var text=''; if(val in IndSiteName) text=IndSiteName[val].siteName;
    //else if(val===null) text='(orphan)';
    var text=(val===null)?text='(orphan)':val;
    span.myText(text);
  }
  PropImage.parent.setFilterButtF=function(span,val,boOn){
    var text=''; if(val in TextByParentId) text=TextByParentId[val];
    else if(val===null) text='(orphan)';
    span.myText(text);
  }

  //var myRows;
  var tBody=el.tBody=createElement('div').addClass('imageList', 'listBody');  //.addClass('listBody');
  el.table=createElement('div').myAppend(tBody).css({width:'100%',position:'relative'});
  el.divCont=createElement('div').myAppend(el.table).css({margin:'0em auto 1em','text-align':'left',display:'inline-block'});//
  
  
  var strTmp='Parents / Alternatve parents';
  var StrCol=['nParentI','cb','execute','tCreated','tLastAccess','nAccess','image','size','boOther','link'];
  var BoAscDefault={cb:0,boOther:0,size:0,nAccess:0}, Label={nParent:strTmp, nParentI:strTmp, cb:'Select',tCreated:'Created',tLastAccess:'Last Access',nAccess:'nAccess',boOther:'Supplied by user'}; //'nParent',
  //var headFill=createElement('p').myAppend().css({background:'white',margin:'0px',height:'calc(12px + 1.2em)'});
  var head=headExtend(createElement('p'),el,StrCol,BoAscDefault,Label,'p','span').addClass('imageList');
  head.css({background:'white', width:'inherit',height:'calc(12px + 1.2em)'});     // , position:'sticky', top:'57px', 'z-index':'1', margin:'0px'
  el.headW=createElement('div').myAppend(head).css({background:'white', width:'inherit', position:'sticky', top:'0px', 'z-index':'1', margin:'0px'});     
  el.table.prepend(el.headW); //,headFill

  
    // menuA
  var allButton=createElement('button').myText('All').addClass('fixWidth').css({'margin-right':'1em'}).on('click',function(){  //'margin-left':'0.8em'
    var boOn=allButton.myText()=='All';
    //var Tr=tBody.children('p:lt('+el.nRowVisible+')');
    //Tr.find('input').prop({'checked':boOn});
    var Tr=[...tBody.childNodes].slice(0, el.nRowVisible);
    Tr.forEach(ele=>{ var inp=ele.querySelector('input'); if(inp) inp.prop({'checked':boOn}); });
    allButton.myText(boOn?'None':'All');
    buttonExecuteMult.toggle(boOn);
  });

  var strEvent='mouseup'; if(boTouch) strEvent='click';


    // menuSingle
  var buttonDownload=createElement('div').myText('Download');
  var buttonRename=createElement('div').myText('Rename').on(strEvent,function(){
    renamePop.openFunc('image', this.parentElement.r, 1);
  });
  var buttonDelete=createElement('div').myText('Delete').on(strEvent,function(){
    var r=this.parentElement.r,  Id=[r.idImage], strLab='Are sure you want to delete this page'; 
    areYouSurePop.openFunc(strLab, function(){el.deleteF(Id, historyBack);}, historyBack);
  });
  var buttonBoOtherTog=createElement('div').myText('Toggle boOther').on(strEvent,function(){ changeModOfSingleI.call(this.parentElement.r,'boOther');   });
  
  
  var itemSingle=[buttonRename, buttonDelete, buttonBoOtherTog];
  var menuSingle=createElement('div').css({'text-align':'left', 'line-height':'1.3em'});  menuExtend(menuSingle);
  var buttonExeSingleClick=function(e){ 
    var button=this; 
    menuSingle.r=button.parentElement.parentElement;
    //var fragItems=jQueryObjToFragment(itemSingle);
    menuSingle.openFunc(e,this,itemSingle);
  }
  

    // menuMult
  var buttonDownload=createElement('div').myText('Download');
  var buttonDelete=createElement('div').myText('Delete').on(strEvent,function(){
    var Id=getCheckedId(), strLab='Deleting '+Id.length+' image(s).';   areYouSurePop.openFunc(strLab, function(){el.deleteF(Id, historyBack);}, historyBack);
  });
  
  //var tmpImg=createElement('img').prop({src:uFlash}).prop('draggable',false).css({height:'1em',width:'1em','vertical-align':'text-bottom'});
  var buttonExecuteMult=createElement('button').myText(charFlash).addClass('fixWidth').addClass('unselectable').prop({UNSELECTABLE:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie;
  var itemMulti=[buttonDelete];
  var menuMult=createElement('div').css({'text-align':'left', 'line-height':'1.3em'});  menuExtend(menuMult);
  var buttonExeMultClick=function(e){ 
    //var button=this;  //itemMulti[0].toggle(isOneOn());
    //if(boTouch){      doHistPush({view:menuDiv});     menuDiv.setUp(itemMulti);   menuDiv.setVis();    }else{    }
    //var fragItems=jQueryObjToFragment(itemMulti);
    menuMult.openFunc(e,this,itemMulti);
  }
  buttonExecuteMult.on(strMenuOpenEvent,buttonExeMultClick);


  //el.buttonExecuteParent=createElement('button').myText(charFlash).addClass('fixWidth').addClass('unselectable').prop({UNSELECTABLE:"on"});
  //var divRowParent=new DivRowParentT(el);
  //headW.prepend(divRowParent);


  var File=[]; el.nRowVisible=0;

  //var buttonBack=createElement('button').myText('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',historyBack);
  var spanTmp=createElement('span').myText(strFastBackSymbol).css({'font-size':'0.7em'});
  var buttonFastBack=createElement('button').myAppend(spanTmp).addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',function(){history.fastBack(adminMoreDiv);});
  //var spanLabel=createElement('span').myText('Images').css({'float':'right',margin:'0.2em 0 0 0'}); 
  
  var tmpImg=createElement('img').prop({src:uFilter, alt:"filter"}).css({height:'1em',width:'1em','vertical-align':'text-bottom'}).addClass('undraggable');
  el.filterInfoWrap=createElement('span');
  var buttFilter=createElement('button').myAppend(tmpImg,' (',el.filterInfoWrap,')').addClass('flexWidth').css({'float':'right','margin-right':'0.2em'}).on('click',function(){ doHistPush({view:imageFilterDiv}); imageFilterDiv.setVis();});
  var buttClear=createElement('button').myText('C').on('click',function(){imageFilterDiv.Filt.filtAll(); imageList.histPush(); imageList.loadTab()}).css({'float':'right','margin-right':'1em'});
  var spanTmp=createElement('span').myText('(orphans)').css({'font-size':'0.8em'});
  var buttOrphan=createElement('button').myAppend(spanTmp).on('click',function(){imageFilterDiv.Filt.setSingleParent(null);  imageList.histPush(); imageList.loadTab()}).css({'float':'right','margin-right':'1em'});

  var menuA=createElement('div').myAppend(buttonFastBack, allButton, buttonExecuteMult, buttFilter, buttClear, buttOrphan);  // buttonBack, 
  menuA.css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});

  el.fixedDiv=createElement('div').myAppend(menuA).css(cssFixed).css({'background':'lightblue'});
  el.css({'text-align':'center'});
  el.append(el.divCont,el.fixedDiv);  //,el.fixedTop
  return el;
}



/*******************************************************************************
 * editDiv
 ******************************************************************************/

var editDivExtend=function(el){
  el.toString=function(){return 'editDiv';}
  el.setUp=function(){
    if(editText.parentNode!==el.fixedDiv) {
      el.fixedDiv.prepend(dragHR,editText);
    }
    
    if(divReCaptcha.isLoaded()) { console.log('Setting up recaptcha (divReCaptcha became visible)'); divReCaptcha.setUp(); } // Otherwise cbRecaptcha will fire later
  }
  
    // menuB
  el.spanSave=spanSaveExtend(createElement('span'));
  var templateButton=createElement('button').myText('Template list').addClass('fixWidth').css({'margin-right':'1em'}).on('click',function(){
    doHistPush({view:templateList});
    templateList.setVis();
  });
  el.templateButton=templateButton;
  var upLoadButton=createElement('button').myAppend('Upload image').on('click',function(){  doHistPush({view:uploadUserDiv}); uploadUserDiv.setVis();}).css({'float':'right'});
  
  var menuB=createElement('div').myAppend(el.spanSave,templateButton).addClass('fixWidth').css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'1em auto 0'});
  //,' ',upLoadButton
    // menuA
  //var buttonBack=createElement('button').myText('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',historyBack);
  //var spanLabel=createElement('span').myText('Edit').css({'float':'right',margin:'0.2em 0 0 0'});  
  
  //el.spanCreated=createElement('span');   el.spanLastMod=createElement('span');  
  //var spanTModNCreated=createElement('span').myAppend('Page created: ', el.spanCreated, '. Last mod: ', el.spanLastMod).css({'float':'right',margin:'0.2em .5em 0 0', 'font-size':'70%'});
  //var menuA=createElement('div').myAppend(spanTModNCreated).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});  //buttonBack, ,spanLabel

  el.spanClickOutside=createElement('span').myText('Click outside the textarea when ready.').hide();
  el.fixedDiv=createElement('div').myAppend(el.spanClickOutside,menuB).css(cssFixedDrag);

  el.fixedDiv.css({background:'rgb(255, 255, 255, 0.8)'});
  el.menus=[menuB];
  el.append(el.fixedDiv);
  return el;
}



var dragHRExtend=function(el){
  var myMousedown= function(e){
    var e = e || window.event; if(e.which==3) return;
    el.css({position:'relative',opacity:0.55,'z-index':'auto',cursor:'move'}); 
    //hStart=editText.height();
    //var rect=editText.getBoundingClientRect(); hStart=rect.height;
    hStart=editText.offsetHeight;
    if(boTouch) {e.preventDefault(); mouseXStart=e.changedTouches[0].pageX; mouseYStart=e.changedTouches[0].pageY;}
    else {mouseXStart=e.pageX; mouseYStart=e.pageY;}

    //if(boTouch){      document.on('touchmove',myMousemove).on('touchend',el.myMouseup);  } else{   document.on('mousemove',myMousemove).on('mouseup',el.myMouseup);    }
    document.on(strMouseMoveEvent,myMousemove).on(strMouseUpEvent,el.myMouseup);
    //setMess('Down',5);
  } 
  el.myMouseup= function(e){ 
    el.css({position:'relative',opacity:1,'z-index':'auto',top:'0px',cursor:'row-resize'});
    //if(boTouch) document.off('touchmove',myMousemove).off('touchend',el.myMouseup); else document.off('mousemove').off('mouseup'); 
    document.off(strMouseMoveEvent,myMousemove).off(strMouseUpEvent,el.myMouseup);
  }
  
  var myMousemove= function(e){
    var mouseX,mouseY;
    if(boTouch) {e.preventDefault(); mouseX=e.changedTouches[0].pageX; mouseY=e.changedTouches[0].pageY;}
    else {mouseX=e.pageX; mouseY=e.pageY;}

    var hNew=hStart-(mouseY-mouseYStart); 
    //editText.height(hNew);
    editText.css('height', hNew+'px');
  };
  var strMouseDownEvent='mousedown', strMouseMoveEvent='mousemove', strMouseUpEvent='mouseup';  if(boTouch){  strMouseDownEvent='touchstart'; strMouseMoveEvent='touchmove'; strMouseUpEvent='touchend';  }
  var hStart,mouseXStart,mouseYStart;
  //if(boTouch) el.on('touchstart',myMousedown); else el.on('mousedown',myMousedown);
  el.on(strMouseDownEvent,myMousedown);
  el.addClass('unselectable').prop({UNSELECTABLE:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie;
  el.css({cursor:'row-resize'});
  return el;
}


var editTextExtend=function(el){
  var hDefault=180;
  var hEditText=getItem('hEditText');  if(hEditText===null)  hEditText=hDefault;      
  if(boTouch) hEditText=hDefault;
  el.css({width:'calc(100% - 3em)',height:hEditText+'px',display:'block',resize:'none'}).prop({autocomplete:"off"});//,wrap:"virtual"//,'margin-left':'40px','margin-right':'10px's
  var clickBlurFunc=function(e){
    var boOn=e.type=='click';
    //if(!boOn) return;
    if(boTouch){//boTouch
      var elParent=el.parentNode;
      if(boOn) {        
        //elParent.css({top:'0px',bottom:''});
        //elParent.css({position:'', height:hDefault+'px'});
        //elParent.parentNode.css({position:'', height:hDefault+'px'});
        //el.css({height:hDefault+'px', overflow:'hidden'});
        //el.css({top:'',bottom:'0px'});
        //el.css({position:'fixed'});
        //elHtml.css({overflow:'hidden'}); elBody.css({overflow:'hidden'});
        //elHtml.css({height:'100%', overflow:'hidden'}); elBody.css({height:'100%', overflow:'hidden'});
        //elHtml.css({height:hDefault+'px', overflow:'hidden'}); elBody.css({height:hDefault+'px', overflow:'hidden'});
        if(boIOS) {window.scrollTo(0,document.body.scrollHeight); }
        if(boChrome) {el.css({height:'calc(100vh - 5em)'}); } // Does not work on ios, not tested on others
      } else { 
        //elParent.css({top:'',bottom:'0px'});
        //el.css({position:''});
        //el.css({top:'',bottom:''});
        //elHtml.css({height:''}); elBody.css({height:''});
        if(boIOS) { }
        if(boChrome) el.css({height:hDefault+'px'});
      }
      var toHideAtTouch=[pageText, ...editDiv.menus, adminDiv.menus, dragHR];
      toHideAtTouch.forEach(ele=>ele.toggle(!Boolean(boOn)));
      //editDiv.spanClickOutside.toggle(Boolean(boOn));
      //adminDiv.spanClickOutside.toggle(Boolean(boOn));
    }
  }
  el.on('click',clickBlurFunc);  
  el.on('blur',clickBlurFunc);
  return el;
}


var spanSaveExtend=function(el){
  el.divReCaptcha=createElement('div');
  var summary=createElement('input').prop({type:'text', placeholder:'Summary'}).css({width:'5em'}); //spanSummary=createElement('span').myAppend('Summary: ',summary).css({'white-space':'nowrap'});
  var signature=createElement('input').prop({type:'text', placeholder:'Signature'}).css({width:'5em'}); //spanSignature=createElement('span').myAppend('Signature: ',signature).css({'white-space':'nowrap'});
  var save=createElement('button').myText('Save').on('click',function(){
    if(!summary.value || !signature.value) { setMess('Summary- or signature- field is empty',5); return;}
    
    if(boDbgSkipRecaptcha) var strTmp="recapcha disabled (boDbgSkipRecaptcha=true)";
    else{
      var strTmp=grecaptcha.getResponse(); if(!strTmp) {setMess("Captcha response is empty"); return; }
    }
    var o={strEditText:editText.value, summary:summary.value, signature:signature.value,  'g-recaptcha-response': strTmp};
    
    var vec=[['saveByAdd',o]];   myFetch('POST',vec); 
    summary.value=''; signature.value='';
    boLCacheObs.value=1;
  });
  var preview=createElement('button').myText('Show preview').on('click',function(){
    var vec=[['getPreview',{strEditText:editText.value}]];   myFetch('POST',vec); 
  });
  var ElTmp=[summary,signature,save]; ElTmp.forEach(el=>el.css({'margin-right':'0.4em'}))
  el.append(el.divReCaptcha, ...ElTmp, preview);
  return el;
}


var templateListExtend=function(el){
  el.toString=function(){return 'templateList';}
  el.setUp=function(obj={}){
    div.empty(); 
    for(var key in obj) {
      var str; if(key.substr(0,9)=='template:') str=key; else str="template:"+key; 
      var a=createElement('a').prop({href:'/'+str}).myText(str).css({display:'block'}); div.append(a);
      if( obj[key]==0) a.addClass("stub");
    }
    //if(tab.length) el.prepend('<h3>Templates</h3>');
    //editDiv.templateButton.toggle(!$.isEmptyObject(obj));
    editDiv.templateButton.toggle(Object.keys(obj).length);
  }
  var div=createElement('div');
      // menuA
  // var buttonBack=createElement('button').myText('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',historyBack);
  var spanLabel=createElement('span').myText('Template list').css({'float':'right',margin:'0.2em 0 0 0'});  
  var menuA=createElement('div').myAppend(spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'}); // buttonBack,


  var fixedDiv=createElement('div').myAppend(menuA).css(cssFixed);

  el.append(div,fixedDiv);
  return el;
}



/*******************************************************************************
 * versionTable
 ******************************************************************************/
var versionTableExtend=function(el){
  el.toString=function(){return 'versionTable';}
  function cbCompareWPrev(){ 
    var iVer=this.parentNode.parentNode.iMy;  arrVersionCompared=[bound(iVer-1,1),iVer];
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec); 
    doHistPush({view:diffDiv}); diffDiv.setVis();
    return false;
  }
  function cbVersionView(e){
    var ele=e.target;
    if(ele.name=='ind' || ele.name=='date' || ele.name=='summary'){} else return;
    
    var iVer=ele.parentNode.iMy;
    var vec=[['pageLoad',{version:iVer}]];   myFetch('GET',vec); 
    historyBack();
  }
  /*
  function cbRowClick(){ 
    var iRow=this.parentNode.myIndex();
    if(iRow==nVersion-1) { var vec=[['pageLoad',{version:nVersion-iRow}]];   myFetch('POST',vec);   }
    else{
      arrVersionCompared=[bound(nVersion-iRow-1,1),nVersion-iRow];
      var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec); 
    }
    return false;
  }*/
  function redClick(){ 
    var verR=this.parentNode.parentNode.iMy, verGT=arrVersionCompared[1]; verGT=verGT<=verR?verR+1:verGT; verGT=Math.min(verGT,nVersion);
    arrVersionCompared=[verR, verGT]; 
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec); 
    doHistPush({view:diffDiv}); diffDiv.setVis();
    return false;
  }
  function greenClick(){ 
    var verG=this.parentNode.parentNode.iMy,  verRT=arrVersionCompared[0]; verRT=verRT>=verG?verG-1:verRT; verRT=Math.max(verRT,1);
    arrVersionCompared=[verRT, verG];
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec); 
    doHistPush({view:diffDiv}); diffDiv.setVis();
    return false;
  }  
  el.setTable=function(){
    el.condAddRows(); el.versionTable2TBody();
    //boMultVersion=Number(matVersion.length>1); 
    
    [pageView.versionMenu, el.table, warningDiv].forEach(ele=>ele.toggle(matVersion.length>1));
    //if(matVersion.length==1) {tHead.children('th:gt(3)').hide();}  else {tHead.children('th:gt(3)').show();}
  }
  
  el.condAddRows=function(){
    //var rows=tBody.children('tr');
    var rows=tBody.children;
    var n=matVersion.length;
    //var diff=n-rows.length;
    for(var i=rows.length; i<n;i++){
      var r=createElement('tr'); r.css({cursor:'pointer'});
      //if(!boTouch) {  r.on('mouseover',function(){this.children('td').css({background:'#8f8'});}).on('mouseout',function(){this.children('td').css({background:''});});  }
      /*if(!boTouch) { var tmp='td:lt(3)';
        r.on('mouseover',tmp,function(){this.parentNode.children(tmp).css({background:'#8f8',cursor:'pointer'});});
        r.on('mouseout',tmp,function(){this.parentNode.children(tmp).css({background:'',cursor:''});});
      }*/
      //var bView=createElement('button').myText('View').on('click',cbVersionView);
      var bEdit=createElement('button').myText('Diff').on('click',cbCompareWPrev).css({position:'relative',top:'1.25em'});
      var bRed=createElement('button').css({width:'1.5em'}).on('click',redClick);
      var bGreen=createElement('button').css({width:'1.5em'}).on('click',greenClick);
      var tInd=createElement('td').attr('name','ind');
      var tDate=createElement('td').attr('name','date');
      var tSummary=createElement('td').attr('name','summary');
      r.myAppend(tInd,tDate,tSummary,createElement('td').css({'vertical-align':'bottom'}).myAppend(bEdit),createElement('td').myAppend(bRed),createElement('td').myAppend(bGreen));  //,createElement('td').myAppend(bView)
      
      tBody.append(r);
    }
  }
  el.versionTable2TBody=function(){
    nVersion=matVersion.length;
    var nRT=matVersion.length;
    //tBody.find('button').show();
    var Tmp=[...tBody.querySelectorAll('button')]; Tmp.forEach(ele=>ele.show());
    //tBody.children('tr').css({"background-color":""});
    [...tBody.childNodes].forEach(ele=>ele.css({"background-color":""}));
    //tBody.find('button').css({"background-color":""});
    var Tmp=[...tBody.querySelectorAll('button')]; Tmp.forEach(ele=>ele.css({"background-color":""}));
    //tBody.children('tr:nth-of-type('+(nRT+1)+'), gt('+nRT'+)').hide();
    //tBody.children('tr:lt('+nRT'+)').show();
    //var myRows=tBody.children('tr:lt('+nRT'+)');
    //var rows=tBody.children('tr');
    var rows=[...tBody.childNodes];
    rows.slice(nRT).forEach(ele=>ele.hide());
    var myRows=rows.slice(0,nRT); 
    if(myRows.length==0) return;
    //myRows.show();
    myRows.forEach(function(tr,i){
      tr.show(); tr.iMy=nRT-i;
      tr.children[0].myText(nRT-i);
      var {tMod, summary, signature}=matVersion[nRT-1-i];
      tr.children[1].myText(mySwedDate(tMod));
      tr.children[2].myText(summary + ' / '+ signature);
    });
    //myRows.find('td:nth-child(1)').forEach(function(td,i){      (td).myText(nRT-i);  });
    //myRows.find('td:nth-child(2)').forEach(function(td,i){      (td).myText(mySwedDate(matVersion[nRT-1-i][0]));  });
    //myRows.find('td:nth-child(3)').forEach(function(td,i){    (td).empty();  (td).myText(matVersion[nRT-1-i][1], ' / ', matVersion[nRT-1-i][2]);  });

    var rEarliest=myRows[nRT-1];
    //rEarliest.querySelector('button:nth-of-type('+(jBEdit+1)+')').hide(); // Hide earliest edit-button
    //rEarliest.querySelector('button:nth-of-type('+(jBGreen+1)+')').hide(); // Hide earliest green-button
    var arrButtT=rEarliest.querySelectorAll('button');
    arrButtT[jBEdit].hide(); // Hide earliest edit-button
    arrButtT[jBGreen].hide(); // Hide earliest green-button
    var rLatest=myRows[0];
    //rLatest.querySelector('button:nth-of-type('+(jBRed+1)+')').hide(); // Hide latest red-button
    var arrButtT=rLatest.querySelectorAll('button')
    arrButtT[jBRed].hide(); // Hide latest red-button

    if(arrVersionCompared[0]!==null){
      //var iRowRedT=nVersion-arrVersionCompared[0];   tBody.querySelector('tr:nth-of-type('+(iRowRedT+1)+')').css({"background-color":'#faa'}); // rowRed
      var iRowRedT=nVersion-arrVersionCompared[0];   tBody.children[iRowRedT].css({"background-color":'#faa'}); // rowRed
      //tBody.querySelector('tr:nth-of-type('+(iRowRedT+1)+')').querySelector('button:nth-of-type('+(jBRed+1)+')').css({"background-color":'red'}); // buttRed
      //var arrButtT=tBody.querySelector('tr:nth-of-type('+(iRowRedT+1)+')').querySelectorAll('button');
      var arrButtT=tBody[iRowRedT].querySelectorAll('button');
      arrButtT[jBRed].css({"background-color":'red'}); // buttRed
    } 
    //var iRowVerT=nVersion-arrVersionCompared[1];     tBody.querySelector('tr:nth-of-type('+(iRowVerT+1)+')').css({"background-color":"#afa"}); // rowGreen
    var iRowVerT=nVersion-arrVersionCompared[1];     tBody.children[iRowVerT].css({"background-color":"#afa"}); // rowGreen
    //tBody.querySelector('tr:nth-of-type('+(iRowVerT+1)+')').querySelector('button:nth-of-type('+(jBGreen+1)+')').css({"background-color":'green'}); // buttGreen
    //var arrButtT=tBody.querySelector('tr:nth-of-type('+(iRowVerT+1)+')').querySelectorAll('button');
    var arrButtT=tBody.children[iRowVerT].querySelectorAll('button');
    arrButtT[jBGreen].css({"background-color":'green'}); // buttGreen
  
  }
  var jBEdit=0,jBRed=1,jBGreen=2;
  var spanDiff=createElement('span').myText('Diff').css({position:'absolute',top:'0em',right:'0.9em'});
  //var spanSumSign=createElement('span').myText('sum/sign').css({position:'absolute',top:'-1.1em',left:'-1em'});
  //var spanSumSign=createElement('span').myText('sum/sign').css({position:'absolute',top:'0em',left:'-1em','white-space':'nowrap'});
  //display:'inline-block'
  //var colgroup=createElement('colgroup').myAppend(createElement('col'),createElement('col'),createElement('col'),createElement('col'),createElement('col'),createElement('col').css({}),createElement('col'));
  //.css({'overflow':'visible',position:'relative'})
  var tHead=createElement('thead').myAppend(createElement('th'), createElement('th'), createElement('th').myText('Sum/Sign'), createElement('th'),
      createElement('th').css({'background':'#faa'}), createElement('th').css({'max-width':'10px',background:'lightgreen',overflow:'visible',position:'relative'}).myAppend(spanDiff) );
  var tBody=createElement('tbody').css({border:'1px solid #000'});
  //var tmp='[name=ind],[name=date],[name=summary]';
  tBody.on('click', cbVersionView);
  el.table=createElement('table').myAppend(tHead,tBody).css({"border-collapse":"collapse",'margin':'1em auto'}); 
  el.append(el.table); //'<h3>Versions</h3>',
  //tBody.find('td').css({border:'1px #000 soild'});

      // menuA
  // var buttonBack=createElement('button').myText('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',historyBack);
  var spanLabel=createElement('span').myText('Version list').css({'float':'right',margin:'0.2em 0 0 0'});  
  var menuA=createElement('div').myAppend(spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});  //buttonBack,

  el.fixedDiv=createElement('div').myAppend(menuA).css(cssFixed);

  el.append(el.table,el.fixedDiv);
  return el;
}

var diffDivExtend=function(el){  
  el.toString=function(){return 'diffDiv';}  
  el.setUp=function(strHtml){
    el.divCont.myHtml(strHtml);
    //el.divCont.find('td').css({border:'1px #fff'});
    //el.divCont.find('td:nth-child(2):not(:first)').css({background:'#ddd'});
    //el.divCont.find('td:nth-child(1)').css({background:'pink'});
    //el.divCont.find('td:nth-child(3)').css({background:'lightgreen'});
    //[...el.divCont.querySelectorAll('td')].forEach(ele=>ele.css({border:'1px #fff'}));
    //[...el.divCont.querySelectorAll('td:nth-child(2):not(:first-of-type)')].forEach(ele=>ele.css({background:'#ddd'}));
    //[...el.divCont.querySelectorAll('td:nth-child(1)')].forEach(ele=>ele.css({background:'pink'}));
    //[...el.divCont.querySelectorAll('td:nth-child(3)')].forEach(ele=>ele.css({background:'lightgreen'}));
    [...el.divCont.querySelectorAll('tr')].forEach((tr,i)=>{
      [...tr.childNodes].forEach(td=>td.css({border:'1px #fff'}));
      tr.children[0].css({background:'pink'});
      if(i) tr.children[1].css({background:'#ddd'});
      tr.children[2].css({background:'lightgreen'});
    });
    var elT=el.divCont.querySelector('table'); if(elT) elT.css({'margin':'1em auto'});

    var strNR='', str='';
    if(matVersion.length>0){
      var ver=arrVersionCompared[1], rev=ver-1;
      var {tMod, summary, signature}=matVersion[rev];
      strNR='v'+ver;   str=summary+' <b><i>'+signature+'</i></b> '+mySwedDate(tMod);
    }
    versionNew.myText(strNR); detailNew.myHtml(str);  
    var strNR='', str='', ver=arrVersionCompared[0];
    if(ver){  // ver is 1-indexed
      var rev=ver-1;
      var {tMod, summary, signature}=matVersion[rev];
      strNR='v'+ver;   str=summary+' <b><i>'+signature+'</i></b> '+mySwedDate(tMod);
    }
    versionOld.myText(strNR); detailOld.myHtml(str); 

    [prevButton, nextButton].forEach(ele=>ele.toggle(matVersion.length>2));
  }


  el.divCont=createElement('div');

        // menuC
  var nextButtonNew=createElement('button').myText('⇧').addClass('fixWidth').on('click',function(){
    arrVersionCompared[1]++;   if(arrVersionCompared[1]>nVersion) {arrVersionCompared[1]=nVersion;}
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec); 
  });
  var prevButtonNew=createElement('button').myText('⇩').addClass('fixWidth').on('click',function(){
    arrVersionCompared[1]--; if(arrVersionCompared[0]==arrVersionCompared[1]) arrVersionCompared[0]--;
    if(arrVersionCompared[0]==0) {arrVersionCompared=[nVersion-1,nVersion];}
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec);  
  });
  var versionNew=createElement('span').css({'background':'#afa'}), detailNew=createElement('span'); 
  

        // menuB
  var nextButtonOld=createElement('button').myText('⇧').addClass('fixWidth').on('click',function(){
    arrVersionCompared[0]++; if(arrVersionCompared[0]==arrVersionCompared[1]) arrVersionCompared[1]++;
    if(arrVersionCompared[1]>nVersion) {arrVersionCompared=[1,2];}
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec);
  });
  var prevButtonOld=createElement('button').myText('⇩').addClass('fixWidth').on('click',function(){
    arrVersionCompared[0]--;   if(arrVersionCompared[0]==0) {arrVersionCompared[0]=1;}
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec); 
  });
  var versionOld=createElement('span').css({'background':'#faa'}), detailOld=createElement('span'); 

  [versionNew, versionOld].forEach(ele=>ele.css({'margin':'auto 0.3em'}));
  [detailNew, detailOld].forEach(ele=>ele.css({'margin':'auto 0.3em'}));
  [prevButtonNew, prevButtonOld].forEach(ele=>ele.css({'margin-left':'0.8em'}));

  //prevButtonNew,versionNew,nextButtonNew   prevButtonOld,versionOld,nextButtonOld
  var menuC=createElement('div').myAppend(versionNew,detailNew).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});
  var menuB=createElement('div').myAppend(versionOld,detailOld).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});



        // menuA
  var nextButton=createElement('button').myText('⇧').addClass('fixWidth').css({'margin':'0 1em'}).on('click',function(){
    arrVersionCompared[0]++; arrVersionCompared[1]++;
    if(arrVersionCompared[1]>nVersion) {arrVersionCompared=[1,2];}
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec);
  });
  var prevButton=createElement('button').myText('⇩').addClass('fixWidth').css({'margin':'0 1em'}).on('click',function(){
    arrVersionCompared[0]--; arrVersionCompared[1]--; 
    if(arrVersionCompared[0]==0) {arrVersionCompared=[nVersion-1,nVersion];}
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec);  
  });
  // var buttonBack=createElement('button').myText('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',historyBack);
  var spanLabel=createElement('span').myText('Diff').css({'float':'right',margin:'0.2em 0 0 0'});  
  var menuA=createElement('div').myAppend(prevButton,nextButton,spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'}); //buttonBack,

  el.fixedDiv=createElement('div').myAppend(menuC,menuB,menuA).css(cssFixed);

  el.append(el.divCont,el.fixedDiv);
  return el;
}


var formPPExtend=function(el){
  //var urlPaypalButton="https://www.paypal.com/en_US/i/btn/btn_paynowCC_LG.gif";
  //var urlPaypalButton="https://www.paypalobjects.com/webstatic/en_US/btn/btn_paynow_cc_144x47.png";
  //var urlPaypalButton="https://www.paypalobjects.com/webstatic/en_US/btn/btn_pponly_142x27.png";
  if(boDbg) urlPaypalButton='';
  el.empty();   el.prop({action:urlPayPal,method:'post'}).css({display:"inline","vertical-align":"-6px"});
  var input0=createElement('input').prop({type:"hidden",name:"cmd", value:"_s-xclick"});
  var input1=createElement('input').prop({type:"hidden",name:"hosted_button_id", value:ppStoredButt});
  var inputImg=createElement('input').prop({type:"image", src:urlPaypalButton, name:"submit", alt:"PayPal — The safer, easier way to pay online."}).css({border:"0"});
  el.append(input0,input1,inputImg);
  return el;
}

var paymentDivExtend=function(el){  
  el.toString=function(){return 'paymentDiv';}
    // menuB
  var formPP=formPPExtend(createElement('form')),     divPP=createElement('div').myAppend(formPP).css({'margin-top':'1em'}); if(ppStoredButt.length==0) divPP.hide();  //'Paypal: ',
  var spanBTC=createElement('span').myAppend(strBTC).css({'font-size':'0.70em'}),    divBC=createElement('div').myAppend('฿: ',spanBTC); if(spanBTC.length==0) divBC.hide();
  var menuB=createElement('div').myAppend(divBC,divPP).css({'text-align':'center'}).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'center',margin:'1em auto'});

    // menuA
  // var buttonBack=createElement('button').myText('⇦').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',historyBack);
  var spanLabel=createElement('span').myText('Pay/Donate').css({'float':'right',margin:'0.2em 0 0 0'}); 
  spanLabel.addClass('unselectable').prop({UNSELECTABLE:"on"}); // class: needed by firefox, prop: needed by opera, firefox and ie 
  var menuA=createElement('div').myAppend(spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'}); //buttonBack,

  el.fixedDiv=createElement('div').myAppend(menuB,menuA).css(cssFixed);


  el.append(el.fixedDiv);
  return el;
}



var calcLimitingDim=function(wFrame,hFrame,wOld,hOld){
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


var slideShowExtend=function(el){
  el.toString=function(){return 'slideShow';}
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

  var leftCur=0; // State variable when dragging
  var leftGoal, timerSlide, tInt=50; // Variable when timer is running
  var panNZoom=function(evt){
    clearTimeout(timerSlide);
    //var strEvent=evt.timeStamp+' '+evt.type; if('targetTouches' in evt && evt.targetTouches.length) strEvent+=' '+evt.targetTouches.length+' '+evt.targetTouches[0].identifier;  console.log(strEvent);
    if(nImg==1) return;
    var Tou=evt.targetTouches;
    var mode=Tou.length;
    if(mode==1){
      
      var viewportScale = screen.width / window.innerWidth;  //console.log(viewportScale);
      if(viewportScale>1.1) return;
      if(evt.cancelable) evt.preventDefault(); 
      //var pos=board.position(); leftCur=pos.left;
      leftCur=board.offsetLeft; 
      var tAL=getStoredTouch(Tou[0].identifier), xAL, yAL, xavgL=xAL=tAL.pageX, yavgL=yAL=tAL.pageY;
      var tA=Tou[0], xA, yA, xavg=xA=tA.pageX, yavg=yA=tA.pageY;
      var dXScreen=xavg-xavgL;    leftCur+=dXScreen;
      var dYScreen=yavg-yavgL;    //topCur+=dYScreen;
      board.css({transition:'','left':leftCur+'px'});
    }
    else if(mode==0){
      var leftCurA=Math.abs(leftCur);
      var dir=sign(-leftCur), boShift=leftCurA>window.innerWidth/4; if(!boShift) dir=0;
      var distA=leftCurA;  if(boShift) distA=window.innerWidth-leftCurA;
      
      if(1){
        leftGoal=-dir*window.innerWidth;
        timerSlide=setInterval(timerCB, tInt);
      }else{
        //board.css({'left':'0px'});
        leftCur=0;
        if(boShift){  shiftFunc(dir); } else board.css({'left':'0px'});
      }

    }
    storeTouches(Tou);
  }
  var arrowPressF=function(e){ 
    e.stopPropagation();
    if(el.style.display=='none') return;
    if(e.which==37) {shiftFunc(-1);return false;}else if(e.which==39) {shiftFunc(1);return false;}
  }
  var shiftFunc=function(dir){
    if(nImg==1) return;
    if(dir==0) return;
    iCur+=dir;  iCur=(iCur+nImg)%nImg
    var iNext=(iCur+1+nImg)%nImg, iPrev=(iCur-1+nImg)%nImg;
    var Img=board.children;
    //if(dir==1) {var imgT=Img[0].detach(); imgT.prop({src:StrImgUrl[iNext]}); board.append(imgT);}
    //else if(dir==-1) {var imgT=Img[2].detach(); imgT.prop({src:StrImgUrl[iPrev]}); board.prepend(imgT);}
    if(dir==1) {var imgT=Img[0].detach(); imgT.css({'background-image':'url("'+StrImgUrl[iNext]+'")'}); board.append(imgT);}
    else if(dir==-1) {var imgT=Img[2].detach(); imgT.css({'background-image':'url("'+StrImgUrl[iPrev]+'")'}); board.prepend(imgT);}
    var Img=board.children;
    Img[0].css({left:'-100%'}); Img[1].css({left:'0%'}); Img[2].css({left:'100%'});
    board.css({'left':leftCur+'px'});
    divCaptionCont.empty().myAppend(Caption[iCur].cloneNode(true));
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
  el.setUp=function(StrImgUrlT, CaptionT, iCurT){
    StrImgUrl=StrImgUrlT;  Caption=CaptionT;  iCur=iCurT;
    nImg=StrImgUrl.length; var Img=[];
    if(!boTouch) Arrow.forEach(ele=>ele.toggle(nImg!=1));
    for(var i=0;i<3;i++){  //StrImgUrl.length
      //var img=createElement('img').prop({src:StrImgUrl[i]});
      var iTmp=(iCur+i-1+nImg)%nImg;
      var img=createElement('div').css({'background-image':'url("'+StrImgUrl[iTmp]+'")'}); //.on('click',winCaption[0].openFunc);
      Img.push(img);
    }
    Img[0].css({left:'-100%'});
    Img[2].css({left:'100%'});  
    
    Img.forEach(ele=>ele.css({width:'100%', height:'100%',  margin:'auto',position:'absolute',  'box-sizing':'border-box', border:'#fff 1px solid', display:'block'}));  //,transition:'left 1s'
    Img.forEach(ele=>ele.css({'background-size':'contain', 'background-repeat':'no-repeat', 'background-position':'center'}));    
    board.empty().myAppend(...Img);
    document.on('keydown',arrowPressF);
    winCaption.css({width:'',left:'0px',top:window.offsetHeight/3+'px'});
    divCaptionCont.empty().myAppend(Caption[iCur].cloneNode(true));  winCaption.openFunc(); 
    
  } 
  el.addClass('unselectable').prop({UNSELECTABLE:"on"}).css({height:'100%',width:'100%'}); // class: needed by firefox, attr: needed by opera, firefox and ie 
  el.on('keydown',arrowPressF); 
  var StrImgUrl, Caption, iCur, nImg;
  
  var intStepSize=50;
  var timerCB=function(){
    var leftCurT=board.offsetLeft, diffGoal=leftGoal-leftCurT, aDiffGoal=Math.abs(diffGoal), dirT=sign(diffGoal), leftNext, boFin=0;
    if(aDiffGoal<=intStepSize) {leftNext=leftGoal; clearTimeout(timerSlide); boFin=1; }
    else leftNext=leftCurT+dirT*intStepSize;
    board.style.left=leftNext+"px";
    
    if(boFin) {    
      leftCur=0; var dir=-sign(leftGoal);
      if(dir){  shiftFunc(dir); } else board.css({'left':'0px'});
    }
    
  }

  
  var board=createElement('div').css({'left':leftCur+'px'});
  board.css({position:'relative',width:'100%',height:'100%'}); //
  el.css({position:'absolute',width:'100%',height:'100%', overflow:'hidden'});
  el.append(board);


  if(boTouch){
    el.addEventListener("click", function(){ winCaption.toggleFunc();}, true);
  }else{
    var intArrowSize=20, strColor='blue';
    var elArrowLeft=createElement('div').css({'border-right': intArrowSize+'px solid '+strColor}),  elArrowRight=createElement('div').css({'border-left': intArrowSize+'px solid '+strColor});
    var Arrow=[elArrowLeft, elArrowRight]; Arrow.forEach(ele=>ele.css({width:'0px', height:'0px', 'border-top':intArrowSize+'px solid transparent', 'border-bottom': intArrowSize+'px solid transparent', opacity:0.3}));
  //, margin:'auto'
  /*
    var divLeft=createElement('div').myAppend(elArrowLeft).css({left:'0px'}).on('click',function(){shiftFunc(-1);}),  divRight=createElement('div').myAppend(elArrowRight).css({right:'0px'}).on('click',function(){shiftFunc(1);});
    divLeft.add(divRight).css({height:'100%', width:'33%', position:'absolute', right:'0px', top:'0px', display:'flex', 'justify-content':'center','align-items':'center'});
    divLeft.add(divRight).mouseover(function(){this.children('div').css({opacity:1});}).mouseout(function(){this.children('div').css({opacity:0.3});});
    if(!boTouch) el.append(divLeft,divRight);
  */

    var divAreaParent=createElement('div').css({position:'absolute', width:'100vw', height:'100vh', top:'0px', left:'0px',display:'flex'}); 
    var divLeft=createElement('div').myAppend(elArrowLeft).css({left:'0px'}).on('click',function(){shiftFunc(-1);}),  divRight=createElement('div').myAppend(elArrowRight).css({right:'0px'}).on('click',function(){shiftFunc(1);});
    [divLeft, divRight].forEach(ele=>ele.css({height:'100%', display:'flex', 'justify-content':'center','align-items':'center', flex:'1 1 auto'}));
    [divLeft, divRight].forEach(ele=>ele.on('mouseover', function(){this.firstChild.css({opacity:1});}).on('mouseout', function(){this.firstChild.css({opacity:0.3});}));
    var divCenter=createElement('div').css({flex:'1 1 auto'}).on('click',function(){winCaption.toggleFunc();});
    divAreaParent.append(divLeft,divCenter,divRight);
    el.append(divAreaParent);
  }

  var divCaptionCont=createElement('div');//.css({padding:'0.1em'});
  var winCaption=createElement('div').myAppend(divCaptionCont);
  //var divPopParent=createElement('div').css({position:'absolute', width:'100vw', height:'100vh', top:'0px', left:'0px'}); el.prepend(divPopParent);
  winCaption=popupDragExtendM(winCaption,'',el); winCaption.css({left:'3px',top:'200px'}); 

  board.on("touchstart", handleStart, false);
  board.on("touchend", handleEnd, false);
  board.on("touchcancel", handleCancel, false);
  board.on("touchleave", handleLeave, false);
  board.on("touchmove", handleMove, false);

 
  return el;
}



var pageTextExtend=function(el){
  var clickImgFun=function(e){
    //var li=this.parentNode, iCur=li.myIndex(); //, StrImg=li.parentNode.StrImg, Caption=li.parentNode.Caption;
    var a=this, iCur=a.iCur;
    slideShow.setUp(el.StrImg,el.Caption,iCur);
    doHistPush({view:slideShow});
    slideShow.setVis();
    e.preventDefault();
  }
  var clickVideoFun=function(e){
    var s=this.querySelector('source');
    window.location.href=s.getAttribute('src');
    e.preventDefault();
  }
  el.modStuff=function(){
    var galleries=[...el.querySelectorAll('.gallery')];
    galleries.forEach(function(ele,i){ 
      var Li=[...ele.querySelectorAll('li')];
      Li.forEach(function(l,j){
        var a=l.querySelector('a:nth-of-type(1)'); a.on('click',clickImgFun).prop({iCur:el.StrImg.length});  el.StrImg.push(a.prop('href')); el.Caption.push(a.nextElementSibling);
      });
    });
    //var imgThumbimage=el.find('.thumbimage');
    var ImgThumbimage=[...el.querySelectorAll('.thumbimage')];
    ImgThumbimage.forEach(function(ele,i){ 
      var a=ele.parentNode;
      a.on('click',clickImgFun).prop({iCur:el.StrImg.length});  el.StrImg.push(a.prop('href'));
      var elTmp; if(a.nextElementSibling && a.nextElementSibling.hasClass('thumbcaption')) elTmp=a.nextElementSibling; else elTmp=createElement('div').myText('(no caption)');
      el.Caption.push(elTmp);
    });
    //var video=el.find('video');
    var Video=[...el.querySelectorAll('video')];
    Video.forEach(function(ele,i){  ele.on('click',clickVideoFun);  });
  }
  el.StrImg=[];
  el.Caption=[];
  return el;
}

var redirectSetPopExtend=function(el){
  el.toString=function(){return 'redirectSetPop';}
  var save=function(){
    rMat.idSiteOld=rMat.idSite; rMat.pageNameOld=rMat.pageName;
    var idSite=selSite.value;
    rMat.idSite=idSite; 
    var rS=siteTab.indexSiteTabById[rMat.idSite]; rMat.siteName=rS.siteName; rMat.www=rS.www;
    rMat.pageName=inpPageName.value; if(rMat.pageName.length==0){ setMess('empty page name',2);  return;}
    rMat.url=inpURL.value;  if(rMat.url.length==0){ setMess('empty url',2);  return;}
    //if(RegExp('^https?:\/\/$').test(url)) { setMess('empty domain',2);  return;}
    //if(!RegExp('^https?:\/\/').test(url)){  url="http://"+url;   }
    var objTmp=extend({boUpd},rMat);
    var vec=[['redirectTabSet', objTmp, saveRet]];   myFetch('POST',vec);
  }
  var saveRet=function(data){
    var {boOK,objDoc}=data;
    if(!boOK) return;
    if(boUpd) { extend(rMat,objDoc); rMat.siteName=objDoc.idSite;  redirectTab.myEdit(rMat); } //rMat.idSite=idSite;
    //else {rMat.tCreated=unixNow(); redirectTab.myAdd(rMat); }
    //else {copySome(rMat, data.objSite, ['tCreated']); redirectTab.myAdd(rMat); }
    //else {rMat.tCreated=data.tCreated; rMat.tMod=data.tMod; redirectTab.myAdd(rMat); }
    else {extend(rMat,objDoc); rMat.siteName=objDoc.idSite;  redirectTab.myAdd(rMat); }
    //redirectTab.setUp();
    historyBack();
  }
  el.setUp=async function(){
    //if(!siteTab.boUpToDate) {await siteTab.setUp();}
    var ObjSite=siteTab.ObjSite;
    var Opt=[]; //siteTab=redirectTab.siteTab;
    for(var i=0;i<ObjSite.length;i++) {var optT=createElement('option').myText(ObjSite[i].idSite).prop('value',ObjSite[i].idSite); Opt.push(optT); }
    selSite.empty().myAppend(...Opt);    var tmpVal=(typeof rMat.idSite!='undefined')?rMat.idSite:objSite.idSite;    selSite.value=tmpVal;
    inpPageName.value=rMat.pageName; inpURL.value=rMat.url; inpPageName.focus();  return true;
  }
  el.openFunc=function(boUpdT,boGotData){
    boUpd=boUpdT;
    if(boGotData){
      var elR=this.parentNode.parentNode;
      rMat=elR.rMat;
    } else {rMat=rDefault;}
    //divInsOrUpd.toggle(boUpd); vippInsOrUpd.setStat(0);
    //selSite.push(inpPageName).prop('disabled',boUpd);
    doHistPush({view:redirectSetPop});
    el.setVis();
    el.setUp();
  }
  el.setVis=function(){
    el.show(); return 1;
  }
 
  var rDefault={siteName:'', www:'', pageName:'', url:''};
  var boUpd, rMat; //siteTab,
  

  var labSite=createElement('b').myText('siteName');
  var selSite=createElement('select').css({display:'block'});
  var labPageName=createElement('b').myText('pageName');
  var inpPageName=createElement('input').prop({type:'text'});
  var labURL=createElement('b').myText('Redirect to (pageName or url)');
  var inpURL=createElement('input').prop({type:'text'});


  [labSite, labPageName, labURL].forEach(ele=>ele.css({'margin-right':'0.5em'}));
  [inpPageName, inpURL].forEach(ele=>ele.css({display:'block',width:'100%'}).on('keypress',  function(e){ if(e.which==13) {save();return false;}} ));
  var inpNLab=[labSite, selSite, labPageName, inpPageName, labURL, inpURL];


  var buttonSave=createElement('button').myText('Save').on('click',save).css({'margin-top':'1em'});
  var divBottom=createElement('div').myAppend(buttonSave);  //buttonCancel,

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").myAppend(...inpNLab,divBottom).css({'min-width':'17em','max-width':'30em', padding: '1.2em 0.5em 1.2em 1.2em'});  // height:'18em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
   
  return el;
}


var redirectDeletePopExtend=function(el){
  el.toString=function(){return 'redirectDeletePop';}
  var ok=createElement('button').myText('OK').css({'margin-top':'1em'}).on('click',function(){    
    var pageName=elR.attr('pageName'), idSite=elR.attr('idSite'), vec=[['redirectTabDelete',{idSite,pageName},okRet]];   myFetch('POST',vec);    
  });
  var okRet=function(data){
    if(!data.boOK) return;
    redirectTab.myRemove(elR);
    historyBack();
  }
  el.openFunc=function(){
    elR=this.parentNode.parentNode; spanPage.myText(elR.rMat.siteName+':'+elR.attr('pageName'));
    doHistPush({view:redirectDeletePop});
    el.setVis();
    ok.focus();
  }
  el.setVis=function(){
    el.show(); return 1;
  }
 
  var elR;
  var head=createElement('h3').myText('Delete');
  var spanPage=createElement('span');//.css({'font-weight': 'bold'});
  var p=createElement('div').myAppend(spanPage);

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").myAppend(head,p,ok).css({'min-width':'17em','max-width':'25em', padding:'0.5em'}); //,cancel height:'10em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
 
  return el; 
}

var createUrlFrPageData=function(r){var strS=Number(r.boTLS)?'s':'', url='http'+strS+'://'+r.www+'/'+r.pageName; return url; }
var regHttp=/^https?:\/\//;
var redirectTabExtend=function(el){
  el.toString=function(){return 'redirectTab';}
  //var funcTTimeTmp=function(t){ var strT=getSuitableTimeUnitStr(unixNow()-t);  this.myText(strT);  }
  var funcTTimeTmp=function(t){ var strT=getSuitableTimeUnitStr(unixNow()-t.toUnix());  this.myText(strT);  }
  var funcLinkTmp=function(url, rMat){
    var {boTLS,www}=siteTab.indexSiteTabById[rMat.idSite], urlLink=url;
    if(!regHttp.test(url)) urlLink=createUrlFrPageData({boTLS, www, pageName:url}); this.querySelector('a').prop({href:urlLink}).myText(url);
  }
  var TDProt={
    url:{ mySetVal:funcLinkTmp },
    tCreated:{ mySetVal:funcTTimeTmp },
    tLastAccess:{ mySetVal:funcTTimeTmp },
    tMod:{ mySetVal:funcTTimeTmp }
  }
  var TDConstructors={
    url:function(){ var a=createElement('a').prop({target:"_blank", rel:"noopener"}),el=createElement('td').myAppend(a);  extend(el,TDProt.url);  return el;  },
    tCreated:function(){ var el=createElement('td');  extend(el,TDProt.tCreated);  return el;  },
    tLastAccess:function(){ var el=createElement('td');  extend(el,TDProt.tLastAccess);  return el;  },
    tMod:function(){ var el=createElement('td');  extend(el,TDProt.tMod);  return el;  }
  }
  el.myAdd=function(rMat){
    var Td=[];  for(var i=0;i<StrCol.length;i++) { 
      var name=StrCol[i], val=rMat[name], td; if(name in TDConstructors) {td=new TDConstructors[name](); }   else td=createElement('td');   Td.push(td.attr('name',name));
      if('mySetVal' in td) { td.mySetVal(val, rMat);}   else td.append(val);
      if('mySetSortVal' in td) { td.mySetSortVal(val);}   else td.valSort=val;
    }
    var buttEdit=createElement('button').attr('name','buttonEdit').myText('Edit').on('click',function(){
      redirectSetPop.openFunc.call(this,1,1);
    });
    var buttCopy=createElement('button').attr('name','buttonCopy').myText('Copy').on('click',function(){
      redirectSetPop.openFunc.call(this,0,1);
    });
    var buttDelete=createElement('button').attr('name','buttonDelete').css({'margin-right':'0.2em'}).myAppend(charDelete).on('click',redirectDeletePop.openFunc);
    var tEdit=createElement('td').myAppend(buttEdit), tCopy=createElement('td').myAppend(buttCopy), tDelete=createElement('td').myAppend(buttDelete); 
    var elR=createElement('tr').myAppend(...Td, tEdit, tCopy, tDelete); elR.attr({idSite:rMat.idSite, pageName:rMat.pageName}).prop('rMat',rMat)
    tBody.append(elR); 
    el.nRowVisible=tBody.children.length;
    return el;
  }
  el.myRemove=function(elR){
    elR.remove();  
    el.nRowVisible=tBody.children.length;
    return el; 
  }
  el.myEdit=function(rMat){
    var elR=tBody.querySelector('[idSite="'+rMat.idSiteOld+'"][pageName='+rMat.pageNameOld+']');
    elR.attr({idSite:rMat.idSite,pageName:rMat.pageName}).prop('rMat',rMat);
    //for(var i=0;i<StrCol.length;i++) { var name=StrCol[i], val=rMat[name], td=elR.querySelector('td:nth-of-type('+(i+1)+')'); if(td.mySetVal) td.mySetVal(val, rMat); else td.myText(val); }
    for(var i=0;i<StrCol.length;i++) { var name=StrCol[i], val=rMat[name], td=elR.children[i]; if(td.mySetVal) td.mySetVal(val, rMat); else td.myText(val); }
    return el;
  }
  el.setUp=async function(){
    if(!siteTab.boUpToDate) {await siteTab.setUp();}
    var vec=[['redirectTabGet',{},setUpRetB]];   myFetch('POST',vec);
  }
  var setUpRetB=function(data){
    var ObjRedir=tabNStrCol2ArrObj(data);
    var nEntry=ObjRedir.length;
    tBody.empty(); 
    for(var i=0;i<nEntry;i++) {  el.myAdd(ObjRedir[i]);   }
    var plurEnding=nEntry==1?'y':'ies'; setMess('Got '+nEntry+' entr'+plurEnding,3);
    el.nRowVisible=nEntry;
  }

  var tBody=el.tBody=createElement('tbody');
  el.table=createElement('table').myAppend(tBody).addClass('tableSticky'); //.css({width:'100%',position:'relative'});
  el.divCont=createElement('div').myAppend(el.table).css({'margin':'1em auto','text-align':'left',display:'inline-block'});

  var StrCol=['siteName','pageName','url', 'tCreated', 'tMod', 'nAccess', 'tLastAccess'], BoAscDefault={tCreated:0};
  var Label={tCreated:'Age'};
  //var tHead=headExtend(createElement('thead'),el,StrCol,BoAscDefault,Label);
  var trTmp=headExtend(createElement('tr'),el,StrCol,BoAscDefault,Label);
  var tHead=createElement('thead').myAppend(trTmp);
  tHead.css({background:'white', width:'inherit'});  //,height:'calc(12px + 1.2em)'
  el.table.prepend(tHead);
  el.nRowVisible=0;

      // menuA
  var buttonAdd=createElement('button').myText('Add').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',function(){
    redirectSetPop.openFunc.call({},0,0);
    //redirectSetPop.openFunc.call({boButtonIns:1});
  });
  var buttonClearNAccess=createElement('button').myText('Clear nAccess').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',function(){
    var vec=[['redirectTabResetNAccess', {}, function(){ el.setUp();}]];   myFetch('POST',vec);
  });
  var spanLabel=createElement('span').myText('Redirect').css({'float':'right',margin:'0.2em 0 0 0'});  
  var menuA=createElement('div').myAppend(buttonAdd,buttonClearNAccess,spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'}); 

  el.addClass('redirectTab');
  el.fixedDiv=createElement('div').myAppend(menuA).css(cssFixed);
  el.css({'text-align':'center'});
  el.append(el.divCont, el.fixedDiv);
  return el;
}


var siteSetPopExtend=function(el){
  el.toString=function(){return 'siteSetPop';}
  var save=function(){ 
    r.boTLS=Number(selBoTLS.value);
    var idSite=inpName.value; if(idSite.length==0){ setMess('empty name',2);  return;}
    r.www=inpWWW.value;  if(r.www.length==0){ setMess('empty www',2);  return;}
    r.googleAnalyticsTrackingID=inpGog.value;
    r.srcIcon16=inpSrcIcon16.value;
    r.strLangSite=inpStrLangSite.value; //if(r.strLangSite.length!=2){ setMess('strLangSite should be two characters',2);  return;}
    var objTmp=extend({},r); //boUpd
    //var vec=[['siteTabSet', objTmp, saveRet]];   myFetch('POST',vec);
    if(boUpd){  objTmp.idSiteNew=idSite; var vec=[['siteTabUpd', objTmp, saveRet]];   myFetch('POST',vec); }
    else { objTmp.idSite=idSite;  var vec=[['siteTabInsert', objTmp, saveRet]];   myFetch('POST',vec); }
  }
  var saveRet=function(data){
    if(!data.boOK) return;
    var idSiteOld=r.idSite; r.idSite=data.idSite;
    if(boUpd) { siteTab.myEdit(idSiteOld, r); } //r.idSite=idSite;
    //else {r.tCreated=new Date(); siteTab.myAdd(r); }    
    //else {r.tCreated=data.objSite.tCreated;  siteTab.myAdd(r); }   
    else {copySome(r, data.objSite, ['tCreated']); r.nPage=0; siteTab.myAdd(r); }    
    //siteTab.setUp();
    historyBack();
  }
  el.setUp=function(){
    if(typeof r.boTLS=='undefined') r.boTLS=0;
    selBoTLS.value=Number(r.boTLS); inpName.value=r.idSite; inpWWW.value=r.www; inpGog.value=r.googleAnalyticsTrackingID; inpSrcIcon16.value=r.srcIcon16; inpStrLangSite.value=r.strLangSite;
    inpName.focus();  return true;
  }
  el.openFunc=function(boUpdT,boGotData){
    boUpd=boUpdT;
    if(boGotData){
      var elR=this.parentNode.parentNode;  r=elR.rMat;
    } else {r=rDefault;}
    if(!boUpd) r.boDefault=0;
    doHistPush({view:siteSetPop});
    el.setVis();
    el.setUp();
  }
  el.setVis=function(){
    el.show(); return 1;
  }
 
  var rDefault={idSite:'', www:'', googleAnalyticsTrackingID:'', srcIcon16:'', strLangSite:''};
  var boUpd, r; 
  var opt=createElement('option').prop({value:0, selected:true}).css({display:'block'}).myText('http'); 
  var optS=createElement('option').prop({value:1}).css({display:'block'}).myText('https'); 
  var selBoTLS=createElement('select').css({display:'block'}).myAppend(opt,optS); 
  var labName=createElement('b').myText('Name (used as prefix when backing up etc.)');
  var inpName=createElement('input').prop('type', 'text');
  var imgHWWW=imgHelp.cloneNode(1).css({margin:'0em 1em'}); popupHover(imgHWWW,createElement('div').myHtml('<p>Ex:<p>www.example.com<p>127.0.0.1:5000<p>localhost:5000'));
  var labWWW=createElement('b').myAppend('www (domain)', imgHWWW);
  var inpWWW=createElement('input').prop('type', 'text');
  var labGog=createElement('b').myText('googleAnalyticsTrackingID');
  var inpGog=createElement('input').prop('type', 'text');
  var imgSrcIcon16=imgHelp.cloneNode(1).css({margin:'0em 1em'}); popupHover(imgSrcIcon16,createElement('div').myHtml('<p>srcIcon16<p>Note!!! The source/url must have "16" right before the period. Ex:<br>Site/Icon/icon16.png<p>("16" will be replaced with 144, 192, 200, 512 and 1024 respectivly, to provide high resolution icons.)'));  //<p>Make sure the corresponding files exist in the selected location.
  //'<p>srcIcon16<p>The source/url must have the "16" right before the period. Ex:<br>Site/Icon/icon16.png<p>("16" will be replaced with 144, 192, 200, 512 and 1024 respectivly, to provide high resolution icons.)'
  var labSrcIcon16=createElement('b').myAppend('srcIcon16', imgSrcIcon16);
  var inpSrcIcon16=createElement('input').prop('type', 'text').attr({pattern:"16"});
  var imgStrLangSite=imgHelp.cloneNode(1).css({margin:'0em 1em'}); popupHover(imgStrLangSite,createElement('div').myHtml('ISO 639-1 Language Code (used by search engines)'));
  var labStrLangSite=createElement('b').myAppend('strLangSite', imgStrLangSite);
  var intL=11, inpStrLangSite=createElement('input').prop({type:'text'}).attr({maxlength:intL, title:'ISO 639-1 Language Code', size:intL}).css({display:'block'});
 
  [labName, labWWW, labGog, labSrcIcon16, labStrLangSite].forEach(ele=>ele.css({'margin-right':'0.5em'}));
  [inpName, inpWWW, inpGog, inpSrcIcon16].forEach(ele=>ele.css({display:'block',width:'100%'}).on('keypress',  function(e){ if(e.which==13) {save();return false;}} ));
  var inpNLab=[selBoTLS, labName, inpName, labWWW, inpWWW, labGog, inpGog, labSrcIcon16, inpSrcIcon16, labStrLangSite, inpStrLangSite];

  //var buttonCancel=createElement('button').myText('Cancel').on('click',historyBack).css({'margin-top':'1em'});
  var buttonSave=createElement('button').myText('Save').on('click',save).css({'margin-top':'1em'});
  var divBottom=createElement('div').myAppend(buttonSave);  //buttonCancel,

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").myAppend(...inpNLab,divBottom).css({'min-width':'17em','max-width':'30em', padding: '1.2em 0.5em 1.2em 1.2em'}); //height:'24em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
   
  return el;
}

var siteDeletePopExtend=function(el){
  el.toString=function(){return 'siteDeletePop';}
  var ok=createElement('button').myText('OK').css({'margin-top':'1em'}).on('click',function(){    
    var vec=[['siteTabDelete',{idSite},okRet]];   myFetch('POST',vec);    
  });
  var okRet=function(data){
    if(!data.boOK) return;
    siteTab.myRemove(elR);
    historyBack();
  }
  el.openFunc=function(){
    elR=this.parentNode.parentNode; idSite=elR.rMat.idSite; spanSite.myText(idSite);
    doHistPush({view:siteDeletePop});
    el.setVis();
    ok.focus();
  }
  el.setVis=function(){
    el.show(); return 1;
  }
 
  var elR, idSite;
  var head=createElement('h3').myText('Delete');
  var spanSite=createElement('span');//.css({'font-weight': 'bold'});
  var p=createElement('div').myAppend(spanSite);
  //var cancel=createElement('button').myText("Cancel").on('click',historyBack).css({'margin-top':'1em'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").myAppend(head,p,ok).css({'min-width':'17em','max-width':'25em', padding:'0.5em'});  //,cancel height:'10em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
 
  return el;
}

var siteTabExtend=function(el){
  el.toString=function(){return 'siteTab';}

  var TDProt={
    boDefault:{
      mySetVal:function(boOn){  var td=this, b=td.firstChild, strCol=''; if(boOn) strCol='green'; b.css('background',strCol);  }
    },
    boTLS:{
      mySetVal:function(boOn){  this.myHtml(boOn?'s':'<s>s</s>');  }
    },
    www:{
      mySetVal:function(strText){
        var td=this, strS=Number(td.parentNode.rMat.boTLS)?'s':'', a=td.firstChild.prop('href','http'+strS+'://'+strText).myText(strText);
      }
    },
    tCreated:{
      mySetVal:function(tCreated){      var td=this, strT=getSuitableTimeUnitStr(unixNow()-tCreated.toUnix());  td.myText(strT);  }
    },
    srcIcon16:{
      mySetVal:function(url){     this.firstChild.prop({src:url, title:url});    }
    },
    // strLangSite:{
    //   mySetVal:function(str){      this.firstChild.prop({src:str, title:strLangSite});   }
    // }
  }
  var TDConstructors={
    boDefault:function(){ var b=createElement('button').css('width','1.2em').on('click',setDefault), el=createElement('td').css('text-align','center').myAppend(b);  extend(el,TDProt.boDefault);  return el;  },
    boTLS:function(){ var el=createElement('td'); extend(el,TDProt.boTLS);  return el;  },
    www:function(){ var a=createElement('a').prop({target:"_blank", rel:"noopener"}),  el=createElement('td').myAppend(a);  extend(el,TDProt.www);  return el;  },
    tCreated:function(){ var el=createElement('td');  extend(el,TDProt.tCreated);  return el;  },
    srcIcon16:function(){ var im=createElement('img').prop({alt:"iconProt"}).css({'vertical-align':'middle'}), el=createElement('td').myAppend(im); extend(el,TDProt.srcIcon16);  return el;  },
    //strLangSite:function(){ var im=createElement('img').prop({alt:"icon200"}).css({'vertical-align':'middle', 'max-width':'50px', 'max-height':'50px'}), el=createElement('td').myAppend(im); extend(el,TDProt.strLangSite);  return el;  }
  }
  el.myAdd=function(rMat){
    var elR=createElement('tr'); elR.attr({idSite:rMat.idSite}).prop('rMat',rMat)
    for(var i=0;i<StrColOrder.length;i++) { 
      var name=StrColOrder[i], val=rMat[name], td; if(name in TDConstructors) {td=new TDConstructors[name](); }   else td=createElement('td');   elR.append(td.attr('name',name));
      if('mySetVal' in td) { td.mySetVal(val);}   else td.append(val);
      if('mySetSortVal' in td) { td.mySetSortVal(val);}   else td.valSort=val;
    }
    var buttEdit=createElement('button').attr('name','buttonEdit').myText('Edit').on('click',function(){
      siteSetPop.openFunc.call(this,1,1);
    });
    var buttCopy=createElement('button').attr('name','buttonCopy').myText('Copy').on('click',function(){
      siteSetPop.openFunc.call(this,0,1);
    });
    var buttDelete=createElement('button').attr('name','buttonDelete').css({'margin-right':'0.2em'}).myAppend(charDelete).on('click',siteDeletePop.openFunc);
    var tEdit=createElement('td').myAppend(buttEdit), tCopy=createElement('td').myAppend(buttCopy), tDelete=createElement('td').myAppend(buttDelete); 
    elR.append(tEdit, tCopy, tDelete);
    tBody.append(elR); 
    el.nRowVisible=tBody.children.length;
    return el;
  }
  el.myRemove=function(elR){
    elR.remove();
    el.nRowVisible=tBody.children.length;
    return el; 
  }
  el.myEdit=function(idSiteOld, rMat){
    var elR=tBody.querySelector('[idSite="'+idSiteOld+'"]');
    elR.attr({idSite:rMat.idSite});
    //for(var i=0;i<StrCol.length;i++) { var name=StrCol[i], val=rMat[name], td=elR.children[i]; if(td.mySetVal) td.mySetVal(val); else td.myText(val); }
    for(var i=0;i<StrColOrder.length;i++) { var name=StrColOrder[i], val=rMat[name], td=elR.children[i]; if(td.mySetVal) td.mySetVal(val); else td.myText(val); }
    return el;
  }
  el.setUp=async function(){
    if(el.boUpToDate) return;
    var vec=[['siteTabGet',{}]];   var [err,dataArr]=await myFetch('POST',vec,1); if(err){setMess(err); return;}  
    var data=dataArr[0][0];
    if(!data.boOK) return;
    tabNStrCol2ArrObjGC(data, ObjSite);
    //StrCol=data.StrCol;
    el.boUpToDate=1;
    
    tBody.empty(); 
    el.indexSiteTabById={};
    for(var i=0;i<ObjSite.length;i++) {  
      var r=ObjSite[i];   el.myAdd(r);   el.indexSiteTabById[r.idSite]=r;
    }
    el.nRowVisible=ObjSite.length;
  }
  
  var setDefault=function(){
    var elR=this.parentNode.parentNode, rMat=elR.rMat;
    var vec=[['siteTabSetDefault',{idSite:rMat.idSite},function(){
      var Row=[...tBody.childNodes];
      Row.forEach(function(rowA,i){
        var idA=rowA.rMat.idSite;  //.data('r')
        var td=rowA.querySelector('[name=boDefault]'); td.mySetVal(idA==rMat.idSite);
      })
    }]];   myFetch('POST',vec);
  }
  //el.boRefreshNeeded; // The parent view of this view (siteTab) should set this to 1
  var ObjSite=el.ObjSite=[];
  //var StrCol;
  el.boUpToDate=0;


  var tBody=el.tBody=createElement('tbody');
  el.table=createElement('table').myAppend(tBody).addClass('tableSticky'); //.css({width:'100%',position:'relative'});
  el.divCont=createElement('div').myAppend(el.table).css({'margin':'1em auto','text-align':'left',display:'inline-block'});

  var StrColOrder=['boDefault','boTLS', 'idSite','www','googleAnalyticsTrackingID','srcIcon16','strLangSite','tCreated','nPage'];

  var BoAscDefault={boDefault:0,boTLS:0,tCreated:0,nPage:0};
  var Label={boDefault:'Default',idSite:'name/key', gog:'gog...', tCreated:'Age', nPage:'#page', boTLS: 'secure (TLS)'};
  //var tHead=headExtend(createElement('thead'),el,StrColHead,BoAscDefault,Label);
  var trTmp=headExtend(createElement('tr'),el,StrColOrder,BoAscDefault,Label);
  var tHead=createElement('thead').myAppend(trTmp);
  tHead.css({background:'white', width:'inherit'});  //,height:'calc(12px + 1.2em)'
  el.table.prepend(tHead);
  el.nRowVisible=0;


      // menuA
  var buttonAdd=createElement('button').myText('Add').addClass('fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',function(){
    siteSetPop.openFunc.call({},0,0);
  });
  var spanLabel=createElement('span').myText('SiteTab').css({'float':'right',margin:'0.2em 0 0 0'});  
  var menuA=createElement('div').myAppend(buttonAdd,spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'}); //buttonBack,

  el.addClass('siteTab');
  el.fixedDiv=createElement('div').myAppend(menuA).css(cssFixed);
  el.css({'text-align':'center'});
  el.append(el.divCont, el.fixedDiv);
  return el;
}





var myFetch=async function(strMethod, vecIn, boHandlesErr=0){  // Each argument of vecIn is an array: [serverSideFunc, serverSideFuncArg, returnFunc]
  var headers={'X-Requested-With':'XMLHttpRequest'};
  var argFetch={method:strMethod, headers}
  var arrRet=[]; vecIn.forEach(function(el,i){var f=null; if(el.length==3) f=el.pop(); arrRet[i]=f;}); // Put return functions in a separate array
  vecIn.push(['page',objPage.pageName]);
  var boForm=vecIn.length==2 && vecIn[0][1] instanceof FormData;
  if(boForm){
    var formData=vecIn[0][1]; vecIn[0][1]=0; // First element in vecIn contains the formData object. Rearrange it as "root object" and add the remainder to a property 'vec'
    vecIn.push(['tMod',objPage.tMod],['CSRFCode',getItem('CSRFCode')]); 
    formData.append('vec', JSON.stringify(vecIn));
    var tmp=window.btoa(Math.random().toString()).substr(0, 12);
    var dataOut=formData;
    headers['x-type']='single';
  } else {
    if(strMethod=='POST'){   vecIn.push(['CSRFCode',getItem('CSRFCode')],['tMod',objPage.tMod]);   }
    var dataOut=JSON.stringify(vecIn);
  }
  busyLarge.show();
  
  if(strMethod=='GET') var uBETmp=uBE+'?'+encodeURIComponent(dataOut); else {uBETmp=uBE; argFetch.body=dataOut;}
  
  var [err, response]= await fetch(uBETmp, argFetch).toNBP();
  if(err) { if(!boHandlesErr) {console.log(err); setMess(err);}  return [err]; }
  //var data=await response.json();
  var [err, data]=await response.text().toNBP();
  if(err) { if(!boHandlesErr) {console.log(err); setMess(err);}  return [err]; } 
  var data=deserialize(data);

    
  var dataArr=data.dataArr||[];  // Each element of dataArr looks like [argument] or [altFuncArg,altFunc]
  delete data.dataArr;
  beRet(data);
  for(var i=0;i<dataArr.length;i++){
    var r=dataArr[i];
    if(typeof r=="undefined") continue;
    if(r.length==1) {var f=arrRet[i]; if(f) f(r[0]);} else { window[r[1]].call(window,r[0]);   }
  }
  return [null,dataArr];
}

var beRet=function(data){
  //if(typeof jqXHR!='undefined') var tmp=jqXHR.responseText;
  for(var key in data){
    if(key=='GRet') GRet.call(this,data[key]); 
    else setMess('Unexpected: return function from be');
    //window[key].call(this,data[key]); 
  }
  busyLarge.hide();
}  



var GRet=function(data){
  var tmp;
  if(data.boARLoggedIn!=undefined){  copySome(app, data, ['boARLoggedIn']);  }
  if(data.boAWLoggedIn!=undefined){
    copySome(app, data, ['boAWLoggedIn']);
    adminDiv.setUpButtons(boAWLoggedIn);
  }
  //tmp=data.idPage;   if(typeof tmp!="undefined") { objPage.idPage=tmp;  }
  //tmp=data.objRev;   if(typeof tmp!="undefined") { objRev=tmp; }
  tmp=data.objPage;   if(typeof tmp!="undefined") {
    //objPage.idPage=objPage._id; delete objPage._id;
    overwriteProperties(objPage, tmp);
    //objPage=tmp; 
    pageView.editButton.setImg(objPage.boOW);  editDiv.spanSave.toggle(Boolean(objPage.boOW));   //editDiv.spanCreated.myText(mySwedDate(objPage.tCreated));
    adminMoreDiv.setMod();
  }
  tmp=data.objSetting;   if(typeof tmp!="undefined") { app.objSetting=tmp; adminMoreDiv.setBUNeededInfo();  }

  pageView.spanMod.setup(objPage);
  pageView.setFixedDivColor(objPage.boOR);

  copyIfExist(app, data, ['arrVersionCompared']);

  //tmp=data.matVersion;   if(typeof tmp!='undefined') {  nVersion=tmp.length;  matVersion=tmp.tab; versionTable.setTable(); pageView.setDetail(); }
  tmp=data.matVersion;   if(typeof tmp!='undefined') {  matVersion=tabNStrCol2ArrObj(tmp); app.nVersion=matVersion.length; versionTable.setTable(); pageView.setDetail(); }
  
  tmp=data.strDiffText;   if(typeof tmp!="undefined") {diffDiv.setUp(tmp);  }  
  tmp=data.strHtmlText;   if(typeof tmp!="undefined") {pageText.myHtml(tmp); pageText.modStuff();}
  tmp=data.strEditText;   if(typeof tmp!="undefined") editText.value=tmp;
  //tmp=data.templateHtml;   if(typeof tmp!="undefined") templateList.empty().append(tmp);
  tmp=data.objTemplateE;   if(typeof tmp!="undefined") templateList.setUp(tmp);
  //tmp=data.strMessageText;   if(typeof tmp!="undefined") setMess(tmp,15);
  tmp=data.strMessageText;   if(typeof tmp!="undefined") {setMess(tmp,15); if(/error/i.test(tmp)) navigator.vibrate(100);}
  tmp=data.boTalkExist;   if(typeof tmp!="undefined") commentButton.setUp(tmp);
  //tmp=data.strMessageText;   if(typeof tmp!="undefined") setMess(tmp,5);
  //tmp=data.CSRFCode;   if(typeof tmp!="undefined") CSRFCode=tmp;
  if('CSRFCode' in data) setItem('CSRFCode',data.CSRFCode);
  //if(!(boARLoggedIn || objPage.boOR)) aRLoginDiv.setVis();  
  //if(!objPage.boOR && (boARLoggedIn==undefined || boARLoggedIn==0)) aRLoginDiv.setVis();  
  if(!objPage.boOR && boARLoggedIn==0) aRLoginDiv.setVis();  


  // if(boARLoggedIn!=undefined ){
  //   var boT=!objPage.boOR && boARLoggedIn; butARLogout.toggle(boT);
  // }
  var boT=!objPage.boOR && boARLoggedIn;   butARLogout.toggle(boT);

  if(boAWLoggedIn){ //boAWLoggedIn!=undefined && 
    if(timerALogout) { clearTimeout(timerALogout); }
    timerALogout=setTimeout(function(){
      boAWLoggedIn=0; //histGoTo('adminDiv');
      adminDiv.setUpButtons(boAWLoggedIn);
    },maxAdminWUnactivityTime*1000);
  }
  
}




var timerALogout=null;

window.langHtml={
  histsRem:'trunc',
  All:'All',
  None:'None',
  // time units [[singularShort, pluralShort], [singularLong, pluralLong]]
  timeUnit:{
  s:[['s','s'],['second','seconds']],
  m:[['min','min'],['minute','minutes']],
  h:[['h','h'],['hour','hours']],
  d:[['d','d'],['day','days']],
  M:[['mo','mo'],['month','months']],
  y:[['y','y'],['year','years']]
  },
};
langHtml.label={
parent:'Parent name',
//child:'Child name',
//image:'Image',
size:'Size',
boOR:'Public read access',
boOW:'Public write access',
boSiteMap:'On sitemap',
boTalk:'Talk page',
boTemplate:'Template',
boOther:'Supplied by user',
tMod:'Modification age',
tCreated:'Created',
tLastAccess:'Last Access',
nAccess:'nAccess'
}
var helpBub={}


window.elHtml=document.documentElement; window.elBody=document.body;
elBody.css({margin:'0px'}); //, position:'relative'
//window.elViewport=document.querySelector('head>meta[name=viewport]');
window.boTouch = Boolean('ontouchstart' in document.documentElement);
//boTouch=1;

//var boLCacheObs=document.querySelector('#boLCacheObs'); if(boLCacheObs.value.length) { boLCacheObs.value=""; location.reload(); return} //boLCacheObs.value=1;




var ua=navigator.userAgent, uaLC = ua.toLowerCase(); //alert(ua);
window.boAndroid = uaLC.indexOf("android") > -1;
window.boFF = uaLC.indexOf("firefox") > -1; 

app.boChrome= /chrome/.test(uaLC);
app.boIOS= /iphone|ipad|ipod/.test(uaLC);
app.boEpiphany=/epiphany/.test(uaLC);    if(boEpiphany && !boAndroid) boTouch=false;  // Ugly workaround
//app.boEdge= /\bedg\b/.test(uaLC);


window.boOpera=RegExp('OPR\\/').test(ua); if(boOpera) boChrome=false; //alert(ua);



var boSmallAndroid=0;



var strMenuOpenEvent=boTouch?'click':'mousedown';


var charBackSymbol=boIOS?'◄':'◀';
var strFastBackSymbol=charBackSymbol+charBackSymbol;
var charFlash='↯';//⚡↯
var charPublicRead='<span style="font-family:courier">͡°</span>'; //☉͡°
var charPublicRead='<span class=eye>(∘)</span>'; //☉͡° ·
var charPublicRead='📖' //'👁'; //'📖'; //👀😶☉͡° · 🕮
var charPublicWrite='🖉'; //✎ 🔏 🔒 🔓 🔐 🖉 🖊 ✏ 🖋 ✎ ✐
var charPromote='📣'; //'🗣️';  //😗😱😮
var charDelete='✖'; //x, ❌, X, ✕, ☓, ✖, ✗, ✘
var charClose='✖';
var charLink='🔗'; //☞🔗
var charThumbsUp='👍'; //👍☝
var charThumbsDown='👎'; //👎☟
var charSpeechBaloon='💬';
var charCamera='📷';
var charHourGlass='⏳';
// charPhone ✆☎☏📱🌍👨‍🔬💻💡👷🏢👨‍💼

// ♿⚠⌂💰💋♥

//cssEye={'font-family':'courier', 'font-size':'90%', 'letter-spacing':'-.5em', transform:'rotate(90deg)', display:'inline-block','vertical-align':'.4em'}

//boHistPushOK='pushState' in history && 'state' in history;
var boHistPushOK='pushState' in history;
if(!boHistPushOK) { console.log('This browser does not support history'); return;}
var boStateInHistory='state' in history;
if(!boStateInHistory) { console.log('This browser does not support history.state'); return;}


var boIsGeneratorSupported=isGeneratorSupported();
var boFormDataOK=1;  if(typeof FormData=='undefined') {  boFormDataOK=0;  }

if(!(typeof sessionStorage=='object' && sessionStorage.getItem)) {console.log("This browser doesn't support sessionStorage"); return;}

//var menuMaxWidth=500;
var menuMaxWidth="var(--menuMaxWidth)";
var boImgCreationOK=1;


var urlPayPal='https://www.paypal.com/cgi-bin/webscr';

var iEdit=0, iPay=1, iVersion=2;
var colButtonOn='#aaa', colButtonOff='#eee'; 
var cssFixed={margin:'0em 0','text-align':'center',position:'fixed',bottom:0,width:'100%','border-top':'3px #aaa solid',background:'#fff'}; //,'z-index':5
var cssFixedDrag={margin:'0em 0','text-align':'center',position:'fixed',bottom:0,width:'100%',background:'#ddd'}; //,'z-index':5
if(boTouch) { cssFixedDrag=extend({},cssFixed); cssFixedDrag['border-top']=''};
var sizeIcon=1.5, strSizeIcon=sizeIcon+'em';



indexAssign();
setItem('CSRFCode',CSRFCode);

assignCommonJS();
//extend(window,{boARLoggedIn:0, boAWLoggedIn:0});

matVersion=tabNStrCol2ArrObj(matVersion);  app.nVersion=matVersion.length;


var strScheme='http'+(objSite.boTLS?'s':''),    strSchemeLong=strScheme+'://',    uSite=strSchemeLong+objSite.www;
var strScheme='http'+(objSiteDefault.boTLS?'s':''),    strSchemeLong=strScheme+'://',       uSiteCommon=strSchemeLong+objSiteDefault.www;
var uBE=uSite+"/"+leafBE;
var uCanonical=uSite+'/'+objPage.pageName;
if(objPage.pageName=='start') uCanonical=uSite;



var wcseLibImageFolder='/'+flLibImageFolder+'/';
var uLibImageFolder=uSiteCommon+wcseLibImageFolder;

//uImCloseW=uLibImageFolder+'triangleRightW.png';
//uImOpenW=uLibImageFolder+'triangleDownW.png';
//uImCloseB=uLibImageFolder+'triangleRight.png';
//uImOpenB=uLibImageFolder+'triangleDown.png';


var uHelpFile=uLibImageFolder+'help.png';

//uVipp0=uLibImageFolder+'vipp0.png';
//uVipp1=uLibImageFolder+'vipp1.png';

//uFB=uLibImageFolder+'fb.png';
//uFBFacebook=uLibImageFolder+'fbFacebook.png';
var uIncreasing=uLibImageFolder+'increasing.png';
var uDecreasing=uLibImageFolder+'decreasing.png';
var uUnsorted=uLibImageFolder+'unsorted.png';

//uAnon=uLibImageFolder+'anon.png';
//uHeart=uLibImageFolder+'heart20.png';
//uOpenId=uLibImageFolder+'openid-inputicon.gif';
//uOID22=uLibImageFolder+'oid22.png';
var uBusy=uLibImageFolder+'busy.gif';
var uBusyLarge=uLibImageFolder+'busyLarge.gif';
var uSummary=uLibImageFolder+'summary.png';
var uSignature=uLibImageFolder+'signature.png';

var uPen=uLibImageFolder+'pen.png';
var srcsetPen=uPen+" 1x, "+uPen+" 2x ";
var uPenNot=uLibImageFolder+'penNot.png';
var srcsetPenNot=uPenNot+" 1x, "+uPenNot+" 2x ";
var uBitcoin=uLibImageFolder+'bitcoin.png';
var uAdmin=uLibImageFolder+'admin.png';
var uComment=uLibImageFolder+'comment.png';
//uSave=uLibImageFolder+'save.png';
var uFlash=uLibImageFolder+'flash.png';
var uFilter=uLibImageFolder+'filter.png';
//uZoom=uLibImageFolder+'zoom.png';
var urlPaypalButton=uLibImageFolder+"btn_pponly_142x27.png";


var uDelete=uLibImageFolder+'delete.png';
var uDelete1=uLibImageFolder+'delete1.png';


//var imgHelp=createElement('img').prop({src:uHelpFile, alt:"help"}).css({'vertical-align':'-0.4em', height:'fit-content'});
app.hovHelpMy=createElement('span').myText('❓').addClass('btn-round', 'helpButtonGradient').css({color:'transparent', 'text-shadow':'0 0 0 #5780a8'}); //on('click', function(){return false;})    //'pointer-events':'none',
app.imgHelp=hovHelpMy;

var sizeIcon=1.5, strSizeIcon=sizeIcon+'em';
var imgProt=createElement('img').css({height:strSizeIcon,width:strSizeIcon,'vertical-align':'text-bottom'}).addClass('undraggable'); 



  //
  // History
  //
  
var strHistTitle=objPage.pageName;

var histList=[];
var stateLoaded=history.state;
var tmpi=stateLoaded?stateLoaded.ind:0,    stateLoadedNew={hash:randomHash(), ind:tmpi};
history.replaceState(stateLoadedNew, '', uCanonical);
app.stateTrans=stateLoadedNew;
history.StateMy=[];

window.on('popstate', function(event) {
  var dir=history.state.ind-stateTrans.ind;
  //if(Math.abs(dir)>1) {debugger; alert('dir=',dir); }
  //console.log(stateTrans);
  //console.log(history.state);
  var boSameHash=history.state.hash==stateTrans.hash;
  if(boSameHash){
    var tmpObj=history.state;
    if('boResetHashCurrent' in history && history.boResetHashCurrent) {
      tmpObj.hash=randomHash();
      history.replaceState(tmpObj, '', uCanonical);
      history.boResetHashCurrent=false;
    }

    var stateMy=history.StateMy[history.state.ind];
    if(typeof stateMy!='object' ) {
      var tmpStr=window.location.href +" Error: typeof stateMy: "+(typeof stateMy)+', history.state.ind:'+history.state.ind+', history.StateMy.length:'+history.StateMy.length+', Object.keys(history.StateMy):'+Object.keys(history.StateMy);
      if(!boEpiphany) alert(tmpStr); else  console.log(tmpStr);
      debugger;
      return;
    }
    var view=stateMy.view;
    view.setVis();
    if(typeof view.getScroll=='function') {
      var scrollT=view.getScroll();
      setTimeout(function(){window.scrollTop(scrollT);}, 1);
    } else {
      //var scrollT=stateMy.scroll;  setTimeout(function(){  window.scrollTop(scrollT);}, 1);
    }
    
    if('funOverRule' in history && history.funOverRule) {history.funOverRule(); history.funOverRule=null;}
    else{
      if('fun' in stateMy && stateMy.fun) {var fun=stateMy.fun(stateMy); }
    }

    stateTrans=extend({}, tmpObj);
  }else{
    //history.StateMy[history.state.ind]=history.StateMy[stateTrans.ind];
    history.StateMy[history.state.ind]={view:pageView, tDate:new Date()};
    stateTrans=history.state; extend(stateTrans, {hash:randomHash()}); history.replaceState(stateTrans, '', uCanonical);
    history.go(sign(dir));
  }
});
if(boFF){
  window.on('beforeunload', function(){   });
}

if(!boTouch){
  window.on('beforeunload',function(){
    var h=editText.style.height.slice(0,-2);
    setItem('hEditText',h); 
  })
}

var errorFunc=function(jqXHR, textStatus, errorThrown){
  setMess('responseText: '+jqXHR.responseText+', textStatus: '+' '+textStatus+', errorThrown: '+errorThrown);     throw 'bla';
}

var strClickOutside='Click outside the textarea to get back the buttons';

var warningDiv=createElement('div').myText("The page has unconfirmed changes. Use the buttons below to see older versions.").css({'background':'yellow','padding':'0.2em','text-align':'center','font-weight':'bold','font-size':'0.9em'}).hide();
var warningDivW=createElement('div').myAppend(warningDiv);

//viewDiv=createElement('div');
var pageText=document.querySelector('#pageText').detach();
var pageText=pageTextExtend(pageText).css({'overflow-y': 'hidden'});   pageText.modStuff();
var imgBusy=createElement('img').prop({src:uBusy, alt:"busy"});
//messageText=messExtend(createElement('span'));  window.setMess=messageText.setMess;  window.resetMess=messageText.resetMess;   elBody.append(messageText); 
//var spanMessageText=spanMessageTextCreate();  window.setMess=spanMessageText.setMess;  window.setMessHtml=spanMessageText.setHtml;  window.resetMess=spanMessageText.resetMess;  window.appendMess=spanMessageText.appendMess;  elBody.append(spanMessageText)


var divMessageText=divMessageTextCreate();  copySome(window, divMessageText, ['setMess', 'resetMess', 'appendMess']);
var divMessageTextW=createElement('div').myAppend(divMessageText).css({width:'100%', position:'fixed', bottom:'0px', left:'0px', 'z-index':'10'});
elBody.append(divMessageTextW);

var busyLarge=createElement('img').prop({src:uBusyLarge, alt:"busy"}).css({position:'fixed',top:'50%',left:'50%','margin-top':'-42px','margin-left':'-42px','z-index':'1000',border:'black solid 1px'}).hide();
elBody.append(busyLarge);
//loginInfo=loginInfoExtend(createElement('div')); elBody.prepend(loginInfo);


//commentButton=commentButtonExtend(createElement('a')).css({'margin-left':'1em'});
var commentButton=commentButtonExtend(createElement('span')).css({'margin-left':'','line-height':'2.5em'});

//paymentButton=createElement('button').myText('Pay/Donate');
//versionButton=createElement('button').myText('Versions');


commentButton.setUp(boTalkExist);

var dragHR=dragHRExtend(createElement('hr')); dragHR.css({height:'0.3em',background:'grey',margin:0});
if(boTouch) dragHR="";
var editText=editTextExtend(createElement('textarea')).css({background:'rgb(255, 255, 255, 0)'});

var butARLogout=createElement('button').myText('Logout').prop({title:'Logout (write-access AND read-access)'}).on('click',function(){
  var vec=[['aWLogout',{}], ['aRLogout',{}]];   myFetch('POST',vec); 
}).hide(); 
var pageView=pageViewExtend(createElement('div'));  //app.pageView=pageView;
var editDiv=editDivExtend(createElement('div')).css({width:'100%'}); //editDiv.spanLastMod.myText(mySwedDate(objPage.tMod));
var templateList=templateListExtend(createElement('div'));






var adminDiv=adminDivExtend(createElement('div')).css({width:'100%'});  

var adminMoreDiv=adminMoreDivExtend(createElement('div'));
var uploadUserDiv=uploadUserDivExtend(createElement('div')); //elBody.append(uploadUserDiv);

var menuPageSingle=menuPageSingleExtend(createElement('div'));
var parentSelPop=parentSelPopExtend(createElement('div'));
var divRowParent=new DivRowParentT();
var pageList=pageListExtend(createElement('div'));
var imageList=imageListExtend(createElement('div'));
var renamePop=renamePopExtend(createElement('div'));
var setStrLangPop=setStrLangPopExtend(createElement('div'));
var setSiteOfPagePop=setSiteOfPagePopExtend(createElement('div'));
var areYouSurePop=areYouSurePopExtend(createElement('div'));


var paymentDiv=paymentDivExtend(createElement('div')); 

    //filter colors
//var colButtAllOn='#9f9', colButtOn='#0f0', colButtOff='#ddd', colFiltOn='#bfb', colFiltOff='#ddd', colFontOn='#000', colFontOff='#777', colActive='#65c1ff', colStapleOn='#f70', colStapleOff='#bbb';  
//var maxStaple=20;
var objFilterSetting={colButtAllOn:'#9f9', colButtOn:'#0f0', colButtOff:'#ddd', colFiltOn:'#bfb', colFiltOff:'#ddd', colFontOn:'#000', colFontOff:'#777', colActive:'#65c1ff', colStapleOn:'#f70', colStapleOff:'#bbb', maxStaple:20};  

extend(Filt.tmpPrototype,MmmWikiFiltExtention);
var pageFilterDiv=PageFilterDiv(PropPage, langHtml.label, StrOrderFiltPage, function(){ pageList.histReplace(-1); pageList.loadTab();}); 
var imageFilterDiv=ImageFilterDiv(PropImage, langHtml.label, StrOrderFiltImage, function(){ imageList.histReplace(-1); imageList.loadTab();});  



    // apply "plugin changes"
var StrCompact=['boOR', 'boOW', 'boSiteMap', 'boTalk', 'boTemplate', 'boOther'];
var tmpRowButtf=function(span,val,boOn){   span.myText(Number(val)?'Yes':'No');   };
for(var i=0;i<StrCompact.length;i++) {
  var strName=StrCompact[i];
  extend(PropPage[strName], {    setFilterButtF:tmpRowButtf  });
}
extend(PropImage.boOther, {    setFilterButtF:tmpRowButtf  });

pageFilterDiv.divCont.createDivs();   pageFilterDiv.Filt=pageFilterDiv.divCont.Filt;
imageFilterDiv.divCont.createDivs();  imageFilterDiv.Filt=imageFilterDiv.divCont.Filt; 




//editorLoginDiv=loginDivExtend(createElement('div'),'editor');
var aRLoginDiv=aRLoginDivExtend(createElement('div'));


var versionTable=versionTableExtend(createElement('div')).css({'margin-top':'2em','text-align':'center'});   versionTable.setTable();  pageView.setDetail();
var diffDiv=diffDivExtend(createElement('div')).css({'text-align':'center'});
//versionDiv=createElement('div').append(versionTable,diffDiv).css({clear:'both'});

var slideShow=slideShowExtend(createElement('div'));

var redirectSetPop=redirectSetPopExtend(createElement('div'));
var redirectDeletePop=redirectDeletePopExtend(createElement('div'));
var redirectTab=redirectTabExtend(createElement('div'));
var siteSetPop=siteSetPopExtend(createElement('div'));
var siteDeletePop=siteDeletePopExtend(createElement('div'));
var siteTab=siteTabExtend(createElement('div'));

var diffBackUpDiv=createElement('div');
if(boIsGeneratorSupported) {
  diffBackUpDiv=diffBackUpDivExtend(createElement('div'));
}
var dumpDiv=dumpDivExtend(createElement('div'));
var tabBUDiv=tabBUDivExtend(createElement('div'));


var MainDiv=[aRLoginDiv, warningDivW, pageText, pageView, adminDiv, adminMoreDiv, pageList, imageList, editDiv, templateList, versionTable, diffDiv, paymentDiv, slideShow, pageFilterDiv, imageFilterDiv, uploadUserDiv, renamePop, setStrLangPop, setSiteOfPagePop, parentSelPop, areYouSurePop, redirectTab, redirectSetPop, redirectDeletePop, siteTab, siteSetPop, siteDeletePop, diffBackUpDiv, dumpDiv, tabBUDiv]; 

history.StateMy[history.state.ind]={view:pageView, tDate:new Date()};
//console.log(history.StateMy);
MainDiv.forEach(ele=>ele.hide());
elBody.append(...MainDiv);



aRLoginDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.aRPass.focus();
  //pageText.css({'margin-bottom':285+'px'});
  //fillScreenF(false);
  return true;
}
pageView.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); [this, warningDivW, pageText].forEach(ele=>ele.show());
  //pageText.css({'margin-bottom':285+'px'});
  //fillScreenF(false);
  this.setUp();
  return true;
}
adminDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); [this, pageText].forEach(ele=>ele.show());
  this.setUp();
  pageText.css({'margin-bottom':285+'px'});  
  //fillScreenF(false);
  return true;
}
adminMoreDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  //this.setUp();
  this.divCont.css({'margin-bottom':285+'px'});
  //fillScreenF(false);
  //redirectTab.boStale=1; siteTab.boStale=1;
  return true; 
}
pageList.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.setCBStat(0); 
  this.headW.prepend(divRowParent);
  this.divCont.css({'margin-bottom':285+'px'});
  //fillScreenF(false);
  return true;
}
imageList.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  //this.setCBStat(0);
  this.headW.prepend(divRowParent);
  this.divCont.css({'margin-bottom':285+'px'});
  //fillScreenF(false);
  return true;
}

editDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); [this, pageText].forEach(ele=>ele.show());
  pageText.css({'margin-bottom':285+'px'});
  //fillScreenF(false);
  this.setUp();
}
templateList.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  pageText.css({'margin-bottom':285+'px'});
  //fillScreenF(false);
  return true;
}

versionTable.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.table.css({'margin-bottom':285+'px'});
  //fillScreenF(false);
  return true;
}
diffDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.divCont.css({'margin-bottom':285+'px'});
  //fillScreenF(false);
  return true;
}
paymentDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); [this, pageText].forEach(ele=>ele.show());
  pageText.css({'margin-bottom':285+'px'});
  //fillScreenF(false);
}
slideShow.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  //fillScreenF(true);
} 
/*
menuDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show(); 
  //fillScreenF(false);
  return true;
}
*/
pageFilterDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();   return true;
}
imageFilterDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();  return true;
}
diffBackUpDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();  return true;
}
dumpDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();   return true;
}
tabBUDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();  return true;
}
redirectTab.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.setUp();
  //fillScreenF(false);
  return true;
}
siteTab.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.setUp();
  //fillScreenF(false);
  //redirectTab.boStale=1;
  return true;
}
//fillScreenF=function(boFill){    
  //if(boIOS) bodyHtmlSlide.toggleClass('fillScreen',boFill);
  //bodyNHtml.toggleClass('fillScreen',boFill);
//}


var setScroll=function(x){ pageText.intScroll=x;}
var getScroll=function(){ return pageText.intScroll;}
pageView.setScroll=adminDiv.setScroll=editDiv.setScroll=paymentDiv.setScroll=setScroll;
pageView.getScroll=adminDiv.getScroll=editDiv.getScroll=paymentDiv.getScroll=getScroll;


editText.value=strEditText;  templateList.setUp(objTemplateE);  


pageView.editButton.setImg(objPage.boOW);
pageView.spanMod.setup(objPage);
pageView.setFixedDivColor(objPage.boOR);

editDiv.spanSave.toggle(Boolean(objPage.boOW));

var boMakeFirstScroll=1;




await (async function(){
  if(objPage.boOR==0) { // If private
    adminDiv.setUpButtons(boAWLoggedIn);
    butARLogout.toggle(boARLoggedIn); 
    if(boARLoggedIn){
      pageView.setVis();
      var vec=[['pageLoad',{}]];  await myFetch('GET',vec); 
      pageView.setVis();
    } else aRLoginDiv.setVis();  
  }
  else {   var vec=[['getLoginBoolean',{}]];  await myFetch('POST',vec); pageView.setVis();   } 
  if(boAWLoggedIn) {  var vec=[['getAWRestrictedStuff',{}]];  await myFetch('POST',vec);  } 
})();

setTimeout(function(){
  var scriptZip=createElement("script").prop({src:uZip}).on('load',function(){ zip.workerScriptsPath = flFoundOnTheInternetFolder+'/'; });
  document.head.myAppend(scriptZip);
  var scriptSha1=createElement("script").prop({src:uSha1});  document.head.myAppend(scriptSha1);

  // import(uZip).then(function(trash){  zip.workerScriptsPath = flFoundOnTheInternetFolder+'/'; });
  // import(uSha1);
},0);
const strSha1NotLoaded='sha1.js is not loaded yet';



window.divReCaptcha=divReCaptchaExtend(editDiv.spanSave.divReCaptcha);
window.cbRecaptcha=function(){
  if(editDiv.style.display!='none') { console.log('Setting up recaptcha (onload)'); divReCaptcha.setUp(); } // Otherwise "render" will occur when editDiv is opened.
}
window.boDbgSkipRecaptcha=0;
if(!boDbgSkipRecaptcha) divReCaptcha.loadScript();



var fixedDivsCoveringPageText=[pageView.fixedDiv, editDiv.fixedDiv, adminDiv.fixedDiv, paymentDiv.fixedDiv];
var setBottomMargin=function() { // This is not very beautiful. But how should one else make a fixed div at the bottom without hiding the bottom of the scrollable content behind??
  if(pageText.style.display!='none'){
    //var tmp=fixedDivsCoveringPageText.map(ele=>ele.style.display!='none'); pageText.css({'margin-bottom':tmp[0].offsetHeight+'px'});
    var hMax=0; for(var i=0;i<fixedDivsCoveringPageText.length;i++){var tmp=fixedDivsCoveringPageText[i], hTmp=tmp.offsetHeight; if(tmp.style.display!='none' && hTmp>hMax) hMax=hTmp;}
    pageText.css({'margin-bottom':hMax+'px'});
  }
  else if(versionTable.style.display!='none'){versionTable.table.css({'margin-bottom':versionTable.fixedDiv.offsetHeight+'px'});}
  else if(diffDiv.style.display!='none'){diffDiv.divCont.css({'margin-bottom':diffDiv.fixedDiv.offsetHeight+'px'});}
  else if(pageList.style.display!='none'){
    pageList.divCont.css({'margin-bottom':pageList.fixedDiv.offsetHeight+'px'});
    //pageList.divCont.css({'margin-top':pageList.fixedTop.offsetHeight+'px'});
  }
  else if(imageList.style.display!='none'){
    imageList.divCont.css({'margin-bottom':imageList.fixedDiv.offsetHeight+'px'});
    //imageList.divCont.css({'margin-top':imageList.fixedTop.offsetHeight+'px'});
  }
  else if(redirectTab.style.display!='none'){redirectTab.divCont.css({'margin-bottom':redirectTab.fixedDiv.offsetHeight+'px'});}
  else if(siteTab.style.display!='none'){siteTab.divCont.css({'margin-bottom':siteTab.fixedDiv.offsetHeight+'px'});}
  //else if(menuDiv.divCont.style.display!='none'){menuDiv.divCont.css({'margin-bottom':menuDiv.fixedDiv.offsetHeight+'px'});}
  else if(pageFilterDiv.style.display!='none'){pageFilterDiv.divCont.css({'margin-bottom':pageFilterDiv.fixedDiv.offsetHeight+'px'});}
  else if(imageFilterDiv.style.display!='none'){imageFilterDiv.divCont.css({'margin-bottom':imageFilterDiv.fixedDiv.offsetHeight+'px'});}
  else if(adminMoreDiv.style.display!='none'){adminMoreDiv.divCont.css({'margin-bottom':adminMoreDiv.fixedDiv.offsetHeight+'px'});}
}
if(boFF) window.on("DOMMouseScroll", setBottomMargin, false); else   window.on('mousewheel', setBottomMargin);
if(boTouch) elBody.on('touchstart',setBottomMargin); else { elBody.on('click',setBottomMargin);  window.scroll(setBottomMargin); }



window.scroll(function(){ 
  var stateMy=history.StateMy[history.state.ind];
  var view=stateMy.view;
  var scrollT=window.scrollTop(); 
  if('boFirstScroll' in history && history.boFirstScroll){
  //if(false){
    history.boFirstScroll=false;
    if(typeof view.getScroll=='function') {
      var scrollT=view.getScroll();
      setTimeout(function(){
        window.scrollTop(scrollT);},1);
    } else {
      //var scrollT=stateMy.scroll;  setTimeout(function(){  window.scrollTop(scrollT);},1);
    }      
  } else {
    if(typeof view.setScroll=='function') view.setScroll(scrollT); else stateMy.scroll=scrollT;  //view.intScroll=scrollT;
  }    
});

};

//window.onload=funLoad;
//window.on('DOMContentLoaded', funLoad);  // If one uses "import" in "DOMContentLoaded" then "load" will wait until the imported stuff is loaded.
window.addEventListener('load', funLoad);
window.addEventListener('load', function(){
  window.boLCacheObs=document.querySelector('#boLCacheObs'); if(boLCacheObs.value.length) { boLCacheObs.value=""; location.reload(); return} 
});
//funLoad();
//var root = document.documentElement,   node = document.createTextNode("This is some new textA.");    root.appendChild(node);
 

