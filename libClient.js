"use strict"

//
// Checking browser functionalities
//

var isGeneratorSupported = function(){ try { eval("(function*(){})()"); return true; } catch(err){ return false;}}  // mmmWiki works a bit different than the other apps (allowing public pages to be seen even if javascript doesn't work etc.)


//
// Storage, DOM etc
//

var getItem=function(name){    var tmp=localStorage.getItem(name);   if(tmp!==null) tmp=JSON.parse(tmp);  return tmp;   }
var setItem=function(name,value){  if(typeof value=='undefined') value=null; localStorage[name]=JSON.stringify(value); }
var getItemS=function(name){    var tmp=sessionStorage.getItem(name);    if(tmp!==null) tmp=JSON.parse(tmp);   return tmp;   }
var setItemS=function(name,value){  sessionStorage[name]=JSON.stringify(value); }


var httpGetAsync=function(theUrl, callback){
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() { 
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(null, xmlHttp.responseText);
  }
  xmlHttp.open("GET", theUrl, true); // true for asynchronous 
  xmlHttp.send(null);
}


var msort=function(compare){
  var length = this.length,  middle = Math.floor(length / 2);
  //if(length < 2) return this;
  if(length==0) return [];
  if(length==1) return [this[0]];
  //return merge(    this.slice(0, middle).msort(compare),    this.slice(middle, length).msort(compare),    compare    );
  var a=this.slice(0, middle),  b=this.slice(middle, length);
  return merge(    msort.call(a,compare),    msort.call(b,compare),    compare    );
}

var merge=function(left, right, compare){
  var result = [];
  while (left.length > 0 || right.length > 0){
    if(left.length > 0 && right.length > 0){
      if(compare(left[0], right[0]) <= 0){ result.push(left[0]);  left = left.slice(1);  }
      else{ result.push(right[0]); right = right.slice(1);  }
    }
    else if(left.length > 0){  result.push(left[0]);  left = left.slice(1);  }
    else if(right.length > 0){  result.push(right[0]);  right = right.slice(1);  }
  }
  return result;
}


var deepExtend=function(oA, oB) {
    // Handle the 3 simple types, and null or undefined
  if(oB==null || typeof oB != "object" ) return oB;
  
    // Handle Date
  if(oB instanceof Date){  oA = new Date(); oA.setTime(oB.getTime()); return oA;  }

    // Handle Array
  if(oB instanceof Array) {
    if(typeof oA=='undefined') oA=[];
    for(var i=0; i<oB.length; i++) oA[i]=deepExtend(oA[i],oB[i]);
    return oA;
  }
    // Handle Object
  if(oB instanceof Object) {
    if(typeof oA=='undefined') oA={};
    for(var key in oB) {
      if(oB.hasOwnProperty(key)) oA[key] = deepExtend(oA[key],oB[key]);
    }
    return oA;
  }
 
  throw new Error("Unable to copy oB! Its type isn't supported.");
};

/*******************************************************************************************************************
 * DOM handling
 *******************************************************************************************************************/

var findPos=function(el) {
  var rect = el.getBoundingClientRect();
  //return {top:rect.top+document.body.scrollTop, left:rect.left + document.body.scrollLeft};
  return {top:rect.top+window.scrollY, left:rect.left + window.scrollX};
}
//var findPosMy=function(el) {
  //var curleft = 0, curtop = 0;
  //while(1){
    //curleft += el.offsetLeft; curtop += el.offsetTop;
    //if(el.offsetParent) el = el.offsetParent; else break;
  //}
  //return { left: curleft, top: curtop };
//}


var removeChildren=function(myNode){
  while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
  }
}

var scrollTop=function(){ return window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop; }
var scrollLeft=function(){ return window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft; }

