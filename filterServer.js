


FilterQueries=app.SelectFilter=function(){
  this.regWhereWExt=new RegExp('\\$whereWExt', 'g'); this.regWhere=new RegExp('\\$where', 'g'); this.regColumn=new RegExp('\\$column', 'g'); this.regBucket=new RegExp('\\$bucket', 'g');
}
FilterQueries.prototype.readQueryFile=function*(flow){
  var Ou={}, buf;
  fs.readFile('./mmmWiki_filterqueries.cyp', function(errT, bufT) {  Ou.err=errT; buf=bufT;  flow.next(); });   yield;
  if(!Ou.err){    var strCqlOrg=buf.toString(); this.objCqlFilter=splitCql(strCqlOrg);    }
    
  var arrType=['page', 'image'], arrNullFilterMode=['null', 'nullRemoved', 'all'];
  for(var i=0;i<arrType.length;i++){
    var type=arrType[i], cqlColumn=this.objCqlFilter['List.'+type+'.column'];
    for(var j=0;j<arrNullFilterMode.length;j++){
      var strNullFilterMode=arrNullFilterMode[j];
      
        // Insert $column
      var tmpKeyOrg='List.'+type+'.'+strNullFilterMode;     this.objCqlFilter[tmpKeyOrg]=this.objCqlFilter[tmpKeyOrg].replace(this.regColumn, cqlColumn);
      
        // Insert $bucket
      var StrOrderFilt=type=='page'?StrOrderFiltPage:StrOrderFiltImage;
      var Prop=type=='page'?PropPage:PropImage;
      for(var k=0;k<StrOrderFilt.length;k++){
        var nameFeat=StrOrderFilt[k], prop=Prop[nameFeat], feat=prop.feat;
        if('min' in feat){
          var cqlBucket=JSON.stringify(feat.min);
          var tmpKeyOrg='Hist.'+type+'.'+nameFeat+'.'+strNullFilterMode;    this.objCqlFilter[tmpKeyOrg]=this.objCqlFilter[tmpKeyOrg].replace(this.regBucket, cqlBucket);      
        }
      }
    }
  }
  

  return Ou;
}


filtClear=function(StrOrderFilt, Prop, Filt){
"use strict"
  var el=this;
  for(var i=0;i<StrOrderFilt.length;i++){  
    var strName=StrOrderFilt[i], feat=Prop[strName].feat, kind=feat.kind, len=feat.n, filt=Filt[i];
    if(kind[0]=='S') {filt[0]=0; filt[1]=len; }
    else if(kind[0]=='B') {   var tmp; if(kind=='BF') tmp=stepN(0,len); else tmp=[];      filt[0]=[]; filt[1]=tmp; filt[2]=0;    }
  }
}
  
