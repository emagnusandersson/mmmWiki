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
    var name=StrProp[i], filt=Filt[name];
    if(!is_array(filt)) {return [new Error('Filt['+name+'] is not an array.')];  }
    //if(filt.length==0) continue;
    var {feat, boIncludeNull, condBNameF, cond0F, cond1F, pre}=Prop[name];
    if(!pre) pre=preDefault;
    //var prop=Prop[name], pre; if('pre' in prop) pre=prop.pre; else pre=preDefault;
    //var feat=prop.feat;
    var arrCondInFeat=[];
    if(feat.kind[0]=='B'){
      // var arrSpec, boWhite;
      // if(filt.length==1){arrSpec=[]; boWhite=filt[0];} //jQuery $.post deletes empty arrays 
      // else {
      //   if(!is_array(filt[0])) {console.log('Filt['+name+'][0] is not an array ('+arrSpec+')');  }
      //   arrSpec=filt[0].slice(); boWhite=filt[1]; 
      // }

      if(!is_array(filt[0])) {return [new Error('Filt['+name+'][0] is not an array.')];  }
      var [arrSpecProt, boWhite]=filt;
      var arrSpec=arrSpecProt.slice(); // Copying since arrSpec is modified (might not be needed)


      var strNot=boWhite?'':' NOT';
         
      if(arrSpec.length==0){   if(boWhite==1) arrCondInFeat.push('FALSE'); }  // "FALSE" to prevent all matches 
      else {
        var boAddExtraNull=boIncludeNull && !boWhite,    arrCondOuter=[];
        var tmpName; if(condBNameF) tmpName=condBNameF(name,arrSpec); else tmpName="`"+name+"`";
        var arrCondInner=[];
        var ind=arrSpec.indexOf(null);
        if(ind!=-1) {arrCondInner.push(pre+tmpName+" IS "+strNot+" NULL"); mySplice1(arrSpec,ind);  boAddExtraNull=0;}
        
        if(arrSpec.length){
          for(var j=0;j<arrSpec.length;j++){ 
            var value=arrSpec[j];
            if(feat.kind=='BF' && !(feat.boUseInd)) {value=feat.bucket[value];  arrSpec[j]="'"+value+"'"; } 
            else {       value=mysql.escape(value);          arrSpec[j]=value;   }
          }
          arrCondInner.push(pre+tmpName+strNot+' IN('+arrSpec.join(', ')+')');
        }
        var strGlue=boWhite?' OR ':' AND ';
        arrCondOuter.push("("+arrCondInner.join(strGlue)+")");
        if(boAddExtraNull && arrCondOuter.length) arrCondOuter.push(pre+tmpName+" IS NULL");
        var strCond=arrCondOuter.join(' OR ');
        if(strCond) arrCondInFeat.push("("+strCond+")");
      }
    } else {
      var [iOn,iOff]=filt;
      var val0=feat.min[iOn]; if(iOn==feat.n) val0=feat.max[feat.n-1];
      var val1=feat.max[iOff-1]; if(iOff==0) val1=feat.min[0];
      if(iOn>0) {
        var tmp; if(cond0F) tmp=cond0F(pre+"`"+name+"`",val0);  else tmp=pre+"`"+name+"`>="+val0;       arrCondInFeat.push(tmp);
      }
      if(iOff<feat.n) {
        var tmp; if(cond1F) tmp=cond1F(pre+"`"+name+"`",val1);  else tmp=pre+"`"+name+"`<"+val1;       arrCondInFeat.push(tmp);
      }
    }
    Where.push(arrCondInFeat.join(' AND '));
  }
  // var arrCol=[],ii=0;
  // for(var i=0;i<KeySel.length;i++) {
  //   var key=KeySel[i], b=Prop[key].b, pre=Prop[key].pre||preDefault;
  //   var tmp; if('selF' in Prop[key]) { tmp=Prop[key].selF(pre+key);  }   else tmp=pre+"`"+key+"`";
  //   arrCol.push(tmp+" AS "+"`"+key+"`"); ii++;
  // }
  // var strSel=arrCol.join(', ');
  // return {strSel, Where}; //, nColTrans:ii
  return [null, {Where}]; //, nColTrans:ii

}

// condB->condBNameF
// histColF->binKeyExp, histCountF->binValueF
// relaxCountExp




