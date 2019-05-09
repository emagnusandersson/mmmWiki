"use strict"

app.setUpCond=function(arg){
  var {KeySel, Prop, Filt}=arg;
  var StrProp=Object.keys(Filt);
  var Where=[];

      // Filt (client-side): 'B/BF'-features: [vOffNames,vOnNames, boWhite],     'S'-features: [iOn,iOff]
      // Filt (server-side): 'B/BF'-features: [vSpec, boWhite],     'S'-features: [iOn,iOff]
      // Hist (client-side): 'B'-features: [vPosName,vPosVal],       'S'/'BF'-features: [vPosInd,vPosVal]
      // Hist (server-side): histsPHP[iFeat][buttonNumber]=['name',value], (converts to:) Hist[iFeat][0]=names,  Hist[iFeat][1]=values
  for(var i=0;i<StrProp.length;i++){
    var name=StrProp[i];
    if(Filt[name].length==0) continue;
    var pre; if('pre' in Prop[name]) pre=Prop[name].pre; else pre=preDefault;
    var feat=Prop[name].feat;
    var arrCondInFeat=[];
    var filt=Filt[name];
    if(feat.kind[0]=='B'){
      var arrSpec, boWhite;
      if(filt.length==1){arrSpec=[]; boWhite=filt[0];} //jQuery $.post deletes empty arrays 
      else {
        if(!is_array(filt[0])) {console.log('Filt['+name+'][0] is not an array ('+arrSpec+')');  }
        arrSpec=filt[0].slice(); boWhite=filt[1]; 
      }
      var strNot=boWhite?'':' NOT';
         
      if(arrSpec.length==0){   if(boWhite==1) arrCondInFeat.push('FALSE'); }  // "FALSE" to prevent all matches 
      else {
        var boAddExtraNull=Prop[name].boIncludeNull && !boWhite,    arrCondOuter=[];
        var tmpName; if('condBNameF' in Prop[name]) tmpName=Prop[name].condBNameF(name,arrSpec); else tmpName="`"+name+"`";
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
      var val0=feat.min[filt[0]]; if(filt[0]==feat.n) val0=feat.max[feat.n-1];
      var val1=feat.max[filt[1]-1]; if(filt[1]==0) val1=feat.min[0];
      if(filt[0]>0) {
        var tmp; if('cond0F' in Prop[name]) tmp=Prop[name].cond0F(pre+"`"+name+"`",val0);  else tmp=pre+"`"+name+"`>="+val0;       arrCondInFeat.push(tmp);
      }
      if(filt[1]<feat.n) {
        var tmp; if('cond1F' in Prop[name]) tmp=Prop[name].cond1F(pre+"`"+name+"`",val1);  else tmp=pre+"`"+name+"`<"+val1;       arrCondInFeat.push(tmp);
      }
    }
    Where.push(arrCondInFeat.join(' AND '));
  }
  var arrCol=[],ii=0;
  for(var i=0;i<KeySel.length;i++) {
    var key=KeySel[i], b=Prop[key].b, pre=Prop[key].pre||preDefault;
    var tmp; if('selF' in Prop[key]) { tmp=Prop[key].selF(pre+key);  }   else tmp=pre+"`"+key+"`";
    arrCol.push(tmp+" AS "+"`"+key+"`"); ii++;
  }
  var strCol=arrCol.join(', ');
  return {strCol:strCol, Where:Where}; //, nColTrans:ii

}

// condB->condBNameF
// histColF->binKeyExp, histCountF->binValueF
// relaxCountExp



app.getHist=function*(flow, arg){
  var Sql=[], TypeNInd=[];
  var {Prop}=arg;
  var StrProp=Object.keys(arg.Filt), nFilt=StrProp.length;
  var WhereWExtra=array_merge(arg.Where,arg.WhereExtra);
  for(var i=0;i<nFilt;i++){
    var name=StrProp[i];
    var pre; if('pre' in Prop[name]) pre=Prop[name].pre; else pre=preDefault;
    var feat=Prop[name].feat;
    var kind=feat.kind;
    
    var WhereTmp=[].concat(WhereWExtra); WhereTmp.splice(i,1);
    Sql.push("\n  -- "+name);
    
    var boIsButt=(kind[0]=='B'); 
    if(boIsButt){ 
      var strOrder; if(kind=='BF') strOrder='bin ASC'; else strOrder="groupCount DESC, bin ASC";
      var WhereTmp=array_filter(WhereTmp), strCond=''; if(WhereTmp.length) strCond='WHERE '+WhereTmp.join(' AND ');

      var relaxCountExp; if('relaxCountExp' in Prop[name]) { relaxCountExp=Prop[name].relaxCountExp(name);  }  else relaxCountExp='count(*)';
      if(relaxCountExp!==null) {
        Sql.push("SELECT "+relaxCountExp+" AS n FROM \n"+arg.strTableRef+" "+strCond+";");
        TypeNInd.push(['c',i]); 
      }

      var sqlHist;
      if('histF' in Prop[name]) { sqlHist=Prop[name].histF(name, arg.strTableRef, strCond, strOrder);  }
      else{
        var colExp;  if('binKeyF' in Prop[name]) { colExp=Prop[name].binKeyF(name);  }  else if(kind=='BF') colExp=pre+"`"+name+"`-1";   else colExp=pre+"`"+name+"`";
        var countExp;  if('binValueF' in Prop[name]) { countExp=Prop[name].binValueF(name);  }   else countExp="COUNT("+pre+"`"+name+"`)";
        //Sql.push("SELECT "+colExp+" AS bin, "+countExp+" AS groupCount FROM \n"+arg.strTableRef+" \n"+strCond+"\nGROUP BY bin ORDER BY "+strOrder+";");
        sqlHist="SELECT "+colExp+" AS bin, "+countExp+" AS groupCount FROM \n"+arg.strTableRef+" \n"+strCond+"\nGROUP BY bin ORDER BY "+strOrder+";";
      }
      Sql.push(sqlHist);

      TypeNInd.push([kind,i]);
    }else{
      var countExp;  if('binValueF' in Prop[name]) { countExp=Prop[name].binValueF(name);  } else countExp="SUM("+pre+"`"+name+"` IS NOT NULL)";
      var colExpCond;  if('histCondF' in Prop[name]) { colExpCond=Prop[name].histCondF(name);  }    else colExpCond=pre+"`"+name+"`";
      
      var strOrder='bin ASC';

      var nameT=name; if('nameDBBinTab' in feat){ nameT=feat.nameDBBinTab; }
      var binTable=arg.strDBPrefix+"_bins"+ucfirst(nameT);
      WhereTmp.push(colExpCond+" BETWEEN b.minVal AND b.maxVal");
      var WhereTmp=array_filter(WhereTmp), strCond=''; if(WhereTmp.length) strCond='WHERE '+WhereTmp.join(' AND ');
      Sql.push("SELECT b.id AS bin, "+countExp+" AS groupCount FROM "+binTable+" b, \n("+arg.strTableRef+")\n"+strCond+"\nGROUP BY bin ORDER BY "+strOrder+";");
      TypeNInd.push([kind,i]);
    }
  }
  var sql=Sql.join('\n\n'), Val=[]; //set GLOBAL max_heap_table_size=128*1024*1024, GLOBAL tmp_table_size=128*1024*1024
  var [err, results]=yield* arg.myMySql.query(flow, sql, Val);  if(err) return [err];
  var NInRelaxedCond=[], Hist=[];
  for(var i=0;i<results.length;i++){
    var [kind,ii]=TypeNInd[i]; 
    if(kind=='c') NInRelaxedCond[ii]=results[i][0].n;
    else {
      var nGroupsInFeat=results[i].length,     boTrunk=nGroupsInFeat>maxGroupsInFeat,   nDisp=boTrunk?maxGroupsInFeat:nGroupsInFeat,     nWOTrunk=0;
      Hist[ii]=[]; 
      for(var j=0;j<nDisp;j++){ 
        var tmpRObj=results[i][j], tmpR, bin=tmpRObj.bin, val=Number(tmpRObj.groupCount); 
        if(kind=='BF') tmpR=[Number(bin), val]; 
        else if(kind[0]=='B') tmpR=[bin, val];   
        else tmpR=[Number(bin), val];
        nWOTrunk+=val;
        Hist[ii].push(tmpR);
      }
        // Note! calculating the trunk this way is wrong (when you have nxn relations). Should be done with a query with a "NOT IN(...)" condition.
      if(boTrunk){Hist[ii].push(['',NInRelaxedCond[ii]-nWOTrunk]); } // (if boTrunk) the second-last-item is the trunk (remainder)
      Hist[ii].push(boTrunk);  // The last item marks if the second-last-item is a trunk (remainder)
    }
  }
  return [null,Hist];

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


