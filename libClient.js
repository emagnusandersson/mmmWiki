


//
// Storage, DOM etc
//
/*
if(typeof(sessionStorage) == 'undefined'){
    sessionStorage = {
        getItem: function(){return null;},
        setItem: function(){}
    };
}
if(typeof(localStorage) == 'undefined'){
    localStorage = {
        getItem: function(){return null;},
        setItem: function(){}
    };
}*/
getItem=function(name){    var tmp=localStorage.getItem(name);   if(tmp!==null) tmp=JSON.parse(tmp);  return tmp;   }
setItem=function(name,value){  if(typeof value=='undefined') value=null; localStorage[name]=JSON.stringify(value); }
getItemS=function(name){    var tmp=sessionStorage.getItem(name);    if(tmp!==null) tmp=JSON.parse(tmp);   return tmp;   }
setItemS=function(name,value){  sessionStorage[name]=JSON.stringify(value); }


uVipp0="lib/image/vipp0.png";
uVipp1="lib/image/vipp1.png";
var vippButtonExtend=function($el){
"use strict"
  $el.setStat=function(bo1){
    if(!bo1) {$el.css(o0);} else {$el.css(o1);} 
    $el.attr({boOn:bo1});
  }
  var o0={background:'url('+uVipp0+') no-repeat'}, o1={background:'url('+uVipp1+') no-repeat'};
    
  $el.attr({boOn:0});
  $el.css({'background':'url('+uVipp0+') no-repeat',height:'54px',width:'102px',zoom:'60%','vertical-align':'-0.5em',cursor:'pointer',display:'inline-block'}).addClass('unselectable');
  $el.on('click',function(){var t=1-$el.attr('boOn');   $el.setStat(t);});
  return $el;
}

httpGetAsync=function(theUrl, callback){
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() { 
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", theUrl, true); // true for asynchronous 
  xmlHttp.send(null);
}

//
// Hardware checking
//

getBrowser=function(){
    var ua=navigator.userAgent.toLowerCase();

    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
        /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
        /(msie) ([\w.]+)/.exec( ua ) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
        [];

    var brand=match[ 1 ] || "";
    var version=match[ 2 ] || "0";
    
    return {brand:brand,version:version};
};
detectIE=function() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // IE 12 => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

isGeneratorSupported = function(){
    try {
       eval("(function*(){})()");
       return true;
    } catch(err){
       return false;
    }
}

//
// JQuery extentions
//

// $.fn.push = function(selector) {    Array.prototype.push.apply(this, $.makeArray($(selector)));   return this;   };
$.fn.pushOne = function(selector){
    Array.prototype.push.apply(this, $.makeArray($(selector)));
    return this;
};
$.fn.push = function(){
  for(var i=0; i<arguments.length; i++){
    this.pushOne(arguments[i]);
  }
  return this;
}
$.fn.visible = function() {    return this.css('visibility', 'visible');  };
$.fn.invisible = function() {    return this.css('visibility', 'hidden');  };
$.fn.visibilityToggle = function() {
    if(arguments.length) return this.css('visibility', arguments[0]?'visible':'hidden');
    return this.css('visibility', function(i, visibility) {
        return (visibility == 'visible') ? 'hidden' : 'visible';
    });
};
$.fn.sortElements = (function(){
 
    var funcSort = [].sort;
    //var funcSort=merge_sort;
    var funcSort = [].msort;
 
    return function(comparator, getSortable){
 
        getSortable = getSortable || function(){return this;};
 
        var placements = this.map(function(){   // A vector of functions, each function asumes that its 'this' will be the moved object, which will then be moved to the corresponding 'flagNode'
 
            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
 
                // Since the element itself will change position, we have
                // to have some way of storing it's original position in
                // the DOM. The easiest way is to have a 'flag' node:
                flagNode = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                );
 
            return function(){
 
                if (parentNode === this){
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }
 
                // Insert before flag:
                parentNode.insertBefore(this, flagNode);
                // Remove flag:
                parentNode.removeChild(flagNode);
 
            };
 
        });
 

        //var tmp=funcSort.call(this, comparator); 
        //var tmp=this.msort(comparator); 
        var tmp=msort.call(this,comparator); 

        //var tmp=merge_sort(this, comparator); 
        return tmp.forEach(function(v,i){
            placements[i].call(getSortable.call(v));
        });
        /*return this.each(function(i){
            placements[i].call(getSortable.call(this));
        });*/
        //return funcSort.call(this, comparator).each(function(i){
        //    placements[i].call(getSortable.call(this));
        //});
 
    };
 
})();



