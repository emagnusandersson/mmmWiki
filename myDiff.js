

"use strict"

app.htmlDiff=function(strOld, strNew){
  var arr=diff(strOld.split(''),strNew.split(''));  //splitting a string into its component characters
  var ret='', lastOp='none';
  for(var i=0;i<arr.length;i++){
    var k=arr[i],op=k.operation;
    var tagSep='';
    if(op!=lastOp){
      var tagEnd='';   if(lastOp=='delete') tagEnd="</del>";       else if(lastOp=='add') tagEnd="</ins>";
      var tagStart=''; if(op=='delete') tagStart="<del>"; else if(op=='add') tagStart="<ins>";
      tagSep=tagEnd+tagStart;
    } 
    ret+=tagSep+k.atom;
    lastOp=op;
  }
  if(lastOp=='delete') ret+='</del>'; else if(lastOp=='add') ret+='</ins>';
  return ret;
}


app.myDiff=function(strOld,strNew,headOld,headNew){
  var arrOld=strOld.split('\n');    // Split along linestarts
  var arrNew=strNew.split('\n'); 

  for(var i=0;i<arrOld.length-1;i++){arrOld[i]+='\n'};
  for(var i=0;i<arrNew.length-1;i++){arrNew[i]+='\n'};

  var arrOperation = diff(arrOld, arrNew); 

    // Calc row numbers for resp operation
  var iROld=0,iRNew=0;    
  for(var i=0;i<arrOperation.length;i++){
    var k=arrOperation[i],op=k.operation;
    if(op=='none') {iROld++; iRNew++; }   else if(op=='add') { iRNew++;}    else if(op=='delete') {iROld++;}
    k.iROld=iROld; k.iRNew=iRNew;
  }
  
    // Create tableProt ( add/delete operations are merged )
  var tableProt=[];
  var lastOp='none', rowSpec;  // rowSpec: table row with delete/add operation
  var len=arrOperation.length;
  for(var i=0;i<len;i++){
    var k=arrOperation[i], op=k.operation;
    
    if(op=='none') {
      rowSpec={text:k.atom, iROldFirst:k.iROld, iRNewFirst:k.iRNew, labOld:k.iROld, labNew:k.iRNew};
      tableProt.push(rowSpec);
    }
    if(op!='none' && lastOp=='none'){
      rowSpec={strOld:'',strNew:''};
      tableProt.push(rowSpec);
    }
    if(op!=lastOp){
      if(op=='delete'){ rowSpec.iROldFirst=k.iROld; }
      if(op=='add'){ rowSpec.iRNewFirst=k.iRNew; }
    }    
    if(op!='none'){
      if(op=='delete'){
        rowSpec.strOld+=k.atom;
        var tmp=rowSpec.iROldFirst;  rowSpec.labOld=tmp==k.iROld?tmp:tmp+'-'+k.iROld;
      }
      if(op=='add'){
        rowSpec.strNew+=k.atom;
        var tmp=rowSpec.iRNewFirst;  rowSpec.labNew=tmp==k.iRNew?tmp:tmp+'-'+k.iRNew;
      }
    }
    lastOp=op;
  }

      // Table rows with changes gets a run over by htmlDiff
  var len=tableProt.length;
  for(var j=0;j<len;j++){
    var k=tableProt[j];
    if('strOld' in k) { k.text=htmlDiff(k.strOld,k.strNew);}
  }
  
      // Mark Table rows to be included ( "delete/add-rows" + the two rows above/below such rows ) 
  for(var j=0;j<len;j++) tableProt[j].include=0;
  for(var j=0;j<len;j++){
    var k=tableProt[j];
    if('strOld' in k) {
      k.include=1;
      if(j>0) tableProt[j-1].include=1;
      if(j>1) tableProt[j-2].include=1;
      if(j<len-1) tableProt[j+1].include=1;
      if(j<len-2) tableProt[j+2].include=1;
    }
  }
  
      // Create Table-html
  var ret='';
  var boIncludePrevious=0;
  for(var j=0;j<len;j++){ 
    var k=tableProt[j], boInclude=k.include;
    if(!boIncludePrevious && boInclude) {
      var tmpOld=''; if('iROldFirst' in k) tmpOld=`Line ${k.iROldFirst}: `;
      var tmpNew=''; if('iRNewFirst' in k) tmpNew=`Line ${k.iRNewFirst}: `;
      ret+=`<tr><td><b>${tmpOld}</b></td><td></td><td><b>${tmpNew}</b></td></tr>`;
    }
    if(boInclude) {
      var tmpOld=''; if('labOld' in k) tmpOld=k.labOld;
      var tmpNew=''; if('labNew' in k) tmpNew=k.labNew;
      ret+=`<tr><td>${tmpOld}</td><td class=textcompare>${k.text}</td><td>${tmpNew}</td></tr>`; 
    } 
    
    boIncludePrevious=boInclude;
  }
  
  if(ret.length) ret=`<table>${ret}</table>`;
  return ret;
}