EventTarget.prototype.on=function(){ this.addEventListener.apply(this, [...arguments]); return this; }
EventTarget.prototype.off=function(){ this.removeEventListener.apply(this, [...arguments]); return this; }
//if(!Node.prototype.append) Node.prototype.append=Node.prototype.appendChild;
if(!Node.prototype.prepend) Node.prototype.prepend=function(el){ this.insertBefore(el, this.firstChild);  }
Node.prototype.myAppend=function(){ this.append.apply(this, [...arguments]); return this; }
Node.prototype.myAppendHtml=function(){
  var arg=[...arguments], elTmp=null, argB=[];
  arg.forEach(ele=>{
    if(typeof ele=='string') {
      if(!elTmp) elTmp=createElement('div');
      elTmp.innerHTML=ele;  // Convert html to nodes (found in elTmp.childNodes)
      argB.push(...elTmp.childNodes);
    } else argB.push(ele);
  }); 
  this.append.call(this, ...argB); return this;
}
Node.prototype.myBefore=function(elN){
  this.parentNode.insertBefore(elN,this); return this;
}
Node.prototype.empty = function() {
  while (this.lastChild) {
    this.lastChild.remove();
  }
  return this;
}
Element.prototype.insertChildAtIndex=function(child, index){
  if(!index) index=0;
  if(index >= this.children.length){
    this.appendChild(child);
  }else{
    this.insertBefore(child, this.children[index]);
  }
}
Element.prototype.attr=function(attr, value) {
  if(!attr) return;
  if(typeof attr=='string') {
    if(arguments.length<2) return this.getAttribute(attr);
    this.setAttribute(attr, value); return this;
  }
  for(var key in attr) { this.setAttribute(key, attr[key]);}
  return this;
}
Element.prototype.prop=function(prop, value) {
  if(!prop) return;
  if(typeof prop=='string') {
    if(arguments.length<2) return this[prop];
    this[prop]=value; return this;
  }
  for(var key in prop) { this[key]=prop[key];}
  return this;
}
Element.prototype.css=function(style, value) {
  if(!style) return;
  if(typeof style=='string') {
    if(arguments.length<2) return this.style[style];
    this.style[style]=value; return this;
  }
  for(var key in style) { this.style[key]=style[key];}
  return this;
}
Element.prototype.addClass=function() {this.classList.add(...arguments);return this;}
Element.prototype.removeClass=function() {this.classList.remove(...arguments);return this;}
Element.prototype.toggleClass=function() {this.classList.toggle(...arguments);return this;}
Element.prototype.hasClass=function() {return this.classList.contains(...arguments);}
Node.prototype.cssChildren=function(styles){  this.childNodes.forEach(function(elA){ Object.assign(elA.style, styles);  }); return this;  }
Node.prototype.myText=function(str){
  if(arguments.length==0) { return this.textContent; }
  if(typeof str!='string') { if(str==null) str=' '; str=str.toString(); }
  if(this.childNodes.length==1 && this.firstChild.nodeName=="#text" ) { this.firstChild.nodeValue=str||' ';  return this;} // Being a bit GC-friendly
  this.textContent=str||' '; return this;
}
Node.prototype.myHtml=function(str=' '){
  if(typeof str!='string') { if(str==null) str=' '; str=str.toString(); }
  this.innerHTML=str||' '; return this;
}
Node.prototype.hide=function(){
  if(this.style.display=='none') return this;
  this.displayLast=this.style.display;
  this.style.display='none';
  return this;
}
Node.prototype.show=function(){
  if(this.style.display!='none') return this;
  if(typeof this.displayLast!='undefined') var tmp=this.displayLast; else var tmp='';
  this.style.display=tmp;
  return this;
}
Node.prototype.toggle=function(b){
  if(typeof b=='undefined') b=this.style.display=='none'?1:0;
  if(b==0) this.hide(); else this.show();
  return this;
}
NodeList.prototype.toggle=function(b){
  if(typeof b=='undefined') {if(this.length) b=this[0].style.display=='none'?1:0; else return this;}
  this.forEach(function(ele){ ele.toggle(b); });
  return this;
}
var createTextNode=function(str){ return document.createTextNode(str); }
var createElement=function(str){ return document.createElement(str); }
var createFragment=function(){ var fr=document.createDocumentFragment(); if(arguments.length) fr.append(...arguments); return fr; }

