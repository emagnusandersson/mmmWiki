



/*
var rangeExtendSel=function($el,Filt,Hist,vBoHasRem,StrOrderFilt,iFeat, changeFunc){  
      // filt: 'B/BF'-features: [vOffNames,vOnNames, boWhite],     'S'-features: [iOn,iOff]
      // hist: 'B'-features: [vPosName,vPosVal],       'S'/'BF'-features: [vPosInd,vPosVal]
  var makeChangeFunc=function(boMax){   return function(){     var i=Number($(this).val());    if(boMax)  filt[1]=i+1; else filt[0]=i;    $el.update();    }     }
  var graphExtend=function($el){
    $el.set=function(){
      for(var i=0;i<len;i++){
        var colSpan,colFont,colStaple;
        if(i>=iOn && i< iOff) {colSpan=colFiltOn; colFont=colFontOn; colStaple=colStapleOn;} 
        else {colSpan=colFiltOff; colFont=colFontOff; colStaple=colStapleOff;}
        $cellI[i].find('span').css({background:colStaple,height:Math.ceil(vVal[i]*heightScaleFac) });
        $cellI[i].css({color:colFont}); 
        $cellT[i].css({'background-color':colSpan,color:colFont});
      }
    }
    $el.empty();
    var $rowI=$('<tr>'),$rowT=$('<tr>'), $table=$('<table>').css({display:"inline-block","margin-top":'0.4em',"border-collapse":"collapse",'font-size':'80%',border:'0px'});
    $table.append($rowI,$rowT); $el.append($table);
    var $cellI=[],$cellT=[];
      // Create slider spans    
    for(var i=0;i<len;i++){
      var strtmp=Prop[strName].feat.bucketLabel[i];
      var $staple=$('<span>').css({width:'9px',display:'block',"margin-left":'auto',"margin-right":'auto', "vertical-align":"bottom" });
      $cellI[i]=$('<td>').append($staple).css({'border':'solid',"border-width":"0px","border-color":"white","vertical-align":"bottom"}); 
      $cellT[i]=$('<td>').append(strtmp).css({'border':'0px solid',"border-width":"0px 1px 0px 0px","border-color":"white"});
      $rowI.append($cellI[i]); $rowT.append($cellT[i]);
    }
    var $sLast=$el.children('span:last');
    $sLast.css({'border-right-width':'1px'});
    return $el;
  }
 
  var sel0Extend=function($el){
    $el.set=function(){
      var tmp="option[value='"+iOn+"']";
      var $tmp=$el.find(tmp);   if($tmp.length==1) $tmp.prop('selected', 'selected');
      $opts.detach(); $el.append($opts.slice(0,iOff));

    }
    $el.empty();
    for(var i=0;i<len;i++){
      var $opt=$('<option>').html(Prop[strName].feat.minName[i]).val(i);
      $el.append($opt);
    }
    var $opts=$el.children('option');
    return $el;
  } 
  var sel1Extend=function($el){
    $el.set=function(){
      var tmp="option[value='"+iOffm1+"']";
      var $tmp=$el.find(tmp);   if($tmp.length==1) $tmp.prop('selected', 'selected');
      $opts.detach(); $el.append($opts.slice(iOn));
    }
    $el.empty();
    for(var i=0;i<len;i++){
      var $opt=$('<option>').html(Prop[strName].feat.maxName[i]).val(i);
      $el.append($opt);
    }
    var $opts=$el.children('option');
    return $el;
  }

  $el.update=function(){
    iOn=filt[0]; iOff=filt[1]; iOffm1=iOff-1;

    var maxV=arr_max(hist[1].concat(1));
    var heightScaleFac=1;  if(maxV>maxStaple) heightScaleFac=maxStaple/maxV;
    //vPosInd=[],vPosVal=[],vVal=[];
    vPosInd.length=0,vPosVal.length=0,vVal.length=0;
    for(var j=0;j<hist[0].length;j++) { 
      vPosInd[j]=hist[0][j]; 
      vPosVal[j]=hist[1][j];
    }
    for(var i=0;i<len;i++) {vVal[i]=0;}   for(var i=0;i<vPosInd.length;i++) vVal[vPosInd[i]]=vPosVal[i];

    if(Prop[strName].feat.kind[1]=='1') $sel0.set();  if(Prop[strName].feat.kind[2]=='1') $sel1.set();  $graph.set();
  }
  
  var strName=StrOrderFilt[iFeat];
  var filt=Filt[iFeat], hist=Hist[iFeat];

  var iOn, iOff,iOffm1;
  var len=Prop[strName].feat.n;
    
  var vPosInd=[],vPosVal=[],vVal=[], heightScaleFac;
  
  var $sel0='',$sel1='',$minS='',$maxS='';
  if(Prop[strName].feat.kind[1]=='1') {
    $sel0=sel0Extend($('<select>')).change(makeChangeFunc(0)); 
    $minS=$('<font>').append(langHtml.min+':').css({'font-size':'85%','font-weight':'normal'});
  }
  if(Prop[strName].feat.kind[2]=='1') {
    $sel1=sel1Extend($('<select>')).change(makeChangeFunc(1)); 
    $maxS=$('<font>').append(langHtml.max+':').css({'font-size':'85%','font-weight':'normal'});
  }
  var $graph=graphExtend($('<span>')).css({'font-weight':'normal'});
  
  var $spanSelector=$('<span>').append($minS,$sel0,' ',$maxS,$sel1,' ').css({'float':'right',clear:'both'});
  $el.append($graph,' &nbsp;',$spanSelector);
  
  $el.addClass('unselectable');    $el.prop({unselectable:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie
  return $el;
}
*/

