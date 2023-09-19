


//🗝 👵👴👶🌳🌲

"use strict"
const funLoad=async function(){
console.log('load');
var MmmWikiFiltExtention={  // Monkey patching Filt (see more below)
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
// Theme functions
//

  // themeOS ∈ ['dark','light']
  // themeChoise ∈ ['dark','light','system']
  // themeCalc ∈ ['dark','light']
window.analysColorSchemeSettings=function(){
  var themeOS=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"
  var themeChoise=localStorage.getItem("themeChoise")??"system";
  var arrThemeChoise=['dark','light','system'];
  var ind=arrThemeChoise.indexOf(themeChoise);  if(ind==-1) ind=2;
  var themeChoise=arrThemeChoise[ind]
  var themeCalc=themeChoise=="system"?themeOS:themeChoise
  return {themeOS, themeChoise, themeCalc}
}

var setThemeClass=function(theme){
  if(theme=='dark') elHtml.setAttribute('data-theme', 'dark'); else elHtml.removeAttribute('data-theme');
  var strT=theme; if(theme!='dark' && theme!='light') strT='light dark'
  elHtml.css({'color-scheme':strT});
}

  // Initial setup of selectorOfTheme
// var selectorOfTheme=selThemeCreate()
// elBody.myAppend(selectorOfTheme)

// var {themeOS, themeChoise, themeCalc}=analysColorSchemeSettings();
// console.log(`OS: ${themeOS}, choise: ${themeChoise}, calc: ${themeCalc}`)
// setThemeClass(themeCalc)
// selectorOfTheme.value=themeChoise

  // Listen to prefered-color changes on the OS
window.colorSchemeQueryListener = window.matchMedia('(prefers-color-scheme: dark)');
colorSchemeQueryListener.addEventListener('change', function(e) {
  var {themeOS, themeChoise, themeCalc}=analysColorSchemeSettings();
  console.log(`OS: ${themeOS}, choise: ${themeChoise}, calc: ${themeCalc}`)
  setThemeClass(themeCalc)
});

window.selThemeCreate=function(){
  var optSystem=createElement('option').myText('Same as OS').prop({value:'system'})
  var optLight=createElement('option').myText('Light').prop({value:'light'})
  var optDark=createElement('option').myText('Dark').prop({value:'dark'})
  var Opt=[optSystem, optLight, optDark]
  var el=createElement('select').myAppend(...Opt).on('change',function(e){
    localStorage.setItem('themeChoise', this.value);
    var {themeOS, themeChoise, themeCalc}=analysColorSchemeSettings();
    console.log(`OS: ${themeOS}, choise: ${themeChoise}, calc: ${themeCalc}`)
    setThemeClass(themeCalc)
  })
  return el
}




window.divThemeSelectorCreate=function(){
  var el=createElement('div')
  var butSystem=createElement('button').myText('Same as OS').prop({value:'system'})
  var butLight=createElement('button').myText('Light').prop({value:'light'})
  var butDark=createElement('button').myText('Dark').prop({value:'dark'})
  var But=[butSystem, butLight, butDark]
  var StrBut=['system', 'light', 'dark']
  var objBut={};  But.forEach((ele,i)=>objBut[StrBut[i]]=ele);
  el.setButStyling=function(strTheme){
    //var but=(typeof arg=='string')?objBut(arg):arg
    var but=objBut[strTheme]
    But.forEach(elem=>elem.removeClass('boxShadowOn').addClass('boxShadowOff'))
    but.removeClass('boxShadowOff').addClass('boxShadowOn')
  }
  But.forEach(ele=>ele.on('click',function(e){
    localStorage.setItem('themeChoise', this.value);
    var {themeOS, themeChoise, themeCalc}=analysColorSchemeSettings();
    console.log(`OS: ${themeOS}, choise: ${themeChoise}, calc: ${themeCalc}`)
    setThemeClass(themeCalc)
    el.setButStyling(themeChoise)
  }))
  el.myAppend(...But).css({display:'flex', gap:'.4em', 'justify-content':'space-evenly', 'flex-wrap':'wrap'})
  return el
}
var themePopExtend=function(el){
  el.strName='themePop'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  el.setVis=function(){
    if(boDialog) el.showModal(); else el.show();
    return true;
  }
  el.addEventListener('cancel', (event) => {
    event.preventDefault();
    historyBack()
  })

  var h1=createElement('h3').myText("Theme (Background colors): ").css({'margin':'0'});

  var divThemeSelector=divThemeSelectorCreate()
  var {themeOS, themeChoise, themeCalc}=analysColorSchemeSettings();
  console.log(`OS: ${themeOS}, choise: ${themeChoise}`)
  setThemeClass(themeCalc)
  divThemeSelector.setButStyling(themeChoise)

  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  var divBottom=createElement('div').myAppend(buttonBack).css({display:'flex', gap:'0.4em', 'justify-content':'space-between'})

  var El=[h1, divThemeSelector, divBottom];
  var centerDiv=createElement('div').myAppend(...El);
  if(boDialog){
    el.myAppend(centerDiv);
  } else{
    var blanket=createElement('div').addClass("blanket");
    centerDiv.addClass("Center-Flex")
    centerDiv.css({height:'min(10em, 98%)', width:'min(21em,98%)'});
    el.addClass("Center-Container-Flex").myAppend(centerDiv,blanket);
  }
  centerDiv.css({display:'flex', gap:'1em', 'flex-direction':'column', 'justify-content':'space-evenly'})

  return el;
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

  if(0){ //boSmallAndroid
    
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
    el.myAppend(a);
    //el.css({'font-size':'0.88em','vertical-align':'text-bottom','line-height':strSizeIcon,'display':'inline-block'});
  }
  el.toggle(Boolean(boShallHave));
  //if(boShallHave) el.css({display:''}); else {el.hide(); }  //el.show(); // el.show() => display:block in Firefox !!!!!
  return el;
}

var aRLoginDivExtend=function(el){
  el.strName='aRLoginDiv'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  var vPassF=async function(){  
    //var tmp=SHA1(aRPass.value+strSalt);
    if(typeof SHA1 == 'undefined') { setMess(strSha1NotLoaded); return;}
    var data=aRPass.value+strSalt; for(var i=0;i<nHash;i++) data=SHA1(data);
    //var data=aRPass.value+strSalt; for(var i=0;i<nHash;i++) data=Sha256.hash(data);
    if(data.substr(0,2)!=aRPasswordStart) {setMess('Wrong pw'); return;}
    var vec=[['aRLogin',{pass:data}]];   await myFetch('POST',vec);  
    aRPass.value='';

    if(!boARLoggedIn) return;
    pageView.setVis('page');
    var vec=[['pageLoad',{}]];   await myFetch('GET',vec);

    //if(!boARLoggedIn) return;
    //var vec=[['getLoginBoolean',{}]];  await myFetch('POST',vec);
  }

  var aRPass=createElement('input').prop('type', 'password').on('keypress',  function(e){ if(e.which==13) {vPassF();return false;} });     
  var vPassButt=createElement('button').myText('Login').on('click',vPassF);
  el.aRPass=aRPass;
  el.myAppend(aRPass, vPassButt).css({ border:'2px solid', position:'fixed', top:'50%', left:'50%', margin:0, padding:'10px', background:'var(--bg-colorEmp)', transform:'translate(-50%,-50%)' });

  return el;
}


var divMessageTextCreate=function(){
  var spanInner=createElement('span');
  var imgBusyLoc=imgBusy.cloneNode().css({transform:'scale(0.65)','margin-left':'0.4em'}).hide();
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
  el.on('click',el.resetMess)
  var messTimer;
  el.addClass('message');
  return el;
}


var areYouSurePopExtend=function(el){
  el.strName='areYouSurePop'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  el.openFunc=function(strLab, continueClick, cancelClick){ // continueClick(finFun): called when the user clicks the continue button. It takes a callback-argument which closes the areYouSurePop.
    labPageName.myText(strLab);
    doHistPush({strView:'areYouSurePop'});
    el.setVis();
    continueClickLoc=continueClick;
    cancelClickLoc=cancelClick;
  }
  el.setVis=function(){
    el.show(); return 1;
  }
 
  var continueClickLoc, cancelClickLoc;

  var labPageName=createElement('div').css({'word-break':'break-word'});
  var buttonCancel=createElement('button').myText('Cancel').on('click',function(){ cancelClickLoc(); });
  var buttonContinue=createElement('button').myText('Yes').on('click',function(){  continueClickLoc();  });
  var divBottom=createElement('div').myAppend(buttonCancel,buttonContinue).css({display:'flex', gap:'0.4em', 'justify-content':'space-between'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center-Flex").myAppend(labPageName,divBottom);;
  centerDiv.css({display:'flex', gap:'1em', 'flex-direction':'column', 'justify-content':'space-between', width:'min(10em,98%)'});

  el.addClass("Center-Container-Flex").myAppend(centerDiv,blanket); 
  
  return el;
}


var pageTextExtend=function(el){
  var clickImgFun=function(e){
    //var li=this.parentNode, iCur=li.myIndex(); //, StrImg=li.parentNode.StrImg, Caption=li.parentNode.Caption;
    var a=this, iCur=a.iCur;
    slideShow.setUp(el.StrImg,el.Caption,iCur);
    doHistPush({strView:'slideShow'});
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

    var Table=[...document.querySelectorAll('.sortable')];
    Table.forEach(function(ele,i){ 
      var thead=ele.querySelector('thead');
      var tBody=ele.querySelector('tBody');
      if(tBody==null) return
      if(thead==null) {
        var tr=tBody.firstElementChild, thTmp=tr.firstElementChild;
        if(thTmp==null || thTmp.tagName.toLocaleLowerCase()=='td') return
        thead=createElement('thead').myAppend(tr);
      }
      var tr=thead.querySelector('tr');
      ele.prepend(thead);
      headExtend(tr, {tBody});  //, 'tr', tr.firstElementChild.tagName.toLocaleLowerCase()
    });
  }
  el.StrImg=[];
  el.Caption=[];
  return el;
}


/*******************************************************************************
 * pageView
 ******************************************************************************/

var editButtonExtend=function(el){
  el.setImg=function(boOW){ 
    spanOW.css({'text-decoration':boOW?'':'line-through'})
    var txt=boOW?'Edit the page.':'See wiki text.'
    el.prop({'aria-label':txt});
    el.title=txt;
  }
  var spanOW=createElement('span').css({'user-select':'none', position:'relative', 'bottom':'-0.0em', 'font-size':'1.3em', 'text-decoration':'line-through'}).myText('✎'); //🖉
  el.append(spanOW);
  return el;
}

var spanModExtend=function(el){
  el.setup=function(data){
    el.myHtml((data.boOR?`<span>${charPublicRead}</span>`:' ')
   + (data.boOW?`<span style="font-size:1em">${charPublicWrite}</span>`:' ')
    + (data.boSiteMap?charPromote:' '));
  }
  return el;
}

var pageDivFixedExtend=function(el){
  el.setUp=function(){
    var {tMod, tCreated}=objPage; spanLastMod.myText(date2ToSuitableString(tMod)).prop('title','Last Modified:\n'+tMod);
    spanCreated.myText(date2ToSuitableString(tCreated)).prop('title','Created:\n'+tCreated);
    divLastModW.toggle(Boolean(tMod));
    divCreatedW.toggle(tCreated>1000); // tCreated==1000 means that it is unknown (and should be hidden)

    spanMod.setup(objPage);
    el.css({background:objPage.boOR?'var(--bg-color)':'var(--bg-green)'});
    editButton.setImg(objPage.boOW);
    return this
  }
  el.setVersioninfo=function(){
    var strNR='',  str='';
    if(matVersion.length){
      var ver=arrVersionCompared[1], rev=ver-1;
      var {summary, signature}=matVersion[rev];
      strNR=`v${ver}/${nVersion}`;  str=`${summary} <b><i>${signature}</i></b>`;//+mySwedDate(r[0]);
    }
    spanNR.myHtml(strNR);  spanDetail.myHtml(str);

    var boMult=matVersion.length>1; versionMenu.toggle(boMult);
  }


  // versionMenu
  var versionTableButton=createElement('button').myText('Version list').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',function(){
    doHistPush({strView:'versionTable'});
    versionTable.setVis();
  });    
  var diffButton=createElement('button').myText('Diff').css({'margin-right':'1em'}).on('click',function(){
    //var arrVersionCompared=[bound(nVersion-iRow-1,1),nVersion-iRow];
    if(nVersion<2) return;
    arrVersionCompared[0]=arrVersionCompared[1]-1;
    if(arrVersionCompared[1]==1) arrVersionCompared=[2,1]; 
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec); 
    doHistPush({strView:'diffDiv'});
    diffDiv.setVis();
  });
  var spanNR=createElement('span').css({margin:'0em 0.1em'});
  var nextButton=createElement('button').myText(charNext).on('click',function(){
    var iVer=arrVersionCompared[1]+1; if(iVer>nVersion) iVer=1;
    var vec=[['pageLoad',{version:iVer}]];   myFetch('GET',vec); 
  });
  var prevButton=createElement('button').myText(charPrev).css({'margin-left':'0.8em'}).on('click',function(){
    var iVer=arrVersionCompared[1]-1; if(iVer<1) iVer=nVersion;
    var vec=[['pageLoad',{version:iVer}]];   myFetch('GET',vec); 
  });
  var spanDetail=createElement('span').myText('ggggggggggg').css({'margin-right':'0.5em', 'margin-left':'0.5em'});
  var divUpper=createElement('div').myAppend(prevButton, spanNR, nextButton, spanDetail, diffButton).css({'line-height':'2em'});

  var divLower=createElement('div').myAppend(versionTableButton).css({margin:'.5em auto auto'});

  var versionMenu=createElement('div').myAppend(divUpper,divLower).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.5em auto'});


    // menuA

    // boShowAdminButton
  var boShowAdminButton=getItem('boShowAdminButton');  if(boShowAdminButton===null)  boShowAdminButton=false;
  var adminButtonToggleEventF=function(){
    var now=Date.now(); if(now>timeSpecialR+1000*10) {timeSpecialR=now; nSpecialReq=0;}    nSpecialReq++;
    if(nSpecialReq==3) { nSpecialReq=0;boShowAdminButton=!boShowAdminButton; setItem('boShowAdminButton',boShowAdminButton); ElAdmin.forEach(ele=>ele.toggle(boShowAdminButton));    }
  }
  var timeSpecialR=0, nSpecialReq=0;

    // paymentButton
  var tmpSpan=createElement('span').myText('Pay/­Donate');//.css({display:'inline-block','vertical-align':'text-bottom',height:strSizeIcon});  display:'inline-block',
  var paymentButton=createElement('button').myAppend(tmpSpan).css({'vertical-align':'bottom'}).on('click',function(){
    doHistPush({strView:'paymentDiv'});
    paymentDiv.setVis();
  }); if(ppStoredButt=='' && strBTC=='') paymentButton.hide();  //,'line-height':strSizeIcon

    // editButton
  var editButton=editButtonExtend(createElement('button')).prop({"aria-label":"edit"}).css({}).on('click',function(){
    doHistPush({strView:'pageView', arg:'edit'});
    pageView.setVis('edit');
  });
  editButton.on('click', adminButtonToggleEventF);
  //var tmpImg=createElement('img').prop({src:uAdmin, alt:"admin", draggable:false}).css({height:strSizeIcon,width:strSizeIcon,'vertical-align':'text-bottom'}).addClass('invertOnDark');    //var strAdmin='👤🔑';
  var adminButton=createElement('button').myAppend(charAdmin).prop({title:"Administrator entry."}).on('click',function(){
    doHistPush({strView:'pageView', arg:'admin'});
    pageView.setVis('admin');
  });
  //if(!boTouch) popupHover(adminButton,createElement('div').myText('Administrator entry.'));

    // spanMod
  var spanMod=spanModExtend(createElement('span')).css({'line-height':'0.9em', 'text-align':'center'}); //,'font-family':'monospace'
  var ElAdmin=[spanMod, adminButton];
  //var spanAdmin=createElement('span').myAppend(spanMod, adminButton).css({'margin-left':'auto'});
  //spanAdmin.toggle(boShowAdminButton);
  ElAdmin.forEach(ele=>ele.toggle(boShowAdminButton));


    // divMetaNComment
  var spanCreated=createElement('span'), spanLastMod=createElement('span');
  var divCreatedW=createElement('div').myAppend('Created: ', spanCreated);
  var divLastModW=createElement('div').myAppend('Last mod: ', spanLastMod);


  el.commentButton=commentButtonExtend(createElement('div')).css({'margin-top':'.3em'});
  el.commentButton.setUp(boTalkExist);

  var divMetaNComment=createElement('div').myAppend(divCreatedW, divLastModW, el.commentButton).css({'font-size':'0.73em', 'margin-right':'auto', 'min-width':'5.2em'});

  el.butARLogout=createElement('button').myText('Log­out').prop({title:'Logout (write-access AND read-access)'}).on('click',function(){
    var vec=[['aWLogout',{}], ['aRLogout',{}]];   myFetch('POST',vec); 
  }).hide().css({});


  var settingDivButton=createElement('button').myText(charHamburger).css({}).on('click',function(){
    doHistPush({strView:'settingDiv'});
    settingDiv.setVis();
  }); 
  var themePopButton=createElement('button').myText(charBlackWhite).css({}).prop({title:'Change theme'}).on('click',function(){
    doHistPush({strView:'themePop'});
    themePop.setVis();
  });    

  var menuA=createElement('div').myAppend(editButton, paymentButton, divMetaNComment, themePopButton, el.butARLogout, ...ElAdmin).css({padding:'0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'0em'});  //.css({margin:'1em 0','text-align':'center',position:'fixed',bottom:0,width:'100%'});
  menuA.css({position:'relative', display:'flex', 'align-items':'center', 'justify-content':'space-between', gap:'0.3em'});


  //menuA.css({padding:'0 0.3em 0.6em 0', margin:'.2em auto 0em'});  // Bottom bar and Center versions
  var cssFixed={margin:'0em 0', 'text-align':'center', position:'fixed', bottom:0, width:'100%', background:"var(--bg-color)", opacity:0.9, 'border-top':'3px solid'}

  el.myAppend(versionMenu, menuA).css(cssFixed);//.css({position:'static'});
  el.css({right:'1em',bottom:'1em',width:'','border-radius':'5px', border:'1px solid', padding:'.3em', margin:''})  // Corner version
  //el.css({width:'','border-radius':'5px', border:'1px solid', padding:'.3em', margin:'', transform:'translate(-50%, 0%)', left:"50%"}) // Center version

  return el;

}

var pageViewExtend=function(el){
  el.strName='pageView'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  el.funPopped=function(state){ 
    var {arg}=state;
    el.pageDivFixed.toggle(arg=='page')
    el.editDivFixed.toggle(arg=='edit')
    el.adminDivFixed.toggle(arg=='admin')
    el.boDoScroll=true; el.intDoScroll=state.scroll
  }
  el.histPush=function(strType){
    doHistPush({strView:'pageView', arg:strType});
  }
  el.setVersioninfo=function(){
    el.pageDivFixed.setVersioninfo();
    warningDiv.toggle(matVersion.length>1);
  }

  var warningDiv=createElement('div').myText("The page has unconfirmed changes. Use the buttons below to see older versions.").css({'background':'var(--bg-yellow)','padding':'0.2em','text-align':'center','font-weight':'bold','font-size':'0.9em', width:'100%'}).hide();  //, position:'fixed', top:'0px', right:'0em', opacity:'0.8'
  //var warningDivW=createElement('div').myAppend(warningDiv); warningDivW.toString=function(){return 'warningDivW';}
  var cssFixedDrag={margin:'0em 0', 'text-align':'center', position:'fixed', bottom:0, width:'100%', background:"var(--bg-color)", opacity:0.9}

  el.pageDivFixed=pageDivFixedExtend(createElement('div'))
  el.editDivFixed=editDivFixedExtend(createElement('div')); el.editDivFixed.css(cssFixedDrag)
  el.editDivFixed.css({background:"var(--bg-color)", opacity: '0.9'});  //background:'rgb(255, 255, 255, 0.8)'

  el.adminDivFixed=adminDivFixedExtend(createElement('div')); el.adminDivFixed.css(cssFixedDrag)
  el.adminDivFixed.css({background:"var(--bg-color)", opacity: '0.9'});  //background:'rgb(255, 255, 255, 0.8)'

  el.prepend(warningDiv);
  el.myAppend(el.pageDivFixed, el.editDivFixed, el.adminDivFixed);
  return el;
}


/*******************************************************************************
 * adminDiv
 ******************************************************************************/
var adminDivFixedExtend=function(el){
  el.setUp=function(){
    if(editText.parentNode!==el) {
      el.prepend(dragHR,editText);
    }
    //dragHR.after(editText);
    return this
  }
  el.setUpButtons=function(boAWLoggedInT){
    var boT=Boolean(boAWLoggedInT);
    [moreButton, butAWLogout, handyButton].forEach(ele=>ele.toggle(boT));
    [password, password2, butLogin].forEach(ele=>ele.toggle(!boT));
  }
  var aPassF=function(){
    if(typeof SHA1 == 'undefined') { setMess(strSha1NotLoaded); return;}
    var data=password.value+strSalt; for(var i=0;i<nHash;i++) data=SHA1(data);
    if(data.substr(0,2)!=aWPasswordStart) {setMess('Wrong pw'); return;}
    var vec=[['aWLogin',{pass:data}], ['getAWRestrictedStuff',{}]];   myFetch('POST',vec); 
    password.value='';
  }
  var butAWLogout=createElement('button').myText('Logout (adm)').prop({title:'Logout (write-access only)'}).on('click',function(){
    var vec=[['aWLogout',{}]];   myFetch('POST',vec); 
  }); 
  var password=createElement('input').prop({type:'password', placeholder:"Login (adm)", title:'Login (write-access)'}).on('keypress',  function(e){   if(e.which==13) { aPassF(); return false;}   }); 

  var aPass2F=function(){  
    if(typeof SHA1 == 'undefined') { setMess(strSha1NotLoaded); return;}
    var data=password2.value+strSalt; for(var i=0;i<nHash;i++) data=SHA1(data);
    if(data.substr(0,2)!=aWPasswordStart) {setMess('Wrong pw'); return;}
    var vec=[['aWLogin',{pass:data}], ['saveByReplace',{strEditText:editText.value}], ['getAWRestrictedStuff',{}]];   myFetch('POST',vec); 
    password2.value='';
    boLCacheObs.value=1;
  }
  var butLogin=createElement('button').myText(langHtml.Login).on('click',aPassF); 
  var handyClickF=function(){  
    var vec=[['saveByReplace',{strEditText:editText.value}]];   myFetch('POST',vec); 
    boLCacheObs.value=1;
  }
  var handyButton=createElement('button').myText('Over­write').on('click',handyClickF); 
  var password2=createElement('input').prop({type:'password', placeholder:"Overwrite", title:'Login (write-access) and overwrite'}).on('keypress',  function(e){   if(e.which==13) {aPass2F(); return false;}   }); 
  var imgH=imgHelp.cloneNode(1).css({'margin-left':'auto', flex:"0 0 auto"}); popupHover(imgH,createElement('div').myHtml('Write password for:<li>Login (adm): logging in with write-access<li>Overwrite: A brutal but handy quick route for saving plus deleting all old versions.'));


  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  var moreButton=createElement('button').myText('Mo­re').on('click',function(){
    doHistPush({strView:'adminMoreDiv'});
    adminMoreDiv.setVis();
  }); 

  [password, password2].forEach(ele=>ele.css({width:'6em', 'min-width':'2em'}));

  var menuB=createElement('div').myAppend(buttonBack, moreButton, imgH, butAWLogout, password, butLogin, handyButton, password2);

  var cssTmp={'min-width':'min(100vw, var(--menuMaxWidth))', margin:'.5em auto .5em', display:'flex', 'align-items':'center', 'justify-content':'space-between', gap:'0.8em'}
  menuB.css(cssTmp);
  menuB.css({'max-width':menuMaxWidth, gap:'0.4em'});
  
  //menuB.css({padding:'0 0.3em 0 0',display:'flex','max-width':menuMaxWidth, margin:'1em auto', "align-items":"center", "justify-content":"space-between", gap:'0.4em'});

  el.myAppend(dragHR,menuB);
  el.menus=menuB;
  return el;
}



class ButtonToggle extends HTMLElement{
  constructor(){ super(); }
  getState(){return this.hasClass('boxShadowOn');}
  mySet(boOn){  boOn=Boolean(boOn); this.toggleClass('boxShadowOn', boOn).toggleClass('boxShadowOff', !boOn); }
  myToggle(){var boOn=!this.getState(); this.mySet(boOn); return boOn;}
}
customElements.define('button-toggle', ButtonToggle);



class AdminMoreDiv extends HTMLElement{
  constructor(){ super(); }
  toString=function(){return this.strName;}
  setBUNeededInfo(){
    var {tModLast, pageTModLast, tLastBU}=objSetting;
    //if(!(tLastBU instanceof Date)) tLastBU=new Date(tLastBU);
    var boBUNeeded=tModLast>tLastBU,     strTmp=`tLastBU: ${swedTime(tLastBU)}, tModLast: ${swedTime(tModLast)} (${pageTModLast})`;
    this.aBUFilesToComp.prop('title', strTmp).css({'background':boBUNeeded?'red':''});
  }
  setMod(){
    this.butModRead.mySet(objPage.boOR);
    this.butModWrite.mySet(objPage.boOW);
    this.butModSiteMap.mySet(objPage.boSiteMap);
  }
  connectStuff(){
    this.strName='adminMoreDiv'
    this.id=this.strName
    var strPublicRead=`<span style="display:inline-block">${charPublicRead}</span>`;
    var imgH=imgHelp.cloneNode(1).css({'margin-left':'.5em','margin-right':'0.5em', 'vertical-align':'middle'}); popupHover(imgH,createElement('div').myHtml(`${strPublicRead} = public read access<br>${charPublicWrite} = public write access<br>${charPromote} = promote = include the page in sitemap.xml etc. (encourage search engines to list the page)`));

    // Methods of the below buttons:
    var clickModF=function(){
      var strType=this.strType;
      var b=this, boOn=b.myToggle();
      var o={Id:[objPage.idPage]}; o[strType]=boOn;
      //var vec=[['myChMod',o]]; myFetch('POST',vec).then(a=>{var [e,r]=a; if(e) setMess(e.message);}).catch(err=> {setMEss('ee');});
      var vec=[['myChMod',o]]; myFetch('POST',vec);
      //setButMod.call(b, boOn);
    }
    this.butModRead=createElement('button-toggle').myHtml(strPublicRead).prop({title:'Public read access', strType:'boOR'}).on('click', clickModF );  
    this.butModWrite=createElement('button-toggle').myText(charPublicWrite).prop({title:'Public write access', strType:'boOW'}).on('click',clickModF);
    this.butModSiteMap=createElement('button-toggle').myText(charPromote).prop({title:'Promote (include page in sitemap.xml)',strType:'boSiteMap'}).on('click',clickModF);
    var Tmp=[this.butModRead, this.butModWrite, this.butModSiteMap]; Tmp.forEach(ele=>ele.css({'margin-right':'0.4em', width:'1.5em', padding:0}));   
      
    this.setMod();

    
    var uploadAdminDiv=uploadAdminDivExtend(createElement('div')); 
    var buttonDiffBackUpDiv=createElement('button').myText('Backup (diff)').on('click',function(){
      doHistPush({strView:'diffBackUpDiv'});
      diffBackUpDiv.setVis();
    });
    

    var statLink=createElement('a').prop({href:'stat.html'}).myText('stat');
    var pageListButton=createElement('button').myText('pageList').on('click',function(){
      //var idTmp=objPage.idPage; if(isNaN(idTmp)) idTmp=null;
      var idTmp=objPage.idPage; if(typeof idTmp=='string' && idTmp.length==0) idTmp=null;
      pageFilterDiv.Filt.setSingleParent(idTmp);  pageList.histPush(); pageList.loadTab();  pageList.setVis();
    });    
    var imageListButton=createElement('button').myText('imageList').css({'background':'var(--bg-colorImg)'}).on('click',function(){
      //var idTmp=objPage.idPage; if(isNaN(idTmp)) idTmp=null;
      var idTmp=objPage.idPage; if(typeof idTmp=='string' && idTmp.length==0) idTmp=null;
      imageFilterDiv.Filt.setSingleParent(idTmp);   imageList.histPush();  imageList.loadTab();  imageList.setVis();  // pageFilterDiv.Filt.filtAll();
    });

    var imgHPrefix=imgHelp.cloneNode(1).css({'margin-left':'1em'}); popupHover(imgHPrefix,createElement('div').myHtml('<p>Use prefix on default-site-pages:<p>Note that non-default-site-pages always gets the prefix added (to the filename in the zip-file).<p>Click the "Site table"-button below if you want to see or change the prefixes, and if you want to change which site is the default.'));  
    var boUsePrefix=getItem('boUsePrefixOnDefaultSitePages')||true;
    var cb=createElement('input').prop({type:'checkbox', checked:boUsePrefix}).on('click',function(){
      boUsePrefix=Number(cb.prop('checked')); 
      setItem('boUsePrefixOnDefaultSitePages',boUsePrefix);  
      this.aBUFilesToComp.setUp(boUsePrefix);
    })

    //var imgHDownload=imgHelp.cloneNode(1).css({'margin-left':'1em','margin-right':'1em'}); popupHover(imgHDownload,createElement('div').myText('Put all pages (or images or videos) in a zip-file and download.'));
    this.aBUFilesToComp=createElement('a').prop({rel:'nofollow', download:''}).myText('(...)page.zip');
    this.aBUFilesToComp.setUp=function(boUsePrefix){
      var tmpUrl='BUPage'+(boUsePrefix?'':'?{"boUsePrefixOnDefaultSitePages":0}'); this.prop({href:tmpUrl});
    };  this.aBUFilesToComp.setUp(boUsePrefix);
    var aBUImageToComp=createElement('a').prop({href:'BUImage', rel:'nofollow', download:''}).myText('(...)image.zip');
    var aBUVideoToComp=createElement('a').prop({href:'BUVideo', rel:'nofollow', download:''}).myText('(...)video.zip');
    var aBUMeta=createElement('a').prop({href:'BUMeta', rel:'nofollow', download:''}).myText('(...)meta.zip');
    var aBUMetaSQL=createElement('a').prop({href:'BUMetaSQL', rel:'nofollow', download:''}).myText('(...)meta.sql');
    var imgHSql=imgHelp.cloneNode(1).css({'margin':'0 1em'}); popupHover(imgHSql,createElement('div').myHtml('<p>Download "meta-data":<br>-extra data for pages/images (modification dates, access rights ...). <br>-redirect table.<br>-site table.'));
    
    var butBUPageServ=createElement('button').myText('page.zip').on('click',  function(){    httpGetAsync('BUPageServ',function(err, str) {setMess(str,3);});    });
    var butBUImageServ=createElement('button').myText('image.zip').on('click',function(){    httpGetAsync('BUImageServ',function(err, str) {setMess(str,3);});   });
    var butBUMetaServ=createElement('button').myText('meta.zip').on('click',function(){      httpGetAsync('BUMetaServ',function(err, str) {setMess(str,3);});    });
    
    var strOverwrite='This will overwrite data in the db?';
    
    var siteButton=createElement('button').myText('Site table').on('click',function(){
      doHistPush({strView:'siteTab'});
      siteTab.setVis();
    });
    var redirectButton=createElement('button').myText('Redirect table').on('click',function(){
      doHistPush({strView:'redirectTab'});
      redirectTab.setVis();
    });

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
    var menuA0=createElement('div').myAppend(pageListButton, imageListButton);
    var menuA=createElement('div').myAppend(this.butModRead, this.butModWrite, this.butModSiteMap, imgH, ' | ', renameButton, butSetStrLang, butSetSiteOfPage);
    var menuB0=createElement('div').myHtml("<b>BU download: </b>");
    var menuB=createElement('div').myAppend(this.aBUFilesToComp, ', Use prefix on default-site-pages: ', cb, imgHPrefix);
    var menuC=createElement('div').myAppend(aBUImageToComp, ' | ', buttonDiffBackUpDiv).css({'background':'var(--bg-colorImg)'});
    //var menuD=createElement('div').myAppend(aBUVideoToComp);
    var menuE=createElement('div').myAppend(aBUMeta, imgHSql);  // , ' | ', aBUMetaSQL
    var menuF=createElement('div').myHtml("Save to server-BU-Folder: ").myAppend(butBUPageServ,butBUImageServ,butBUMetaServ);
    var menuG=createElement('div').myAppend(uploadAdminDiv);
    var menuH=createElement('div').myAppend(siteButton,redirectButton);
    var menuJ=createElement('div').myAppend('DB: '+strDBType, ' | ', statLink);
    var Menu=[menuA0, menuA, menuB0, menuB,menuC,menuE,menuF,menuG, menuH, menuJ]; //Menu.forEach(ele=>ele.css({})); //,menuD , menuI

      // divCont
    var divCont=createElement('div').myAppend(...Menu).addClass('contDivFix');
  
    var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
    var spanLabel=createElement('span').myText('adminMore').css({ margin:"0 0 0 auto"});
    var divFoot=createElement('div').myAppend(buttonBack, spanLabel).addClass('footDivFix'); 
    this.append(divCont, divFoot);
    this.css({ display:'block', 'max-width':'var(--menuMaxWidth)'})
    return this;
  }
 
}
customElements.define('admin-more', AdminMoreDiv);




var diffBackUpDetailDivExtend=function(el){  // Details of how differential backup will be performed (Really only used for images)
  el.strName='diffBackUpDetailDiv'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  el.setUp=function(arrStr,objFetchChanged){
    table.empty();
    var StrOld=arrStr[0], StrDeleted=arrStr[1], StrReuse=arrStr[2], StrFetchChanged=arrStr[3], StrFetchNew=arrStr[4], StrNew=arrStr[5];
    var nOld=StrOld.length, nDel=StrDeleted.length, nReuse=StrReuse.length, nFetchChanged=StrFetchChanged.length, nFetchNew=StrFetchNew.length, nNew=StrNew.length;

    var tha=createElement('th').myText(`Deleted (${nDel})`).css({background:'var(--bg-orange)'});
    var thb=createElement('th').myText(`Reused (${nReuse})`).css({background:'var(--bg-yellow)'});
    var thc=createElement('th').myText(`Fetch Changed (${nFetchChanged})`).css({background:'var(--bg-green)'});
    var thd=createElement('th').myText(`Fetch New (${nFetchNew})`).css({background:'var(--bg-blue)'});
    table.myAppend(createElement('tr').myAppend(tha,thb,thc,thd));

    //var nMax=Math.max(nOld,nNew);
    var nMax=Math.max(nDel,nReuse,nFetchChanged, nFetchNew);
    for(var i=0;i<nMax;i++){
      var r=createElement('tr');
      var tda=createElement('td'), tdb=createElement('td'), tdc=createElement('td'), tdd=createElement('td');
      var strNameA='', strColorA=''; if(i<nDel) {strNameA=StrDeleted[i]; strColorA='var(--bg-orange)'; }

      var strNameB='', strColorB=''; if(i<nReuse) {strNameB=StrReuse[i]; strColorB='var(--bg-yellow)'; }
      var strNameC='', strColorC='';
      if(i<nFetchChanged){
        strNameC=StrFetchChanged[i];
        if(strNameC in objFetchChanged) {var {dSize,dateNew,dateOld,dUnix}=objFetchChanged[strNameC];
          if(dSize) strNameC+=', Δsize='+dSize; 
          if(dUnix) { 
            var strT=getSuitableTimeUnitStr(dUnix);  strNameC+=',  Δt='+strT; 
            tdc.prop('title',`Old: ${dateOld}\u000dNew: ${dateNew}`);
          }
        }
        strColorC='var(--bg-green)';
      }
      var strNameD='', strColorD=''; if(i<nFetchNew) {strNameD=StrFetchNew[i]; strColorD='var(--bg-blue)'; }
      tda.myText(strNameA).css({background:strColorA}); 
      tdb.myText(strNameB).css({background:strColorB}); 
      tdc.myText(strNameC).css({background:strColorC}); 
      tdd.myText(strNameD).css({background:strColorD}); 

      r.myAppend(tda, tdb, tdc, tdd);
      table.myAppend(r);
    }
    
  }
  var table=createElement('table').addClass('tableSticky');
  

    // divCont
  var divCont=createElement('div').myAppend(table).addClass('contDivFix').css({width:'fit-content'});

  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  var spanLabel=createElement('span').myText('diffBackUpDetailDiv').css({ margin:"0 0 0 auto"});
  var divFoot=createElement('div').myAppend(buttonBack, spanLabel).addClass('footDivFix'); 
  divFoot.css({left:'50%', transform:'translateX(-50%)'})
  el.append(divCont, divFoot);
  el.css({ 'text-align':'center'})

  return el;
}



var tabBUSumExtend=function(el){
  el.setUp=function(nOld,nNew,arrN){
    var iToFetchNew=3, iToBeDeleted=0;
    for(var i=0;i<nAction;i++){
      var len=arrN[i];
      var lenT=len; if(i==iToFetchNew) lenT=0;   tdOld.children[i].css({width:lenT+'px'});
      var lenT=len; if(i==iToBeDeleted) lenT=0;   tdNew.children[i].css({width:lenT+'px'});
      divExplanation.children[i*3+2].myText(len);
      tdOldNum.myText(nOld);
      tdNewNum.myText(nNew);
    }
  }
  var StrAction=['toBeDeleted','toBeReused','toFetchChanged','toFetchNew'], nAction=StrAction.length;
  var StrActionLabel=['To be deleted','To be reused','To fetch (changed)','To fetch (new)'];
  //var StrActionColor=['orange','yellow','lightgreen','lightblue'];
  var StrActionColor=['var(--bg-orange)','var(--bg-yellow)','var(--bg-green)','var(--bg-blue)'];
  var tdOld=createElement('td'), tdNew=createElement('td'), divExplanation=createElement('div').attr({colspan:"3"});
  for(var i=0;i<nAction;i++){
    var divAction=createElement('div').css({'background':StrActionColor[i],'height':'20px', width:'25%', display:'inline-block'});
    tdOld.myAppend(divAction);
    tdNew.myAppend(divAction.cloneNode());
    var divColor=createElement('span').css({'background':StrActionColor[i],'height':'1em', width:'1em', display:'inline-block', 'margin-right':'0.1em'});
    var spanColor=createElement('span').myText(StrActionLabel[i]+": ");
    var spanN=createElement('span').css({'margin-right':'0.6em', 'font-weight':'bold'});
    divExplanation.myAppend(divColor, spanColor, spanN);
  }

  var tdOldNum=createElement('td'), tdNewNum=createElement('td');
  [tdOldNum,tdNewNum].forEach(ele=>ele.css({'text-align':'center'}))
  var trOld=createElement('tr').myHtml("<td>Old Zip</td>").myAppend(tdOldNum, tdOld);
  var trNew=createElement('tr').myHtml("<td>New Zip</td>").myAppend(tdNewNum, tdNew);
  //var divExplanation=createElement('div').myAppend(tdColor);

  //var DivPop=[]; //, Button=([]);
  var tHead=createElement('thead').myHtml("<tr><th></th><th>nFiles</th></tr>");
  var tBody=createElement('tbody');
  tBody.myAppend(trOld, trNew);
  var table=createElement('table');
  table.myAppend(tHead,tBody);
  el.myAppend(table,divExplanation);

  table.css({'border-collapse':'collapse'});
  return el;
}


var diffBackUpDivExtend=function(el){
  el.strName='diffBackUpDiv'
  el.id=el.strName
  el.toString=function(){return el.strName;}
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
      // Create instanceJSZip
    instanceJSZip = new JSZip();
    await instanceJSZip.loadAsync(file);


    EntryLocal={}; // Create EntryLocal

    // var blobReader=new zip.BlobReader(file);
    // var [err, zipReader]=await new Promise(resolve=>{   zip.createReader(blobReader, zipReaderT=>resolve([null,zipReaderT]), err=>resolve([err]));   }); 
    // if(err) return [err];

    // var [err, EntryTmp]=await new Promise(resolve=>{   zipReader.getEntries( EntryT=>resolve([null,EntryT]), err=>resolve([err]));    });   if(err) return [err];


    // EntryTmp.forEach(function(entry){  EntryLocal[entry.filename]=entry;   });  

    // StrOld=Object.keys(EntryLocal); //var li=createElement('li').myAppend(`Old zip-file has <b>${nOld}</b> files.`); ul.append(li);

    // var [err, data]=await new Promise(resolve=>{ myFetch('POST',[['getImageInfo',{},data=>resolve([null,data]) ]]);  });
    // if(err) return [err];

    StrOld=Object.keys(instanceJSZip.files);
    EntryLocal=instanceJSZip.files
    var [err, arr]=await myFetch('POST',[['getImageInfo',{} ]]); if(err) return [err];
    var [[data]]=arr; 

    var FileNewInfo=data.FileInfo, FileNew={};
    for(var i=0;i<FileNewInfo.length;i++){ FileNew[FileNewInfo[i].imageName]=FileNewInfo[i]; } 
    StrNew=Object.keys(FileNew);
  
    // var writer;   // Create writer
    // if(creationMethod == "Blob") {
    //   writer=new zip.BlobWriter();
    // } else {

    //   var [err, zipFileEntryT]=await new Promise(resolve=>{   createTempFile(fileEntryT=>resolve([null, fileEntryT]), err=>resolve([err]));   });
    //   if(err) return [err];
    //   zipFileEntry=zipFileEntryT;

    //   writer=new zip.FileWriter(zipFileEntry);
    // }

      // Create zipWriter
    // var [err, zipWriterT]=await new Promise(resolve=>{   zip.createWriter(writer, writerT=>resolve([null,writerT]), err=>resolve([err])); }); if(err) return [err];
    // zipWriter=zipWriterT;


    StrDeleted=[]; StrReuse=[]; StrFetchAll=[]; StrFetchChanged=[]; StrFetchNew=[]; objFetchChanged={};   

    for(var key in EntryLocal){
      if(!(key in FileNew)){ StrDeleted.push(key); }
    }
  
    var progress=createElement('progress'), iProgress=0, imgDoneLast=imgDone.cloneNode();
    var li=createElement('li').myText('Extracting meta data from the selected file (names, modification dates and file-sizes): ').myAppend(progress, imgDoneLast); ul.append(li);
    
    for(var key in FileNew){  // Create StrReuse, StrFetchChanged, StrFetchNew and objFetchChanged
      if(key in EntryLocal){
        var entryLocal = EntryLocal[key];
        //var writer = new zip.BlobWriter(entryLocal);

        //var [err, blob]=await new Promise(resolve=>{   entryLocal.getData(writer, blobT=>resolve([null,blobT]), onprogress); }); if(err) return [err];

        //var dateOld=new Date(entryLocal.lastModDate);
        var size=entryLocal._data.uncompressedSize;
        //var dosRaw=entryLocal.lastModDateRaw, dosDate=dosRaw>>>16, dosTime=dosRaw&0xffff, dateOld=dosTime2tUTC(dosDate,dosTime);
        var dateOld=entryLocal.date
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
      iProgress++; progress.attr({value:iProgress, max:StrNew.length});
    }
    imgDoneLast.show();

      // Display tab
    var ArrStr=[StrOld, StrDeleted, StrReuse, StrFetchChanged, StrFetchNew, StrNew];
    var tabBUSum=tabBUSumExtend(createElement('div'));
    tabBUSum.setUp(StrOld.length, StrNew.length, [StrDeleted.length, StrReuse.length, StrFetchChanged.length, StrFetchNew.length]);
    diffBackUpDetailDiv.setUp(ArrStr, objFetchChanged);
    var buttonDetail=createElement('button').myText('Details').on('click',function(){
      doHistPush({strView:'diffBackUpDetailDiv'});
      diffBackUpDetailDiv.setVis();
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
      var [err]=await downloadDifference(); if(err) return [err];
      buttonContinue.prop("disabled",true);
    });
    var li=createElement('li').myAppend(buttonContinue); ul.append(li); progress.detach();
    return [null];
  }

  var downloadDifference=async function(){
    var progress=createElement('progress')
      // Writing fresh files
    // var iProgress=0, imgDoneLast=imgDone.cloneNode();
    // var li=createElement('li').myText('Reusing (adding) old images to new zip: ').myAppend(progress, imgDoneLast); ul.append(li);
    // for(var i=0;i<StrReuse.length;i++){
    //   var key=StrReuse[i];
    //   var entryLocal = EntryLocal[key];
    //   var writer = new zip.BlobWriter(entryLocal);

    //   var [err, blob]=await new Promise(resolve=>{   entryLocal.getData(writer, blobT=>resolve([null,blobT]), onprogress); }); if(err) return [err];

    //   var date=new Date(entryLocal.lastModDate), size=entryLocal.uncompressedSize;

    //   var blobReader=new zip.BlobReader(blob);
    //   var [err]=await new Promise(resolve=>{   zipWriter.add(key, blobReader, ()=>resolve([null]), onprogress, {lastModDate:date}); }); if(err) return [err];

    //   iProgress++;  progress.attr({value:iProgress,max:StrReuse.length}); 
    // }
    // imgDoneLast.show();

      // Removing deleted files
    var iProgress=0, imgDoneLast=imgDone.cloneNode();
    var li=createElement('li').myText('Removing deleted files in zip: ').myAppend(progress, imgDoneLast); ul.append(li);
    for(var i=0;i<StrDeleted.length;i++){
      var key=StrDeleted[i];
      instanceJSZip.remove(key)
      iProgress++;  progress.attr({value:iProgress, max:StrDeleted.length}); 
    }
    imgDoneLast.show();

      // Removing old files
    var iProgress=0, imgDoneLast=imgDone.cloneNode();
    var li=createElement('li').myText('Removing old files in zip: ').myAppend(progress, imgDoneLast); ul.append(li);
    for(var i=0;i<StrDeleted.length;i++){
      var key=StrDeleted[i];
      instanceJSZip.remove(key)
      iProgress++;  progress.attr({value:iProgress, max:StrDeleted.length}); 
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

    // var blobReader=new zip.BlobReader(dataFetched);
    // var [err, zipReader]=await new Promise(resolve=>{   zip.createReader(blobReader, zipReaderT=>resolve([null,zipReaderT]), err=>resolve([err]));   }); 
    // if(err) return [err];

    // var [err, EntryTmp]=await new Promise(resolve=>{   zipReader.getEntries( EntryT=>resolve([null,EntryT]), err=>resolve([err]));    });   if(err) return [err];

    // var EntryFetched={};
    // EntryTmp.forEach(function(entry) {  EntryFetched[entry.filename]=entry;  });


    var instanceJSZipFetched = new JSZip();
    await instanceJSZipFetched.loadAsync(dataFetched);
    var EntryFetched=instanceJSZipFetched.files


    var iProgress=0, imgDoneLast=imgDone.cloneNode();
    var li=createElement('li').myAppend('Adding the fetched images to new zip: ', progress, imgDoneLast); ul.append(li);
    for(var key in EntryFetched){
      var entry = EntryFetched[key];
      
      // var writer = new zip.BlobWriter(entry);

      // var [err, blob]=await new Promise(resolve=>{   entry.getData(writer, blobT=>resolve([null,blobT]), onprogress); }); if(err) return [err];

      // var date=new Date(entry.lastModDate);

      // var blobReader=new zip.BlobReader(blob);
      // var [err]=await new Promise(resolve=>{   zipWriter.add(key, blobReader, ()=>resolve([null]), onprogress, {lastModDate:date}); }); if(err) return [err];

      var date=entry.date;

      instanceJSZip.files[key]=entry;


      iProgress++; progress.attr({value:iProgress,max:StrFetchAll.length});
    }



    var saveButton=createElement('button').myText('Save to disk').on('click',saveFun);  //.prop("disabled",true)
    var li=createElement('li').myAppend(saveButton); ul.append(li);
    //saveButton.prop("disabled",false);
    //ul.hide();
    imgDoneLast.show();
    progress.hide();
    return [null];
  }

  var saveFun=async function(){
    var strType="uint8array";
    var outdata = await instanceJSZip.generateAsync({type : strType});

    const blobData = new Blob([outdata], {type: "application/zip"})

    var outFileName=`${objSiteDefault.siteName}_${swedDate(unixNow())}_image.zip`; // Todo: wwwCommon-variable should change after siteTabView changes
    triggerDownloadOfBlob(outFileName, blobData)


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

  var zipFileEntry=null; //, zipWriter=null;
  var instanceJSZip=null

  var imgDone=createElement('span').myText('Done').css({'background':'var(--bg-green)'}).hide();

  var imgHHead=imgHelp.cloneNode(1).css({'margin-left':'1em'}); popupHover(imgHHead,createElement('div').myHtml('<p>If the old files\' size and modification date match then they are considered up to date.'));
  var head=createElement('div').myAppend('Differential backup of images',imgHHead).css({'font-weight':'bold'});
  var imgHLoad=imgHelp.cloneNode(1).css({'margin-left':'1em', 'vertical-align':'middle'}); popupHover(imgHLoad,createElement('div').myHtml(`Should be a zip file containing ${strImageExtWComma} files`));
  //`<p>Accepted file endings: ${strImageExtWComma}, or zip files containing these formats (no folders in the zip file)`
  var formFile=createElement('form').prop({enctype:"multipart/form-data"});
  var inpFile=createElement('input').prop({name:"file", type:"file", accept:"application/zip"}).css({background:'var(--bg-colorEmp)'}); //multiple , 'font-size':"0.95em"
  var ul=createElement('ul');//.hide();
  
  var EntryLocal, StrOld;

  inpFile.on('change', async function(e) {
    var [err]=await inpSelChange(this.files); if(err) {setMess(err); return;}
  });

  formFile.myHtml('<b>Select your old backup (zip) file:</b> ').myAppend(inpFile, imgHLoad);   formFile.css({display:'inline'});


    // divCont
  var divCont=createElement('div').myAppend(head, formFile, ul).addClass('contDivFix');

  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  var spanLabel=createElement('span').myText('diffBackUpDiv').css({ margin:"0 0 0 auto"});
  var divFoot=createElement('div').myAppend(buttonBack, spanLabel).addClass('footDivFix'); 
  el.append(divCont, divFoot);
  el.css({ 'max-width':'var(--menuMaxWidth)'})

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
    for(var i=0;i<len;i++){ StrConflict[i]=FileInfo[i]._id;  }     
  }
  var sendConflictCheckReturnB=function(data){ 
    var FileInfo=data.FileInfo, len=FileInfo.length;
    for(var i=0;i<len;i++){ StrConflict.push(FileInfo[i].imageName); } 
    if(StrConflict.length){
      var tmpLab='Pre-check-WARNING!!! Conflicting file names (images will be overwritten, (txt/csv files will result in an error) )';
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
  var sendFun=function(e){
    e.preventDefault();
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
  var imgHUpload=imgHelp.cloneNode(1).css({'margin-left':'1em', 'vertical-align':'middle'}); popupHover(imgHUpload,createElement('div').myText(`Accepted file endings: ${strImageExtWComma}, txt or zip files containing these formats (no folders in the zip file)`));


  var formFile=createElement('form').prop({enctype:"multipart/form-data"});
  var inpFile=createElement('input').prop({name:"file", type:"file", multiple:true}).css({background:'var(--bg-colorEmp)', 'max-width':'-webkit-fill-available'}); //, 'font-size':"0.95em"
  //var inpUploadButton=createElement('input type="button" value="Upload"');
  var uploadButton=createElement('button').myText('Upload').prop({disabled:true, type:"submit"});
  var progress=createElement('progress').prop({max:100, value:0}).hide();
  
  var arrName, arrFile, StrConflict;  //arrOrg, 

  var labUpload=createElement('label').myText('Upload:')
  formFile.myAppend(labUpload, inpFile, uploadButton).css({display:'inline'});
  el.append(formFile, imgHUpload, progress);

  //var flowVerify;
  inpFile.on('change', async function(e) {
    //flowVerify=verifyFun.call(this,e);  flowVerify.next();
    var [err]=await verifyFun(this.files); if(err) {setMess(err); return;}
  }).on('click',function(){inpFile.value=""; uploadButton.prop("disabled",true);});
  uploadButton.on('click',sendFun);

  return el;
}


var uploadUserDivExtend=function(el){
  el.strName='uploadUserDiv'
  el.id=el.strName
  el.toString=function(){return el.strName;}
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
    if(tmpMB>maxUserUploadSizeMB) {setMess(`Max ${maxUserUploadSizeMB}MB\nThe selected file is ${tmpMB}MB`,5);    toggleVerified(0);  return;}

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
    
    var strTmp=grecaptcha.getResponse();
    if(!strTmp) {setMess("Captcha response is empty"); return; }   formData.append('g-recaptcha-response', strTmp);
    
    
    
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

  var head=createElement('h3').myAppend(`Upload Image: (max ${maxUserUploadSizeMB}MB)`).css({margin:0, 'font-weight':'bold'});
  var formFile=createElement('form').prop({enctype:"multipart/form-data"});
  var inpFile=createElement('input').prop({name:"file", type:"file", id:'file', accept:"image/*"}).css({background:'var(--bg-colorEmp)'}); //, 'font-size':"0.95em"
  //var inpUploadButton=createElement('input type="button" value="Upload"');
  var uploadButton=createElement('button').myText('Upload').prop("disabled",true).css({'margin-right':'0.5em', 'float':'right'});
  var progress=createElement('progress').prop({max:100, value:0}).css({'display':'block'}).invisible();
  var divMess=createElement('div');
  
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
  var divName=createElement('div').myAppend('Select name: ', divNameInner, spanOK).hide();
  divName.css({'margin-top':'1.2em','line-height':'1,3em', background:'var(--bg-colorEmp)'});
  

  var closeButton=createElement('button').myText('Close').on('click',historyBack);
  var menuBottom=createElement('div').myAppend(closeButton, uploadButton);
  menuBottom.css({display:'flex', gap:'0.4em', 'justify-content':'space-between'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').myAppend(head, formFile, divName, divMess, progress, menuBottom).addClass("Center-Flex");  
  //centerDiv.css({width: 'min(95%,10em)'});
  centerDiv.css({display:'flex', gap:'1em', 'flex-direction':'column', 'justify-content':'space-between', width:'min(15em,98%)'});
  el.addClass("Center-Container-Flex").myAppend(centerDiv,blanket); 
  

  uploadButton.on('click',sendFun);
  return el;
}





var PageFilterDiv=function(Prop, Label, StrOrderFilt, changeFunc, StrGroupFirst=[], StrGroup=[]){   //  Note!! StrOrderFilt should not be changed by any client side plugins (as it is also used on the server)
  var el=createElement('div'); 
  el.strName='pageFilterDiv'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  el.setNFilt=function(arr){ var tmp=arr[0]+'<wbr>/<wbr>'+arr[1]; infoWrap.myHtml(tmp);  pageList.filterInfoWrap.myHtml(tmp);  } 
  
  //el.Prop=Prop; el.Label=Label; el.StrOrderFilt=StrOrderFilt; el.changeFunc=changeFunc; el.StrGroupFirst=StrGroupFirst; el.StrGroup=StrGroup;
  
  var objArg={Prop, Label, StrOrderFilt, changeFunc, StrGroupFirst, StrGroup, helpBub, objSetting:objFilterSetting};
  //objArg.StrProp=oRole.filter.StrProp;

  el.divCont=createElement('filter-div-i').connectStuff(objArg, changeFunc);
  //el.divCont.css({display:'block', 'max-width':menuMaxWidth,margin:'0em auto','text-align':'left'});
  el.divCont.addClass('contDivFix').css({'margin-bottom':'3em'});

      // menuA
  var buttonClear=createElement('button').myText('C').on('click',function(){el.Filt.filtAll(); pageList.histReplace(-1); pageList.loadTab();});
  var infoWrap=createElement('span'),     spanLabel=createElement('span').myAppend('Page filter',' (',infoWrap,')').css({'margin-left':'auto'});
  
  el.addClass('unselectable');


  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  var divFoot=createElement('div').myAppend(buttonBack, buttonClear, spanLabel).addClass('footDivFix');
  divFoot.css({padding:'0.5em 0'}); 
  el.append(el.divCont, divFoot);
  el.css({ 'text-align':'center', margin:'0 auto', 'max-width':'var(--menuMaxWidth)'}) //display:'block', 
  return el;
}

var ImageFilterDiv=function(Prop, Label, StrOrderFilt, changeFunc, StrGroupFirst=[], StrGroup=[]){   //  Note!! StrOrderFilt should not be changed by any client side plugins (as it is also used on the server)
  var el=createElement('div'); 
  el.strName='imageFilterDiv'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  el.setNFilt=function(arr){ var tmp=arr[0]+'<wbr>/<wbr>'+arr[1]; infoWrap.myHtml(tmp);  imageList.filterInfoWrap.myHtml(tmp);  } 
  
  //el.Prop=Prop; el.Label=Label; el.StrOrderFilt=StrOrderFilt; el.changeFunc=changeFunc; el.StrGroupFirst=StrGroupFirst; el.StrGroup=StrGroup;
  var objArg={Prop, Label, StrOrderFilt, changeFunc, StrGroupFirst, StrGroup, helpBub, objSetting:objFilterSetting};
  //objArg.StrProp=oRole.filter.StrProp;
  
  el.divCont=createElement('filter-div-i').connectStuff(objArg, changeFunc);
  //el.divCont.css({display:'block', 'max-width':menuMaxWidth,margin:'0em auto','text-align':'left'});
  el.divCont.addClass('contDivFix').css({'margin-bottom':'3em'});
  
      // menuA
  var buttonClear=createElement('button').myText('C').on('click',function(){el.Filt.filtAll(); imageList.histReplace(-1); imageList.loadTab()});
  var infoWrap=createElement('span'),     spanLabel=createElement('span').myAppend('Image filter',' (',infoWrap,')').css({'margin-left':'auto'});

  el.addClass('unselectable');

  el.css({'text-align':'center'});

  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  var divFoot=createElement('div').myAppend(buttonBack, buttonClear, spanLabel).addClass('footDivFix');
  divFoot.css({padding:'0.5em 0', background:'var(--bg-colorImg)'}); 
  el.append(el.divCont, divFoot);
  el.css({ 'text-align':'center', margin:'0 auto', 'max-width':'var(--menuMaxWidth)'}) //display:'block', 
  return el;
}



var headExtend=function(el, objArg, strTR='tr', strTD='td'){  // headExtend is used inside headExtendDyn
  el.setArrow=function(strName,dir){
    boAsc=dir==1;
    arrImgSort.forEach(function(ele){ele.prop({src:uUnsorted}) });
    var tmp=boAsc?uIncreasing:uDecreasing;
    el.querySelector(`${strTH}[name=${strName}]`).querySelector('img[data-type=sort]').prop({src:tmp});
  }
  el.clearArrow=function(){
    thSorted=null, boAsc=false;
    arrImgSort.forEach(function(ele){ele.prop({src:uUnsorted}) });
  }
  var thClick=function() {
    var ele=this, boAscDefault=Boolean(ele.boAscDefault); //??0
    boAsc=(thSorted===this)?!boAsc:boAscDefault;  thSorted=this;
    arrImgSort.forEach(function(ele){ele.prop({src:uUnsorted}) });
    var tmp=boAsc?uIncreasing:uDecreasing;  ele.querySelector('img[data-type=sort]').prop({src:tmp});
    //var tBody=tableDiv.tBody;
    var arrT=[...tBody.querySelectorAll(strTR)];
    //var arrToSort=arrT.slice(0, tableDiv.nRowVisible);
    var arrToSort=arrT.slice(0, objArg.nRowVisible);
    var iChild=ele.myIndex();
    var comparator=function(aT, bT){
      var dire=boAsc?1:-1
      var elA = aT.children[iChild],  elB = bT.children[iChild]; 
      var a = elA?.valSort??elA?.textContent,  b = elB?.valSort??elB?.textContent; 
      //var boAStr=0,boBStr=0;
      if(typeof a=='string' && a.length) { 
        var aN=Number(a); if(!isNaN(aN)) a=aN; else a=a.toLowerCase();
      } else if(typeof a=='undefined') a=null;
      if(typeof b=='string' && b.length) { 
        var bN=Number(b); if(!isNaN(bN)) b=bN; else b=b.toLowerCase();
      } else if(typeof b=='undefined') b=null;
      //var aN=Number(a); if(!isNaN(aN) && a!=='') {a=aN;} else {a=a?.toLowerCase(); boAStr=1;}
      //var bN=Number(b); if(!isNaN(bN) && b!=='') {b=bN;} else {b=b?.toLowerCase(); boBStr=1;}
      //if(boAStr!=boBStr) return ((boAStr<boBStr)?-1:1)*dire;
      if(a==b) {return 0;} else return ((a<b)?-1:1)*dire;
    }
    var arrToSortN=msort.call(arrToSort,comparator);
    tBody.prepend.apply(tBody,arrToSortN);
  }

  var tBody=objArg.tBody;
  var strTH=strTD=='td'?'th':strTD;
  var boAsc=false, thSorted=null;

  var Th=el.querySelectorAll(strTH)
  var len=Th.length;
  var arrImgSort=Array(len);
  for(var i=0;i<len;i++){
    var h=Th[i];
    var imgSort=createElement('img').attr('data-type', 'sort').prop({src:uUnsorted, alt:"sort"}).css({"vertical-align":"middle"});
    h.myAppend(imgSort).on('click',thClick).css({cursor:"default"});
    arrImgSort[i]=imgSort;
  }

  return el;
}
var headExtendDyn=function(el, objArg, StrName, BoAscDefault, Label, strTR='tr', strTD='td'){  // objArg must have a property tBody and nRowVisible (int)
  var len=StrName.length;
  var Th=Array(len);
  var strTH=strTD=='td'?'th':strTD;
  for(var i=0;i<len;i++){
    var strName=StrName[i];  
    var boAscDefault=(strName in BoAscDefault)?BoAscDefault[strName]:true;
    var label=(strName in Label)?Label[strName]:ucfirst(strName);
    var h=createElement(strTH).addClass('unselectable').prop('boAscDefault',boAscDefault).prop('title',label).attr('name',strName);
    Th[i]=h;
  }
  el.addClass('listHead');
  el.append(...Th);

  //var tbody=tableDiv.querySelector('tbody');
  //var tr=el.querySelector(strTR);
  headExtend(el, objArg, strTR, strTD);
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
  el.strName='pageList'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  var condAddRows=function(){
    var Row=tBody.childNodes;
    for(var i=Row.length; i<File.length;i++){
      var r=createElement('p');
      var cb=createElement('input').prop('type','checkbox').on('click',cbClick);
      //var buttonNParent=createElement('button').myHtml('<span></span>').on('click',function(e){goToParentMethod.call(this,e,'page');});
      var buttonNParent=createElement('button').addClass('aArrow','aArrowLeft').prop({strType:'page'}).on('click',goToParentMethod);
      var tdNParent=createElement('span').myAppend(buttonNParent).attr('name','nParent').prop('title','Parents');
      var tdCB=createElement('span').prop('valSort',0).myAppend(cb).attr('name','cb');
      //var tmpImg=createElement('img').prop({src:uFlash}).prop('draggable',false).css({height:'1em',width:'1em','vertical-align':'text-bottom'});
      var buttonExecute=createElement('button').myAppend(charFlash).on(strMenuOpenEvent,menuPageSingle.buttonExeSingleClick).addClass('unselectable');
      var tdExecute=createElement('span').prop('valSort',0).myAppend(buttonExecute).attr('name','execute');
      var tdR=createElement('span').attr('name','boOR').myText(charPublicRead).prop('title',PageRowLabel.boOR), tdW=createElement('span').attr('name','boOW').myText(charPublicWrite).prop('title',PageRowLabel.boOW), tdP=createElement('span').attr('name','boSiteMap').myText(charPromote).prop('title',PageRowLabel.boSiteMap);
      var tdVer=createElement('span').attr('name','version');
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
    //var boOn=false, Tr=tBody.children(`p:lt(${el.nRowVisible})`);     Tr.find('input').forEach(function(){var boTmp=this.prop('checked'); if(boTmp) boOn=true;});   return boOn;
    var boOn=false, Tr=[...tBody.childNodes].slice(0, el.nRowVisible);     Tr.forEach(ele=>{var inp=ele.querySelector('input'); if(inp.checked) boOn=true;});   return boOn;
  }
  var isOneOn=function(){
    //var Tr=tBody.children(`p:lt(${el.nRowVisible})`), checked=Tr.find('input:checked'); return checked.length==1;
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
      var tmp=r.querySelector('span[name=size]').prop('valSort',size).myHtml(`${sizeDisp}<b>${pre}</b>`); var strTitle=pre.length?'Size: '+size:''; tmp.prop('title',strTitle);   //tmp.css({weight:pre=='M'?'bold':'',color:pre==''?'grey':''}); 
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
    if(el.boDoScroll) {
      el.setScroll(el.intDoScroll); delete el.boDoScroll; delete el.intDoScroll;
    }
  }
  var histRet=function(data){
    var tmp, HistPHP=data.Hist||[];
    
    pageFilterDiv.divCont.interpretHistPHP(HistPHP);

      // Create TextByParentId
      // If there are pages (parents) with the same "pageName" (on different sites) then use siteName:pageName (when the page is listed). 
    //var StrOrderFiltPageFlip=array_flip(StrOrderFiltPage);
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
    //var Tr=tBody.children(`p:lt(${el.nRowVisible})`);
    //Tr.find('input:checked').forEach(function(ele,i){var cb=ele; cb.parentNode.parentNode.children(`span[name=${strName}]`).prop('valSort',Number(boVal)).visibilityToggle(boVal); });
    var Tr=[...tBody.childNodes].slice(0, el.nRowVisible);
    Tr.forEach(ele=>{
      var inp=ele.querySelector('input:checked'); if(inp) inp.parentNode.parentNode.querySelector(`span[name=${strName}]`).prop('valSort',Number(boVal)).visibilityToggle(boVal);
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
  
  el.funPopped=function(state){ 
    pageFilterDiv.divCont.frStored(state);
    el.boDoScroll=true; el.intDoScroll=state.scroll
    el.loadTab();
  }
  el.histPush=function(){
    var o=pageFilterDiv.divCont.toStored();
    doHistPush({strView:'pageList', arg:o});
  }
  el.histReplace=function(indDiff){
    var o=pageFilterDiv.divCont.toStored();
    doHistReplace({strView:'pageList', arg:o}, indDiff); // 
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
  el.nRowVisible=0
  el.table=createElement('div').myAppend(tBody).css({width:'100%',position:'relative'});

  var StrCol=['nParent','cb','execute','tCreated','tMod','tLastAccess','nAccess','boOR','boOW','boSiteMap','size','nImage','nChild','version','strLang','siteName', 'link'];
  var BoAscDefault={cb:0,boOR:0,boOW:0,boSiteMap:0,nImage:0,nChild:0,nParent:0,version:0,nAccess:0,size:0}; // Default is 1
  //var spanFill=createElement('span').css({height:'calc(1.5*8px + 0.6em)'});
  //var headFill=createElement('p').append().css({background:'white',margin:'0px',height:'calc(12px + 1.2em)'});
  var head=headExtendDyn(createElement('p'), el, StrCol, BoAscDefault, PageRowLabel, 'p', 'span').addClass('pageList');
  head.css({background:'var(--bg-color)', width:'inherit'});     // ,height:'calc(12px + 1.2em)' , position:'sticky', top:'57px', 'z-index':'1', margin:'0px'
  el.headW=createElement('div').myAppend(head).css({background:'var(--bg-color)', width:'inherit', position:'sticky', top:'0px', 'z-index':'1', margin:'0px', opacity:0.9, "border-bottom":'1px solid'});     
  el.table.prepend(el.headW); //,headFill


    // menuA
  var allButton=createElement('button').myText('All').on('click',function(){
    var boOn=allButton.myText()=='All';
    //var Tr=tBody.children(`p:lt(${el.nRowVisible})`);
    //Tr.find('input').prop({'checked':boOn});
    var Tr=[...tBody.childNodes].slice(0, el.nRowVisible);
    Tr.forEach(ele=>{ var inp=ele.querySelector('input'); if(inp) inp.prop({'checked':boOn}); });
    allButton.myText(boOn?'None':'All');
    buttonExecuteMult.toggle(boOn);
  });

  var strEvent='mouseup'; if(boTouch) strEvent='click';


  var strPublicRead=`<span style="display:inline-block">${charPublicRead}</span> (public read)`;
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
  var buttonExecuteMult=createElement('button').myText(charFlash).addClass('unselectable');
  var itemMulti=[buttonROn, buttonROff, buttonWOn, buttonWOff, buttonPOn, buttonPOff, buttonDelete, buttonSetStrLang];
  var menuMult=createElement('div').css({'text-align':'left', 'line-height':'1.3em'});  menuExtend(menuMult);
  var buttonExeMultClick=function(e){ 
    //var button=this;  //itemMulti[0].toggle(isOneOn());
    //if(boTouch){ doHistPush({strView:'menuDiv'});     menuDiv.setUp(itemMulti);   menuDiv.setVis();    }else{   }
    //menuMult.openFunc(e,button,itemMulti); 
    //var fragItems=jQueryObjToFragment(itemMulti);
    menuMult.openFunc(e,this,itemMulti);
  }
  buttonExecuteMult.on(strMenuOpenEvent,buttonExeMultClick); 
  

  var File=[]; el.nRowVisible=0;

  var spanTmp=createElement('span').myText(strFastBackSymbol).css({'font-size':'0.7em'});
  var buttonFastBack=createElement('button').myAppend(spanTmp).css({'margin-left':'0.8em'}).on('click',function(){history.fastBack('adminMoreDiv');});
  var buttonBack=createElement('button').on('click', historyBack).myText(charBack);
  //var spanLabel=createElement('span').append('Pages');  

  var tmpImg=imgFilter.cloneNode(1)
  el.filterInfoWrap=createElement('span');
  var buttFilter=createElement('button').myAppend(tmpImg,el.filterInfoWrap).css({display:'inline-block'}).on('click',function(){
    doHistPush({strView:'pageFilterDiv'});
    pageFilterDiv.setVis();
  });
  var buttClear=createElement('button').myText('C').on('click',function(){pageFilterDiv.Filt.filtAll(); pageList.histPush(); pageList.loadTab()}).css({'margin-left':'auto'});
  var spanTmp=createElement('span').myText(langHtml.orphansInParenthesis).css({'font-size':'0.8em'});
  var buttOrphan=createElement('button').myAppend(spanTmp).on('click',function(){pageFilterDiv.Filt.setSingleParent(null);  pageList.histPush(); pageList.loadTab()});


    // divCont
  var divCont=createElement('div').myAppend(el.table).addClass('contDivFix').css({width:'fit-content'});
  el.table.css({padding:0})

  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({});
  var divFoot=createElement('div').myAppend(buttonFastBack, buttonBack, allButton, buttonExecuteMult, buttClear, buttOrphan, buttFilter).addClass('footDivFix'); 
  divFoot.css({left:'50%', transform:'translateX(-50%)'})
  el.append(divCont, divFoot);
  el.css({ 'text-align':'center'})

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
    //var span=r.children(`span[name=${strName}]`);  span.prop('valSort',Number(boVal)).visibilityToggle(boVal);
    var span=r.querySelector(`span[name=${strName}]`);  span.prop('valSort',Number(boVal)).visibilityToggle(boVal);
  }
}

var menuPageSingleExtend=function(menuSingle){ // The menu that appears when one clicks "execute" on a single row or parent filter row. (not the "multi"-menu)
  var strPublicRead=`<span style="display:inline-block">${charPublicRead}</span> (public read)`;
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
   // SpanGrandParent
   //

class SpanGrandParent extends HTMLElement{
  constructor(){ super(); }
  connectStuff(){
    var self=this
    this.GrandParent=[];
    this.objParent={};
    this.buttPop=createElement('button').addClass('aArrow','aArrowLeft').on('click',function(){
      //this[0].parentElement.parentElement.parentElement.parentElement.parentElement==imageList[0]
      parentSelPop.setUp(self.GrandParent, self.objParent); parentSelPop.setVis();
      doHistPush({strView:'parentSelPop'});
    }).hide();
    this.buttOrphan=createElement('button').myText(langHtml.orphansInParenthesis).addClass('aArrow','aArrowLeft').on('click',function(){ self.clickFunc(null); }).hide();
    this.spanButt=createElement('span').on('click',function(e){
      var ele=e.target;
      if(ele.nodeName!='BUTTON') return;
      var ind=ele.ind;
      //parentSelPop.setUp([self.GrandParent[ind]]);
      self.clickFunc(self.GrandParent[ind]);
    });

    this.myAppend(this.buttPop, this.buttOrphan, this.spanButt); //  'Up: ',    .on('click',function(){this.clickFunc();}); 
    return this;
  }
  setUpClear(){   this.spanButt.empty(); this.buttPop.hide();  this.buttOrphan.hide();  }
  setUp(GrandParent){
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
        //butt.css({'background-image':`url("stylesheets/buttonLeft${intSize}.png")`}); //+this.strColor
        butt.addClass('aArrow','aArrowLeft');
      }
    }
    var filterDiv=strTypeCurrent=='page'?pageFilterDiv:imageFilterDiv;
    var On=filterDiv.Filt.getParentsOn(), boOrphanFiltering=Boolean(On.length==1 && On[0]==null), boShow=!boOrphanFiltering && nGrandParent==0;  this.buttOrphan.toggle(boShow); // this.toggle(boShow);
  }
  clickFunc(parent){ 
    var idPage=parent?parent.idPage:null;
    //var {idPage=null}=parent;
    pageFilterDiv.Filt.setSingleParent(idPage); 
    pageList.histPush(); pageList.loadTab();    if(pageList.style.display=='none') { pageList.setVis(); }  
  }
}
customElements.define('span-grand-parent', SpanGrandParent);


   //
   // DivRowParentT
   //

class DivRowParentT extends HTMLElement{
  constructor(){ super(); }
  connectStuff(){
    var self=this
    var setParentFilter=function(){
      var boImageCur=pageList.style.display=='none',  boImageGoal=this==self.buttonNImage;
      var divCur=boImageCur?imageFilterDiv:pageFilterDiv;
      var divGoal=boImageGoal?imageFilterDiv:pageFilterDiv;
      var listGoal=boImageGoal?imageList:pageList;
      
      var idPage=divCur.Filt.getSingleParent();
      divGoal.Filt.setSingleParent(idPage); listGoal.histPush(); listGoal.loadTab();
      if(listGoal.style.display=='none') listGoal.setVis();
    }
    
    //this.spanGrandParent=new SpanGrandParent();
    this.spanGrandParent=createElement('span-grand-parent'); this.spanGrandParent.connectStuff();
    this.spanGrandParent.css({'margin-right':'0.6em'}).attr('name','nParent');

    var buttonExecute=createElement('button').myText(charFlash).on(strMenuOpenEvent, menuPageSingle.buttonExeSingleClick).addClass('unselectable'); 
    this.tdExecute=createElement('span').prop('valSort',0).myAppend(buttonExecute).attr('name','execute'); 
    this.tdR=createElement('span').attr('name','boOR').myText(charPublicRead).prop('title',PageRowLabel.boOR); this.tdW=createElement('span').attr('name','boOW').myText(charPublicWrite).prop('title',PageRowLabel.boOW); this.tdP=createElement('span').attr('name','boSiteMap').myText(charPromote).css({'margin-right':'0.15em'}).prop('title',PageRowLabel.boSiteMap);
    this.tdVer=createElement('span').attr('name','version').css({'min-width':'1.5em', background:'red'});
    this.tdTCreated=createElement('span').attr('name','tCreated').prop('title',PageRowLabel.tCreated);
    this.tdTMod=createElement('span').attr('name','tMod').prop('title',PageRowLabel.tMod);
    this.tdTLastAccess=createElement('span').attr('name','tLastAccess').prop('title',PageRowLabel.tLastAccess);
    this.tdNAccess=createElement('span').attr('name','nAccess').prop('title',PageRowLabel.nAccess);
    this.tdSite=createElement('span').attr('name','siteName');
    this.tdOrphan=createElement('span').css({color:'grey'});
    this.aLink=createElement('a').prop({target:"_blank", rel:"noopener"});
    this.tdStrLang=createElement('span').attr('name','strLang').prop('title','Language code');
    this.tdLink=createElement('span').attr('name','link').myAppend(this.aLink);
    this.tdSize=createElement('span').attr('name','size');
    this.buttonNChild=createElement('button').addClass('aArrow','aArrowRight').on('click',setParentFilter);
    this.buttonNImage=createElement('button').addClass('aArrow','aArrowRight').on('click',setParentFilter).prop('title','Images');
    this.tdNChild=createElement('span').myAppend(this.buttonNChild).attr('name','nChild'); 
    this.tdNImage=createElement('span').myAppend(this.buttonNImage).attr('name','nImage'); 
    
    this.append(this.spanGrandParent, this.tdExecute, this.tdTCreated, this.tdTMod, this.tdTLastAccess, this.tdNAccess, this.tdR, this.tdW, this.tdP, this.tdSize, this.tdNImage, this.tdNChild, this.tdVer, this.tdStrLang, this.tdSite, this.tdLink, this.tdOrphan);
    
    this.css({'line-height':'2.7em'});  // ,'max-width':menuMaxWidth
    this.addClass('pageList');
    return this;
  }
  setUpPreAJAX(idParent){  
    var boWhite=pageFilterDiv.Filt.isWhite();
    var nParentsOn=pageFilterDiv.Filt.getNParentsOn();
    var nParentsOff=pageFilterDiv.Filt.getNParentsOff();
    //if(typeof iParent!='undefined') this.idPage=idParent;
    if(!boWhite || nParentsOn!=1){
      this.spanGrandParent.setUpClear();
      //this.children().hide();
      [...this.childNodes].forEach(ele=>ele.hide());
      this.tdOrphan.show();
    
      if(boWhite) { var strTmp=`(${nParentsOn} parents on)`, StrTmp=pageFilterDiv.Filt.getParentsOn(); } 
      else { 
        if(nParentsOff){ var strTmp=`(${nParentsOff} parents off)`, StrTmp=pageFilterDiv.Filt.getParentsOff(); }
        else {var strTmp='(No parent filter)', StrTmp=[];}
      }
      var StrTmp=StrTmp.slice(0,5), indT=StrTmp.indexOf(null); if(indT!=-1) StrTmp[indT]=langHtml.orphansInParenthesis;
      var strTitle=StrTmp.join('\n');
      this.tdOrphan.myText(strTmp).css({color:'grey'}).prop('title',strTitle);
      return;
    } 
  }
  getParentRet(data){
    if('tab' in data) { var Parent=tabNStrCol2ArrObj(data); this.spanGrandParent.setUp(Parent);  } 
  }
  getPageInfoByIdRet(data){
    var {nParent, idPage, parent, boOR, boOW, boSiteMap, boOther, lastRev, tCreated, tMod, tLastAccess, nAccess, size, nChild, nImage, strLang, boTLS, siteName, www, pageName}=data;
    Object.assign(this.spanGrandParent.objParent, data);
    var boImageList=imageList.style.display!='none', boPageList=!boImageList;
    this.buttonNChild.myText(boPageList?"cur":nChild).prop("disabled",boPageList).visibilityToggle(nChild);
    this.buttonNImage.myText(boImageList?"cur":nImage).prop("disabled",boImageList).visibilityToggle(nImage);
    
    if(idPage==null) {
      //this.children().hide();
      [...this.childNodes].forEach(ele=>ele.hide());  this.tdNChild.show(); this.tdNImage.show();
      this.tdOrphan.show().myText(langHtml.orphansInParenthesis+(boPageList?' (roots)':'')); this.aLink.myText('');
    } else {
      //this.children().show();
      [...this.childNodes].forEach(ele=>ele.show());
      this.tdOrphan.myText('');
      this.prop(data);  this.prop({iFlip:null}); 
      
      //var text=siteName+':'+pageName; //if(nSame>1) text=siteName+':'+text;

      var sizeDisp=size, pre=''; if(size>=1024) {sizeDisp=Math.round(size/1024); pre='k';} if(size>=1048576) { sizeDisp=Math.round(size/1048576); pre='M';}
        this.tdSize.myHtml(`${sizeDisp}<b>${pre}</b>`); var strTitle=pre.length?'Size: '+size:''; this.tdSize.prop('title',strTitle); 
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
}
customElements.define('div-row-parent', DivRowParentT);



  // Method of buttonNParent
var goToParentMethod=function(e){
  var {strType}=this, r=this.parentNode.parentNode,  {idPage, idImage, nParent, idParent, boTLS, www, parent}=r;
  var FiltGoal=strType=='page'?pageFilterDiv.Filt:imageFilterDiv.Filt;
  var listGoal=strType=='page'?pageList:imageList;
  var boUseSelPop=nParent>1;
  if(adminMoreDiv.boUseSelPopForSinglParent && nParent==1) boUseSelPop=true;
  if(e.shiftKey && nParent==1) boUseSelPop=true;
  if(boUseSelPop){ 
    parentSelPop.setUp({idPage, idImage}, strType); parentSelPop.setVis();
    doHistPush({strView:'parentSelPop'});
  }else{ // ... go directly to parent 
    //if(!e.shiftKey) {var url=createUrlFrPageData({boTLS, www, pageName:parent}); window.open(url); return false; }
    FiltGoal.setSingleParent(idParent);  listGoal.histPush(); listGoal.loadTab(); 
  } 
}

var parentSelPopExtend=function(el){
  el.strName='parentSelPop'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  var cbGotoList=function(){
    var {idPage,strType}=this;
    var FiltT=strType=='page'?pageFilterDiv.Filt:imageFilterDiv.Filt;
    var listGoal=strType=='page'?pageList:imageList;
    FiltT.setSingleParent(idPage);
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
      //var butP=createElement('button').prop({disabled:1}).myText("cur").addClass('aArrow', 'aArrowLeft'); //nParent
      var butC=createElement('button').prop({idPage, strType:'page'}).myText(nChild).on('click',cbGotoList).visibilityToggle(nChild);
      var butI=createElement('button').prop({idPage, strType:'image'}).myText(nImage).on('click',cbGotoList).css({background:'var(--bg-colorImg)'}).visibilityToggle(nImage);
      var spanSite=createElement('span').myText(siteName);
      var url=createUrlFrPageData({boTLS, www, pageName});
      var a=createElement('a').prop({href:url, target:"_blank", rel:"noopener"}).myText(pageName);//.css({display:'inline-block'});
      var ElTmp=[butC, butI]; ElTmp.forEach(ele=>ele.addClass('aArrow', 'aArrowRight'));
      var ElTmpA=[spanSite, a]; //butP, 
      ElTmpA.forEach(ele=>ele.css({'align-self': 'center'}));
      child.empty().myAppend(...ElTmpA, ...ElTmp);
    }else{
      var {idImage, imageName, boOther, tCreated, strHash, size, widthSkipThumb, width, height, extension, tLastAccess, nAccess, tMod, hash, nParent}=data;
      //var butP=createElement('button').prop({disabled:1}).myText("cur").addClass('aArrow', 'aArrowLeft'); // nParent
      var url=createUrlFrPageData({boTLS, www, imageName});
      var img=createElement('img').prop({src:'50apx-'+imageName, alt:"thumb"}).addClass('checkerboard').css({'vertical-align':'middle', 'max-width':'50px', 'max-height':'50px'}).on('click',function(){window.open(imageName);});
      var a=createElement('a').prop({href:url, target:"_blank", rel:"noopener"}).myText(imageName).css({'align-self':'center'});
      //ElTmp=[butP];
      child.empty().myAppend(img, a); //...ElTmp, 
    }
    
    divParents.empty();
    for(var i=0;i<Parent.length;i++) {  
      var {boTLS, siteName, www, idPage, pageName, nChild, nImage, size, strLang, boOR, boOW, boSiteMap, nParent, tCreated, tMod, tLastAccess, nAccess}=Parent[i];
      //var idPage=Parent[i].idPage, name=Parent[i].pageName, siteName=Parent[i].siteName;
      var boCur=idPage===idPageList;
      var cbTmp=nParent==0?cbGotoList:cbChange;
      var butP=createElement('button').prop({idPage, strType:'page'}).myText(nParent).addClass('aArrow', 'aArrowLeft').on('click',cbTmp);
      var boDisabled=boCur && strType=='page';
      var butC=createElement('button').prop({idPage, strType:'page', disabled:boDisabled}).myText(boDisabled?"cur":nChild).on('click',cbGotoList).visibilityToggle(nChild);
      var boDisabled=boCur && strType=='image';
      var butI=createElement('button').prop({idPage, strType:'image', disabled:boDisabled}).myText(boDisabled?"cur":nImage).on('click',cbGotoList).css({background:'var(--bg-colorImg)'}).visibilityToggle(nImage);
      var spanSite=createElement('span').myText(siteName);
      var url=createUrlFrPageData({boTLS, www, pageName});
      var a=createElement('a').prop({href:url, target:"_blank", rel:"noopener"}).myText(pageName).css({'align-self':'center'});
      var ElTmp=[butC, butI]; ElTmp.forEach(ele=>ele.addClass('aArrow', 'aArrowRight'));
      ElTmp=[butP, ...ElTmp];
      //if(!boEqual) r.prepend(siteName+' ');
      var r=createElement('p').css({display:'flex', 'flex-wrap':'wrap', gap:'3px', background:'var(--bg-color)'}).myAppend(...ElTmp, a);
      divParents.append(r);
    }  
  }
  el.closeFunc=function(){   historyBack();    }
  el.setVis=function(){
    el.show(); return 1;
  }
  
  //el=popUpExtend(el);  
  //el.css({'max-width':'20em', padding: '0.5em 0.5em 1.2em 1.2em'});  

  //var spanNParent=createElement('span');


  var divParents=createElement('div').css({wordBreak: 'break-word'}); //'overflow-y':'scroll'   overflow: 'auto'   
  var close=createElement('button').myText(charClose).on('click',function(){historyBack();});
  //close.css({'align-self': 'flex-start'})
  close.css({position: 'absolute', top:'.2em', right:'.2em'})
  var child=createElement('div').css({display:'flex', 'align-items':'center', 'flex-wrap':'wrap', flex:'1 1 0%', background:'var(--bg-color)'}); // .myAppend(spanNParent,' Parents') 'font-weight':'bold', 
  var childW=createElement('div').css({display:'flex', 'align-items':'center', background:'var(--bg-colorRoot)', wordBreak: 'break-word'}).myAppend(child); //close,   .myAppend(spanNParent,' Parents')
 
  //el.append(head,divParents,close);
  //el.css({'text-align':'left'});


  var divTree=createElement('div').myAppend(divParents, childW).css({background:'var(--bg-colorRoot)', display:'flex', gap:'3px'});

  var butCancel=createElement('button').on('click', historyBack).myText(charBack);
  var divBottom=createElement('div').myAppend(butCancel).css({display:'flex', gap:'0.4em', 'justify-content':'space-between'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center-Flex").myAppend(divTree, close);
  centerDiv.css({display:'flex', gap:'1em', 'flex-direction':'column', 'justify-content':'space-between'});
  centerDiv.css({display:'block', position:'relative'});

  el.addClass("Center-Container-Flex").myAppend(centerDiv,blanket); 
  
  return el;
}


var imageListExtend=function(el){
  el.strName='imageList'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  var imageClick=function(){
    //var Tr=tBody.children(`p:lt(${el.nRowVisible})`); 
    var Tr=[...tBody.childNodes].slice(0,el.nRowVisible);
    var StrImg=[], Caption=[]; 
    Tr.forEach(function(p,i){ 
      var tr=p, imageName=tr.imageName, i=tr.iFlip;
      //var size=tr.tdSize, tCreated=tr.tdCreated.data, boOther=tr.tdBoOther
      //var size=tr.children('span[name=size]').myText(), tCreated=tr.children('span[name=tCreated]').myText(), boOther=tr.children('span[name=boOther]').myText();
      var {size,tCreated,tLastAccess,nAccess,boOther}=File[i];
      tCreated=mySwedDate(tCreated); tLastAccess=mySwedDate(tLastAccess);
      StrImg.push(imageName);
      //var str=`<p>${imageName}<p>Size: ${File[i].size}<p>Mod: ${mySwedDate(File[i].tCreated)}`; if(File[i].boOther) str+='<p style="color:red">Others Upload</p>'
      var str=`<p>${imageName}<p>Size: ${size}<p>Created: ${tCreated}<p>Last Access: ${tLastAccess}<p>nAccess: ${nAccess}`; if(Number(boOther)) str+='<p style="color:red">Uploaded by user</p>'
      var cap=createElement('div').myHtml(str);
      Caption.push(cap);    
    });
    var iCur=this.parentNode.parentNode.myIndex();
    slideShow.setUp(StrImg,Caption,iCur);
    doHistPush({strView:'slideShow'});
    slideShow.setVis(); 
  }
  var condAddRows=function(){
    //var rows=tBody.children('p');
    var rows=[...tBody.childNodes];
    for(var i=rows.length; i<File.length;i++){
      var r=createElement('p');
      var cb=createElement('input').prop('type', 'checkbox').on('click',cbClick);
      var buttonNParentI=createElement('button').addClass('aArrow', 'aArrowLeft').prop({strType:'image'}).on('click',goToParentMethod);
      var tdNParentI=createElement('span').myAppend(buttonNParentI).attr('name','nParentI').prop('title','Parents'); 
      var tdCB=createElement('span').prop('valSort',0).myAppend(cb).attr('name','cb');
      //var tmpImg=createElement('img').prop({src:uFlash}).prop('draggable',false).css({height:'1em',width:'1em','vertical-align':'text-bottom'}); 
      var buttonExecute=createElement('button').myText(charFlash).on(strMenuOpenEvent,buttonExeSingleClick).addClass('unselectable');
      var tdExecute=createElement('span').prop('valSort',0).myAppend(buttonExecute).attr('name','execute'); 
      var tdTCreated=createElement('span').attr('name','tCreated').prop('title',Label.tCreated);
      var tdTLastAccess=createElement('span').attr('name','tLastAccess').prop('title',Label.tLastAccess);
      var tdNAccess=createElement('span').attr('name','nAccess').prop('title',Label.nAccess);
      var img=createElement('img').prop({alt:"thumb"}).on('click',imageClick).addClass('checkerboard');
        //.css({'margin-right':'0.1em','max-width':'50px','max-height':'50px'});
      var tdImg=createElement('span').attr('name','image').myAppend(img);
      var tdBoOther=createElement('span').myText('user').attr('name','boOther');
      //var tdName=createElement('span').attr('name','imageName'); //.hide();
      var aLink=createElement('a').prop({target:"_blank", rel:"noopener"});
      var tdLink=createElement('span').myAppend(aLink).attr('name','link');
      var tdSize=createElement('span').attr('name','size');
      r.append(tdNParentI, tdCB, tdExecute, tdTCreated, tdTLastAccess, tdNAccess, tdImg, tdSize, tdBoOther, tdLink);  //  tdName  ,createElement('span').myAppend(bView)  tdNParent, 
      //r.data({tdCB, tdTCreated, tdImg, tdLink, tdBoOther, tdSize});
      tBody.append(r);
    }
  }
  var isAnyOn=function(){
    //var boOn=false, Tr=tBody.children(`p:lt(${el.nRowVisible})`);     Tr.find('input').forEach(ele=>{var boTmp=ele.prop('checked'); if(boTmp) boOn=true;});   return boOn;
    var boOn=false, Tr=[...tBody.childNodes].slice(0, el.nRowVisible);     Tr.forEach(ele=>{var inp=ele.querySelector('input'); if(inp.checked) boOn=true;});   return boOn;
  }
  var isOneOn=function(){
    //var Tr=tBody.children(`p:lt(${el.nRowVisible})`), checked=Tr.find('input:checked'); return checked.length==1;
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
      var tmp=r.querySelector('span[name=size]').prop('valSort',size).myHtml(`${sizeDisp}<b>${pre}</b>`); var strTitle=pre.length?'Size: '+size:''; tmp.prop('title',strTitle);   //tmp.css({weight:pre=='M'?'bold':'',color:pre==''?'grey':''}); 
      var tmp=File[i].imageName; r.querySelector('span[name=link]').prop('valSort',tmp).querySelector('a').prop({href:uSiteCommon+'/'+tmp}).myText(tmp);
    });
    //tBody.find('input').prop({'checked':false}); 
    var Tmp=[...tBody.querySelectorAll('input')]; Tmp.forEach(ele=>ele.prop({'checked':false}));
  }
  el.setCBStat=function(boOn){
    boOn=Boolean(boOn);allButton.myText('All');
    buttonExecuteMult.toggle(false);
    //if(typeof myRows=='undefined') return;
    //var Tr=tBody.children(`p:lt(${el.nRowVisible})`);
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
    if(el.boDoScroll) {
      el.setScroll(el.intDoScroll); delete el.boDoScroll; delete el.intDoScroll;
    }
  }
  var histRet=function(data){
    var tmp, HistPHP=data.Hist||[];

    imageFilterDiv.divCont.interpretHistPHP(HistPHP);

      // Create TextByParentId
      // If there are pages (parents) with the same "pageName" (on different sites) then use siteName:pageName (when the page (parent) is written). 
    //var StrOrderFiltImageFlip=array_flip(StrOrderFiltImage);
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
    //var span=r.children(`span[name=${strName}]`);
    var span=r.querySelector(`span[name=${strName}]`);
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
  
  
  el.funPopped=function(state){ 
    imageFilterDiv.divCont.frStored(state);
    el.boDoScroll=true; el.intDoScroll=state.scroll
    el.loadTab();
  }
  el.histPush=function(){
    var o=imageFilterDiv.divCont.toStored();
    doHistPush({strView:'imageList', arg:o});
  }
  el.histReplace=function(indDiff){
    var o=imageFilterDiv.divCont.toStored();
    doHistReplace({strView:'imageList', arg:o}, indDiff); //
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
  el.nRowVisible=0
  el.table=createElement('div').myAppend(tBody).css({width:'100%',position:'relative'});
  var divCont=createElement('div').myAppend(el.table).css({margin:'0em auto 1em','text-align':'left',display:'inline-block'});//
  
  
  var strTmp='Parents / Alternatve parents';
  var StrCol=['nParentI','cb','execute','tCreated','tLastAccess','nAccess','image','size','boOther','link'];
  var BoAscDefault={cb:0,boOther:0,size:0,nAccess:0}, Label={nParent:strTmp, nParentI:strTmp, cb:'Select',tCreated:'Created',tLastAccess:'Last Access',nAccess:'nAccess',boOther:'Supplied by user'}; //'nParent',
  //var headFill=createElement('p').myAppend().css({background:'white',margin:'0px',height:'calc(12px + 1.2em)'});
  var head=headExtendDyn(createElement('p'), el, StrCol, BoAscDefault, Label, 'p', 'span').addClass('imageList');
  head.css({background:'var(--bg-color)', width:'inherit'});     // ,height:'calc(12px + 1.2em)', position:'sticky', top:'57px', 'z-index':'1', margin:'0px'
  el.headW=createElement('div').myAppend(head).css({background:'var(--bg-color)', width:'inherit', position:'sticky', top:'0px', 'z-index':'1', margin:'0px', opacity:0.9, "border-bottom":'1px solid'});     
  el.table.prepend(el.headW); //,headFill

  
    // menuA
  var allButton=createElement('button').myText('All').on('click',function(){
    var boOn=allButton.myText()=='All';
    //var Tr=tBody.children(`p:lt(${el.nRowVisible})`);
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
    var Id=getCheckedId(), strLab=`Deleting ${Id.length} image(s).`;   areYouSurePop.openFunc(strLab, function(){el.deleteF(Id, historyBack);}, historyBack);
  });
  
  //var tmpImg=createElement('img').prop({src:uFlash}).prop('draggable',false).css({height:'1em',width:'1em','vertical-align':'text-bottom'});
  var buttonExecuteMult=createElement('button').myText(charFlash).addClass('unselectable');
  var itemMulti=[buttonDelete];
  var menuMult=createElement('div').css({'text-align':'left', 'line-height':'1.3em'});  menuExtend(menuMult);
  var buttonExeMultClick=function(e){ 
    //var button=this;  //itemMulti[0].toggle(isOneOn());
    //if(boTouch){      doHistPush({strView:'menuDiv'});    menuDiv.setUp(itemMulti);   menuDiv.setVis();    }else{    }
    //var fragItems=jQueryObjToFragment(itemMulti);
    menuMult.openFunc(e,this,itemMulti);
  }
  buttonExecuteMult.on(strMenuOpenEvent,buttonExeMultClick);


  //el.buttonExecuteParent=createElement('button').myText(charFlash).addClass('unselectable');
  //var divRowParent=new DivRowParentT(el);
  //headW.prepend(divRowParent);


  var File=[]; el.nRowVisible=0;

  var spanTmp=createElement('span').myText(strFastBackSymbol).css({'font-size':'0.7em'});
  var buttonFastBack=createElement('button').myAppend(spanTmp).css({'margin-left':'0.8em'}).on('click',function(){history.fastBack('adminMoreDiv');});
  var buttonBack=createElement('button').on('click', historyBack).myText(charBack);
  //var spanLabel=createElement('span').myText('Images'); 
  
  var tmpImg=imgFilter.cloneNode(1)
  el.filterInfoWrap=createElement('span');
  var buttFilter=createElement('button').myAppend(tmpImg,el.filterInfoWrap).css({display:'inline-block'}).on('click',function(){ doHistPush({strView:'imageFilterDiv'}); imageFilterDiv.setVis();});
  var buttClear=createElement('button').myText('C').on('click',function(){imageFilterDiv.Filt.filtAll(); imageList.histPush(); imageList.loadTab()}).css({'margin-left':'auto'});
  var spanTmp=createElement('span').myText(langHtml.orphansInParenthesis).css({'font-size':'0.8em'});
  var buttOrphan=createElement('button').myAppend(spanTmp).on('click',function(){imageFilterDiv.Filt.setSingleParent(null);  imageList.histPush(); imageList.loadTab()});


    // divCont
  var divCont=createElement('div').myAppend(el.table).addClass('contDivFix').css({width:'fit-content'});
  el.table.css({padding:0})

  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({});
  var divFoot=createElement('div').myAppend(buttonFastBack, buttonBack, allButton, buttonExecuteMult, buttClear, buttOrphan, buttFilter).addClass('footDivFix'); 
  divFoot.css({left:'50%', transform:'translateX(-50%)', background:'var(--bg-colorImg)'})
  el.append(divCont, divFoot);
  el.css({ 'text-align':'center'})


  return el;
}





var renamePopExtend=function(el){
  el.strName='renamePop'
  el.id=el.strName
  el.toString=function(){return el.strName;}
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
    doHistPush({strView:'renamePop'});
    el.setVis();
    inpName.focus(); inpName.select();
  }
  var row, strType='', boCallFrList;

  el.setVis=function(){  el.show();   return true; }

 
  var type=createElement('span'); 
  var head=createElement('h3').myAppend('Rename ',type).css({margin:0});
  var labName=createElement('label').myText('New name: ');
  var inpName=createElement('input').css({display:'block',width:'100%'}).on('keypress',  function(e){ if(e.which==13) {save();return false;}} );

  var secName=createElement('section').myAppend(labName,inpName)

  var saveButton=createElement('button').myText('Save').on('click',save);
  var cancelButton=createElement('button').myText('Cancel').on('click',historyBack);
  //el.append(head,labName,inpName,cancelButton,saveButton); //.css({padding:'0.1em'}); 
  var foot=createElement('div').myAppend(cancelButton,saveButton).css({display:'flex', gap:'0.4em', 'justify-content':'space-between'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center-Flex").myAppend(head, secName, foot); //.css({width:'min(95%,40em)'});
  centerDiv.css({display:'flex', gap:'1em', 'flex-direction':'column', 'justify-content':'space-between', width:'min(40em,98%)'});
  el.addClass("Center-Container-Flex").myAppend(centerDiv,blanket); 
  
  return el;
}

var setStrLangPopExtend=function(el){
  el.strName='setStrLangPop'
  el.id=el.strName
  el.toString=function(){return el.strName;}
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
    doHistPush({strView:'setStrLangPop'});
    el.setVis();
    inpStrLang.focus(); inpStrLang.select()
  }
  el.setVis=function(){ el.show();   return true; }

  var Id, strLang, cbDone;
 
  var head=createElement('h3').myAppend('Set iso 639-1 language code').css({margin:0});
  var labStrLang=createElement('label').myText('Language code:');
  var intL=11, inpStrLang=createElement('input').css({display:'block',width:'100%'}).attr({maxlength:intL, title:'ISO 639-1 Language Code', size:intL}).on('keypress',  function(e){ if(e.which==13) {save();return false;}} );

  var secStrLang=createElement('section').myAppend(labStrLang,inpStrLang)

  var saveButton=createElement('button').myText('Save').on('click',save);
  var cancelButton=createElement('button').myText('Cancel').on('click',historyBack);
  var foot=createElement('div').myAppend(cancelButton,saveButton);
  foot.css({display:'flex', gap:'0.4em', 'justify-content':'space-between'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center-Flex").myAppend(head, secStrLang, foot);
  centerDiv.css({display:'flex', gap:'1em', 'flex-direction':'column', 'justify-content':'space-between'});
  el.addClass("Center-Container-Flex").myAppend(centerDiv,blanket); 
  
  return el;
}

var setSiteOfPagePopExtend=function(el){
  el.strName='setSiteOfPagePop'
  el.id=el.strName
  el.toString=function(){return el.strName;}
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
    doHistPush({strView:'setSiteOfPagePop'});
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
      var obT=ObjSite[i];
      //var strT=`${ObjSite[i].idSite} (${ObjSite[i].www})`;
      var strT=`${obT.idSite} (${obT.www})`;
      var optT=createElement('option').myText(strT).prop('value',obT.idSite); Opt.push(optT);
    }
    selSite.empty().myAppend(...Opt);
  }

  var Id, idSite, cbDone;
 
  var head=createElement('h3').myAppend('Set site of page(s)').css({margin:0});
  var labSite=createElement('label').myText('Site:');
  var selSite=createElement('select').css({display:'block'}).attr({title:'Set site of page(s)'}).on('change',  function(e){ cbTestForCollision();} );
  var secSite=createElement('section').myAppend(labSite, selSite)

  var divCollision=createElement('div');
  

  var saveButton=createElement('button').myText('Save').on('click',save);
  var cancelButton=createElement('button').myText('Cancel').on('click',historyBack);
  var foot=createElement('div').myAppend(cancelButton,saveButton).css({display:'flex', gap:'0.4em', 'justify-content':'space-between'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center-Flex").myAppend(head, secSite, foot, divCollision);
  centerDiv.css({display:'flex', gap:'1em', 'flex-direction':'column', 'justify-content':'space-between'});
  el.addClass("Center-Container-Flex").myAppend(centerDiv,blanket); 
  
  return el;
}



/*******************************************************************************
 * editDiv
 ******************************************************************************/

var editDivFixedExtend=function(el){
  el.setUp=function(){
    if(editText.parentNode!==el) {
      el.prepend(dragHR,editText);
    }
    
    if(divReCaptcha.isLoaded()) { console.log('Setting up recaptcha (divReCaptcha became visible)'); divReCaptcha.setUp(); } // Otherwise cbRecaptcha will fire later
    return this
  }
  
    // menuB
  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  el.objWSaveElements=objWSaveElementsCreator();
  el.templateButton=createElement('button').myText(langHtml.TemplateList).on('click',function(){
    doHistPush({strView:'templateList'});
    templateList.setVis();
  });
  var upLoadButton=createElement('button').myAppend('Upload image').on('click',function(){
    doHistPush({strView:'uploadUserDiv'});
    uploadUserDiv.setVis();
  }).css({});


  var cssTmp={'min-width':'min(100vw, var(--menuMaxWidth))', margin:'.5em auto .5em', display:'flex', 'align-items':'center', 'justify-content':'space-between', gap:'0.8em'}
  var {divReCaptcha, summary, signature, buttonSave, preview}=el.objWSaveElements.El
  var menuA=createElement('div').myAppend(divReCaptcha).css(cssTmp);
  menuA.css({display:'flex', 'justify-content':'space-between', gap:'0.3em', 'max-width':menuMaxWidth})
  var menuB=createElement('div').myAppend(buttonBack, summary, signature, buttonSave, preview, el.templateButton).css(cssTmp);
  //menuB.css({padding:'0 0.3em 0 0', 'max-width':menuMaxWidth, 'text-align':'left', margin:'1em auto 0'});
  menuB.css({display:'flex', 'justify-content':'space-between', gap:'0.3em', 'max-width':menuMaxWidth})
  el.myAppend(menuA,menuB);
  return el;
}



var settingDivExtend=function(el){
  el.strName='settingDiv'
  el.id=el.strName
  el.toString=function(){return el.strName;}

    // Initial setup of selectorOfTheme
  var selectorOfTheme=selThemeCreate()
  var divThemeSelector=createElement('div').myAppend('Theme (Background colors): ', selectorOfTheme);

  var {themeOS, themeChoise, themeCalc}=analysColorSchemeSettings();
  console.log(`OS: ${themeOS}, choise: ${themeChoise}`)
  setThemeClass(themeCalc)
  selectorOfTheme.value=themeChoise
  
  
  var Div=[divThemeSelector]

    // divCont
  var divCont=createElement('div').myAppend(...Div).addClass('contDivFix');  //.css({width:'fit-content'});

  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  var spanLabel=createElement('span').myText('Settings').css({ margin:"0 0 0 auto"});
  var divFoot=createElement('div').myAppend(buttonBack, spanLabel).addClass('footDivFix');
  divFoot.css({left:'50%', transform:'translateX(-50%)'})
  el.append(divCont, divFoot);
  el.css({ 'text-align':'center'})


  return el;
}

var dragHRExtend=function(el, funStartHeight, funSet){ //elTarget
  var myMousedown= function(e){
    var e = e || window.event; if(e.which==3) return;
    el.css({position:'relative',opacity:0.55,'z-index':'auto',cursor:'move'}); 
    //hStart=elTarget.height();
    //var rect=elTarget.getBoundingClientRect(); hStart=rect.height;
    //hStart=elTarget.offsetHeight;
    hStart=funStartHeight();
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
    //elTarget.height(hNew);
    //elTarget.css('height', hNew+'px');
    funSet(hNew)
  };
  var strMouseDownEvent='mousedown', strMouseMoveEvent='mousemove', strMouseUpEvent='mouseup';  if(boTouch){  strMouseDownEvent='touchstart'; strMouseMoveEvent='touchmove'; strMouseUpEvent='touchend';  }
  var hStart,mouseXStart,mouseYStart;
  //if(boTouch) el.on('touchstart',myMousedown); else el.on('mousedown',myMousedown);
  el.on(strMouseDownEvent,myMousedown);
  el.addClass('unselectable');
  el.css({cursor:'row-resize'});
  return el;
}


var editTextExtend=function(el){
  var hDefault=180;
  var hEditText=getItem('hEditText');  if(hEditText===null)  hEditText=hDefault;      
  if(boTouch) hEditText=hDefault;
  el.css({width:'calc(100% - 3em)',height:hEditText+'px',display:'block',resize:'none'}).prop({autocomplete:"off"});//,wrap:"virtual"
  var clickBlurFunc=function(e){
    var boOn=e.type=='click';
    //boOn=1
    //if(!boOn) return;
    if(boTouch){//boTouch
      var elParent=el.parentNode;
      if(boOn) {
        //elParent.css({position:'', height:hDefault+'px'});
        //elParent.parentNode.css({position:'', height:hDefault+'px'});
        //el.css({height:hDefault+'px', overflow:'hidden'});
        //el.css({top:'',bottom:'0px'});
        //el.css({position:'fixed'});
        //elHtml.css({overflow:'hidden'}); elBody.css({overflow:'hidden'});
        //elHtml.css({height:'100%', overflow:'hidden'}); elBody.css({height:'100%', overflow:'hidden'});
        //elHtml.css({height:hDefault+'px', overflow:'hidden'}); elBody.css({height:hDefault+'px', overflow:'hidden'});
        //if(boIOS) {window.scrollTo(0,document.body.scrollHeight); }
        if(boChrome) {elParent.css({top:'0px',bottom:''}); el.css({height:'calc(100vh - 8em)'}); } // Does not work on ios, not tested on others
      } else { 
        //el.css({position:''});
        //el.css({top:'',bottom:''});
        //elHtml.css({height:''}); elBody.css({height:''});
        if(boChrome) { elParent.css({top:'',bottom:'0px'}); el.css({height:hDefault+'px'}); }
      }
      //var toHideAtTouch=[pageText, ...editDiv.menus, adminDiv.menus, dragHR];
      var toHideAtTouch=[pageText, pageView.editDivFixed.menus, pageView.adminDivFixed.menus, dragHR];
      toHideAtTouch.forEach(ele=>ele.toggle?.(!Boolean(boOn)));
    }
  }
  el.on('click',clickBlurFunc);  
  el.on('blur',clickBlurFunc);
  return el;
}


var objWSaveElementsCreator=function(){ // These elements and methods are grouped together like this incase one would want to login on multiple places
  var obj={}
  var divReCaptcha=createElement('div');
  var summary=createElement('input').prop({type:'text', placeholder:'Summary'}).css({width:'5em', 'min-width':'2em'}); //spanSummary=createElement('span').myAppend('Summary: ',summary).css({'white-space':'nowrap'});
  var signature=createElement('input').prop({type:'text', placeholder:'Signature'}).css({width:'5em', 'min-width':'2em'}); //spanSignature=createElement('span').myAppend('Signature: ',signature).css({'white-space':'nowrap'});
  var buttonSave=createElement('button').myText(langHtml.Save).on('click',function(){
    if(!summary.value || !signature.value) { setMess('Summary- or signature- field is empty',5); return;}
    
    if(boDbgSkipRecaptcha) var strTmp="recapcha disabled (boDbgSkipRecaptcha=true)";
    else{
      var strTmp=grecaptcha.getResponse();
      if(!strTmp) {setMess("Captcha response is empty"); return; }
    }
    var o={strEditText:editText.value, summary:summary.value, signature:signature.value,  'g-recaptcha-response': strTmp};
    
    var vec=[['saveByAdd',o]];   myFetch('POST',vec); 
    summary.value=''; signature.value='';
    boLCacheObs.value=1;
  });
  obj.myToggle=function(boOn=true){
    Object.values(obj.El).forEach(ele=>ele.toggle(boOn))
  }
  var preview=createElement('button').myText(langHtml.ShowPreview).on('click',function(){
    var vec=[['getPreview',{strEditText:editText.value}]];   myFetch('POST',vec); 
  });
  obj.El={divReCaptcha, summary, signature, buttonSave, preview}
  //el.append(el.divReCaptcha, ...ElTmp, preview);
  //obj.El=[obj.divReCaptcha, ...ElTmp, preview];
  return obj;
}


class TemplateListDiv extends HTMLElement {
  constructor() { super(); }
  toString(){return this.strName;}
  setUp(IdChildLax=[],IdChild=[]){
    this.div.empty();
    var iStart=objSite.idSite.length+1;
    var strTemlatePrefix='template:', iEnd=strTemlatePrefix.length+iStart;
    var boAny=false;
    for(var i=0;i<IdChildLax.length;i++) {
      var id=IdChildLax[i]
      if(id.slice(iStart,iEnd)==strTemlatePrefix) {
        var boAny=true;
        var str=id.slice(iStart);
        var a=createElement('a').prop({href:'/'+str}).myText(str).css({display:'block'}); this.div.append(a);
        if(IdChild.indexOf(id)==-1) a.addClass("stub");
      }
    }
    //if(tab.length) el.prepend('<h3>Templates</h3>');
    //editDiv.fixedDiv.templateButton.toggle(boAny);
    pageView.editDivFixed.templateButton.toggle(boAny);
  }
  connectStuff(){
    this.strName='templateList'
    this.id=this.strName
      // divCont
    this.div=createElement('div').addClass('contDivFix').css({width:'fit-content'});

    var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
    var spanLabel=createElement('span').myText('Template list').css({ margin:"0 0 0 auto"});
    var divFoot=createElement('div').myAppend(buttonBack, spanLabel).addClass('footDivFix');
    divFoot.css({left:'50%', transform:'translateX(-50%)'})
    this.append(this.div, divFoot);
    this.css({ display:'block', 'text-align':'center'})


    return this;
  }
}
customElements.define('template-list', TemplateListDiv);



/*******************************************************************************
 * versionTable
 ******************************************************************************/
var versionTableExtend=function(el){
  el.strName='versionTable'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  function cbCompareWPrev(){ 
    var iVer=this.parentNode.parentNode.iMy;  arrVersionCompared=[bound(iVer-1,1),iVer];
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec);
    doHistPush({strView:'diffDiv'});
    diffDiv.setVis();
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
    doHistPush({strView:'diffDiv'});
    diffDiv.setVis();
    return false;
  }
  function greenClick(){ 
    var verG=this.parentNode.parentNode.iMy,  verRT=arrVersionCompared[0]; verRT=verRT>=verG?verG-1:verRT; verRT=Math.max(verRT,1);
    arrVersionCompared=[verRT, verG];
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec);
    doHistPush({strView:'diffDiv'});
    diffDiv.setVis();
    return false;
  }  
  el.setTable=function(){
    el.condAddRows(); el.versionTable2TBody();
    //boMultVersion=Number(matVersion.length>1); 
    el.table.toggle(matVersion.length>1)
    
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
    //tBody.children(`tr:nth-of-type(${(nRT+1)}), gt(${nRT})`).hide();
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
    //rEarliest.querySelector(`button:nth-of-type(${(jBEdit+1)})`).hide(); // Hide earliest edit-button
    //rEarliest.querySelector(`button:nth-of-type(${(jBGreen+1)})`).hide(); // Hide earliest green-button
    var arrButtT=rEarliest.querySelectorAll('button');
    arrButtT[jBEdit].hide(); // Hide earliest edit-button
    arrButtT[jBGreen].hide(); // Hide earliest green-button
    var rLatest=myRows[0];
    //rLatest.querySelector(`button:nth-of-type(${(jBRed+1)})`).hide(); // Hide latest red-button
    var arrButtT=rLatest.querySelectorAll('button')
    arrButtT[jBRed].hide(); // Hide latest red-button

    if(arrVersionCompared[0]!==null){
      //var iRowRedT=nVersion-arrVersionCompared[0];   tBody.querySelector(`tr:nth-of-type(${(iRowRedT+1)})`).css({"background-color":'var(--bg-red)'}); // rowRed
      var iRowRedT=nVersion-arrVersionCompared[0];   tBody.children[iRowRedT].css({"background-color":'var(--bg-red)'}); // rowRed
      //tBody.querySelector(`tr:nth-of-type(${(iRowRedT+1)})`).querySelector(`button:nth-of-type(${(jBRed+1)})`).css({"background-color":'red'}); // buttRed
      //var arrButtT=tBody.querySelector(`tr:nth-of-type(${(iRowRedT+1)})`).querySelectorAll('button');
      var arrButtT=tBody[iRowRedT].querySelectorAll('button');
      arrButtT[jBRed].css({"background-color":'red'}); // buttRed
    } 
    //var iRowVerT=nVersion-arrVersionCompared[1];     tBody.querySelector(`tr:nth-of-type(${(iRowVerT+1)})`).css({"background-color":"var(--bg-green)"}); // rowGreen
    var iRowVerT=nVersion-arrVersionCompared[1];     tBody.children[iRowVerT].css({"background-color":"var(--bg-green)"}); // rowGreen
    //tBody.querySelector(`tr:nth-of-type(${(iRowVerT+1)})`).querySelector(`button:nth-of-type(${(jBGreen+1)})`).css({"background-color":'green'}); // buttGreen
    //var arrButtT=tBody.querySelector(`tr:nth-of-type(${(iRowVerT+1)})`).querySelectorAll('button');
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
      createElement('th').css({'background':'var(--bg-red)'}), createElement('th').css({'max-width':'10px',background:'var(--bg-green)',overflow:'visible',position:'relative'}).myAppend(spanDiff) );
  var tBody=createElement('tbody').css({border:'1px solid'});
  //var tmp='[name=ind],[name=date],[name=summary]';
  tBody.on('click', cbVersionView);
  el.table=createElement('table').myAppend(tHead,tBody).css({"border-collapse":"collapse"});
  el.append(el.table); //'<h3>Versions</h3>',
  //tBody.find('td').css({border:'1px soild'});



    // divCont
  var divCont=createElement('div').myAppend(el.table).addClass('contDivFix').css({width:'fit-content'});

  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  var spanLabel=createElement('span').myText('Version list').css({ margin:"0 0 0 auto"});
  var divFoot=createElement('div').myAppend(buttonBack, spanLabel).addClass('footDivFix');
  divFoot.css({left:'50%', transform:'translateX(-50%)'})
  el.append(divCont, divFoot);
  el.css({ 'text-align':'center'})

  return el;
}

var diffDivExtend=function(el){
  el.strName='diffDiv'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  el.setUp=function(strHtml){
    divCont.myHtml(strHtml);
    //el.divCont.find('td').css({border:'1px #fff'});
    //el.divCont.find('td:nth-child(2):not(:first)').css({background:'#ddd'});
    //el.divCont.find('td:nth-child(1)').css({background:'var(--bg-red)'});
    //el.divCont.find('td:nth-child(3)').css({background:'var(--bg-green)'});
    //[...el.divCont.querySelectorAll('td')].forEach(ele=>ele.css({border:'1px #fff'}));
    //[...el.divCont.querySelectorAll('td:nth-child(2):not(:first-of-type)')].forEach(ele=>ele.css({background:'#ddd'}));
    //[...el.divCont.querySelectorAll('td:nth-child(1)')].forEach(ele=>ele.css({background:'var(--bg-red)'}));
    //[...el.divCont.querySelectorAll('td:nth-child(3)')].forEach(ele=>ele.css({background:'var(--bg-green)'}));
    [...divCont.querySelectorAll('tr')].forEach((tr,i)=>{
      [...tr.childNodes].forEach(td=>td.css({border:'0px solid var(--bg-colorEmp)'}));
      tr.children[0].css({background:'var(--bg-red)'});
      if(i) tr.children[1].css({background:'var(--bg-colorEmp)'});
      tr.children[2].css({background:'var(--bg-green)'});
    });
    var elT=divCont.querySelector('table'); if(elT) elT.css({'margin':'1em auto'});

    var strNR='', str='';
    if(matVersion.length>0){
      var ver=arrVersionCompared[1], rev=ver-1;
      var {tMod, summary, signature}=matVersion[rev];
      strNR='v'+ver;   str=`${summary} <b><i>${signature}</i></b> ${mySwedDate(tMod)}`;
    }
    versionNew.myText(strNR); detailNew.myHtml(str);  
    var strNR='', str='', ver=arrVersionCompared[0];
    if(ver){  // ver is 1-indexed
      var rev=ver-1;
      var {tMod, summary, signature}=matVersion[rev];
      strNR='v'+ver;   str=`${summary} <b><i>${signature}</i></b> ${mySwedDate(tMod)}`;
    }
    versionOld.myText(strNR); detailOld.myHtml(str); 

    [prevButton, nextButton].forEach(ele=>ele.toggle(matVersion.length>2));
  }



        // menuC
  var nextButtonNew=createElement('button').myText(charNext).on('click',function(){
    arrVersionCompared[1]++;   if(arrVersionCompared[1]>nVersion) {arrVersionCompared[1]=nVersion;}
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec); 
  });
  var prevButtonNew=createElement('button').myText(charPrev).on('click',function(){
    arrVersionCompared[1]--; if(arrVersionCompared[0]==arrVersionCompared[1]) arrVersionCompared[0]--;
    if(arrVersionCompared[0]==0) {arrVersionCompared=[nVersion-1,nVersion];}
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec);  
  });
  var versionNew=createElement('span').css({'background':'var(--bg-green)'}), detailNew=createElement('span'); 
  

        // menuB
  var nextButtonOld=createElement('button').myText(charNext).on('click',function(){
    arrVersionCompared[0]++; if(arrVersionCompared[0]==arrVersionCompared[1]) arrVersionCompared[1]++;
    if(arrVersionCompared[1]>nVersion) {arrVersionCompared=[1,2];}
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec);
  });
  var prevButtonOld=createElement('button').myText(charPrev).on('click',function(){
    arrVersionCompared[0]--;   if(arrVersionCompared[0]==0) {arrVersionCompared[0]=1;}
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec); 
  });
  var versionOld=createElement('span').css({'background':'var(--bg-red)'}), detailOld=createElement('span'); 

  [versionNew, versionOld].forEach(ele=>ele.css({'margin':'auto 0.3em'}));
  [detailNew, detailOld].forEach(ele=>ele.css({'margin':'auto 0.3em'}));
  [prevButtonNew, prevButtonOld].forEach(ele=>ele.css({'margin-left':'0.8em'}));

  //prevButtonNew,versionNew,nextButtonNew   prevButtonOld,versionOld,nextButtonOld
  var menuC=createElement('div').myAppend(versionNew,detailNew).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});
  var menuB=createElement('div').myAppend(versionOld,detailOld).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});



        // menuA
  var nextButton=createElement('button').myText(charNext).css({'margin':'0 1em'}).on('click',function(){
    arrVersionCompared[0]++; arrVersionCompared[1]++;
    if(arrVersionCompared[1]>nVersion) {arrVersionCompared=[1,2];}
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec);
  });
  var prevButton=createElement('button').myText(charPrev).css({'margin':'0 1em'}).on('click',function(){
    arrVersionCompared[0]--; arrVersionCompared[1]--; 
    if(arrVersionCompared[0]==0) {arrVersionCompared=[nVersion-1,nVersion];}
    var vec=[['pageCompare',{arrVersionCompared }]];   myFetch('POST',vec);  
  });
  
  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  var spanLabel=createElement('span').myText('diffDiv').css({'margin-left':'auto'}); 
  var menuA=createElement('div').myAppend(buttonBack,prevButton,nextButton,spanLabel)
  //menuA.css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});
  menuA.css({display:'flex', 'align-items':'center'});


    // divCont
  var divCont=createElement('div').addClass('contDivFix').css({width:'fit-content', 'margin-bottom':'5em'});

  var divFoot=createElement('div').myAppend(menuC,menuB,menuA).addClass('footDivFix'); 
  divFoot.css({left:'50%', transform:'translateX(-50%)', display:'block'})
  el.append(divCont, divFoot);
  el.css({ 'text-align':'center'})


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
  el.strName='paymentDiv'
  el.id=el.strName
  el.toString=function(){return el.strName;}
    // menuB
  var boPP=ppStoredButt.length!=0
  var formPP=boPP?formPPExtend(createElement('form')):'',     divPP=createElement('div').myAppend(formPP).css({'margin-top':'1em'}); //if(ppStoredButt.length==0) divPP.hide();  //'Paypal: ',
  var spanBTC=createElement('span').myAppend(strBTC).css({'font-size':'0.70em'}),    divBC=createElement('div').myAppend('฿: ',spanBTC); if(spanBTC.length==0) divBC.hide();
  var menuB=createElement('div').myAppend(divBC,divPP).css({'text-align':'center'}).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'center',margin:'1em auto'});

    // menuA
  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  var spanLabel=createElement('span').myText('Pay/Donate').css({'float':'right',margin:'0.2em 0 0 0'}); 
  spanLabel.addClass('unselectable');
  var menuA=createElement('div').myAppend(buttonBack, spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth,'text-align':'left',margin:'.3em auto .4em'});
  var cssFixed={margin:'0em 0', 'text-align':'center', position:'fixed', bottom:0, width:'100%', background:"var(--bg-color)", opacity:0.9, 'border-top':'3px solid'}

  el.fixedDiv=createElement('div').myAppend(menuB,menuA).css(cssFixed);


  el.append(el.fixedDiv);
  return el;
}



var slideShowExtend=function(el){
  el.strName='slideShow'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  var touchesOld=[];
  var getStoredTouch=function(identifier) {
    for (var i=0; i<touchesOld.length; i++) {
      if(touchesOld[i].identifier == identifier) { return touchesOld[i]; }
    }
 //debugger
    //alert(`Touch not found, touchesOld.length:${touchesOld.length}, touchesOld[0].identifier: ${touchesOld[0].identifier}, idNew:${identifier}`);
    return -1;
  }

  var handleStart=function(evt) {
    var Tou = evt.targetTouches, mode=Tou.length;
          
    //var strEvent=evt.timeStamp+' '+evt.type; if('targetTouches' in evt && evt.targetTouches.length) strEvent+=` ${evt.targetTouches.length} ${evt.targetTouches[0].identifier}`;  console.log(strEvent);
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
    //var strEvent=evt.timeStamp+' '+evt.type; if('targetTouches' in evt && evt.targetTouches.length) strEvent+=` ${evt.targetTouches.length} ${evt.targetTouches[0].identifier}`;  console.log(strEvent);
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
    if(dir==1) {var imgT=Img[0].detach(), urlT=StrImgUrl[iNext]; imgT.css({'background-image':`url("${urlT}")`}); board.append(imgT);}
    else if(dir==-1) {var imgT=Img[2].detach(), urlT=StrImgUrl[iPrev]; imgT.css({'background-image':`url("${urlT}")`}); board.prepend(imgT);}
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
      var iTmp=(iCur+i-1+nImg)%nImg, urlT=StrImgUrl[iTmp];
      var img=createElement('div').css({'background-image':`url("${urlT}")`}); //.on('click',winCaption[0].openFunc);
      Img.push(img);
    }
    Img[0].css({left:'-100%'});
    Img[2].css({left:'100%'});  
    
    Img.forEach(ele=>ele.css({width:'100%', height:'100%',  margin:'auto',position:'absolute', border:'1px solid', display:'block'}));  //,transition:'left 1s'
    Img.forEach(ele=>ele.css({'background-size':'contain', 'background-repeat':'no-repeat', 'background-position':'center', 'background-color':'#777'}));    
    board.empty().myAppend(...Img);
    document.on('keydown',arrowPressF);
    winCaption.css({width:'',left:'0px',top:window.offsetHeight/3+'px'});
    divCaptionCont.empty().myAppend(Caption[iCur].cloneNode(true));  winCaption.openFunc(); 
    
  } 
  el.addClass('unselectable').css({height:'100%',width:'100%'});
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
    var intArrowSize=20, strColor='blue', strSide=intArrowSize+'px solid '+strColor;
    var elArrowLeft=createElement('div').css({'border-right':strSide}), elArrowRight=createElement('div').css({'border-left':strSide});
    var strTopNBottom=intArrowSize+'px solid transparent'
    var cssTmp={width:'0px', height:'0px', 'border-top':strTopNBottom, 'border-bottom':strTopNBottom, opacity:0.3} //, filter:'invert(var(--invert))'
    var Arrow=[elArrowLeft, elArrowRight]; Arrow.forEach(ele=>ele.css(cssTmp));
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



/******************************************************
 * redirectTabExtend ...
 ******************************************************/

var createUrlFrPageData=function(r){var strS=Number(r.boTLS)?'s':'', url=`http${strS}://${r.www}/${r.pageName}`; return url; }
var regHttp=/^https?:\/\//;

var redirectSetPopExtend=function(el){
  el.strName='redirectSetPop'
  el.id=el.strName
  el.toString=function(){return el.strName;}
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
  el.openFunc=function(boUpdT){
    boUpd=boUpdT;
    if(this==null){rMat=extend({},rDefault);}
    else{
      var elR=this.parentNode.parentNode;
      rMat=elR.rMat;
      // rMat=extend({}, elR.rMat);  <-- Should be using this, instead of the above right?!?
    }
    //divInsOrUpd.toggle(boUpd); vippInsOrUpd.setStat(0);
    //selSite.push(inpPageName).prop('disabled',boUpd);
    doHistPush({strView:'redirectSetPop'});
    el.setVis();
    el.setUp();
  }

  el.setVis=function(){
    el.show(); return 1;
  }
 
  var rDefault={siteName:'', www:'', pageName:'', url:''};
  var boUpd, rMat; //siteTab,
  

  var labSite=createElement('label').myText('siteName');
  var selSite=createElement('select').css({display:'block'});
  var labPageName=createElement('label').myText('pageName');
  var inpPageName=createElement('input').prop({type:'text'});
  var labURL=createElement('label').myText('Redirect to (pageName or url)');
  var inpURL=createElement('input').prop({type:'text'});


  [labSite, labPageName, labURL].forEach(ele=>ele.css({'margin-right':'0.5em'}));
  [inpPageName, inpURL].forEach(ele=>ele.css({display:'block',width:'100%'}).on('keypress',  function(e){ if(e.which==13) {save();return false;}} ));
  //var inpNLab=[labSite, selSite, labPageName, inpPageName, labURL, inpURL];

  var secSite=createElement('section').myAppend(labSite, selSite);
  var secPageName=createElement('section').myAppend(labPageName, inpPageName);
  var secURL=createElement('section').myAppend(labURL, inpURL);
  var Sec=[secSite, secPageName, secURL];

  var butCancel=createElement('button').on('click', historyBack).myText("Cancel");
  var buttonSave=createElement('button').myText('Save').on('click',save);
  var divBottom=createElement('div').myAppend(butCancel, buttonSave).css({display:'flex', gap:'0.4em', 'justify-content':'space-between'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center-Flex").myAppend(...Sec, divBottom); //.css({width: 'min(95%,40em)'}); 
  centerDiv.css({display:'flex', gap:'.5em', 'flex-direction':'column', 'justify-content':'space-between', width:'min(40em,98%)'});

  el.addClass("Center-Container-Flex").myAppend(centerDiv,blanket); 
   
  return el;
}


var redirectDeletePopExtend=function(el){
  el.strName='redirectDeletePop'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  var butOK=createElement('button').myText('OK').on('click',function(){    
    var pageName=elR.attr('pageName'), idSite=elR.attr('idSite'), vec=[['redirectTabDelete',{idSite,pageName},okRet]];   myFetch('POST',vec);    
  });
  var okRet=function(data){
    if(!data.boOK) return;
    redirectTab.myRemove(elR);
    historyBack();
  }
  el.openFunc=function(){
    elR=this.parentNode.parentNode; spanPage.myText(elR.rMat.siteName+':'+elR.attr('pageName'));
    doHistPush({strView:'redirectDeletePop'});
    el.setVis();
    butOK.focus();
  }
  el.setVis=function(){
    el.show(); return 1;
  }
 
  var elR;
  var head=createElement('h3').myText('Delete').css({margin:0});
  var spanPage=createElement('span');//.css({'font-weight': 'bold'});
  var p=createElement('div').myAppend(spanPage).css({'word-break':'break-word'});

  var butCancel=createElement('button').on('click', historyBack).myText("Cancel");
  var divBottom=createElement('div').myAppend(butCancel, butOK).css({display:'flex', gap:'0.4em', 'justify-content':'space-between'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center-Flex").myAppend(head, p, divBottom);
  centerDiv.css({display:'flex', gap:'1em', 'flex-direction':'column', 'justify-content':'space-between', width:'min(20em,98%)'});

  el.addClass("Center-Container-Flex").myAppend(centerDiv,blanket); 
 
  return el; 
}

var redirectTabExtend=function(el){
  el.strName='redirectTab'
  el.id=el.strName
  el.toString=function(){return el.strName;}
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
      redirectSetPop.openFunc.call(this,1);
    });
    var buttCopy=createElement('button').attr('name','buttonCopy').myText('Copy').on('click',function(){
      redirectSetPop.openFunc.call(this,0);
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
    var elR=tBody.querySelector(`[idSite="${rMat.idSiteOld}"][pageName=${rMat.pageNameOld}]`);
    elR.attr({idSite:rMat.idSite,pageName:rMat.pageName}).prop('rMat',rMat);
    //for(var i=0;i<StrCol.length;i++) { var name=StrCol[i], val=rMat[name], td=elR.querySelector(`td:nth-of-type(${(i+1)})`); if(td.mySetVal) td.mySetVal(val, rMat); else td.myText(val); }
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
    var plurEnding=nEntry==1?'y':'ies'; setMess(`Got ${nEntry} entr${plurEnding}`,3);
    el.nRowVisible=nEntry;
  }

  var tBody=el.tBody=createElement('tbody');
  el.nRowVisible=0;
  el.table=createElement('table').myAppend(tBody).addClass('tableSticky'); //.css({width:'100%',position:'relative'});

  var StrCol=['siteName','pageName','url', 'tCreated', 'tMod', 'nAccess', 'tLastAccess'], BoAscDefault={tCreated:0};
  var Label={tCreated:'Age'};
  var trTmp=headExtendDyn(createElement('tr'), el, StrCol, BoAscDefault, Label);
  var tHead=createElement('thead').myAppend(trTmp);
  tHead.css({background:'', width:'inherit'});  //,height:'calc(12px + 1.2em)'
  el.table.prepend(tHead);

      // menuA
  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  var buttonAdd=createElement('button').myText('Add').css({}).on('click',function(){
    redirectSetPop.openFunc.call(null,0);
  });
  var buttonClearNAccess=createElement('button').myText('Clear nAccess').css({}).on('click',function(){
    var vec=[['redirectTabResetNAccess', {}, function(){ el.setUp();}]];   myFetch('POST',vec);
  });
  var spanLabel=createElement('span').myText('Redirect').css({'margin-left':'auto'}); 

  el.addClass('redirectTab');


    // divCont
  var divCont=createElement('div').myAppend(el.table).addClass('contDivFix').css({width:'fit-content'});

  var divFoot=createElement('div').myAppend(buttonBack, buttonAdd, buttonClearNAccess, spanLabel).addClass('footDivFix'); 
  divFoot.css({left:'50%', transform:'translateX(-50%)'})
  el.append(divCont, divFoot);
  el.css({ 'text-align':'center'})

  return el;
}

/**************************************************************
 * SiteTab
 **************************************************************/

app.SiteTabRow={ 
  connectStuff:function(){
    var {StrColOrder}=siteTab
    //var {TDConstructors}=this.constructor
    //var elR=createElement('tr');
    var elR=this
    for(var i=0;i<StrColOrder.length;i++) { 
      var name=StrColOrder[i], td;
      if(name in SiteTabRow.TDConstructors) { td=SiteTabRow.TDConstructors[name]();  } 
      else td=createElement('td');
      elR.append(td.attr('name',name));
    }
    var buttEdit=createElement('button').attr('name','buttonEdit').myText('Edit').on('click',function(){
      siteSetPop.openFunc.call(this,1);
    });
    var buttCopy=createElement('button').attr('name','buttonCopy').myText('Copy').on('click',function(){
      siteSetPop.openFunc.call(this,0);
    });
    var buttDelete=createElement('button').attr('name','buttonDelete').css({'margin-right':'0.2em'}).myAppend(charDelete).on('click',siteDeletePop.openFunc);
    var tEdit=createElement('td').myAppend(buttEdit), tCopy=createElement('td').myAppend(buttCopy), tDelete=createElement('td').myAppend(buttDelete); 
    elR.append(tEdit, tCopy, tDelete);
    return elR;
  },
  mySet:function(objRow){
    var {StrColOrder}=siteTab
    var elR=this;
    elR.attr({idSite:objRow.idSite}).prop('objRow',objRow)
    for(var i=0;i<StrColOrder.length;i++) { 
      var name=StrColOrder[i], val=objRow[name]; //, td=this.children.item(i)
      var td=this.querySelector(`td[name=${name}]`);
      if('mySetVal' in td) { td.mySetVal(val);}   else td.myText(val);
      if('mySetSortVal' in td) { td.mySetSortVal(val);}   else td.valSort=val;
    }
  },
  setDefaultClick:function(){ // "this" will be refering to the clicked button (see below)
    var td=this.parentNode, elR=td.parentNode;
    //var elR=this;
    siteTab.clearDefault()
    td.mySetVal(true)
    var vec=[['siteTabSetDefault',{idSite:elR.objRow.idSite},function(){
      console.log('todo: siteTabSetDefault-cb: check for error');
      td.mySetVal(true);
    }]];   myFetch('POST',vec);
  },
  TDProt:{
    boDefault:{
      mySetVal:function(boOn){  var td=this, b=td.firstChild, strCol=boOn?'green':''; b.css('background',strCol);  }
    },
    boTLS:{
      mySetVal:function(boOn){  this.myHtml(boOn?'s':'<s>s</s>');  }
    },
    www:{
      mySetVal:function(strText){
        var td=this, strS=Number(td.parentNode.objRow.boTLS)?'s':'', a=td.firstChild.prop('href',`http${strS}://${strText}`).myText(strText);
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
  },
  TDConstructors:{
    boDefault:function(){ 
      var b=createElement('button').css('width','1.2em').on('click',SiteTabRow.setDefaultClick);
      var el=createElement('td').css('text-align','center').myAppend(b);  extend(el,SiteTabRow.TDProt.boDefault);  return el;
    },
    boTLS:function(){ var el=createElement('td'); extend(el,SiteTabRow.TDProt.boTLS);  return el;  },
    www:function(){ var a=createElement('a').prop({target:"_blank", rel:"noopener"}),  el=createElement('td').myAppend(a);  extend(el,SiteTabRow.TDProt.www);  return el;  },
    tCreated:function(){ var el=createElement('td');  extend(el,SiteTabRow.TDProt.tCreated);  return el;  },
    srcIcon16:function(){ var im=createElement('img').prop({alt:"iconProt"}).css({'vertical-align':'middle'}), el=createElement('td').myAppend(im); extend(el,SiteTabRow.TDProt.srcIcon16);  return el;  },
    //strLangSite:function(){ var im=createElement('img').prop({alt:"icon200"}).css({'vertical-align':'middle', 'max-width':'50px', 'max-height':'50px'}), el=createElement('td').myAppend(im); extend(el,SiteTabRow.TDProt.strLangSite);  return el;  }
  }
}


var siteSetPopExtend=function(el){
  el.strName='siteSetPop'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  var save=function(){
    var idSiteOld=objRow.idSite;
    objRow.boTLS=Number(selBoTLS.value);
    objRow.idSite=inpName.value; if(objRow.idSite.length==0){ setMess('empty name',2);  return;}
    objRow.www=inpWWW.value;  if(objRow.www.length==0){ setMess('empty www',2);  return;}
    objRow.googleAnalyticsTrackingID=inpGog.value;
    objRow.srcIcon16=inpSrcIcon16.value;
    objRow.strLangSite=inpStrLangSite.value; //if(objRow.strLangSite.length!=2){ setMess('strLangSite should be two characters',2);  return;}
    objRow.idSiteOld=idSiteOld
    var objTmp=extend({},objRow);
    //objTmp.idSiteOld=idSiteOld
    //var vec=[['siteTabSet', objTmp, saveRet]];   myFetch('POST',vec);
    if(boUpd){  var vec=[['siteTabUpd', objTmp, saveRet]];   myFetch('POST',vec); }
    else { var vec=[['siteTabInsert', objTmp, saveRet]];   myFetch('POST',vec); }
  }
  var saveRet=function(data){
    if(!data.boOK) return;
    if(boUpd) { siteTab.myEdit(objRow.idSiteOld, objRow); }
    else {
      copySome(objRow, data.objSite, ['tCreated']);   objRow.nPage=0;
      var [elR]=siteTab.reserveRows();
      SiteTabRow.mySet.call(elR, objRow);
    }    
    //siteTab.setUp();
    historyBack();
  }
  el.setUp=function(){
    if(typeof objRow.boTLS=='undefined') objRow.boTLS=1;
    selBoTLS.value=Number(objRow.boTLS); inpName.value=objRow.idSite; inpWWW.value=objRow.www; inpGog.value=objRow.googleAnalyticsTrackingID; inpSrcIcon16.value=objRow.srcIcon16; inpStrLangSite.value=objRow.strLangSite;
    inpName.focus();  return true;
  }
  el.openFunc=function(boUpdT){
    boUpd=boUpdT;
    if(this==null){objRow=extend({},rDefault);}
    else{
      var elR=this.parentNode.parentNode;  objRow=extend({},elR.objRow);
    } 
    if(!boUpd) objRow.boDefault=0;
    doHistPush({strView:'siteSetPop'});
    el.setVis();
    el.setUp();
  }
  el.setVis=function(){
    el.show(); return 1;
  }
 
  var rDefault={idSite:'', www:'', googleAnalyticsTrackingID:'', srcIcon16:'', strLangSite:''};
  var boUpd, objRow; 
  var opt=createElement('option').prop({value:0}).css({display:'block'}).myText('http'); 
  var optS=createElement('option').prop({value:1}).css({display:'block'}).myText('https'); //, selected:true
  var selBoTLS=createElement('select').css({display:'block'}).myAppend(opt,optS);
  var labName=createElement('label').myText('Name (used as prefix when backing up etc.)');
  var inpName=createElement('input').prop('type', 'text');
  var imgHWWW=imgHelp.cloneNode(1).css({margin:'0em 1em'}); popupHover(imgHWWW,createElement('div').myHtml('<p>Ex:<p>www.example.com<p>127.0.0.1:5000<p>localhost:5000'));
  var labWWW=createElement('label').myAppend('www (domain)', imgHWWW);
  var inpWWW=createElement('input').prop('type', 'text');
  var labGog=createElement('label').myText('googleAnalyticsTrackingID').css({wordBreak:'break-word'});
  var inpGog=createElement('input').prop('type', 'text');
  var imgSrcIcon16=imgHelp.cloneNode(1).css({margin:'0em 1em'}); popupHover(imgSrcIcon16,createElement('div').myHtml('<p>srcIcon16<p>Note!!! The source/url must have "16" right before the period. Ex:<br>Site/Icon/icon16.png<p>("16" will be replaced with 144, 192, 200, 512 and 1024 respectivly, to provide high resolution icons.)'));  //<p>Make sure the corresponding files exist in the selected location.
  //'<p>srcIcon16<p>The source/url must have the "16" right before the period. Ex:<br>Site/Icon/icon16.png<p>("16" will be replaced with 144, 192, 200, 512 and 1024 respectivly, to provide high resolution icons.)'
  var labSrcIcon16=createElement('label').myAppend('srcIcon16', imgSrcIcon16);
  var inpSrcIcon16=createElement('input').prop('type', 'text').attr({pattern:"16"});
  var imgStrLangSite=imgHelp.cloneNode(1).css({margin:'0em 1em'}); popupHover(imgStrLangSite,createElement('div').myHtml('ISO 639-1 Language Code (used by search engines)'));
  var labStrLangSite=createElement('label').myAppend('strLangSite', imgStrLangSite);
  var intL=11, inpStrLangSite=createElement('input').prop({type:'text'}).attr({maxlength:intL, title:'ISO 639-1 Language Code', size:intL}).css({display:'block'});
 
  [labName, labWWW, labGog, labSrcIcon16, labStrLangSite].forEach(ele=>ele.css({'margin-right':'0.5em'}));
  [inpName, inpWWW, inpGog, inpSrcIcon16].forEach(ele=>ele.css({display:'block',width:'100%'}).on('keypress',  function(e){ if(e.which==13) {save();return false;}} ));
  //var inpNLab=[selBoTLS, labName, inpName, labWWW, inpWWW, labGog, inpGog, labSrcIcon16, inpSrcIcon16, labStrLangSite, inpStrLangSite];


  var secBoTLS=createElement('section').myAppend(selBoTLS);
  var secName=createElement('section').myAppend(labName, inpName);
  var secWWW=createElement('section').myAppend(labWWW, inpWWW);
  var secGog=createElement('section').myAppend(labGog, inpGog);
  var secSrcIcon16=createElement('section').myAppend(labSrcIcon16, inpSrcIcon16);
  var secStrLangSite=createElement('section').myAppend(labStrLangSite, inpStrLangSite);
  var Sec=[secBoTLS, secName, secWWW, secGog, secSrcIcon16, secStrLangSite, secStrLangSite]

  var butCancel=createElement('button').on('click', historyBack).myText("Cancel");
  var buttonSave=createElement('button').myText('Save').on('click',save);
  var divBottom=createElement('div').myAppend(butCancel, buttonSave).css({display:'flex', gap:'0.4em', 'justify-content':'space-between'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center-Flex").myAppend(...Sec, divBottom); //.css({width: 'min(95%,40em)'}); 
  centerDiv.css({display:'flex', gap:'.5em', 'flex-direction':'column', 'justify-content':'space-between', width:'min(40em,98%)'});

  el.addClass("Center-Container-Flex").myAppend(centerDiv,blanket); 
   
  return el;
}

var siteDeletePopExtend=function(el){
  el.strName='siteDeletePop'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  var butOK=createElement('button').myText('OK').on('click',function(){    
    var vec=[['siteTabDelete',{idSite},okRet]];   myFetch('POST',vec);    
  });
  var okRet=function(data){
    if(!data.boOK) return;
    siteTab.myRemove(elR);
    historyBack();
  }
  el.openFunc=function(){
    elR=this.parentNode.parentNode; idSite=elR.objRow.idSite; spanSite.myText(idSite);
    doHistPush({strView:'siteDeletePop'});
    el.setVis();
    butOK.focus();
  }
  el.setVis=function(){
    el.show(); return 1;
  }
 
  var elR, idSite;
  var head=createElement('h3').myText('Delete').css({margin:0});
  var spanSite=createElement('span');//.css({'font-weight': 'bold'});
  var p=createElement('div').myAppend(spanSite).css({'word-break':'break-word'});
  var butCancel=createElement('button').on('click', historyBack).myText("Cancel");
  var divBottom=createElement('div').myAppend(butCancel, butOK).css({display:'flex', gap:'0.4em', 'justify-content':'space-between'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center-Flex").myAppend(head, p, divBottom);
  centerDiv.css({display:'flex', gap:'1em', 'flex-direction':'column', 'justify-content':'space-between', width:'min(10em,98%)'});

  el.addClass("Center-Container-Flex").myAppend(centerDiv,blanket); 
 
  return el;
}



var siteTabExtend=function(el){
  el.strName='siteTab'
  el.id=el.strName
  el.toString=function(){return el.strName;}
  el.myRemove=function(elR){
    elR.remove();
    RowCache.push(elR)
    //el.nRowVisible=tBody.childElementCount
    return el; 
  }
  el.myEdit=function(idSiteOld, objRow){
    var elR=tBody.querySelector(`[idSite="${idSiteOld}"]`);
    SiteTabRow.mySet.call(elR, objRow);
    return el;
  }
  el.reserveRows=function(n=1){
    var Rows=Array(n)
    for(var i=0; i<n;i++){
      var elR
      if(RowCache.length) {elR=RowCache.pop();}
      else { 
        // var elR=document.createElement('tr', { is: "site-tab-row" });
        // elR.connectStuff(el);
        var elR=document.createElement('tr'); 
        SiteTabRow.connectStuff.call(elR)
      } 
      tBody.append(elR); Rows[i]=elR;
    }
    return Rows
  }
  el.setUp=async function(){
    if(el.boUpToDate) return;
    var vec=[['siteTabGet',{}]];   var [err,dataArr]=await myFetch('POST',vec,1); if(err){setMess(err); return;}  
    var data=dataArr[0][0];
    if(!data.boOK) return;
    tabNStrCol2ArrObjGC(data, ObjSite);
    //StrCol=data.StrCol;
    el.boUpToDate=1;
    
    //tBody.empty(); 
    var nOld=tBody.childElementCount, nNew=ObjSite.length;
    if(nOld<nNew) el.reserveRows(nNew-nOld);
    else if(nOld>nNew){
      var Row=[...tBody.children];
      for(var i=nNew; i<nOld;i++){
        var elR=Row[i]; elR.remove(); RowCache.push(elR)
      }
    }
    var Row=[...tBody.children];
    el.indexSiteTabById={};
    for(var i=0;i<nNew;i++) {  
      var objSiteT=ObjSite[i], elR=Row[i]
      //elR.mySet(objSiteT);
      SiteTabRow.mySet.call(elR, objSiteT);
      el.indexSiteTabById[objSiteT.idSite]=objSiteT;
    }
    //el.nRowVisible=nNew
  }
  el.clearDefault=function(){
    var Row=[...tBody.children];
    Row.forEach(function(rowA){
      var td=rowA.querySelector('[name=boDefault]'); td.mySetVal(false);
    })
  }
  //el.boRefreshNeeded; // The parent view of this view (siteTab) should set this to 1
  var ObjSite=el.ObjSite=[];
  //var StrCol;
  el.boUpToDate=0;

  var RowCache=[];
  var tBody=el.tBody=createElement('tbody');
  el.table=createElement('table').myAppend(tBody).addClass('tableSticky'); //.css({width:'100%',position:'relative'});

  el.StrColOrder=['boDefault','boTLS', 'idSite','www','googleAnalyticsTrackingID','srcIcon16','strLangSite','tCreated','nPage'];

  var BoAscDefault={boDefault:0,boTLS:0,tCreated:0,nPage:0};
  var Label={boDefault:'Default',idSite:'name/key', gog:'gog...', tCreated:'Age', nPage:'#page', boTLS: 'secure (TLS)'};
  //el.nRowVisible=undefined;
  var trTmp=headExtendDyn(createElement('tr'), el, el.StrColOrder, BoAscDefault, Label);
  var tHead=createElement('thead').myAppend(trTmp);
  tHead.css({background:'', width:'inherit'});  //,height:'calc(12px + 1.2em)'
  el.table.prepend(tHead);


      // menuA
  var buttonBack=createElement('button').on('click', historyBack).myText(charBack).css({'margin-left':'.8em'});
  var buttonAdd=createElement('button').myText('Add').css({}).on('click',function(){
    siteSetPop.openFunc.call(null,0);
  });
  var spanLabel=createElement('span').myText('SiteTab').css({'margin-left':'auto'});

  el.addClass('siteTab');


    // divCont
  var divCont=createElement('div').myAppend(el.table).addClass('contDivFix').css({width:'fit-content'});

  var divFoot=createElement('div').myAppend(buttonBack, buttonAdd, spanLabel).addClass('footDivFix'); 
  divFoot.css({left:'50%', transform:'translateX(-50%)'})
  el.append(divCont, divFoot);
  el.css({ 'text-align':'center'})

  return el;
}



/***************************************************
 * myFetch, beRet, GRet
 ***************************************************/

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
    pageView.adminDivFixed.setUpButtons(boAWLoggedIn);
  }
  //tmp=data.idPage;   if(typeof tmp!="undefined") { objPage.idPage=tmp;  }
  //tmp=data.objRev;   if(typeof tmp!="undefined") { objRev=tmp; }
  tmp=data.objPage;   if(typeof tmp!="undefined") {
    //objPage.idPage=objPage._id; delete objPage._id;
    overwriteProperties(objPage, tmp);
    //objPage=tmp; 
    pageView.editDivFixed.objWSaveElements.myToggle(Boolean(objPage.boOW));
    adminMoreDiv.setMod();
    templateList.setUp(objPage.IdChildLax, objPage.IdChild);
  }
  tmp=data.objSetting;   if(typeof tmp!="undefined") { app.objSetting=tmp; adminMoreDiv.setBUNeededInfo();  }

  pageView.pageDivFixed.setUp();

  copyIfExist(app, data, ['arrVersionCompared']);

  tmp=data.matVersion;   if(typeof tmp!='undefined') {  
    matVersion=tabNStrCol2ArrObj(tmp); app.nVersion=matVersion.length; versionTable.setTable();
    pageView.setVersioninfo();
    //pageView.pageDivFixed.setVersioninfo(); warningDiv.toggle(matVersion.length>1);
  }
  
  tmp=data.strDiffText;   if(typeof tmp!="undefined") {diffDiv.setUp(tmp);  }  
  tmp=data.strHtmlText;   if(typeof tmp!="undefined") {pageText.myHtml(tmp); pageText.modStuff();}
  tmp=data.strEditText;   if(typeof tmp!="undefined") editText.value=tmp;
  //tmp=data.templateHtml;   if(typeof tmp!="undefined") templateList.empty().append(tmp);
  //tmp=data.strMessageText;   if(typeof tmp!="undefined") setMess(tmp,15);
  tmp=data.strMessageText;   if(typeof tmp!="undefined") {setMess(tmp,15); if(/error/i.test(tmp)) navigator.vibrate(100);}
  tmp=data.boTalkExist;   if(typeof tmp!="undefined") pageView.pageDivFixed.commentButton.setUp(tmp);
  //tmp=data.strMessageText;   if(typeof tmp!="undefined") setMess(tmp,5);
  //tmp=data.CSRFCode;   if(typeof tmp!="undefined") CSRFCode=tmp;
  if('CSRFCode' in data) setItem('CSRFCode',data.CSRFCode);
  //if(!(boARLoggedIn || objPage.boOR)) aRLoginDiv.setVis();  
  //if(!objPage.boOR && (boARLoggedIn==undefined || boARLoggedIn==0)) aRLoginDiv.setVis();  
  if(!objPage.boOR && boARLoggedIn==0) aRLoginDiv.setVis();  


  // if(boARLoggedIn!=undefined ){
  //   var boT=!objPage.boOR && boARLoggedIn; pageView.pageDivFixed.butARLogout.toggle(boT);
  // }
  var boT=!objPage.boOR && boARLoggedIn;   pageView.pageDivFixed.butARLogout.toggle(boT);

  if(boAWLoggedIn){ //boAWLoggedIn!=undefined && 
    if(timerALogout) { clearTimeout(timerALogout); }
    timerALogout=setTimeout(function(){
      boAWLoggedIn=0; //histGoTo('adminDiv');
      pageView.adminDivFixed.setUpButtons(boAWLoggedIn);
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
  Login:'Log­in',
  Orphans:'Or­ph­ans',
  orphans:'or­ph­ans',
  roots:'roo­ts',
  ShowPreview:'Show pre­view',
  TemplateList:'Tem­p­la­te list',
  Save:'Sa­ve'
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
langHtml.orphansInParenthesis=`(${langHtml.orphans})`
var helpBub={}


window.elHtml=document.documentElement; window.elBody=document.body;
//window.elViewport=document.querySelector('head>meta[name=viewport]');
window.boTouch = Boolean('ontouchstart' in document.documentElement);
//boTouch=1;

//var boLCacheObs=document.querySelector('#boLCacheObs'); if(boLCacheObs.value.length) { boLCacheObs.value=""; location.reload(); return} //boLCacheObs.value=1;




var ua=navigator.userAgent, uaLC = ua.toLowerCase(); //alert(ua);
app.boAndroid = uaLC.indexOf("android") > -1;
app.boFF = uaLC.indexOf("firefox") > -1; 

app.boChrome= /chrome/.test(uaLC);
app.boIOS= /iphone|ipad|ipod/.test(uaLC);
app.boEpiphany=/epiphany/.test(uaLC);    if(boEpiphany && !boAndroid) boTouch=false;  // Ugly workaround (epiphany=GNOME Web)

app.boOpera=RegExp('OPR\\/').test(ua); if(boOpera) boChrome=false; //alert(ua);



var boSmallAndroid=0;


var strMenuOpenEvent=boTouch?'click':'mousedown';


var charBack='◄';
var strFastBackSymbol=charBack+charBack;
var charFlash='↯';//⚡↯
var charPublicRead='<span style="font-family:courier">͡°</span>'; //☉͡°
var charPublicRead='<span class=eye>(∘)</span>'; //☉͡° ·
var charPublicRead=boIOS?'📖':'🕮' //🕮👁; //📖; //👀😶☉͡° · 📖📖
var charPublicRead='👁' //🕮👁; //📖; //👀😶☉͡° · 📖📖
var charPublicWrite='⌨'; // ✎🔏 🔒 🔓 🔐  🖊 🖋✏✎✐🖉
var charPromote='🗣️'; //'📣';  //😗😱😮
var charDelete='✖'; //x, ❌, X, ✕, ☓, ✖, ✗, ✘
var charClose='✖';
var charLink='🌍'; //🔗☞🔗
var charThumbsUp='👍'; //👍☝
var charThumbsDown='👎'; //👎☟
var charSpeechBaloon='🗪'; //💬🗨
var charCamera='📷';
var charHourGlass='⏳';
var charAdmin='😎'   // 🂡♛♕♚♔⚖
var charPrev='⇦' //'⇩'
var charNext='⇨' //'⇧'
var charQuestionMark='❓'
var charHamburger='☰'
var charBlackWhite='◩'
// charPhone ✆☎☏📱🌍👨‍🔬💻💡👷🏢👨‍💼

// ♿⚠⌂💰💋♥ 👪

//cssEye={'font-family':'courier', 'font-size':'90%', 'letter-spacing':'-.5em', transform:'rotate(90deg)', display:'inline-block','vertical-align':'.4em'}

//boHistPushOK='pushState' in history && 'state' in history;
var boHistPushOK='pushState' in history;
if(!boHistPushOK) { console.log('This browser does not support history'); return;}
var boStateInHistory='state' in history;
if(!boStateInHistory) { console.log('This browser does not support history.state'); return;}


var boFormDataOK=1;  if(typeof FormData=='undefined') {  boFormDataOK=0;  }

if(!(typeof sessionStorage=='object' && sessionStorage.getItem)) {console.log("This browser doesn't support sessionStorage"); return;}

//var menuMaxWidth=500;
var menuMaxWidth="var(--menuMaxWidth)";


var urlPayPal='https://www.paypal.com/cgi-bin/webscr';


var sizeIcon=1.5, strSizeIcon=sizeIcon+'em';

indexAssign();
setItem('CSRFCode',CSRFCode);

assignCommonJS();
//extend(window,{boARLoggedIn:0, boAWLoggedIn:0});

var StrOrderFiltPageFlip=array_flip(StrOrderFiltPage);
var StrOrderFiltImageFlip=array_flip(StrOrderFiltImage);

matVersion=tabNStrCol2ArrObj(matVersion);  app.nVersion=matVersion.length;


var strScheme='http'+(objSite.boTLS?'s':''),    strSchemeLong=strScheme+'://',    uSite=strSchemeLong+objSite.www;
var strScheme='http'+(objSiteDefault.boTLS?'s':''),    strSchemeLong=strScheme+'://',       uSiteCommon=strSchemeLong+objSiteDefault.www;
var uBE=uSite+"/"+leafBE;
var uCanonical=uSite+'/'+objPage.pageName;
if(objPage.pageName=='start') uCanonical=uSite;



var wcseLibImageFolder=`/${flLibImageFolder}/`;
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
// var uIncreasing=uLibImageFolder+'increasing.svg';
// var uDecreasing=uLibImageFolder+'decreasing.svg';
// var uUnsorted=uLibImageFolder+'unsorted.svg';
var uIncreasing=uLibImageFolder+'blackTriangleUp.png';
var uDecreasing=uLibImageFolder+'blackTriangleDown.png';
var uUnsorted=uLibImageFolder+'blackTriangleUpDown.png';

//uAnon=uLibImageFolder+'anon.png';
//uHeart=uLibImageFolder+'heart20.png';
//uOpenId=uLibImageFolder+'openid-inputicon.gif';
//uOID22=uLibImageFolder+'oid22.png';
var uBusy=uLibImageFolder+'busy.gif';
var uBusyLarge=uLibImageFolder+'busyLarge.gif';
var uSummary=uLibImageFolder+'summary.png';
var uSignature=uLibImageFolder+'signature.png';

var uPen=uLibImageFolder+'pen.png';
var srcsetPen=`${uPen} 1x, ${uPen} 2x `;
var uPenNot=uLibImageFolder+'penNot.png';
var srcsetPenNot=`${uPenNot} 1x, ${uPenNot} 2x `;
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


app.hovHelpMy=createElement('span').myText(charQuestionMark).addClass('btn-round', 'helpButton').css({color:'transparent', 'text-shadow':'0 0 0 #5780a8'}); //on('click', function(){return false;})    //'pointer-events':'none',
app.imgHelp=hovHelpMy;

var sizeIcon=1.5, strSizeIcon=sizeIcon+'em';
var imgProt=createElement('img').css({height:strSizeIcon,width:strSizeIcon,'vertical-align':'text-bottom'}); 

var imgFilter=createElement('img').prop({src:uFilter, alt:"filter", draggable:false}).css({height:'1em',width:'1em','vertical-align':'text-bottom'}).addClass('invertOnDark'); 



  //
  // History
  //


// strView is stored in two places:
//   history.state: since I want to write scrollTop only when strView is strViewOrg.
//   history.StateOpen: since one want to able to fast-backward, and thus one want to be able to search history.StateOpen for a certain value of strView.

// When pageView is popped, scrollTop is not set (Even though it maybe should if things were to be consistent.) That is funPopped is called but the intDoScroll is not acted on.

// Safari (private): prev > cur(scroll 7) > cur(scroll 35) > bwd(scroll 35) > bwd(to prev) > fwd(scroll 7)            (public works ok)
// Chrome, Android+Desktop (public): prev > cur(scroll 7) > cur(scroll 35) > next > bwd(to cur (no rerun))            (private works ok)


app.histGoTo=function(view){}
app.historyBack=function(){  history.back();}
app.doHistPush=function(obj){
  var stateT=history.state
  var {strView, arg=null}=obj;
  var scroll=(strView==stateT.strView)?stateT.scroll:0;

  var indNew=stateT.ind+1;
  stateMem={hash:stateT.hash, ind:indNew, strView, scroll, arg, f:(function(a){console.log('hello: '+a);}).toString()};
  history.pushState(stateMem, strHistTitle, uCanonical);
  history.StateOpen=history.StateOpen.slice(0, indNew);
  history.StateOpen[indNew]=obj;
}
app.doHistReplace=function(obj, indDiff=0){
  if(indDiff==0){
    copySome(stateMem, obj, ['strView']);
    history.pushState(stateMem, strHistTitle, uCanonical);
  }
  history.StateOpen[history.state.ind+indDiff]=obj;
}
app.changeHist=function(obj){
  doHistReplace(obj, 0)
}
app.getHistStatName=function(){
  return history.StateOpen[history.state.ind].strView;
}
history.distToGoal=function(strViewGoal){
  var ind=history.state.ind;
  var indGoal;
  for(var i=ind; i>=0; i--){
    var obj=history.StateOpen[i];
    var strView; if(typeof obj=='object') strView=obj.strView; else continue;
    if(strView===strViewGoal) {indGoal=i; break;}
  }
  var dist; if(typeof indGoal!='undefined') dist=indGoal-ind;
  return dist;
}
history.fastBack=function(strViewGoal, boRefreshHash){
  var dist=history.distToGoal(strViewGoal);
  if(dist) {
    if(typeof boRefreshHash!='undefined') history.boResetHashCurrent=boRefreshHash;
    history.go(dist);
  }
}


var strViewOrg='pageView';
var strHistTitle=objPage.pageName;
//history.scrollRestoration = 'manual';
//history.scrollRestoration = 'auto';
var stateRun=history.state;
var stateMem={hash:randomHash(), ind:0, strView:strViewOrg, scroll:0}
if(stateRun){
  let {strView, ind, scroll}=stateRun;
  if(strView!=strViewOrg)  scroll=0;
  extend(stateMem, {ind, scroll});
}
history.replaceState(stateMem, '', uCanonical);  // ind, hash, strView, scroll
history.StateOpen=[];
history.StateOpen[history.state.ind]=copySome({arg:"page"}, stateMem, ['strView','scroll']);    //  strView, scroll, arg



window.on('popstate', function(event) {
  var stateT=history.state;
  var dir=stateT.ind-stateMem.ind;
  //if(Math.abs(dir)>1) {debugger; alert('dir=',dir); }
  var boSameHash=stateT.hash==stateMem.hash;
  if(boSameHash){
    if('boResetHashCurrent' in history && history.boResetHashCurrent) {
      stateT.hash=randomHash();
      history.replaceState(stateT, '', uCanonical);
      history.boResetHashCurrent=false;
    }

    var scroll=(stateMem.strView==stateT.strView && stateT.strView==strViewOrg)?stateMem.scroll:stateT.scroll;
    stateT.scroll=scroll
    stateMem=copyDeep(stateT);
    history.replaceState(stateMem, '', uCanonical);
    var stateOpen=history.StateOpen[stateT.ind]
    stateOpen.scroll=scroll
    setMyState(stateOpen);
  }else{
    if(stateMem.strView!=strViewOrg) stateMem.scroll=0
    extend(stateMem, {hash:randomHash(), strView:strViewOrg, arg:"page"});
    copySome(stateMem, stateT, ["ind"]);
    history.replaceState(stateMem, '', uCanonical);
    history.StateOpen[stateT.ind]={strView:strViewOrg, scroll:stateMem.scroll};
    history.go(sign(dir));
  }
});

var setMyState=function(state){
  var view=MainDiv[StrMainDivFlip[state.strView]];
  view.setVis();
  if(history.funOverRule) {history.funOverRule(); history.funOverRule=null;}
  else{ view.funPopped?.(state); }
}

window.on('pagehide', function(){ 
  var stateT=history.state, stateOpen=history.StateOpen[stateT.ind];
  var {strView, scroll}=stateOpen;
  if(strView!=strViewOrg) scroll=0;
  extend(stateT, {strView:strViewOrg, scroll});
  history.replaceState(stateT, '', uCanonical);
});

if(boFF){ window.on('beforeunload', function(){   }); }

if(!boTouch){
  window.on('beforeunload',function(){
    var h=editText.style.height.slice(0,-2);
    setItem('hEditText',h); 
  })
}


var errorFunc=function(jqXHR, textStatus, errorThrown){
  setMess(`responseText: ${jqXHR.responseText}, textStatus: ${textStatus}, errorThrown: ${errorThrown}`);     throw 'bla';
}



var pageText=document.querySelector('#pageText'); pageTextExtend(pageText);   pageText.modStuff(); pageText.css({display:'flow-root'})
var imgBusy=createElement('img').prop({src:uBusy, alt:"busy"});
//messageText=messExtend(createElement('span'));  window.setMess=messageText.setMess;  window.resetMess=messageText.resetMess;   elBody.append(messageText); 
//var spanMessageText=spanMessageTextCreate();  window.setMess=spanMessageText.setMess;  window.setMessHtml=spanMessageText.setHtml;  window.resetMess=spanMessageText.resetMess;  window.appendMess=spanMessageText.appendMess;  elBody.append(spanMessageText)


var divMessageText=divMessageTextCreate();  copySome(window, divMessageText, ['setMess', 'resetMess', 'appendMess']);
var divMessageTextW=createElement('div').myAppend(divMessageText).css({width:'100%', position:'fixed', bottom:'0px', left:'0px', 'z-index':'10'});
elBody.append(divMessageTextW);

var busyLarge=createElement('img').prop({src:uBusyLarge, alt:"busy"}).css({position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', 'z-index':'1000', border:'solid 1px'}).addClass('invertOnDark').hide();
elBody.append(busyLarge);
//loginInfo=loginInfoExtend(createElement('div')); elBody.prepend(loginInfo);



//versionButton=createElement('button').myText('Versions');



var editText=editTextExtend(createElement('textarea')).css({'font-family':'monospace'});

var funStartHeight=function(){ return editText.offsetHeight }
var funDragHR=function(hNew){
  editText.css('height', hNew+'px');
}
var dragHR=dragHRExtend(createElement('hr'), funStartHeight, funDragHR); dragHR.css({height:'0.3em',background:'grey',margin:0});
if(boTouch) dragHR="";
 
//var pageView=pageViewExtend(createElement('div'));
var pageView=document.querySelector('#pageView'); pageViewExtend(pageView); pageView.css({height:'100%', overflow:'auto'})
//var editDiv=editDivExtend(createElement('div')).css({width:'100%'}); 
var templateList=createElement('template-list').addClass('viewDivFix').connectStuff()


//var adminDiv=adminDivExtend(createElement('div')).css({width:'100%'});  

var adminMoreDiv=createElement('admin-more').addClass('viewDivFix').connectStuff()
var uploadUserDiv=uploadUserDivExtend(createElement('div')); //elBody.append(uploadUserDiv);

var menuPageSingle=menuPageSingleExtend(createElement('div'));
var parentSelPop=parentSelPopExtend(createElement('div'));
//var divRowParent=new DivRowParentT();
var divRowParent=createElement('div-row-parent').connectStuff();
var pageList=pageListExtend(createElement('div')).addClass('viewDivFix');
var imageList=imageListExtend(createElement('div')).addClass('viewDivFix');
var renamePop=renamePopExtend(createElement('div'));
var setStrLangPop=setStrLangPopExtend(createElement('div'));
var setSiteOfPagePop=setSiteOfPagePopExtend(createElement('div'));
var areYouSurePop=areYouSurePopExtend(createElement('div'));
var boDialog=false
var themePop=themePopExtend(createElement('div'));



var paymentDiv=paymentDivExtend(createElement('div'));
var settingDiv=settingDivExtend(createElement('div'));


    //filter colors
//var colButtAllOn='#9f9', colButtOn='#0f0', colButtOff='#ddd', colFiltOn='#bfb', colFiltOff='#ddd', colFontOn='#000', colFontOff='#777', colActive='#65c1ff', colStapleOn='#f70', colStapleOff='#bbb';  
//var maxStaple=20;
var objFilterSetting={colButtAllOn:'#9f9', colButtOn:'#0f0', colButtOff:'#ddd', colFiltOn:'#bfb', colFiltOff:'#ddd', colFontOn:'#000', colFontOff:'#777', colActive:'#65c1ff', colStapleOn:'#f70', colStapleOff:'#bbb', maxStaple:20, colBg:'var(--bg-color)'};  

extend(Filt.tmpPrototype,MmmWikiFiltExtention); // Monkey patching Filt
var pageFilterDiv=PageFilterDiv(PropPage, langHtml.label, StrOrderFiltPage, function(){ pageList.histReplace(-1); pageList.loadTab();}); 
var imageFilterDiv=ImageFilterDiv(PropImage, langHtml.label, StrOrderFiltImage, function(){ imageList.histReplace(-1); imageList.loadTab();});  
pageFilterDiv.addClass('viewDivFix');
imageFilterDiv.addClass('viewDivFix');


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

pageFilterDiv.Filt.iParent=StrOrderFiltPageFlip.parent  // Monkey patching Filt
imageFilterDiv.Filt.iParent=StrOrderFiltImageFlip.parent  // Monkey patching Filt



//editorLoginDiv=loginDivExtend(createElement('div'),'editor');
var aRLoginDiv=aRLoginDivExtend(createElement('div'));


var versionTable=versionTableExtend(createElement('div')).addClass('viewDivFix');   versionTable.setTable();
pageView.setVersioninfo();
//pageView.pageDivFixed.setVersioninfo(); warningDiv.toggle(matVersion.length>1);

var diffDiv=diffDivExtend(createElement('div')).addClass('viewDivFix');

var slideShow=slideShowExtend(createElement('div'));

var redirectSetPop=redirectSetPopExtend(createElement('div'));
var redirectDeletePop=redirectDeletePopExtend(createElement('div'));
var redirectTab=redirectTabExtend(createElement('div')).addClass('viewDivFix');
var siteSetPop=siteSetPopExtend(createElement('div'));
var siteDeletePop=siteDeletePopExtend(createElement('div'));
var siteTab=siteTabExtend(createElement('div')).addClass('viewDivFix');

var diffBackUpDiv=diffBackUpDivExtend(createElement('div')).addClass('viewDivFix');
var diffBackUpDetailDiv=diffBackUpDetailDivExtend(createElement('div')).addClass('viewDivFix');



var MainDivFull=[pageView, adminMoreDiv, pageList, imageList, templateList, versionTable, diffDiv, paymentDiv, settingDiv, slideShow, pageFilterDiv, imageFilterDiv, redirectTab, siteTab, diffBackUpDiv, diffBackUpDetailDiv];// 
var MainDivPop=[aRLoginDiv, uploadUserDiv, renamePop, setStrLangPop, setSiteOfPagePop, parentSelPop, areYouSurePop, redirectSetPop, redirectDeletePop, siteSetPop, siteDeletePop, themePop]
var MainDiv=[].concat(MainDivFull, MainDivPop)

var StrMainDiv=MainDiv.map(obj=>obj.toString());
var StrMainDivFlip=array_flip(StrMainDiv);


var MainNonDefault=AMinusB(MainDiv, [pageView]); MainNonDefault.forEach(ele=>ele.hide());
//MainDiv.forEach(ele=>ele.hide());
elBody.append(...MainNonDefault);
//elBody.prepend(warningDivW);

var intMarginBottom=70;

aRLoginDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.aRPass.focus();
  return true;
}
pageView.setVis=function(arg){
  MainDiv.forEach(ele=>ele.hide()); [this].forEach(ele=>ele.show());  //warningDivW
  [this.pageDivFixed, this.editDivFixed, this.adminDivFixed].forEach(ele=>ele.hide());
  if(arg=='page') this.pageDivFixed.setUp().show();
  else if(arg=='edit') this.editDivFixed.setUp().show();
  else if(arg=='admin') this.adminDivFixed.setUp().show();
  pageText.css({'margin-bottom':intMarginBottom+'px'});  
  return true;
}
// adminDiv.setVis=function(){
//   MainDiv.forEach(ele=>ele.hide()); [this, pageText].forEach(ele=>ele.show());
//   this.fixedDiv.setUp();
//   pageText.css({'margin-bottom':intMarginBottom+'px'});  
//   return true;
// }
adminMoreDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  //this.setUp();
  //redirectTab.boStale=1; siteTab.boStale=1;
  return true; 
}
pageList.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.setCBStat(0); 
  this.headW.prepend(divRowParent);
  return true;
}
imageList.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  //this.setCBStat(0);
  this.headW.prepend(divRowParent);
  return true;
}

// editDiv.setVis=function(){
//   MainDiv.forEach(ele=>ele.hide()); [this, pageText].forEach(ele=>ele.show());
//   pageText.css({'margin-bottom':intMarginBottom+'px'});
//   this.fixedDiv.setUp();
// }
templateList.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  return true;
}

versionTable.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  return true;
}
diffDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  return true;
}
// paymentDiv.setVis=function(){
//   MainDiv.forEach(ele=>ele.hide()); [this, pageText].forEach(ele=>ele.show());
// }
settingDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  return true;
}
slideShow.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
} 
pageFilterDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();   return true;
}
imageFilterDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();  return true;
}
diffBackUpDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();  return true;
}
diffBackUpDetailDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();  return true;
}
redirectTab.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.setUp();
  return true;
}
siteTab.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.setUp();
  //redirectTab.boStale=1;
  return true;
}



//pageView.getScroll=function(){ return this.scrollTop;}
pageView.setScroll=function(x){ this.scrollTop=x;}
//pageList.getScroll=function(){ return this.firstChild.scrollTop;}
var tmpF=function(x){ this.firstChild.scrollTop=x;}
pageList.setScroll=imageList.setScroll=tmpF
// var getIntScroll=function(){ return pageText.intScroll;}
// var setIntScroll=function(x){ pageText.intScroll=x;}
// var getIntScroll=function(){ return pageText.intScroll;}
// pageView.setIntScroll=adminDiv.setIntScroll=editDiv.setIntScroll=paymentDiv.setIntScroll=setIntScroll;
// pageView.getIntScroll=adminDiv.getIntScroll=editDiv.getIntScroll=paymentDiv.getIntScroll=getIntScroll;
//pageView.setIntScroll=setIntScroll;
//pageView.getIntScroll=getIntScroll;


editText.value=strEditText;  
templateList.setUp(objPage.IdChildLax, objPage.IdChild);


pageView.editDivFixed.objWSaveElements.myToggle(Boolean(objPage.boOW));

//var boMakeFirstScroll=1;



await (async function(){
  if(objPage.boOR==0) { // If private
    pageView.adminDivFixed.setUpButtons(boAWLoggedIn);
    pageView.pageDivFixed.butARLogout.toggle(boARLoggedIn); 
    if(boARLoggedIn){
      pageView.setVis('page');
      //pageView.funPopped?.(history.state)
      var vec=[['pageLoad',{}]];  await myFetch('GET',vec); 
      pageView.scrollTop=history.state.scroll??0
      //pageView.setVis('page');
    } else {
      aRLoginDiv.setVis();
    }
  }
  else {  // If public
    pageView.setVis('page');
    pageView.scrollTop=history.state.scroll
    var vec=[['getLoginBoolean',{}]];  await myFetch('POST',vec);
  } 
  if(boAWLoggedIn) {  var vec=[['getAWRestrictedStuff',{}]];  await myFetch('POST',vec);  } 
})();

setTimeout(function(){
  var scriptZip=createElement("script").prop({src:uZip}).on('load',function(){ zip.workerScriptsPath = flFoundOnTheInternetFolder+'/'; });
  document.head.myAppend(scriptZip);
  var scriptSha1=createElement("script").prop({src:uSha1});  document.head.myAppend(scriptSha1);
  var scriptJszip=createElement("script").prop({src:uJszip});  document.head.myAppend(scriptJszip);

  // import(uZip).then(function(trash){  zip.workerScriptsPath = flFoundOnTheInternetFolder+'/'; });
  // import(uSha1);
},0);
const strSha1NotLoaded='sha1.js is not loaded yet';



window.divReCaptcha=divReCaptchaExtend(pageView.editDivFixed.objWSaveElements.El.divReCaptcha);
window.cbRecaptcha=function(){
  if(pageView.editDivFixed.style.display!='none') { console.log('Setting up recaptcha (onload)'); divReCaptcha.setUp(); } // Otherwise "render" will occur when editDiv is opened.
}
window.boDbgSkipRecaptcha=boDbg;
//window.boDbgSkipRecaptcha=0; // When debugging interface
if(!boDbgSkipRecaptcha) divReCaptcha.loadScript();



//var fixedDivsCoveringPageText=[pageView.fixedDiv, editDiv.fixedDiv, adminDiv.fixedDiv, paymentDiv.fixedDiv];
var fixedDivsCoveringPageText=[pageView.pageDivFixed, pageView.editDivFixed, pageView.adminDivFixed];
var setBottomMargin=function() { // This is not very beautiful. But how should one else make a fixed div at the bottom without hiding the bottom of the scrollable content behind??
  if(pageText.style.display!='none'){
    //var tmp=fixedDivsCoveringPageText.map(ele=>ele.style.display!='none'); pageText.css({'margin-bottom':tmp[0].offsetHeight+'px'});
    var hMax=0; for(var i=0;i<fixedDivsCoveringPageText.length;i++){
      var tmp=fixedDivsCoveringPageText[i], hTmp=tmp.offsetHeight;
      if(tmp.style.display!='none'){
        if(tmp===pageView.pageDivFixed) hTmp=window.innerHeight-tmp.offsetTop;
        if(hTmp>hMax) hMax=hTmp;
      }
    }
    pageText.css({'margin-bottom':hMax+'px'});
  }
}

window.on('wheel', setBottomMargin);
if(boTouch) elBody.on('touchstart',setBottomMargin); else { elBody.on('click',setBottomMargin);  window.scroll(setBottomMargin); }


var cbScrollEvent=function(){ 
  var scrollT=this.scrollTop; 
  var state=history.state;  state.scroll=scrollT;
  stateMem.scroll=scrollT;
  history.replaceState(state, '', uCanonical);
  history.StateOpen[history.state.ind].scroll=scrollT;
}
pageView.on('scroll', cbScrollEvent);
pageList.firstChild.on('scroll', cbScrollEvent);

}

//window.onload=funLoad;
//window.on('DOMContentLoaded', funLoad);  // If one uses "import" in "DOMContentLoaded" then "load" will wait until the imported stuff is loaded.
// window.addEventListener('load', funLoad);
// window.addEventListener('load', function(){
//   window.boLCacheObs=document.querySelector('#boLCacheObs'); if(boLCacheObs.value.length) { boLCacheObs.value=""; location.reload(); return} 
// });
funLoad();
window.boLCacheObs=document.querySelector('#boLCacheObs'); if(boLCacheObs.value.length) { boLCacheObs.value=""; location.reload();}
 