var getNodeIndex=function( elm ){ return [...elm.parentNode.childNodes].indexOf(elm); }
Element.prototype.myIndex=function() {return [...this.parentNode.childNodes].indexOf(this);}

Element.prototype.offset=function() {
  var rect = this.getBoundingClientRect();
  return { top: rect.top + document.body.scrollTop,  left: rect.left + document.body.scrollLeft  };
}

Element.prototype.visible = function() {    this.style.visibility='';  return this;};
Element.prototype.invisible = function() {    this.style.visibility='hidden'; return this; };
Element.prototype.visibilityToggle=function(b){
  if(typeof b=='undefined') b=this.style.visibility=='hidden'?1:0;
  this.style.visibility= b?'':'hidden';
  return this;
};

Node.prototype.detach=function(){ this.remove(); return this; }

var isVisible=function(el) {
  return !!( el.offsetWidth || el.offsetHeight || el.getClientRects().length );
}





/*******************************************************************************************************************
 * popupHover: popup a elBubble when you hover over elArea
 *******************************************************************************************************************/
var popupHover=function(elArea, elBubble, tClose=4){
  elBubble.css({position:'absolute', 'box-sizing':'border-box', margin:'0px', 'text-align':'left'}); //
  function setBubblePos(e){
    var xClear=6, yClear=6;
    var x = e.pageX, y = e.pageY;

    var borderMarg=10;
    var winW=window.innerWidth,winH=window.innerHeight,   bubW=elBubble.clientWidth,bubH=elBubble.clientHeight,   scrollX=scrollLeft(),scrollY=scrollTop();


    var boRight=true, boBottom=true;

    var boMounted=Boolean(elBubble.parentNode);
    if(boMounted){
      var xFar=x+xClear+bubW, xBorder=scrollX+winW-borderMarg;
      if(xFar<xBorder){ 
        x=x+xClear;
      } else {
        x=x-bubW-xClear;  // if the bubble doesn't fit on the right side then flip to the left side
        //x=x-xClear; boRight=false;
      }
        
      var yFar=y+yClear+bubH, yBorder=scrollY+winH-borderMarg;
      if(yFar<yBorder) {
        y=y+yClear;
      }else{ 
        y=y-bubH-yClear;   // if the bubble doesn't fit below then flip to above
        //y=y-yClear; boBottom=false;
      }
    } else {
      x=x+xClear;
      y=y+yClear;
    }
    if(x<scrollX) x=scrollX;
    if(y<scrollY) y=scrollY;
    //elBubble.style.top=y+'px'; elBubble.style.left=x+'px';
    elBubble.css({top:y+'px', left:x+'px'});
    //if(boRight) {elBubble.style.left=x+'px'; elBubble.style.right='';} else {elBubble.style.left=''; elBubble.style.right=x+'px'; }
    //if(boBottom) {elBubble.style.top=y+'px'; elBubble.style.bottom='';} else {elBubble.style.top=''; elBubble.style.bottom=y+'px'; } 
  };
  var closeFunc=function(){ 
    if(boTouch){ 
      elBubble.remove(); 
      if(boIOSTmp) elBlanket.remove();
      clearTimeout(timer);
    } 
    else { elBubble.remove();  }
  }
  var elBlanket, timer, boIOSTmp=boTouch;
  if(boIOSTmp){
    elBlanket=createElement('div').css({'background':'#555',opacity:0,'z-index': 9001,top:'0px',left:'0px',width:'100%',position:'fixed',height:'100%'});
    elBlanket.on('click', closeFunc);
  }
  if(boTouch){
    elArea.on('click', function(e){
      e.stopPropagation();
      if(elBubble.parentNode) closeFunc();
      else {
        elBody.append(elBubble); setBubblePos(e);
        clearTimeout(timer);  if(tClose) timer=setTimeout(closeFunc, tClose*1000);
        if(boIOSTmp) elBody.append(elBlanket);
      }
    });
    elBubble.on('click', closeFunc);
    elHtml.on('click', closeFunc);
    
  }else{
    elArea.on('mousemove', setBubblePos);  
    elArea.on('mouseenter', function(e){elBody.append(elBubble);});
    elArea.on('mouseleave', closeFunc);
  }
  elBubble.classList.add('popupHover'); 
}