app.HistCalc=function(arg){
  //var {Prop}=arg;
  //var StrProp=Object.keys(arg.Filt), nFilt=StrProp.length;
  copySome(this, arg, ['Prop', 'myMySql', 'Filt', 'strDBPrefix', 'strTableRef']);
  this.WhereWExtra=array_merge(arg.Where,arg.WhereExtra);
}
app.HistCalc.prototype.getHist=function*(flow){
  var StrProp=Object.keys(this.Filt), nFilt=StrProp.length;
  var Hist=Array(nFilt);
  for(var i=0;i<nFilt;i++){
    var tStart=new Date();
    var name=StrProp[i], prop=this.Prop[name], Where=[].concat(this.WhereWExtra); Where.splice(i,1); var arg={name, prop, Where};
    var [err, hist]=yield* this.getHistOne(flow, arg); if(err) return [err];
    Hist[i]=hist;
    var tMeas=(new Date())-tStart; if(boDbg) console.log(name+': '+tMeas+'ms');
  }
  return [null,Hist];
}
app.HistCalc.prototype.getHistOne=function*(flow, arg){
  //var {prop, strName:name, WhereWExtra, strTableRef, strDBPrefix, myMySql}=this;
  var {strTableRef, strDBPrefix, myMySql}=this;
  var {prop, name, Where}=arg;
  //var pre; if('pre' in prop) pre=prop.pre; else pre=preDefault;
  var pre=prop.pre||preDefault;
  var feat=prop.feat;
  var kind=feat.kind;
  
  var boIsButt=(kind[0]=='B'); 
  if(boIsButt){ 
    var strOrder; if(kind=='BF') strOrder='bin ASC'; else strOrder="groupCount DESC, bin ASC";
    var Where=array_filter(Where), strCond=''; if(Where.length) strCond='WHERE '+Where.join(' AND ');

    if('histF' in prop) { var sql=prop.histF(name, strTableRef, strCond, strOrder);  }
    else{
      var colExp;  if('binKeyF' in prop) { colExp=prop.binKeyF(name);  }  else if(kind=='BF') colExp=pre+"`"+name+"`-1";   else colExp=pre+"`"+name+"`";
      var countExp;  if('binValueF' in prop) { countExp=prop.binValueF(name);  }   else countExp="COUNT("+pre+"`"+name+"`)";
      var sql="SELECT "+colExp+" AS bin, "+countExp+" AS groupCount FROM \n"+strTableRef+" \n"+strCond+"\nGROUP BY bin ORDER BY "+strOrder+";";
    }

    var Val=[];  //set GLOBAL max_heap_table_size=128*1024*1024, GLOBAL tmp_table_size=128*1024*1024
    var [err, results]=yield* myMySql.query(flow, sql, Val);  if(err) return [err];
    
    var nGroupsInFeat=results.length,     boTrunk=nGroupsInFeat>maxGroupsInFeat,   nDisp=boTrunk?maxGroupsInFeat:nGroupsInFeat,     nWOTrunk=0;
    var hist=[]; 
    for(var j=0;j<nDisp;j++){ 
      var tmpRObj=results[j], tmpR, bin=tmpRObj.bin, val=Number(tmpRObj.groupCount); 
      if(kind=='BF') tmpR=[Number(bin), val]; 
      else if(kind[0]=='B') tmpR=[bin, val];  
      else tmpR=[Number(bin), val];
      //else tmpR=[bin, val];
      nWOTrunk+=val;
      hist.push(tmpR);
    }

    if(boTrunk){
      var relaxCountExp; if('relaxCountExp' in prop) { relaxCountExp=prop.relaxCountExp(name);  }  else relaxCountExp='count(*)';
      if(relaxCountExp===null) { return [new Error('relaxCountExp===null')]; }
      var sql="SELECT "+relaxCountExp+" AS n FROM \n"+strTableRef+" "+strCond+";",   Val=[];
      var [err, results]=yield* myMySql.query(flow, sql, Val);  if(err) return [err];
      var nInRelaxedCond=results[0].n;
      var nTrunk=nInRelaxedCond-nWOTrunk;  hist.push(['', nTrunk]);
    } 
    hist.push(boTrunk);  // The last item marks if the second-last-item is a trunk (remainder)

  }else{
    var countExp;  if('binValueF' in prop) { countExp=prop.binValueF(name);  } else countExp="SUM("+pre+"`"+name+"` IS NOT NULL)";
    var colExpCond;  if('histCondF' in prop) { colExpCond=prop.histCondF(name);  }    else colExpCond=pre+"`"+name+"`";
    
    var strOrder='bin ASC';

    var nameT=name; if('nameDBBinTab' in feat){ nameT=feat.nameDBBinTab; }
    var binTable=strDBPrefix+"_bins"+ucfirst(nameT);
    Where.push(colExpCond+" BETWEEN b.minVal AND b.maxVal");
    var Where=array_filter(Where), strCond=''; if(Where.length) strCond='WHERE '+Where.join(' AND ');
    var sql="SELECT b.id AS bin, "+countExp+" AS groupCount FROM "+binTable+" b, \n("+strTableRef+")\n"+strCond+"\nGROUP BY bin ORDER BY "+strOrder+";";
    
    var Val=[];
    var [err, results]=yield* myMySql.query(flow, sql, Val);  if(err) return [err];
    var hist=[], nDisp=results.length;
    for(var j=0;j<nDisp;j++){   hist.push([Number(results[j].bin), Number(results[j].groupCount)]);    }
    hist.push(false);  // The last item marks if the second-last-item is a trunk (remainder)
    
  }
  
  return [null,hist];
}

app.addBinTableSql=function(SqlTabDrop,SqlTab,strDBPrefix,Prop,engine,collate){
  var SqlTabDropTmp=[]
  for(var name in Prop){
    var prop=Prop[name];
    if(('feat' in prop) && prop.feat.kind[0]=='S'){
      var feat=prop.feat;
      var nameT=name; if('nameDBBinTab' in feat){ nameT=feat.nameDBBinTab; }
      var Name=ucfirst(nameT), binsTable=strDBPrefix+"_bins"+Name;
      SqlTabDropTmp.push(binsTable);
      //SqlTabDrop.push("DROP TABLE IF EXISTS "+binsTable+"");
      SqlTab.push("CREATE TABLE IF NOT EXISTS "+binsTable+" (id INT, minVal INT, maxVal INT, PRIMARY KEY (id)) ENGINE="+engine+" COLLATE "+collate+"");

      var SqlVal=[];
      var len=feat.n;
      for(var i=0;i<len;i++){
        var val0=feat.min[i],  val1=feat.max[i]-1;
        SqlVal.push("("+i+", "+val0+", "+val1+")");
      }
      var sqlVal=SqlVal.join(',\n');
      SqlTab.push("INSERT INTO "+binsTable+" VALUES "+sqlVal+" ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)");
    }
  }
  var sqlTmp=SqlTabDropTmp.join(', '); SqlTabDrop.push("DROP TABLE IF EXISTS "+sqlTmp);

}