setUpArrWhereETC=function(StrOrderFilt, Prop, inObj){  // KeySel seam to something one can remove
"use strict"
  var Filt=inObj.Filt,   Where=[], boFoundNull=0, strFeatWNull;
  var Ou={err:false}
  var strNullFilterMode='all';
  for(var i=0;i<StrOrderFilt.length;i++){
    if(Filt[i].length==0) continue;
    var filt=Filt[i], nameFeat=StrOrderFilt[i], prop=Prop[nameFeat], feat=prop.feat;
    var arrCondFeat=[];

    var nameNode; if('nameNode' in prop) nameNode=prop.nameNode; else nameNode=nameNodeDefault;
    if(feat.kind[0]=='B'){
        // Assign "arrSpec" and "boWhite" from "filt"
      var arrSpec, boWhite;
      if(filt.length==1){arrSpec=[]; boWhite=filt[0];} //jQuery $.post deletes empty arrays 
      else {
        if(!is_array(filt[0])) {console.log('Filt['+i+'][0] is not an array ('+arrSpec+')');  }
        arrSpec=filt[0].slice(); boWhite=filt[1]; 
      }
      
      var strNot=boWhite?'':'NOT ',   strGlue=boWhite?' OR ':' AND ';
      var lenSpec=arrSpec.length;
      var boFilterByQuery=0;
      if(prop.boFeatWNull) {
        if(lenSpec){  
          var iNull=arrSpec.indexOf(null), boNullInSpec=iNull!=-1; if(boNullInSpec) mySplice1(arrSpec,iNull);
          if(boFoundNull) {Ou.err="Can't have filter for both "+strFeatWNull+" and "+nameFeat; return Ou;}

          // WhiteListing:
          // boNullInSpec\lenSpec  1    >1
          //      1                OK  NOK
          //      0                OK   OK
          // BlackListing:
          // boNullInSpec\lenSpec  1    >1
          //      1                OK   OK
          //      0               NOK  NOK

          if(boWhite){ // If whitelisting then null must either alone OR must not be in the list.
            if(boNullInSpec) {
              if(lenSpec>1) {Ou.err="Null must be alone when whitelisting on the "+nameFeat+" feature. (lenSpec:"+lenSpec+")"; debugger; return Ou;}
              strNullFilterMode='null'; boFilterByQuery=1; 
            }else{ strNullFilterMode='nullRemoved'; }
          }else{ // If blacklisting then null must be in the list
            if(boNullInSpec){strNullFilterMode='nullRemoved';} else {Ou.err="Null must be in the list when backlisting on the "+nameFeat+" feature."; debugger; return Ou;}
          }
          boFoundNull=1; strFeatWNull=nameFeat;
          //extend(objFeatWNull,{entry:arrSpec[0]}); 
          
        }
      }
      if(!boFilterByQuery){
        if(lenSpec==0){   if(boWhite==1) arrCondFeat.push('FALSE'); }  // "FALSE" to prevent all matches 
        else {  
          if(lenSpec){
            for(var j=0;j<lenSpec;j++){ 
              if(feat.kind=='BF') arrSpec[j]="'"+feat.bucket[arrSpec[j]]+"'"; 
              else if(feat.kind=='BN') ;
              else   arrSpec[j]="'"+myNeo4j.escape(arrSpec[j])+"'";   
            }
            //var nameNode; if('nameNode' in prop) nameNode=prop.nameNode; else nameNode=nameNodeDefault;
            //var condBNameFTmp=prop.condBNameF||condBNameFDefault,  tmpName=condBNameFTmp(nameFeat,arrSpec);  
            var condBNameFTmp=prop.condBNameF||condBNameFDefault,  tmpName=condBNameFTmp(nameNode,nameFeat,arrSpec);  
            arrCondFeat.push(strNot+tmpName+' IN(['+arrSpec.join(', ')+'])');
          }
        }
      }
    }else{
      var iOn=filt[0], iOff=filt[1], val0=feat.min[iOn], val1=feat.max[iOff-1];     // If iOn==0 => no lower limit. If iOff==feat.n => no upper limit
      //if(iOn>0) {     var cond0FTmp=prop.cond0F||cond0FDefault;   arrCondFeat.push(cond0FTmp(nameNode+".`"+nameFeat+"`",val0));       }
      //if(iOff<feat.n) {   var cond1FTmp=prop.cond1F||cond1FDefault;   arrCondFeat.push(cond1FTmp(nameNode+".`"+nameFeat+"`",val1));     }
      if(iOn>0) {     var cond0FTmp=prop.cond0F||cond0FDefault;   arrCondFeat.push(cond0FTmp(nameNode,nameFeat,val0));       }
      if(iOff<feat.n) {   var cond1FTmp=prop.cond1F||cond1FDefault;   arrCondFeat.push(cond1FTmp(nameNode,nameFeat,val1));     }
    }
    Where.push(arrCondFeat.join(' AND '));
  }
  //if(objFeatWNull.boFound) {  if(objFeatWNull.entry===null) { strNullFilterMode='null';} else { strNullFilterMode='nullRemoved';}    }
  extend(Ou, {Where:Where, strNullFilterMode:strNullFilterMode}); return Ou;
}

whereArrToStr=function(Where){
  var WhereTmp=array_filter(Where), strWhere='', strWhereWExt='WHERE '; if(WhereTmp.length) { var strTmp=WhereTmp.join(' AND '); strWhere='WHERE '+strTmp; strWhereWExt='WHERE '+strTmp+' AND' };
  return {strWhere:strWhere, strWhereWExt:strWhereWExt};
}

