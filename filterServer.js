"use strict"

app.setUpCond=function(arg){
  var {Prop, Filt}=arg; // KeySel, 
  var StrProp=Object.keys(Filt);
  var Where=[];

      // Filt (client-side): 'B/BF'-features: [vOffNames,vOnNames, boWhite],     'S'-features: [iOn,iOff]
      // Filt (server-side): 'B/BF'-features: [vSpec, boWhite],     'S'-features: [iOn,iOff]
      // Hist (client-side): 'B'-features: [vPosName,vPosVal],       'S'/'BF'-features: [vPosInd,vPosVal]
      // Hist (server-side): histsPHP[iFeat][buttonNumber]=['name',value], (converts to:) Hist[iFeat][0]=names,  Hist[iFeat][1]=values
  for(var i=0;i<StrProp.length;i++){
    var name=StrProp[i];    name=mongoSanitize(name);
    var filt=Filt[name];
    if(!is_array(filt)) {return [new Error(`Filt property ${i} not OK.`)];  }
    if(filt.length==0) continue;
    var {feat, condBNameF, condBNullF, condBF, cond0F, cond1F}=Prop[name];  //condBNameF
    var objCondFeat=null;
    if(feat.kind[0]=='B'){
      if(!is_array(filt[0])) {return [new Error(`Filt[${name}][0] is not an array.`)];  }
      var [arrSpec, boWhite]=filt;
      var nameB=condBNameF?condBNameF(name):name;
      if(condBF){
        objCondFeat=condBF(name,boWhite,arrSpec);
      }else{

        var ind=arrSpec.indexOf(null), Cond=[];
        if(ind!=-1) {  mySplice1(arrSpec,ind); Cond.push(condBNullF(nameB,boWhite));   }
        var len=arrSpec.length, arrSpecEscaped=Array(len);
        for(var j=0;j<len;j++){    arrSpecEscaped[j]=mongoSanitize(arrSpec[j]);  }

        if(len) {
          var strMethod=boWhite?'$in':'$nin';
          var objTmp={}; objTmp[strMethod]=arrSpecEscaped;
          var objTmpB={}; objTmpB[nameB]=objTmp;
          Cond.push(objTmpB);
        }
        if(Cond.length){
          if(Cond.length==1) {  objCondFeat=Cond[0]; }//Where[nameB]=Cond[0];
          else if(Cond.length>1){
            var strMethod=boWhite?'$or':'$and';
            var objTmp={}; objTmp[strMethod]=Cond; objCondFeat=objTmp; //Where[nameB]={}; Where[nameB][strMethod]=Cond;
          } 
        }
      }
      
    } else {
      var [iOn,iOff]=filt;
      var val0=feat.min[iOn]; if(iOn==feat.n) val0=feat.max[feat.n-1];
      var val1=feat.max[iOff-1]; if(iOff==0) val1=feat.min[0];
      var objCond={}, boInc=0;
      if(iOn>0) {
        if(cond0F) cond0F(objCond, name, val0); else objCond.$gte=val0;     boInc=1;
      }
      if(iOff<feat.n) {
        if(cond1F) cond1F(objCond, name, val1); else objCond.$lt=val1;    boInc=1;
      }
      if(boInc) {objCondFeat={}; objCondFeat[name]=objCond;}
    }
    Where[i]=objCondFeat;
  }
  // var arrCol=[],ii=0;
  // for(var i=0;i<KeySel.length;i++) {
  //   var key=KeySel[i], b=Prop[key].b, pre=Prop[key].pre||preDefault;
  //   var tmp; if('selF' in Prop[key]) { tmp=Prop[key].selF(pre+key);  }   else tmp=`${pre}\`${key}\``;
  //   arrCol.push(`${tmp} AS \`${key}\``); ii++;
  // }
  // var strSel=arrCol.join(', ');
  // return {strSel, Where}; //, nColTrans:ii
  //var Where={$and:ArrWhere};
  return [null,{Where}]; //, nColTrans:ii

}

// condB->condBNameF
// histColF->binKeyExp, histCountF->binValueF
// relaxCountExp




