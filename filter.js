

var rangeExtend=function(el, Prop, Filt, Hist, vBoHasRem, StrOrderFilt, iFeat, changeFunc){  
"use strict"
  elHtml=document.documentElement;  elBody=document.body;
    
      // filt: 'B/BF'-features: [vOffNames,vOnNames, boWhite],     'S'-features: [iOn,iOff]
      // hist: 'B'-features: [vPosName,vPosVal],       'S'/'BF'-features: [vPosInd,vPosVal]
  var myMousedown= function(e){
    var e = e || window.event; if(e.which==3) return;

    bo1=(this===hand1)?1:0;
    
    document.on(strMouseMoveEvent,myMousemove); document.on(strMouseUpEvent,myMouseup);
    //setMess('Down'+bo1);
    arrHand[bo1].css({cursor:'move'});
  } 

  var myMouseup= function(e){ 
    if(boVis0 && boVis1) separateHandles(); 
    document.off(strMouseMoveEvent,myMousemove); document.off(strMouseUpEvent,myMouseup);
    
    //setMess(bo1); 
    arrHand[bo1].css({cursor:'pointer'});
    if(filt[0]!=IStSt[0] || filt[1]!=IStSt[1]){   myCopy(filt,IStSt);   changeFunc();   }
  }
  var separateHandles=function(){
    var wHandPx=arrHand[0].offsetWidth;
    var rect=handW0.getBoundingClientRect(), xHand0=rect.left + document.body.scrollLeft;
    var rect=handW1.getBoundingClientRect(), xHand1=rect.left + document.body.scrollLeft;
    var xDiff=xHand1-xHand0;
    if(xDiff<wHandPx  &  IStSt[1]-IStSt[0]<2){
      hand0.css({left:(-(wHandPx-xDiff)/2-0.5*wHandPx)+'px'});
      hand1.css({left:((wHandPx-xDiff)/2-0.5*wHandPx)+'px'});
    }
  }
  var myMousemove= function(e){
    var mouseX,mouseY;
    if(boTouch) {e.preventDefault();  mouseX=e.changedTouches[0].pageX; mouseY=e.changedTouches[0].pageY;}
    else {mouseX=e.pageX; mouseY=e.pageY;}

    var iCur=IStSt[bo1];
    var xOff;

    var str='bo1:'+bo1;
    var boChangeAnchor=0;

    for(var i=0;i<len;i++) {
      var rect=arrSpanLab[i].getBoundingClientRect();
      arrX[i]=rect.left + document.body.scrollLeft;
    }
    arrX[len]=arrX[len-1]+Number(arrSpanLab[len-1].offsetWidth);
    var bestI,bestV=Number.MAX_VALUE; for(var i=0;i<len+1;i++)  { var tmpV=Math.abs(mouseX-arrX[i]); if(tmpV<bestV) {bestV=tmpV; bestI=i;}}
    var iNew=bestI;
    if(iNew!=iCur){
      boChangeAnchor=1; IStSt[bo1]=iNew;
    }
    
    var hCur=bo1, hAlt=1-bo1;
    if(bo1==0){ IStSt[0]=bound(IStSt[0],0,Math.min(len,IStSt[1]-1));  } else {  IStSt[1]=bound(IStSt[1],Math.max(0,IStSt[0]+1),len);  }    // hAlt is blocking
    
   if(boChangeAnchor){  setColors();  setAnchor(bo1);   }  //setAnchor(1-bo1);
    //setMess(str); 
  };

  var setAnchor=function(bo1T){ 
    var iCur=IStSt[bo1T], handW=arrHandW[bo1T];
    if(iCur==len) { 
      arrSpanLab[iCur-1].parentNode.after(handW);
    }
    else {
      arrSpanLab[iCur].parentNode.before(handW);
    }
    arrHand.forEach(ele=>ele.css({left:(-0.5*wHand)+'em'})); // (Center both incase they were seperated)
  }
  var setColors=function(){
    var colButtOnT=colButtOn; if(IStSt[0]==0 && IStSt[1]==len)  colButtOnT=colButtAllOn;
    arrStap.forEach(ele=>ele.css({'background':colStapleOff}));
    arrStap.slice(IStSt[0],IStSt[1]).forEach(ele=>ele.css({'background':colStapleOn}));
    arrSpanLab.forEach(ele=>ele.css({'background-color':colFiltOff,color:colFontOff}));
    arrSpanLab.slice(IStSt[0],IStSt[1]).forEach(ele=>ele.css({'background-color':colButtOnT,color:colFontOn}));
  }
  var setStapleHeight=function(){   
    for(var i=0;i<len;i++){
      var staple=arrStap[i];
      staple.css({height:Math.ceil(vVal[i]*heightScaleFac)+'px' });
      staple.parentNode.prop('title',vVal[i]);
    }
  }

  el.update=function(){
    //IStSt=[].concat(filt);
    myCopy(IStSt,filt);

    var maxV=arr_max(hist[1].concat(1));
    heightScaleFac=1;  if(maxV>maxStaple) heightScaleFac=maxStaple/maxV;
    //vPosInd=[],vPosVal=[],vVal=[];
    vPosInd.length=0; vPosVal.length=0; vVal.length=0;
    for(var j=0;j<hist[0].length;j++) { 
      vPosInd[j]=hist[0][j]; 
      vPosVal[j]=hist[1][j];
    }
    for(var i=0;i<len;i++) {vVal[i]=0;}   for(var i=0;i<vPosInd.length;i++) vVal[vPosInd[i]]=vPosVal[i];
  
    
    if(boVis0) setAnchor(0);  if(boVis1) setAnchor(1);  setColors(); setStapleHeight(); if(boVis0 && boVis1) separateHandles(); 
  }
  
  var strName=StrOrderFilt[iFeat];
  var filt=Filt[iFeat], hist=Hist[iFeat];

  var wHand=2;
  var bo1;

  var hand0=createElement('span'), hand1=createElement('span'),  arrHand=[hand0, hand1];
  var handW0=createElement('span').myAppend(hand0), handW1=createElement('span').myAppend(hand1),  arrHandW=[handW0, handW1]; 

  arrHand.forEach(ele=>ele.css({background:'#fff', width:wHand+'em', height:wHand+'em', opacity:'0.3', 'border-radius':'2em', display:'inline-block', position:'relative', border:'black solid 1px', bottom:'-0.7em', cursor:'pointer',left:(-0.5*wHand)+'em'}));  //,'z-index':5
  
  arrHandW.forEach(ele=>ele.css({width:'0px',display:'inline-block'}));
  
  var strMouseDownEvent='mousedown', strMouseMoveEvent='mousemove', strMouseUpEvent='mouseup';  if(boTouch){  strMouseDownEvent='touchstart'; strMouseMoveEvent='touchmove'; strMouseUpEvent='touchend';  }
  arrHand.forEach(ele=>ele.on(strMouseDownEvent,myMousedown));
  
  var boVis0=Prop[strName].feat.kind[1]=='1', boVis1=Prop[strName].feat.kind[2]=='1';
  handW0.toggle(boVis0);
  handW1.toggle(boVis1);
  

  var len=Prop[strName].feat.n;
  var IStSt=[0,len];
    
  var vPosInd=[],vPosVal=[],vVal=[],heightScaleFac;
  
  var graph=createElement('div').css({display:"inline-block",'font-size':'80%',border:'0px','white-space':'nowrap'});   
  var arrStap=Array(len), arrSpanLab=Array(len);
  for(var i=0;i<len;i++){   // Create slider spans  
    var staple=createElement('span').css({width:'9px',display:'block',"margin-left":'auto',"margin-right":'auto', "vertical-align":"bottom" });   arrStap[i]=staple;  
    staple.css({height:i+'px',background:colStapleOn});
    var strtmp=Prop[strName].feat.bucketLabel[i],   spanLab=createElement('span').myAppend(strtmp).css({display:'block','border':'0px'});   arrSpanLab[i]=spanLab;
    var divT=createElement('div').myAppend(staple,spanLab).css({display:"inline-block","vertical-align":"bottom","margin":"0px 2px 0px 0px"});
    graph.append(divT);
  }
  if(len<7) {var tmpW=8/len; arrSpanLab.forEach(ele=>ele.css({width:tmpW+'em'}));} // make small ranges a bit wider
  var arrX=Array(len+1);
  
  arrSpanLab[IStSt[0]].parentNode.before(arrHandW[0]);
  arrSpanLab[IStSt[1]-1].parentNode.after(arrHandW[1]);
  setColors();  setAnchor(0); setAnchor(1);
  
  el.append(graph);
  el.addClass('unselectable').prop({unselectable:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie
  
  return el;
}

var rowButtExtend=function(el, Prop, Filt, Hist, vBoHasRem, StrOrderFilt, iFeat, changeFunc){    // filter-buttons
"use strict"
  var calcAllOnNLight=function(){return vOff.length==0 && filt[2]==0 && boIfAllOnDoLight;}  
  var clickFunc=function(){
    var val=this.myVal;
    
    var boOn=Number(vOn.indexOf(val)!=-1);
    var boOnNew=1-boOn;      
    if(calcAllOnNLight()) {
      var indOf=vAll.indexOf(val);
      //filt[0]=vAll.concat([]).splice(indOf,1); filt[1]=[val]; filt[2]=1;
      myCopy(filt[0],vAll); mySplice1(filt[0],indOf);
      //filt[0]=vAll.concat([]).splice(indOf,1); 
      filt[1][0]=val; filt[1].length=1;   filt[2]=1;
    } else {
      var listPushed=boOnNew,listSliced=1-boOnNew;   arrValMerge(filt[listPushed],val);    arrValRemove(filt[listSliced],val);

      var listType=filt[2];   if(filt[listType].length==0) allOnNLight(); // If there is nothing in the "listType" list
      if(boHasRem==0 && (filt[0].length==0 || filt[1].length==0)) allOnNLight(); // any list empty
    }
 
    changeFunc();
  }
  var remClick=function(){
    if(calcAllOnNLight()) {
      filt[0]=vAll.concat([]);  filt[1].length=0; filt[2]=0;
    } else {
      filt[2]=1-filt[2]; 
      var listType=filt[2];   if(filt[listType].length==0) allOnNLight(); // If there is nothing in the "listType" list
    }
    changeFunc();
  } 
  
  
  el.createCont=function(){
    var len=prop.feat.n; if(typeof len=='undefined') len=maxGroupsInFeat+1;
    setRowButtF=('setRowButtF' in prop)?prop.setRowButtF:null; crRowButtF=('crRowButtF' in prop)?prop.crRowButtF:null;
    var fragButts=createFragment();
    for(var i=0;i<len;i++){
      var staple=createElement('span').css({width:'10px', display:'inline-block', position:'relative', bottom:'-1px'}); 
      var span;
      if(crRowButtF) {var span=crRowButtF(i);}
      else span=createElement('span').css({'margin':'0 0.25em 0 0.1em'}).myText('...');
      var butt=createElement('button').css({margin:'0.6em 0.2em'}).myAppend(span,staple); //,'vertical-align':'bottom', padding:'0.1em 0.2em',

      arrSpan[i]=span;
      arrButt[i]=butt;
      fragButts.append(butt);
    }
    s.append(fragButts);
  }

  el.update=function(){
    vAll=hist[0]; vAllVal=hist[1];
    vOff=filt[0]; vOn=filt[1];
    
    var maxV=arr_max(hist[1].concat(1));
    var fac=1;  if(maxV>maxStaple) fac=maxStaple/maxV;
    
    var len=vAll.length;
    boHasRem=vBoHasRem[iFeat];
    var colButtOnT; if(calcAllOnNLight()) colButtOnT=colButtAllOn; else colButtOnT=colButtOn;
    
    var boWhite=filt[2];
    arrButt.forEach(ele=>ele.hide());
    
    for(var i=0;i<len;i++){
      var boThisIsRem=0; if(boHasRem && i==len-1) boThisIsRem=1;
      var boOn;  if(boThisIsRem) boOn=1-boWhite;  else boOn=Number(vOn.indexOf(vAll[i])!=-1);
      
      var colButt,colFont,colStaple;
      if(boOn) {colButt=colButtOnT; colFont=colFontOn; colStaple=colStapleOn; }
      else {colButt=colButtOff; colFont=colFontOff; colStaple=colStapleOff; }
      
      var butt=arrButt[i].css({'background-color':colButt,color:colFont}).show();  butt.myVal=vAll[i];
      var span=arrSpan[i];
      
      if(boThisIsRem) span.myText('('+langHtml.histsRem+')');
      else {
        if(setRowButtF) {setRowButtF(span,vAll[i],boOn);}
        else{  // Text-data
          var data;
          if(prop.feat.kind=='BF') {
            //if(strName=='standingByMethod') { data=langHtml.standingByMethodsLong[vAll[i]]; } 
            //else data=prop.feat.bucket[vAll[i]];
            data=prop.feat.bucket[vAll[i]];
          } 
          else {
            data=vAll[i]; 
          }
          span.myText(data);
        }
      }
      if(boThisIsRem){ span.css({'font-size':'80%'}); butt.off('click',clickFunc).on('click',remClick); } else { span.css({'font-size':''}); butt.off('click',remClick).on('click',clickFunc); }  
  
      butt.querySelector('span:nth-of-type(2)').css({background:colStaple, height:Math.ceil(vAllVal[i]*fac)+'px'});  // Set staple style
      butt.prop('title',vAllVal[i]);
    }
  }

  var strName=StrOrderFilt[iFeat];
  if(strName in Prop) var prop=Prop[strName]; else return 'err';
  var filt=Filt[iFeat], hist=Hist[iFeat];
  var setRowButtF, crRowButtF;
  
  //var colButtOnClass='filterSingleOn', colButtAllOnClass='filterAllOn';

  var allOff= function(){  filt[2]=1;  filt[0]=vAll.concat([]);  filt[1].length=0;  }
  var allOnNLight= function(){  boIfAllOnDoLight=1;  filt[2]=0;  filt[0].length=0;  filt[1]=vAll.concat([]);  }
  var allOnButtClick= function(){
    if(filt[2]==0 && filt[0].length==0) {boIfAllOnDoLight=1-boIfAllOnDoLight; el.update(); return; }  
    allOnNLight(); changeFunc();
  }
  
  var boBF=prop.feat.kind=='BF';
  //var boNum='type' in prop && !prop.type.match(RegExp('varchar','i'));
  var boNum=prop.feat.kind=='BN';

  
    
  var arrSpan=[], arrButt=[];
  var vAll=[], vAllVal=[], vOff=[], vOn=[];
  var boHasRem, boIfAllOnDoLight=1;
  var s=createElement('span');//.css({'line-height':'2.4em'});



  el.append(s);
  if(!('span' in prop.feat) ){
    var buttOn=createElement('a').prop({href:''}).myText(langHtml.All).css({'font-size':'80%'}).on('click', function(e){allOnButtClick();e.preventDefault();});
    var buttOff=createElement('a').prop({href:''}).myText(langHtml.None).css({'font-size':'80%','margin-left':'1em'}).on('click', function(e){allOff();changeFunc();e.preventDefault();});
    var spanAllNone=createElement('span').css({'float':'right',display:'inline-block','margin-top':'0.8em','margin-left':'0.8em'}).myAppend(buttOn,buttOff);
    el.append(spanAllNone);
  }
  
  el.addClass('unselectable', 'rowButtonFeat');
  
  return el;
}




      // filt: 'B/BF'-features: [vOffNames,vOnNames, boWhite],     'S'-features: [iOn,iOff]
      // hist: 'B'-features: [vPosName,vPosVal],       'S'/'BF'-features: [vPosInd,vPosVal]
Filt=function(Prop, StrOrderFilt){ 
  var el=[];  extend(el,Filt.tmpPrototype);
  el.StrOrderFilt=StrOrderFilt; el.Prop=Prop; el.nFeat=StrOrderFilt.length;
  var StrOrderFiltFlip=array_flip(StrOrderFilt);
  el.iParent=StrOrderFiltFlip.parent
  for(var i=0;i<el.nFeat;i++){  
    var strName=el.StrOrderFilt[i], feat=el.Prop[strName].feat, kind=feat.kind, len=feat.n;
    if(kind[0]=='S') el[i]=[0,len];
    else if(kind[0]=='B') {   var tmp; if(kind=='BF') tmp=stepN(0,len); else tmp=[];       el[i]=[[],tmp,0];    }
  }
  return el;
}
Filt.tmpPrototype={};
Filt.tmpPrototype.filtAll=function(){
"use strict"
  var el=this;
  for(var i=0;i<el.nFeat;i++){  
    var strName=el.StrOrderFilt[i], feat=el.Prop[strName].feat, kind=feat.kind, len=feat.n;
    if(kind[0]=='S') {el[i][0]=0; el[i][1]=len; }
    else if(kind[0]=='B') {   var tmp; if(kind=='BF') tmp=stepN(0,len); else tmp=[];      el[i][0]=[]; el[i][1]=tmp; el[i][2]=0;    }
  }
}
Filt.tmpPrototype.filtNone=function(){
"use strict"
  var el=this;
  for(var i=0;i<el.nFeat;i++){  
    var strName=el.StrOrderFilt[i], feat=el.Prop[strName].feat, kind=feat.kind, len=feat.n;
    if(kind[0]=='S') {
      if(kind[1]=='1') el[i][0]=len; else el[i][1]=0;
    }
    else if(kind[0]=='B') {   var tmp; if(kind=='BF') tmp=stepN(0,len); else tmp=[];      el[i][0]=tmp; el[i][1]=[]; el[i][2]=1;    }
  }
}
Filt.tmpPrototype.filtDefault=function(){   
  var el=this; 
  for(var i=0;i<el.nFeat;i++) {
    var strName=el.StrOrderFilt[i], feat=el.Prop[strName].feat;
    if('myDefault' in feat)     el[i]=feat.myDefault.concat([]);
  }
}



Hist=function(nFeat){ 
  var el=[]; extend(el,Hist.tmpPrototype);  for(var i=0;i<nFeat;i++){ el[i]=[[],[]];}
  el.nFeat=nFeat;
  return el;
}
Hist.tmpPrototype={};
Hist.tmpPrototype.histClear=function(){  var el=this;  for(var i=0;i<el.nFeat;i++){ el[i][0]=[]; el[i][1]=[];}   }



      // Filt is an array of filt, Hist is an array of hist, HistPHP is an array of histPHP:
      //  filt (client-side): 'B/BF'-features: [vOffNames,vOnNames, boWhite],     'S'-features: [iOn,iOff]
      //  filt (server-side): 'B/BF'-features: [vSpec, boWhite],     'S'-features: [iOn,iOff]
      //  hist (client-side): 'B'-features: [vPosName,vPosVal],       'S'/'BF'-features: [vPosInd,vPosVal]
      //  histPHP (server-side): histPHP[buttonNumber]=['name',value], (converts to:) hist[0]=names,  hist[1]=values
      //
      // HistPHP (server-side) has dimmension [nFeat,nBins,2]. Hist (client-side) has dimmension [nFeat,2,nBins]. nBins is constant for 'S'/'BF'-features but varies for 'B'-features.

      
      // TODO  variables starting with v should have it removed (v is for 'vector'). (My new naming conversion uses a capital letter to denote arrays.)

filterDivICreator=function(objArg, changeFunc){ 
  var el=createElement('div'); extend(el, filterDivICreator.tmpPrototype);
  el.changeFunc=changeFunc;
  copySome(el, objArg, ['Prop', 'Label', 'helpBub',   'StrGroupFirst', 'StrGroup',   'StrOrderFilt']); // ,   'StrProp'
  //copySome(el, oRole, ['Prop', 'Label', 'helpBub']);
  //copySome(el, oRole.filter, ['StrProp', 'StrGroupFirst', 'StrGroup']);
  //el.StrOrderFilt=oRole.filter.StrProp;
  return el;
}

filterDivICreator.tmpPrototype={};
filterDivICreator.tmpPrototype.update=function(){  var el=this; for(var i=0;i<el.nFeat;i++){ el.arrFeat[i].update();}  } 
filterDivICreator.tmpPrototype.createDivs=function(){
"use strict"
  var el=this;
  el.nFeat=el.StrOrderFilt.length;

  el.arrFeat=Array(el.nFeat), el.BoHasRem=[]; 

  el.Filt=new Filt(el.Prop, el.StrOrderFilt);  el.Filt.filtDefault();
  el.Hist=new Hist(el.nFeat);

  //el.helpBub=extend({},el.helpBub);
  if(typeof el.Unit=='undefined') el.Unit={};
      
  var boRangeControlOK=0;
  //if(typeof rangeExtend!='undefined') boRangeControlOK=boImgCreationOK;
  boRangeControlOK=1;
  var rangeExtender; if(boRangeControlOK) rangeExtender=rangeExtend; else rangeExtender=rangeExtendSel;


  for(var i=0;i<el.nFeat;i++){
    var p, h='', imgH='';
    var strName=el.StrOrderFilt[i];
    var divT=createElement('div').attr('name',strName);
    
    if(strName in el.helpBub){ var imgH=imgHelp.cloneNode().css({'vertical-align':'top'});  popupHover(imgH,el.helpBub[strName]);    }   
    var strUnit=''; if(strName in el.Unit) strUnit=' ['+el.Unit[strName]+']';
    if(el.Prop[strName].feat.kind[0]=='B') { 
      h=createElement('div').myAppend(calcLabel(el.Label,strName),strUnit,': ',imgH); //.css({'margin':'0.3em 0em 0em'})
      var p=createElement('p').css({'padding':'0.3em 0em 0em','font-size': '85%'}); 
      rowButtExtend(p, el.Prop, el.Filt, el.Hist, el.BoHasRem, el.StrOrderFilt, i, el.changeFunc);     p.createCont();
    }  
    else if(el.Prop[strName].feat.kind[0]=='S') { 
      h=createElement('div').myAppend(calcLabel(el.Label,strName),strUnit,': ',imgH); 
      var p=createElement('p');  p=rangeExtender(p, el.Prop, el.Filt, el.Hist, el.BoHasRem, el.StrOrderFilt, i, el.changeFunc);
      if(boRangeControlOK) {h.css({'margin':'0 1em 0 0'});   p.css({'line-height':'100%','padding':'0 0 1em 0','text-align':'center'}); } 
      else { h.css({'margin':'0.3em 0em -0.4em'});  p.css({'margin':'0',display:'block'}); }
    } 
    h.css({height:'1.4em'});
    p.css({margin:'0px'});
    el.arrFeat[i]=p;
    
    divT.append(h,p); el.append(divT);

    if('span' in el.Prop[strName].feat ){ 
      divT.css({display:'inline-block', 'padding': '0 0.6em 0 0.6em','margin-right':'0.2em'});
    }
    divT.css({'background-color':'lightgrey','margin-bottom':'0.2em', overflow:'hidden'});
  }

  

  for(var i=0;i<el.StrGroup.length;i++){
    var h=createElement('div').css({'font-size':'130%','font-weight':'bold', 'margin-top':'1em'}).myText(langHtml[el.StrGroup[i]]+':');
    el.querySelector('div[name='+el.StrGroupFirst[i]+']').before(h);
  }
}
filterDivICreator.tmpPrototype.interpretHistPHP=function(HistPHP){
"use strict"
  var el=this;
  for(var i=0;i<el.nFeat;i++) { 
    var strName=el.StrOrderFilt[i]; 
    el.Hist[i][0].length=0;el.Hist[i][1].length=0;  
    el.BoHasRem[i]=0;    
    if(i in HistPHP) { // <-- maybe not needed
      el.BoHasRem[i]=HistPHP[i].pop();
      for(var j=0;j<HistPHP[i].length;j++) {  // Convert HistPHP to Hist
        el.Hist[i][0][j]=HistPHP[i][j][0];  // HistPHP[iFeat][buttonNumber]=['name',value],  el.Hist[iFeat][0]=names,  el.Hist[iFeat][1]=values, 
        el.Hist[i][1][j]=HistPHP[i][j][1];
      }
    } //else Hist[i]=[[],[]];

    if(el.Prop[strName].feat.kind[0]=='B'){
        // If button-feature: Change vOnNames/vOffNames so that they only contain buttons that are either "filtered" 
        // (occurs in speclist (whitelist or blacklist)) or buttons whose name occur in 'Hist'
        // Q: What does histogram of a feature mean? A: It means that the features filter is relaxed (removed),  (while all other features filters still are applied).
      var listType=el.Filt[i][2],  listAlt=1-listType; // vKeepNames=boWhite?vOnNames:vOffNames 
      el.Filt[i][listAlt]=[];
      var nButt=el.Hist[i][0].length; if(el.BoHasRem[i]) nButt=nButt-1;  
      for(var j=0;j<nButt;j++) {
        var name=el.Hist[i][0][j]; // name=name or index of button
        if(el.Filt[i][listType].indexOf(name)==-1) el.Filt[i][listAlt].push(name);  // Keep el.Filt[i][listType] as is and add any potential new "name"'s
      }
    }
  }
  //var Sum=new Array(HistPHP.length).fill(0);
  //for(var i=0;i<HistPHP.length;i++){
    //var histPHP=HistPHP[i];
    //var strName=el.StrOrderFilt[i];
    //for(var j=0;j<histPHP.length;j++){
      //Sum[i]=Sum[i]+histPHP[j][1];
    //}
    //console.log(strName+': '+Sum[i]);
  //}
  //console.log('------------');
}

  // gatherFiltData closebymarket
filterDivICreator.tmpPrototype.gatherFiltData=function(){
"use strict"
  var el=this;
  var Filt=el.Filt;
  var FiltOut={};
  for(var i=0;i<Filt.length;i++){
    var strName=el.StrOrderFilt[i];
    var filtT; if(el.Prop[strName].feat.kind[0]=='B'){ var vSpec=Filt[i][Filt[i][2]];  filtT=[vSpec,Filt[i][2]];} else filtT=Filt[i];
    FiltOut[strName]=filtT;
  }
  return FiltOut;
}

  // gatherFiltData mmmWiki
filterDivICreator.tmpPrototype.gatherFiltData=function(){
"use strict"
  var el=this;
  var Filt=el.Filt;
  var o={Filt:[]};
  for(var i=0;i<Filt.length;i++){
    var strName=el.StrOrderFilt[i];
    var filtT; if(el.Prop[strName].feat.kind[0]=='B'){ var vSpec=Filt[i][Filt[i][2]];  filtT=[vSpec,Filt[i][2]];} else filtT=Filt[i];
    o.Filt.push(filtT);
  }
  return o;
}
filterDivICreator.tmpPrototype.toStored=function(){
"use strict"
  var el=this;
  var Filt=el.Filt;
  //var FiltS=[];
  //for(var i=0;i<Filt.length;i++){
  //  FiltS[i]=.extend(true, [], Filt[i]);
  //}
  var FiltS = JSON.parse(JSON.stringify(Filt));
  return FiltS;
}
filterDivICreator.tmpPrototype.frStored=function(o){
"use strict"
  var el=this;
  var Filt=el.Filt, FiltS=o.Filt;
  for(var i=0;i<Filt.length;i++){
    var strName=el.StrOrderFilt[i];
    if(el.Prop[strName].feat.kind[0]=='B'){ 
      //for(var j=0;j<FiltS[i][0].length;j++)     Filt[i][0][j]=FiltS[i][0][j];
      //for(var j=0;j<FiltS[i][1].length;j++)     Filt[i][1][j]=FiltS[i][1][j];
      myCopy(Filt[i][0],FiltS[i][0]);  myCopy(Filt[i][1],FiltS[i][1]);
      Filt[i][2]=FiltS[i][2];
    } else  { Filt[i][0]=FiltS[i][0]; Filt[i][1]=FiltS[i][1]; }
  }
}