createListQuery=function(type, strNullFilterMode, strWhere, strWhereWExt){
  var cqlList=filterQueries.objCqlFilter['List.'+type+'.'+strNullFilterMode];
  cqlList=cqlList.replace(filterQueries.regWhereWExt, strWhereWExt);     cqlList=cqlList.replace(filterQueries.regWhere, strWhere);    
  return cqlList;
}
createCountQuery=function(type, nameFeat, strNullFilterMode, strWhere, strWhereWExt){
  var tmpKey, tmpKeyOrg='Hist.'+type+'.'+nameFeat+'.'+strNullFilterMode+'.nInRelaxedCond', objCqlFilter=filterQueries.objCqlFilter;
  if(tmpKeyOrg in objCqlFilter) tmpKey=tmpKeyOrg; else tmpKey='Hist.'+type+'.'+nameFeat+'.nInRelaxedCond';
  var cqlCount=objCqlFilter[tmpKey];
  cqlCount=cqlCount.replace(filterQueries.regWhereWExt, strWhereWExt);     cqlCount=cqlCount.replace(filterQueries.regWhere, strWhere);
  return cqlCount;
}
createHistQuery=function(type, nameFeat, strNullFilterMode, strWhere, strWhereWExt){
  var tmpKey, tmpKeyOrg='Hist.'+type+'.'+nameFeat+'.'+strNullFilterMode, objCqlFilter=filterQueries.objCqlFilter;
  if(tmpKeyOrg in objCqlFilter) tmpKey=tmpKeyOrg; else tmpKey='Hist.'+type+'.'+nameFeat;
  var cqlHist=objCqlFilter[tmpKey];
  cqlHist=cqlHist.replace(filterQueries.regWhereWExt, strWhereWExt);     cqlHist=cqlHist.replace(filterQueries.regWhere, strWhere);
  return cqlHist;
}

  // Filt (client-side): 'B/BF'-features: [vOffNames,vOnNames, boWhite],     'S'-features: [iOn,iOff]
  // Filt (server-side): 'B/BF'-features: [vSpec, boWhite],     'S'-features: [iOn,iOff]
  // Hist (client-side): 'B'-features: [vPosName,vPosVal],       'S'/'BF'-features: [vPosInd,vPosVal]
  // Hist (server-side): histsPHP[iFeat][buttonNumber]=['name',value], (converts to:) Hist[iFeat][0]=names,  Hist[iFeat][1]=values


// condB->condBNameF
// histColF->binKeyExp, histCountF->binValueF
// relaxCountExp


getHist=function*(flow, arg){
  var Ou={Hist:[]};
  var StrOrderFilt=arg.StrOrderFilt, nFilt=arg.StrOrderFilt.length;
  var objCqlFilter=filterQueries.objCqlFilter;
  var Where=arg.where, strNullFilterMode=arg.strNullFilterMode;
  var WhereWExtra=array_mergeM(arg.Where, arg.WhereExtra);
  var tNow=(new Date()).toUnix();
  for(var i=0;i<StrOrderFilt.length;i++){
    var nameFeat=StrOrderFilt[i], prop=arg.Prop[nameFeat], feat=prop.feat, kind=feat.kind;
    //var nameNode; if('nameNode' in prop) nameNode=prop.nameNode; else nameNode=nameNodeDefault;
    
    var WhereTmp=[].concat(WhereWExtra); WhereTmp.splice(i,1);
    
    var tmp=whereArrToStr(WhereTmp), strWhere=tmp.strWhere, strWhereWExt=tmp.strWhereWExt;
    
    var nCount=NaN;
    if('boCount' in prop){
      var strCql=createCountQuery(arg.type, nameFeat, strNullFilterMode, strWhere, strWhereWExt);  // cqlCount
      var Val={tNow:tNow};
      var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
      if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
      var rec=records[0];   nCount=rec.nInRelaxedCond;  
    }
    
    var strCql=createHistQuery(arg.type, nameFeat, strNullFilterMode, strWhere, strWhereWExt);  // cqlHist
    var Val={tNow:tNow};
    var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
    if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
    var len=records.length,   nGroupsInFeat=len,     boTrunk=len>maxGroupsInFeat,   nDisp=boTrunk?maxGroupsInFeat:len,     nWOTrunk=0;
    if(boTrunk && isNaN(nCount)) console.log('Seams '+nameFeat+'-buckets should have been counted. Got '+len+' buckets, which is more than maxGroupsInFeat: '+maxGroupsInFeat);
    Ou.Hist[i]=[];
    for(var j=0;j<nDisp;j++){
      var tmpRObj=records[j], tmpR, bucket=tmpRObj.bucket, val=Number(tmpRObj.nBucket); 
      if(kind=='BF') tmpR=[Number(bucket), val]; 
      else if(kind[0]=='B') tmpR=[bucket, val];   
      else tmpR=[Number(bucket), val];
      nWOTrunk+=val;
      Ou.Hist[i].push(tmpR);
    }
    if(boTrunk){Ou.Hist[i].push(['',nCount-nWOTrunk]); } // (if boTrunk) the second-last-item is the trunk (remainder)
    Ou.Hist[i].push(boTrunk);  // The last item marks if the second-last-item is a trunk (remainder)
    
  }
  return Ou;
}