/*******************************************************************************************************************
 * menuExtend (Display a menu under (or above) a button (when button is clicked))       (mousedown, drag, mouseup-on-option)
 *******************************************************************************************************************/
var menuExtend=function(el, ElItem=[]){
  //  var objEdgeDist=$menu[0].getBoundingClientRect();
  el.openFunc=function(e,elButton,ElItemT){ 
    e.stopPropagation();
    if(el.parentNode) { el.closeFunc();  return; }
    if(e.which==3) return;

    if(typeof ElItemT!='undefined') {
      ElItem=ElItemT;  el.empty();   el.append(...ElItem);
    }
    //elItems.classList.add('menuItem');
    el.childNodes.forEach(function(elA){ elA.classList.add('menuItem');});
    el.childNodes.forEach(function(elA){ elA.style.background='';});
    
    //var elAncestor=elButton.offsetParent || elHtml;
    elBody.append(el);

    var x,y;

    //var winW=window.innerWidth,winH=window.innerHeight;
    var winW=document.documentElement.clientWidth,winH=document.documentElement.clientHeight,   butW=elButton.clientWidth,butH=elButton.clientHeight,   scrollX=scrollLeft(),scrollY=scrollTop();
    
    var {left:xButt, top:yButt}=findPos(elButton);
    var winEdgeX=scrollX+winW, winEdgeY=scrollY+winH; 
    
    //var margLeft=xButt-scrollX, margRight=winEdgeX-(xButt+butW);
    //var margTop=yButt-scrollY, margBottom=winEdgeY-(yButt+butH);
    var margLeft=xButt, margRight=winW-(xButt+butW);
    var margTop=yButt, margBottom=winH-(yButt+butH);
    var boRight=margRight>=margLeft; 
    var boDown, boYFits=1;
    var hExtraMargin=boAndroid&&boChrome?55:5;
    if(margBottom>el.offsetHeight+hExtraMargin) {boDown=1;} // If there is room below
    else if(margTop>el.offsetHeight+5) {boDown=0;} // If there is room above
    else {boDown=1; boYFits=0; }
    
    //var xButtAnc=elButton.offsetLeft, yButtAnc=elButton.offsetTop; 

    var cssEl;
    if(boRight) {x=xButt; cssEl={left:Number(x)+'px',right:''};}
    else { x=elBody.clientWidth-xButt-elButton.offsetWidth; cssEl={left:'',right:Number(x)+'px'};}
    el.css(cssEl);
    if(boYFits){
      if(boDown) {y=yButt+elButton.offsetHeight; cssEl={top:Number(y)+'px',bottom:''};}
      else { y=yButt-el.offsetHeight; cssEl={top:Number(y)+'px',bottom:''};}
    }else{
      //var posAncestor=findPos(elAncestor);
      y=scrollY; //-posAncestor.top;
      y=boIOS?Math.max(0,y):y; cssEl={top:Number(y)+'px',bottom:''};
    }
    el.css(cssEl);
  }
  if(typeof ElItem=='undefined') {ElItem=[];}  
  else { 
    el.append(...ElItem);
    //elItems.childNodes.forEach(function(){this.classList.add('menuItem');});
    ElItem.forEach(ele=>ele.classList.add('menuItem'));
    
  }
  
  el.closeFunc=function() {  
    el.remove();
  } 

  var objCss={position:'absolute',border:'black 1px solid',background:'#fff',cursor:'pointer', 'z-index':100};
  el.css(objCss);
  //$el.on('mouseover','.menuItem',function(e){$(this).css({background:'grey'});});
  //$el.on('mouseout','.menuItem',function(e){$(this).css({background:''});});
  //$el.on('mouseup','.menuItem',function(e){$(this).css({background:''});});

  el.on('mouseover', function(e) {
    if(e.target.classList.contains('menuItem')) {
        e.target.style.background='grey';  }
  });
  el.on('mouseout', function(e) {
    if(e.target.classList.contains('menuItem')) {
        e.target.style.background='';  }
  });
  el.on('mouseup', function(e) {
    if(e.target.classList.contains('menuItem')) {
        e.target.style.background='';  }
  });

  var strEventOff='mouseup'; if(boTouch) strEventOff='click';
  if(boTouch) {el.style['line-height']=2;}
  //$('html').on(strEventOff,$el.closeFunc);
  elHtml.on(strEventOff, el.closeFunc)
  return el;
}