// Add stable merge sort to Array and jQuery prototypes

  // expose to Array and jQuery
//Array.prototype.msort = $.fn.msort = msort;

msort=function(compare){
"use strict"
  var length = this.length,  middle = Math.floor(length / 2);
  //if(length < 2) return this;
  if(length==0) return [];
  if(length==1) return [this[0]];
  //return merge(    this.slice(0, middle).msort(compare),    this.slice(middle, length).msort(compare),    compare    );
  var a=this.slice(0, middle),  b=this.slice(middle, length);
  return merge(    msort.call(a,compare),    msort.call(b,compare),    compare    );
}

merge=function(left, right, compare){
"use strict"
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

  
var extend=function(out) {
  out=out||{};
  for(var i=1; i<arguments.length; i++) {
    if(!arguments[i]) continue;
    for(var key in arguments[i]) {    if(arguments[i].hasOwnProperty(key)) out[key]=arguments[i][key];     }
  }
  return out;
};

/*******************************************************************************************************************
 * DOM handling (non-jQuery)
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
var jQueryObjToFragment=function($items){
"use strict"
  var fragment = createFragment();
  for(var i=0; i<$items.length; i++){ fragment.append($items[i]); }
  return fragment;
}

var scrollTop=function(){ return window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop; }
var scrollLeft=function(){ return window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft; }

EventTarget.prototype.on=EventTarget.prototype.addEventListener;
EventTarget.prototype.off=EventTarget.prototype.removeEventListener;
if(!Node.prototype.append) Node.prototype.append=Node.prototype.appendChild;
if(!Node.prototype.prepend) Node.prototype.prepend=function(el){ this.insertBefore(el, this.firstChild);  }

Node.prototype.appendChildren=function() {
  for(var i=0; i<arguments.length; i++)
    this.append(arguments[i]);
  return this;
}
Node.prototype.css=function(styles, boChildren=false){
  if(this instanceof DocumentFragment) boChildren=true;
  if(!boChildren) Object.assign(this.style, styles);
  else 
    this.childNodes.forEach(function(elA){ Object.assign(elA.style, styles);  });
  return this;
}
createTextNode=function(str){ return document.createTextNode(str); }
createElement=function(str){ return document.createElement(str); }
createFragment=function(str){ return document.createDocumentFragment(); }

isVisible=function(el) {
    return !!( el.offsetWidth || el.offsetHeight || el.getClientRects().length );
}


/*******************************************************************************************************************
 * popupHover: popup a elBubble when you hover over elArea
 *******************************************************************************************************************/
function popupHover(elArea,elBubble){
  elBubble.css({position:'absolute', 'box-sizing':'border-box', margin:'0px'}); //
  function setBubblePos(e){
    var xClear=6, yClear=6;
    var x = e.pageX, y = e.pageY;

    var borderMarg=10;
    //var $win = $(window), $doc=$(document);
    //var winW=$win.width(),winH=$win.height(),   bubW=$(elBubble).width(),bubH=$(elBubble).height(),   scrollX=$doc.scrollLeft(),scrollY=$doc.scrollTop();
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
      if(boIOS) elBlanket.remove();
    } 
    else { elBubble.remove();  }
  }
  var elBlanket;
  if(boIOS){
    //$blanket=$('<div>').css({'background':'#555',opacity:0,'z-index': 9001,top:'0px',left:'0px',width:'100%',position:'fixed',height:'100%'}).click(closeFunc);
    elBlanket=createElement('div').css({'background':'#555',opacity:0,'z-index': 9001,top:'0px',left:'0px',width:'100%',position:'fixed',height:'100%'});
    elBlanket.on('click', closeFunc);
  }
  if(boTouch){
    elArea.on('click', function(e){ e.stopPropagation();  elBody.append(elBubble); setBubblePos(e); setTimeout(closeFunc, 4000); if(boIOS) elBody.append(elBlanket);  });
    elBubble.on('click', function(e){ closeFunc(); });
    elHtml.on('click', function(e){ closeFunc(); });
    
  }else{
    elArea.on('mousemove', setBubblePos);  
    elArea.on('mouseenter', function(e){elBody.append(elBubble);});
    elArea.on('mouseleave', function(){elBubble.remove();});
  }
  elBubble.classList.add('popupHover'); 
}

  // Wrappers of popupHover
