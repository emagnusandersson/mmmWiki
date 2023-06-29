"use strict"

app.ParserTable=function(){

    
  this.arrTableAttributes=[];
  this.rowAttributes=[];
  this.cellContent=[];
  this.cellAttributes=[];
  this.cellType=[];
  this.arrTableCaption=[];
  this.arrTableCaptionAttributes=[];
    
} 
app.ParserTable.prototype.replaceTable=function(lines) { 
  var line0=lines[0];
  lines=lines.slice(1); //Remove first line
  var iRow=0;
  
  var strLineWithTableTag, iTable,boRowDelimFound,boRowBeforeRowDelim, matches;    
  if(matches=line0.match(/^([\*#:;]*?[^\{]*?)\{\|(.*)$/)) { // If a table-starter-token is found
    iTable=this.arrTableAttributes.length;
    this.arrTableAttributes[iTable]=' ' +matches[2];
    strLineWithTableTag=matches[1];
    this.arrTableCaption[iTable]='';
    this.arrTableCaptionAttributes[iTable]='';
    this.rowAttributes[iTable]=[];
    
    this.cellContent[iTable]=[];  this.cellContent[iTable][0]=[];
    this.cellAttributes[iTable]=[];  this.cellAttributes[iTable][0]=[];
    this.cellType[iTable]=[];  this.cellType[iTable][0]=[];
    var iCell=0;
    boRowDelimFound=false;
    boRowBeforeRowDelim=false;
  }
  
  var boContainerOpened=false;
  var i=0;
  while(true) {
    var matches=[];
    if(i==lines.length ) { // document ending found
      //strLineWithTableTag=`${strLineWithTableTag}<table${iTable}/>`;
      strLineWithTableTag=strLineWithTableTag +STARTCHAR +'table' +iTable +ENDCHAR;
      lines.splice(0, i, strLineWithTableTag); //replace rows 0...i
      return lines;
          
    }
    
    var line=lines[i];
    
    if(line.substr(0, 2)=='|}' ) { // Table ending found
      strLineWithTableTag=strLineWithTableTag +STARTCHAR +'table' +iTable +ENDCHAR +line.substr(2);
      lines.splice(0, i+1,strLineWithTableTag);
      return lines;
    }
    else if(matches=line.match(/^([\*#:;]*?[^\{]*?)\{\|(.*)$/)) { // First check if we're coming accross an internal (new) table
      var linesRemainingNew='';
      var linesRemainingNew=this.replaceTable(lines.slice(i));       
      
      //array_splice(lines, i, count(lines),linesRemainingNew);
      //lines.splice(i, 1000,linesRemainingNew);
      lines=lines.slice(0,i).concat(linesRemainingNew);
      i--; //You might ask "Backing 'i' ?? WTF" So OK, it requires some explanation: The (internal) table we found has just been replaced with a tag. Since it was part of a cell we reread the line so that it gets added to a cell. I know this solution is not beautiful, so feel free to do something better.
      
      //if(iTable==0) echo 'i:' +i ' +'lines: '.myDump2str(lines);
      //if(iTable==0) echo 'linesRemainingNew'.myDump2str(linesRemainingNew);  
    }
    else if(line.substr(0, 2)=='|-') {  // Table row-switch found
      //if(boRowBeforeRowDelim) this.rowAttributes[iTable][0]='';
      iRow=this.rowAttributes[iTable].length;
      //echo 'this.rowAttributes: '.myDump2str(this.rowAttributes[iTable]);
      //$rowAttributes[$iTable][$iRow]=' '.$line=preg_replace('#^\|-+#', '', $line); // Whats remaining is only attributes
      this.rowAttributes[iTable][iRow]=' ' +line.replace(/^\|-+/, ''); // Whats remaining is only attributes
      //this.cellContent[iTable][iRow][0]=''; this.cellAttributes[iTable][iRow][0]=''; this.cellType[iTable][iRow][0]='';
      //this.cellContent[iTable][iRow][0]=array(); this.cellAttributes[iTable][iRow][0]=array(); this.cellType[iTable][iRow][0]=array();
      this.cellContent[iTable][iRow]=[]; this.cellAttributes[iTable][iRow]=[]; this.cellType[iTable][iRow]=[];
      //iCell==0;
      boRowDelimFound=true;
      //echo 'iRow:' +iRow;
      boContainerOpened=false;
    }
    else if(line.substr(0, 2)=='|+') {
      line=line.substr(2); 
      var parts=line.split('|',2);
      boContainerOpened='caption';
      if(parts.length==1){ 
        this.arrTableCaption[iTable]=parts[0];
        this.arrTableCaptionAttributes[iTable]='';
      } else{
        this.arrTableCaption[iTable]=parts[1];
        this.arrTableCaptionAttributes[iTable]=parts[0];
      }
    }
    else if(line!='' && (line[0]=='|' || line[0]=='!')) {
      var first_character=line[0];
      line=line.substr(1);
      //if(first_character=='!') line=str_replace('!!', '||', line);
      if(first_character=='!') { line=line.replace(/!!/g, '||'); }
      var cells=line.split('||');
      //echo `i:${i}cells: ${myDump2str(cells)}`;
      
      var type;   if(first_character=='|') type='td'; else type='th';
      boContainerOpened=type;
      
      if(!boRowDelimFound) {this.rowAttributes[iTable][0]=''; boRowBeforeRowDelim=true;}

      //foreach(cells as cell) {
      for(var j in cells){
        //cell=cells[j];
        var cell_data=cells[j].split('|', 2);
        //if(count(this.cellAttributes[iTable])
        iCell=this.cellAttributes[iTable][iRow].length;
        if(cell_data.length==1) {
          //echo iTable.iRow.iCell."\n";
          //this.cellContent[iTable][iRow][iCell]=this.cellContent[iTable][iRow][iCell].cell_data[0];
          this.cellContent[iTable][iRow][iCell]=cell_data[0];
          this.cellAttributes[iTable][iRow][iCell]='';
        } else{
          //this.cellContent[iTable][iRow][iCell]=this.cellContent[iTable][iRow][iCell].cell_data[1];
          this.cellContent[iTable][iRow][iCell]=cell_data[1];
          this.cellAttributes[iTable][iRow][iCell]=cell_data[0];
          
        }
        this.cellType[iTable][iRow][iCell]=type;
        //this.cellType[iTable][iRow][iCell]=first_character=='|' ? 'td' : 'th';
        //iCell++;
      }
      
    }
    else if(boContainerOpened=='td' || boContainerOpened=='th') {  //if other chars in the beginning of the line and boContainerOpened!=false
      this.cellContent[iTable][iRow][iCell]=this.cellContent[iTable][iRow][iCell] +'\n' +line;
      //echo line;
      //echo 'hex'.bin2hex(line);  
    }
    else if(boContainerOpened=='caption') {
      this.arrTableCaption[iTable]=this.arrTableCaption[iTable] +'\n' +line;
    }
    i++;
    
  }
}
  
  
app.ParserTable.prototype.putbackTables=function(lines) {
  var k=0;
  
  while(true) {
    if(k==lines.length ) {break;}
    var line=lines[k];
    var matches;
    //if(preg_match('/^([\*#:;]*)'.STARTCHARSTR.'table(\d+)'.ENDCHARSTR.'(.*)$/', line, matches)) {
    if(  matches=line.match( RegExp(`^(.*?)${STARTCHARSTR}table(\\d+)${ENDCHARSTR}(.*?)$`) )  ) {
      //alert(k +line);
      //echo `k:${k}, matches: ${myDump2str(matches)}<br>`;
      //list(trash, strLineStart, iTable, strLineEnd) = matches;
      var strLineStart=matches[1];
      var iTable=matches[2];
      var strLineEnd=matches[3];
      var nRows=this.cellContent[iTable].length;
      //str='';
      
      var newLines=new Array('');
      if(nRows>0){
        newLines[0]=`<table ${this.arrTableAttributes[iTable]}>`;
        newLines[1]=`<caption ${this.arrTableCaptionAttributes[iTable]}>${this.arrTableCaption[iTable]}</caption>`;
        
        for(var i=0;i<nRows;i++){
          newLines.push(`<tr ${this.rowAttributes[iTable][i]}>`);
          
          var nCells=this.cellContent[iTable][i].length;
          
          for(var j=0;j<nCells;j++){
            var tmp=this.cellContent[iTable][i][j];
            
            //echo `k:${k}, cell_lines: ${ord(tmp[0])}${ord(tmp[1])}${myDump2str(tmp)}<br>`;
            
            var cell_lines=this.cellContent[iTable][i][j].split("\n");
            
            cell_lines=this.putbackTables(cell_lines);
            newLines.push(`<${this.cellType[iTable][i][j]} ${this.cellAttributes[iTable][i][j]}>`);
            //array_splice(newLines, count(newLines), 0,cell_lines); 
            //newLines.splice(newLines.length, 0,cell_lines); 
            newLines=newLines.concat(cell_lines); 
            //array_merge(newLines,cell_lines);
            newLines.push(`</${this.cellType[iTable][i][j]}>`);
            
          }
          newLines.push("</tr>\n");
        
          
        }
        newLines.push("</table>\n");
      }
      //lines[k]=strLineStart.str.strLineEnd;
      //alert(k);
      
      newLines[0]=strLineStart +newLines[0];
      var n=newLines.length;
      //alert(lines[k]);
      //alert(`lines:${lines.length}, k:${k}, newLines:${n}`);
      newLines[n-1]=newLines[n-1] +strLineEnd;
      //array_splice(lines, k, 1,newLines); 
      //lines=lines.slice(0,k).concat(newLines).concat(lines.slice(k+1)); 
      var tmpSt=lines.slice(0,k)
      var tmpEnd=lines.slice(k+1);
      //alert(lines); alert(newLines);
      
      //alert(tmpSt);  alert(tmpEnd);
      tmpSt=tmpSt.concat(newLines);
      //alert(tmpSt);
      tmpSt=tmpSt.concat(tmpEnd); 
      //alert(tmpSt);
      lines=tmpSt;
      
      k=k+n-1;
      //echo `iTable:${iTable}, newLines: ${var_dump(newLines)}<br>`;
    }
    k++;
    
  }
  
  return lines;
}