/*******************************************************************************************************************
 * popupDragExtend  (Display a draggable bubble (div) (when button is clicked))
 *******************************************************************************************************************/

var popupDragExtendM=function(elBubble,strTitle,elParent){ 
  elBubble.css({position:'absolute','z-index':200,'background-color':'#ccc','text-align':'left',padding:'0em',border:'solid black 1px'}); 
  popupDragExtend(elBubble,strTitle,elParent);
  return elBubble;
}

var popupDragExtend=function(elBubble,strTitle,elParent){
  var xLoc, yLoc, xBubStart, xMouseStart, wBubStart, wWinStart;
  var mouseDownGrab= function(e){
    var e = e || window.event; if(e.which==3) return; 
    var pTmp; if(boTouch) {e.preventDefault(); pTmp=e.changedTouches[0]; }  else pTmp=e;     var mouseX=pTmp.pageX, mouseY=pTmp.pageY;
    var {left:xBub, top:yBub}=findPos(elBubble);
    xLoc=mouseX-xBub;yLoc=mouseY-yBub;
    wBubStart=elBubble.offsetWidth; wWinStart=window.innerWidth;
    xBubStart=xBub;

    elBubble.css({opacity:0.70,'z-index':'auto'});  
    elParent.on(strEventMove,mouseMoveGrab); elParent.on(strEventEnd,mouseUpGrab);
    elDragBarB.css({cursor:'move'});
    //setMess('Down');
    if(e.cancelable) e.preventDefault(); 
    return false;
  } 
  var mouseUpGrab= function(e){  
    elBubble.css({opacity:1,'z-index':'auto'});
    elParent.off(strEventMove,mouseMoveGrab); elParent.off(strEventEnd,mouseUpGrab); 
    elDragBarB.css({cursor:'-webkit-grab'});
    if(e.cancelable) e.preventDefault(); 
    return false;
  } 
  var mouseMoveGrab= function(e){ 
    var pTmp; if(boTouch) {e.preventDefault(); pTmp=e.changedTouches[0]; }  else pTmp=e;     var mouseX=pTmp.pageX, mouseY=pTmp.pageY;
    var xBub=mouseX-xLoc, yBub=mouseY-yLoc;
    var xBubR=xBub+wBubStart;
    var wBub=wBubStart;
    if(xBub<0) {
      wBub=wBubStart+xBub; xBub=0;
      if(wBub<minBubWidth) wBub=minBubWidth;
    } 

    if(xBubR>wWinStart) {
      wBub=wWinStart-xBub;
      if(wBub<minBubWidth) {wBub=minBubWidth; xBub=wWinStart-wBub; }
    }
    elBubble.css({width:wBub+'px'});

    if(yBub<0) yBub=0;
    //elBubble.offset({ left: xBub, top: yBub});
    elBubble.css({ left: xBub+'px', top: yBub+'px'});
    if(e.cancelable) e.preventDefault(); 
    return false;
  };

  var mouseDownNW= function(e){
    var e = e || window.event; if(e.which==3) return; 
    var pTmp; if(boTouch) {e.preventDefault(); pTmp=e.changedTouches[0]; }  else pTmp=e;     var mouseX=pTmp.pageX, mouseY=pTmp.pageY;
    var {left:xBub, top:yBub}=findPos(elBubble);
    xBubStart=xBub;
    xLoc=mouseX-xBub;yLoc=mouseY-yBub;
    wBubStart=elBubble.offsetWidth;
    elBubble.css({opacity:0.70,'z-index':'auto'});     elParent.on(strEventMove,mouseMoveNW); elParent.on(strEventEnd,mouseUpNW); 
    if(e.cancelable) e.preventDefault();   
    return false;
  } 
  var mouseUpNW= function(e){  
    elBubble.css({opacity:1,'z-index':'auto'});    elParent.off(strEventMove,mouseMoveNW); elParent.off(strEventEnd,mouseUpNW);
    if(e.cancelable) e.preventDefault(); 
    return false;
  } 
  var mouseMoveNW= function(e){
    var pTmp; if(boTouch) {e.preventDefault(); pTmp=e.changedTouches[0]; }  else pTmp=e;     var mouseX=pTmp.pageX, mouseY=pTmp.pageY;
    var xBub=mouseX-xLoc, yBub=mouseY-yLoc;
    if(xBub<0) {xBub=0; }
    var xDiff=xBub-xBubStart, wBub=wBubStart-xDiff;

    if(wBub<minBubWidth) {wBub=minBubWidth; xBub=xBubStart-(wBub-wBubStart); }
    elBubble.css({width:wBub+'px'});
    if(yBub<0) yBub=0;
    //elBubble.offset({ left: xBub, top: yBub});
    elBubble.css({ left: xBub+'px', top: yBub+'px'});
    if(e.cancelable) e.preventDefault(); 
    return false;
  };

  var mouseDownNE= function(e){
    var e = e || window.event; if(e.which==3) return;
    var pTmp; if(boTouch) {e.preventDefault(); pTmp=e.changedTouches[0]; }  else pTmp=e;     var mouseX=pTmp.pageX, mouseY=pTmp.pageY;
    var {left:xBub, top:yBub}=findPos(elBubble);
    xMouseStart=mouseX; xBubStart=xBub; wWinStart=window.innerWidth;
    xLoc=mouseX-xBub;yLoc=mouseY-yBub;
    wBubStart=elBubble.offsetWidth;
    elBubble.css({opacity:0.70,'z-index':'auto'});     elParent.on(strEventMove,mouseMoveNE); elParent.on(strEventEnd,mouseUpNE); 
    if(e.cancelable) e.preventDefault();    
    return false;
  } 
  var mouseUpNE= function(e){
    elBubble.css({opacity:1,'z-index':'auto'});    elParent.off(strEventMove,mouseMoveNE); elParent.off(strEventEnd,mouseUpNE);
    if(e.cancelable) e.preventDefault(); 
    return false;
  } 
  var mouseMoveNE= function(e){
    var pTmp; if(boTouch) {e.preventDefault(); pTmp=e.changedTouches[0]; }  else pTmp=e;     var mouseX=pTmp.pageX, mouseY=pTmp.pageY;
    var xBub=xBubStart, yBub=mouseY-yLoc;
    var xDiff=mouseX-xMouseStart;
    var wBub=wBubStart+xDiff;
    var xBubR=xBubStart+wBub;  if(xBubR>wWinStart) {wBub=wWinStart-xBubStart; }
    if(wBub<minBubWidth) wBub=minBubWidth;
    elBubble.css({width:wBub+'px'});
    if(yBub<0) yBub=0;
    //elBubble.offset({ top: yBub});
    elBubble.css({ top: yBub+'px'});
    if(e.cancelable) e.preventDefault(); 
    return false;
  };

  var minBubWidth=140; 
  if(typeof elParent=='undefined') elParent=elBody;
  elBubble.openFunc=function(){ elParent.append(elBubble);  }
  elBubble.closeFunc=function(){ elBubble.remove();  }
  elBubble.toggleFunc=function(boOn){  if(typeof boOn=='undefined') boOn=!Boolean(elBubble.parentNode); if(boOn) elParent.append(elBubble); else elBubble.remove();}

  strTitle=(typeof strTitle==='undefined')?'':strTitle;
  //var elDeleteButton=$('<img>').attr({src:uDelete}).mouseover(function(){$(this).attr({src:uDelete1})}).mouseout(function(){$(this).attr({src:uDelete})})
  //     .click(function(){elBubble.closeFunc();}).css({cursor:'pointer'});
  var elDeleteButton=createElement('div'); elDeleteButton.append(createTextNode('✖'));
  elDeleteButton.on('click', function(e){
    elBubble.closeFunc(); e.preventDefault(); 
    return false;
  });
  if(!boTouch){
    elDeleteButton.on('mouseover', function(){this.css({'font-weight':'bold', color:'white'});})
    elDeleteButton.on('mouseout', function(){this.css({'font-weight':'', color:''});});
  }


  var strEventStart='mousedown', strEventMove='mousemove', strEventEnd='mouseup'; if(boTouch){strEventStart='touchstart'; strEventMove='touchmove'; strEventEnd='touchend';}

  var floatSize=1.30;
  elDeleteButton.css({flex:'0 0 '+floatSize+'em', cursor:'pointer', background:'red'}); 

  var elDragBarA=createElement('div'), elDragBarB=createElement('div'), elDragBarC=createElement('div');
  
  var arrDragBar=[elDragBarA, elDragBarB, elDragBarC]; arrDragBar.forEach(ele=>ele.css({ background:'darkgrey', flex:'1 1 33%'}));
  arrDragBar.push(elDeleteButton); arrDragBar.forEach(ele=>ele.css({ height:'100%', 'box-sizing':'border-box', 'text-align':'center'})); 
  if(boIOS) {  arrDragBar.forEach(ele=>ele.css({width:'25%', 'box-sizing':'border-box', display:'inline-block', 'vertical-align':'top'}));  }
  
  //var fragDragBar=createFragment();
  //fragDragBar.append(elDragBarA, elDragBarB, elDragBarC);
  //fragDragBar.css({ background:'darkgrey', flex:'1 1 33%'});
  //fragDragBar.append(elDeleteButton);
  //fragDragBar.css({ height:'100%', 'box-sizing':'border-box', 'text-align':'center'});
  //if(boIOS) {  fragDragBar.css({width:'25%', 'box-sizing':'border-box', display:'inline-block', 'vertical-align':'top'});  }
  
  elDragBarB.css({background:'grey'});

  var elTitle=createElement('div').css({color:'white', position:'absolute', top:'0px', 'text-align':'center', width:'100%', 'white-space':'nowrap'});
  elTitle.append(createTextNode(strTitle));
  var elBar=createElement('div').css({height:floatSize+'em',position:'relative',display:'flex'});
  elBar.append(elDragBarA, elDragBarB, elDeleteButton, elDragBarC, elTitle);
  elBubble.prepend(elBar);
 
  elDragBarA.on(strEventStart,mouseDownNW); elDragBarA.css({cursor:'nw-resize'});
  elDragBarB.on(strEventStart,mouseDownGrab); elDragBarB.css({cursor:'-webkit-grab'});
  elDragBarC.on(strEventStart,mouseDownNE); elDragBarC.css({cursor:'ne-resize'});

//⬌⬍↔↕╔╗⤢⤡⇱⌜⌝

  elTitle.setAttribute.UNSELECTABLE="on"; elTitle.classList.add('unselectable');
  
  //elArea.on('click', function(e) {     if(elBubble.parentNode) elBubble.closeFunc();  else {  e.stopPropagation();  elBubble.openFunc();  }     });
  
  elBubble.css({left:'0px',top:'0px', 'box-sizing':'border-box', 'min-width':'8em'});
  return elBubble;
}