function popupHoverM(elArea,elBubble){
  elBubble.css({'z-index':9005,'text-align':'left',padding:'0.4em'}); 
  popupHover(elArea,elBubble);    
  return elArea;
}
function popupHoverJQ($area,$bubble){
  $bubble.css({'z-index':9005,'text-align':'left',padding:'0.4em'});  
  popupHover($area[0],$bubble[0]);    
  return $area;
}

//document.onmousemove = function(e){
//var x = e.pageX;
//var y = e.pageY;
//e.target.title = "X is "+x+" and Y is "+y;
//};

/*******************************************************************************************************************
 * menuExtend (Display a menu under (or above) a button (when button is clicked))       (mousedown, drag, mouseup-on-option)
 *******************************************************************************************************************/
var menuExtend=function(el, elItems){
"use strict"
  //  var objEdgeDist=$menu[0].getBoundingClientRect();
  el.openFunc=function(e,elButton,elItemsT){ 
    e.stopPropagation();
    if(el.parentNode) { el.closeFunc();  return; }
    if(e.which==3) return;

    if(typeof elItemsT!='undefined') {
      elItems=elItemsT;  removeChildren(el);   el.append(elItems);
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
  if(typeof elItems=='undefined') {elItems=createFragment();}  
  else { 
    el.append(elItems);
    elItems.childNodes.forEach(function(){this.classList.add('menuItem');});
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

function popupDragExtendM(elBubble,strTitle,elParent){ 
  elBubble.css({position:'absolute','z-index':200,'background-color':'#ccc','text-align':'left',padding:'0em',border:'solid black 1px'}); 
  popupDragExtend(elBubble,strTitle,elParent);
  return elBubble;
}

function popupDragExtend(elBubble,strTitle,elParent){
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
  var fragDragBar=createFragment();
  fragDragBar.appendChildren(elDragBarA, elDragBarB, elDragBarC);
  fragDragBar.css({ background:'darkgrey', flex:'1 1 33%'});
  fragDragBar.append(elDeleteButton);
  fragDragBar.css({ height:'100%', 'box-sizing':'border-box', 'text-align':'center'});
  if(boIOS) {  fragDragBar.css({width:'25%', 'box-sizing':'border-box', display:'inline-block', 'vertical-align':'top'});  }
  elDragBarB.css({background:'grey'});

  var elTitle=createElement('div').css({color:'white', position:'absolute', top:'0px', 'text-align':'center', width:'100%', 'white-space':'nowrap'});
  elTitle.append(createTextNode(strTitle));
  var elBar=createElement('div').css({height:floatSize+'em',position:'relative',display:'flex'});
  elBar.appendChildren(elDragBarA, elDragBarB, elDeleteButton, elDragBarC, elTitle);
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