var rangeExtend=function($el, Prop, Filt, Hist, vBoHasRem, StrOrderFilt, iFeat, changeFunc){  
"use strict"
      // filt: 'B/BF'-features: [vOffNames,vOnNames, boWhite],     'S'-features: [iOn,iOff]
      // hist: 'B'-features: [vPosName,vPosVal],       'S'/'BF'-features: [vPosInd,vPosVal]
  var myMousedown= function(e){
    var e = e || window.event; if(e.which==3) return;

    bo1=(this===$hand1[0])?1:0;
    
    if(boTouch){      $(document).on('touchmove',myMousemove).on('touchend',myMouseup);  }
    else{   $(document).on('mousemove',myMousemove).on('mouseup',myMouseup);    }
    //setMess('Down'+bo1);
    $Hand.eq(bo1).css({cursor:'move'});
  } 

  var myMouseup= function(e){ 
    if(boVis0 && boVis1) separateHandles(); 
    if(boTouch) $(document).off('touchmove',myMousemove).off('touchend',myMouseup);
    else $(document).off('mousemove').off('mouseup');
    //setMess(bo1); 
    $Hand.eq(bo1).css({cursor:'pointer'});
    if(filt[0]!=IStSt[0] || filt[1]!=IStSt[1]){   myCopy(filt,IStSt);   changeFunc();   }
  }
  var separateHandles=function(){
    var wHandPx=Number($Hand.eq(0).css('width').slice(0,-2));
    var xHand0=$handW0.offset().left,  xHand1=$handW1.offset().left,  xDiff=xHand1-xHand0;
    if(xDiff<wHandPx  &  IStSt[1]-IStSt[0]<2){
      $hand0.css({left:(-(wHandPx-xDiff)/2-0.5*wHandPx)+'px'});
      $hand1.css({left:((wHandPx-xDiff)/2-0.5*wHandPx)+'px'});
    }
  }
  var myMousemove= function(e){
    var mouseX,mouseY;
    if(boTouch) {e.preventDefault(); var orig=e.originalEvent;  mouseX=orig.changedTouches[0].pageX; mouseY=orig.changedTouches[0].pageY;}
    else {mouseX=e.pageX; mouseY=e.pageY;}

    var iCur=IStSt[bo1];
    var xOff;

    var str='bo1:'+bo1;
    var boChangeAnchor=0;

    for(var i=0;i<len;i++)  arrX[i]=$spanLabs.eq(i).offset().left;     arrX[len]=$spanLabsLast.offset().left+Number($spanLabsLast.css('width').slice(0,-2));
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
    var iCur=IStSt[bo1T], $handW=$HandW.eq(bo1T), xOffLast; //wHand=Number($hand.css('width').slice(0,-2));;
    if(iCur==len) { 
      $spanLabs.eq(iCur-1).parent().after($handW);
    }
    else {
      $spanLabs.eq(iCur).parent().before($handW);
    }
    $Hand.css({left:(-0.5*wHand)+'em'}); // (Center both incase they were seperated)
  }
  var setColors=function(){
    var colButtOnT=colButtOn; if(IStSt[0]==0 && IStSt[1]==len)  colButtOnT=colButtAllOn;
    $staps.css({'background':colStapleOff});  $staps.slice(IStSt[0],IStSt[1]).css({'background':colStapleOn});
    $spanLabs.css({'background-color':colFiltOff,color:colFontOff});   $spanLabs.slice(IStSt[0],IStSt[1]).css({'background-color':colButtOnT,color:colFontOn}); 
  }
  var setStapleHeight=function(){   
    for(var i=0;i<len;i++){
      var $staple=$staps.eq(i);   $staple.css({height:Math.ceil(vVal[i]*heightScaleFac) });
      $staple.parent().prop('title',vVal[i]);
    }
  }

  $el.update=function(){
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
  var bo1;//,xOffLast;//,$tdCur;

  var $hand0=$('<span>'), $hand1=$('<span>'),  $Hand=$([]).push($hand0, $hand1); 
  var $handW0=$('<span>').append($hand0), $handW1=$('<span>').append($hand1),  $HandW=$([]).push($handW0, $handW1); 

  $Hand.css({background:'#fff', width:wHand+'em', height:wHand+'em', opacity:'0.3', 'border-radius':'2em', display:'inline-block', position:'relative', border:'black solid 1px', bottom:'-0.7em', cursor:'pointer',left:(-0.5*wHand)+'em'});//,'z-index':5
 $HandW.css({width:'0px',display:'inline-block'});
  //$Hand.eq(0).css({background:'#00f'});
  
  if(boTouch) $Hand.on('touchstart',myMousedown); else $Hand.on('mousedown',myMousedown);

  var boVis0=Prop[strName].feat.kind[1]=='1', boVis1=Prop[strName].feat.kind[2]=='1';
  $handW0.toggle(boVis0);
  $handW1.toggle(boVis1);
  

  var len=Prop[strName].feat.n;
  var IStSt=[0,len];
    
  var vPosInd=[],vPosVal=[],vVal=[],heightScaleFac;
  
  var $graph=$('<div>').css({display:"inline-block",'font-size':'80%',border:'0px','white-space':'nowrap'});   $el.append($graph);
  var $staps=$([]), $spanLabs=$([]);
  for(var i=0;i<len;i++){   // Create slider spans  
    var $staple=$('<span>').css({width:'9px',display:'block',"margin-left":'auto',"margin-right":'auto', "vertical-align":"bottom" });    $staps.push($staple);  
    $staple.css({height:i+'px',background:colStapleOn});
    //var strtmp=Prop[strName].feat.bucketLabel[i],   $spanLab=$('<span>').append(strtmp).css({display:'block','border':'0px solid white',"border-width":"0px 1px 0px 0px"});     $spanLabs.push($spanLab);
    var strtmp=Prop[strName].feat.bucketLabel[i],   $spanLab=$('<span>').append(strtmp).css({display:'block','border':'0px'});     $spanLabs.push($spanLab);
    var $divT=$('<div>').append($staple,$spanLab).css({display:"inline-block","vertical-align":"bottom","margin":"0px 2px 0px 0px"}); 
    $graph.append($divT);
  }
  if(len<7) {var tmpW=8/len; $spanLabs.css({width:tmpW+'em'});} // make small ranges a bit wider
  var $spanLabsLast=$spanLabs.last();
  var arrX=Array(len+1);
  
  $spanLabs.eq(IStSt[0]).parent().before($HandW.eq(0));
  $spanLabs.eq(IStSt[1]-1).parent().after($HandW.eq(1));
  setColors();  setAnchor(0); setAnchor(1);
  
  var $tmp=$el;
  $tmp.addClass('unselectable');    $tmp.prop({unselectable:"on"}); //class: needed by firefox, prop: needed by opera, firefox and ie
  
  return $el;
}

var rowButtExtend=function($el, Prop, Filt, Hist, vBoHasRem, StrOrderFilt, iFeat, changeFunc){    // filter-buttons
"use strict"
  var calcAllOnNLight=function(){return vOff.length==0 && filt[2]==0 && boIfAllOnDoLight;}  
  var clickFunc=function(){
    var $butt=$(this);
    var val=$butt.data('val'); //if(boBF || boNum) val=Number(val); //if(val==undefined) val=null;
    
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
  
  
  $el.createCont=function(){
    var len=Prop[strName].feat.n; if(typeof len=='undefined') len=maxGroupsInFeat+1;
    //if(strName in $el) {var tmpObj=$el[strName]; setRowButtF=('setRowButtF' in tmpObj)?tmpObj.setRowButtF:null, crRowButtF=('crRowButtF' in tmpObj)?tmpObj.crRowButtF:null; }
    var tmpObj=(strName in Prop)?Prop[strName]:emptyObj; 
    setRowButtF=('setRowButtF' in tmpObj)?tmpObj.setRowButtF:null; crRowButtF=('crRowButtF' in tmpObj)?tmpObj.crRowButtF:null; 
    for(var i=0;i<len;i++){
      var $staple=$('<span>').css({width:10,display:'inline-block',position:'relative',bottom:'-1px'}); 
      var $span;
      if(crRowButtF) {$span=crRowButtF(i);}
      else $span=$("<span>").css({'margin':'0 0.25em 0 0.1em'});
      var $butt=$('<button>').append($span,$staple).css({margin:'0.6em 0.2em'});  //,'vertical-align':'bottom', padding:'0.1em 0.2em',

      arrSpans.push($span);
      $butts.push($butt);
    }
    $s.append($butts);

  }

  $el.update=function(){
    vAll=hist[0]; vAllVal=hist[1];
    vOff=filt[0]; vOn=filt[1];
    
    var maxV=arr_max(hist[1].concat(1));
    var fac=1;  if(maxV>maxStaple) fac=maxStaple/maxV;
    
    var len=vAll.length;
    boHasRem=vBoHasRem[iFeat];
    var colButtOnT; if(calcAllOnNLight()) colButtOnT=colButtAllOn; else colButtOnT=colButtOn;
    
    var boWhite=filt[2];
    $butts.hide();
    
    for(var i=0;i<len;i++){
      var boThisIsRem=0; if(boHasRem && i==len-1) boThisIsRem=1;
      var boOn;  if(boThisIsRem) boOn=1-boWhite;  else boOn=Number(vOn.indexOf(vAll[i])!=-1);
      
      var colButt,colFont,colStaple;
      if(boOn) {colButt=colButtOnT; colFont=colFontOn; colStaple=colStapleOn; }
      else {colButt=colButtOff; colFont=colFontOff; colStaple=colStapleOff; }
      
      var $butt=$butts.eq(i).css({'background-color':colButt,color:colFont}).show().data({val:vAll[i]});
      var $span=arrSpans[i];
      
      if(boThisIsRem) $span.html('('+langHtml.histsRem+')');
      else {
        if(setRowButtF) {setRowButtF($span,vAll[i],boOn);}
        else{  // Text-data
          var data;
          if(Prop[strName].feat.kind=='BF') {
            //if(strName=='standingByMethod') { data=langHtml.standingByMethodsLong[vAll[i]]; } 
            //else data=Prop[strName].feat.bucket[vAll[i]];
            data=Prop[strName].feat.bucket[vAll[i]];
          } 
          else {
            data=vAll[i]; 
          }
          $span.html(data);
        }
      }
      if(boThisIsRem) { $span.css({'font-size':'80%'}); $butt.off('click').on('click',remClick); } else { $span.css({'font-size':''}); $butt.off('click').on('click',clickFunc); }  
  
      var $staple=$butt.children('span:eq(1)').css({background:colStaple,height:Math.ceil(vAllVal[i]*fac)});
      $butt.prop('title',vAllVal[i]);
    }
  }

  var strName=StrOrderFilt[iFeat];
  var filt=Filt[iFeat], hist=Hist[iFeat];
  var setRowButtF, crRowButtF;
  
  //var colButtOnClass='filterSingleOn', colButtAllOnClass='filterAllOn';

  var allOff= function(){  filt[2]=1;  filt[0]=vAll.concat([]);  filt[1].length=0;  }
  var allOnNLight= function(){  boIfAllOnDoLight=1;  filt[2]=0;  filt[0].length=0;  filt[1]=vAll.concat([]);  }
  var allOnButtClick= function(){
    if(filt[2]==0 && filt[0].length==0) {boIfAllOnDoLight=1-boIfAllOnDoLight; $el.update(); return; }  
    allOnNLight(); changeFunc();
  }
  var boBF=Prop[strName].feat.kind=='BF';
  //var boNum='type' in Prop[strName] && !Prop[strName].type.match(RegExp('varchar','i'));
  var boNum=Prop[strName].feat.kind=='BN';

  
    
  var arrSpans=[], $butts=$([]);
  var vAll=[], vAllVal=[], vOff=[], vOn=[];
  var boHasRem, boIfAllOnDoLight=1;
  var $s=$('<span>');//.css({'line-height':'2.4em'});

  var $buttOn=$('<a>').prop({href:''}).text(langHtml.All).css({'font-size':'80%'}).click(function(){allOnButtClick();return false;});
  var $buttOff=$('<a>').prop({href:''}).text(langHtml.None).css({'font-size':'80%','margin-left':'1em'}).click(function(){allOff();changeFunc();return false;});
  var $spanAllNone=$('<span>').append($buttOn,$buttOff).css({'float':'right',display:'inline-block','margin-top':'0.8em','margin-left':'0.8em'});

  $el.append($s,$spanAllNone);

  $el.addClass('unselectable');  
  $el.addClass('rowButtonFeat');  
  
  return $el;
}




      // filt: 'B/BF'-features: [vOffNames,vOnNames, boWhite],     'S'-features: [iOn,iOff]
      // hist: 'B'-features: [vPosName,vPosVal],       'S'/'BF'-features: [vPosInd,vPosVal]
Filt=function(Prop, StrOrderFilt){ 
  var el=[];  $.extend(el,Filt.tmpPrototype);
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
Filt.tmpPrototype.filtClear=function(){
"use strict"
  var el=this;
  for(var i=0;i<el.nFeat;i++){  
    var strName=el.StrOrderFilt[i], feat=el.Prop[strName].feat, kind=feat.kind, len=feat.n;
    if(kind[0]=='S') {el[i][0]=0; el[i][1]=len; }
    else if(kind[0]=='B') {   var tmp; if(kind=='BF') tmp=stepN(0,len); else tmp=[];      el[i][0]=[]; el[i][1]=tmp; el[i][2]=0;    }
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
  var el=[]; $.extend(el,Hist.tmpPrototype);  for(var i=0;i<nFeat;i++){ el[i]=[[],[]];}
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

FilterDivProt={};
FilterDivProt.update=function(){  var $el=this; for(var i=0;i<$el.nFeat;i++){ $el.arrFeat[i].update();}  } 
FilterDivProt.createDivs=function(){
"use strict"
  var $el=this;
  $el.nFeat=$el.StrOrderFilt.length;

  $el.arrFeat=[], $el.BoHasRem=[]; 

  $el.Filt=new Filt($el.Prop, $el.StrOrderFilt);  $el.Filt.filtDefault();
  $el.Hist=new Hist($el.nFeat);

  $el.helpBub=$.extend({},helpBub); if(typeof $el.Unit=='undefined') $el.Unit={};
      
  var boRangeControlOK=0;
  //if(typeof rangeExtend!='undefined') boRangeControlOK=boImgCreationOK;
  boRangeControlOK=1;
  var rangeExtender; if(boRangeControlOK) rangeExtender=rangeExtend; else rangeExtender=rangeExtendSel;


  for(var i=0;i<$el.nFeat;i++){
    var $p, $h='', $imgH='';
    var strName=$el.StrOrderFilt[i];
    var $divT=$('<div>').attr('name',strName);
    
    if(strName in $el.helpBub){ $imgH=$imgHelp.clone().css({'vertical-align':'top'});  popupHoverJQ($imgH,$el.helpBub[strName]);    }   
    var strUnit=''; if(strName in $el.Unit) strUnit=' ['+$el.Unit[strName]+']';
    if($el.Prop[strName].feat.kind[0]=='B') { 
      //$h=$('<div>').append($el.arrLabel[strName],strUnit,': ',$imgH); //.css({'margin':'0.3em 0em 0em'})
      $h=$('<div>').append(calcLabel($el.Label,strName),strUnit,': ',$imgH); //.css({'margin':'0.3em 0em 0em'})
      $p=$('<p>').css({'padding':'0.3em 0em 0em','font-size': '85%'}); 
      rowButtExtend($p, $el.Prop, $el.Filt, $el.Hist, $el.BoHasRem, $el.StrOrderFilt, i, $el.changeFunc);  $p.createCont();
    }  
    else if($el.Prop[strName].feat.kind[0]=='S') { 
      $h=$('<div>').append(calcLabel($el.Label,strName),strUnit,': ',$imgH); 
      $p=$('<p>');  $p=rangeExtender($p, $el.Prop, $el.Filt, $el.Hist, $el.BoHasRem, $el.StrOrderFilt, i, $el.changeFunc); 
      if(boRangeControlOK) {$h.css({'margin':'0 1em 0 0'});   $p.css({'line-height':'100%','padding':'0 0 1em 0','text-align':'center'}); } 
      else { $h.css({'margin':'0.3em 0em -0.4em'});  $p.css({'margin':'0',display:'block'}); }
    } 
    $h.css({height:'1.4em'});
    $p.css({margin:'0px'});
    $el.arrFeat.push($p);
    
    var $hr=$('<hr>').css({clear:'both','margin':'1em 0em 0em'});
    if(!boRangeControlOK) $hr.css({'margin':'0em 0em'});
    //$divT.append($h,$p,$hr); $el.$divCont.append($divT);
    $divT.append($h,$p); $el.$divCont.append($divT);

    if('span' in $el.Prop[strName].feat ){ 
      $divT.css({display:'inline-block', 'padding': '0 0.6em 0 0.6em','margin-right':'0.2em'}); //,'border-width':'0 1px 1px 0', 'border-style':'solid'
      $divT.children('p').children('span:last').hide(); $hr.remove();
    }else {$divT.css({ }); } //'border-width':'0 0 1px 0','border-style':'solid'
    $divT.css({'background-color':'lightgrey','margin-bottom':'0.2em', overflow:'hidden'});
  }

  $el.find('p select').change(function(){$el.changeFunc();}).css({'font-size':'95%'});

  for(var i=0;i<$el.StrGroup.length;i++){
    var $h=$('<div>').append(langHtml[$el.StrGroup[i]],':').css({'font-size':'130%','font-weight':'bold', 'margin-top':'1em'});
    $el.$divCont.find('div[name='+$el.StrGroupFirst[i]+']').before($h);
  }
}
FilterDivProt.interpretHistPHP=function(HistPHP){
"use strict"
  var $el=this;
  for(var i=0;i<$el.nFeat;i++) { 
    var strName=$el.StrOrderFilt[i]; 
    $el.Hist[i][0].length=0;$el.Hist[i][1].length=0;  
    $el.BoHasRem[i]=0;    
    if(i in HistPHP) { // <-- maybe not needed
      $el.BoHasRem[i]=HistPHP[i].pop();
      for(var j=0;j<HistPHP[i].length;j++) {  // Convert HistPHP to Hist
        $el.Hist[i][0][j]=HistPHP[i][j][0];  // HistPHP[iFeat][buttonNumber]=['name',value],  $el.Hist[iFeat][0]=names,  $el.Hist[iFeat][1]=values, 
        $el.Hist[i][1][j]=HistPHP[i][j][1];
      }
    } //else Hist[i]=[[],[]];

    if($el.Prop[strName].feat.kind[0]=='B'){
        // If button-feature: Change vOnNames/vOffNames so that they only contain buttons that are either "filtered" 
        // (occurs in speclist (whitelist or blacklist)) or buttons whose name occur in 'Hist'
        // Q: What does histogram of a feature mean? A: It means that the features filter is relaxed (removed),  (while all other features filters still are applied).
      var listType=$el.Filt[i][2],  listAlt=1-listType; // vKeepNames=boWhite?vOnNames:vOffNames 
      $el.Filt[i][listAlt]=[];
      var nButt=$el.Hist[i][0].length; if($el.BoHasRem[i]) nButt=nButt-1;  
      for(var j=0;j<nButt;j++) {
        var name=$el.Hist[i][0][j]; // name=name or index of button
        if($el.Filt[i][listType].indexOf(name)==-1) $el.Filt[i][listAlt].push(name);  // Keep $el.Filt[i][listType] as is and add any potential new "name"'s
      }
    }
  } 
}
FilterDivProt.gatherFiltData=function(){
"use strict"
  var $el=this;
  var Filt=$el.Filt;
  var o={Filt:[]};
  for(var i=0;i<Filt.length;i++){
    var strName=$el.StrOrderFilt[i];
    var filtT; if($el.Prop[strName].feat.kind[0]=='B'){ var vSpec=Filt[i][Filt[i][2]];  filtT=[vSpec,Filt[i][2]];} else filtT=Filt[i];
    o.Filt.push(filtT);
  }
  return o;
}
FilterDivProt.toStored=function(){
"use strict"
  var $el=this;
  var Filt=$el.Filt;
  //var FiltS=[];
  //for(var i=0;i<Filt.length;i++){
  //  FiltS[i]=$.extend(true, [], Filt[i]);
  //}
  var FiltS = JSON.parse(JSON.stringify(Filt));
  return FiltS;
}
FilterDivProt.frStored=function(o){
"use strict"
  var $el=this;
  var Filt=$el.Filt, FiltS=o.Filt;
  for(var i=0;i<Filt.length;i++){
    var strName=$el.StrOrderFilt[i];
    if($el.Prop[strName].feat.kind[0]=='B'){ 
      myCopy(Filt[i][0],FiltS[i][0]);  myCopy(Filt[i][1],FiltS[i][1]);
      Filt[i][2]=FiltS[i][2];
    } else  { Filt[i][0]=FiltS[i][0]; Filt[i][1]=FiltS[i][1]; }
  }
}