app.HistCalc=function(arg){
  //var {Prop}=arg;
  //var StrProp=Object.keys(arg.Filt), nFilt=StrProp.length;
  copySome(this, arg, ['Prop', 'Filt', 'collection']);
  this.WhereWExtra=array_merge(arg.Where,arg.WhereExtra);
  //this.WhereWExtra=extend(arg.Where, arg.WhereExtra);
}
app.HistCalc.prototype.getHist=async function(){
  var StrProp=Object.keys(this.Filt), nFilt=StrProp.length;
  var Hist=Array(nFilt);
  for(var i=0;i<nFilt;i++){
    var tStart=new Date();
    var name=StrProp[i], prop=this.Prop[name];
    //var Where=extend({}, this.WhereWExtra); delete Where[name];
    var Where=[].concat(this.WhereWExtra); Where.splice(i,1);
    var arg={name, prop, Where};
    var [err, hist]=await this.getHistOne(arg); if(err) return [err];
    Hist[i]=hist;
    var tMeas=(new Date())-tStart; if(boDbg) console.log(`${name}: ${tMeas}ms`);
  }
  return [null,Hist];
}
app.HistCalc.prototype.getHistOne=async function(arg){
  //var {prop, strName:name, WhereWExtra}=this;
  var {prop, name, Where}=arg;
  //var pre; if('pre' in prop) pre=prop.pre; else pre=preDefault;
  //var pre=prop.pre||preDefault;
  var {feat, histF, histQueryF, histBNameF}=prop;
  var {kind}=feat;

  //var WhereFiltered=[]; for(var where of Where){if(where) WhereFiltered.push(where);}
  var WhereFiltered=Where.filter(it=>it);
  var objWhere=WhereFiltered.length?{$and:WhereFiltered}:{};
  
  var boIsButt=(kind[0]=='B'); 
  if(boIsButt){ 
    //var strOrder; if(kind=='BF') strOrder='bin ASC'; else strOrder="groupCount DESC, bin ASC";
    //var Where=array_filter(Where), strCond=''; if(Where.length) strCond='WHERE '+Where.join(' AND ');

    if(histF) { 
      var [err, hist]=await histF(this.collection,objWhere, this.Filt);   if(err) return [err];
    }else{
      if(histQueryF) var arrArg=histQueryF(objWhere); 
      else {
        var nameField; if(histBNameF) nameField=histBNameF(name); else nameField=name;
        var arrArg=[{$match:objWhere}, {$group : {_id:"$"+nameField, n:{$sum:1}}}, {$sort: { n:-1, _id:1 } }];
      }
      var cursor=this.collection.aggregate(arrArg);
      var [err, results]=await cursor.toArray().toNBP();   if(err) return [err];

      var nBinAll=results.length,     boTruncate=nBinAll>maxGroupsInFeat,   nBinDisp=boTruncate?maxGroupsInFeat:nBinAll,     nDisp=0;
      var hist=[]; 
      for(var i=0;i<nBinDisp;i++){ 
        var {_id:bin, n}=results[i];
        n=Number(n); 
        if(kind=='BF' || kind[0]!='B') bin=Number(bin);
        
        nDisp+=n;
        hist.push([bin, n]);
      }
      var nAll=0; for(var i=0;i<nBinAll;i++){   nAll+=results[i].n; }

      if(boTruncate){ var nTrunk=nAll-nDisp;  hist.push(['', nTrunk]); } 
      hist.push(boTruncate);  // The last item marks if the second-last-item is a trunk (remainder)

    }

  }else{

    var {boundaries}=feat;

    var valGroupBy;  if('histGroupByF' in prop) { valGroupBy=prop.histGroupByF(name);  }     else { valGroupBy="$"+name; }
    var arr=[  {$match: objWhere},
      {$bucket:{    groupBy: valGroupBy,  boundaries, output: {  "n":{$sum:1}  }    }},
      //{$sort: { n: -1, _id:1 } }
    ];

    var cursor=this.collection.aggregate(arr);
    var [err, results]=await cursor.toArray().toNBP(); if(err) return [err];


    var hist=[], nBinDisp=results.length;
    for(var i=0;i<nBinDisp;i++){  var {_id, n}=results[i];  hist.push([feat.boundariesIndFlip[_id], n]);    }
    hist.push(false);  // The last item marks if the second-last-item is a trunk (remainder)
    
  }
  
  return [null,hist];
}



