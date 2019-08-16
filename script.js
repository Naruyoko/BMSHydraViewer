Array.prototype.min=function(){
  var min=this[0];
  for(var i=1;i<this.length;i++){
    if(this[i]<min)min=this[i];
  }
  return min;
}
Array.prototype.max=function(){
  var max=this[0];
  for(var i=1;i<this.length;i++){
    if(this[i]>max)max=this[i];
  }
  return max;
}
//matrix
function Matrix(matrix){
  this.matrix=matrix;
  this.columns=matrix.length;
  this.rows=matrix[0].length;
}
Matrix.prototype.toString=function (){
  str="";
  for(var x=0;x<this.columns;x++){
    str+="(";
    for(var y=0;y<this.rows;y++){
      str+=this.get(x,y);
      if(y!=this.rows-1) str+=",";
    }
    str+=")";
  }
  return str;
}
Matrix.prototype.get=function (x,y){
  return this.matrix[x][y];
}
Matrix.prototype.lowermostNonzero=function (){
  for (var i=0;i<this.rows;i++){
    if (!this.get(this.columns-1,i)){
      return i-1;
    }
  }
  return this.rows-1;
}
Matrix.prototype.getParent=function (x,y){
  if (y===0){
    for (var i=x-1;i>-1;i--){
      if (this.get(i,y)<this.get(x,y)){
        return i;
      }
    }
    return -1;
  }else{
    for (var i=x-1;i>-1;i--){
      if (this.get(i,y)<this.get(x,y)&&this.ancestry(x,y-1).includes(i)){
        return i;
      }
    }
    return -1;
  }
}
Matrix.prototype.ancestry=function (x,y){
  var r=[];
  var i=x;
  while (i>-1){
    r.push(i);
    i=this.getParent(i,y);
  }
  return r;
}
Matrix.prototype.badroot=function (){
  return this.getParent(this.columns-1,this.lowermostNonzero());
}
Matrix.prototype.color=function (x,y,ver){
  if (ver=="4"){
    if (y<this.lowermostNonzero()&&x>=this.badroot()&&x!==this.columns-1){
      if (this.ancestry(x,y).includes(this.badroot())){
        return green;
      }else{
        return pink;
      }
    }else{
      return "white";
    }
  }else if (ver=="3.3"){
    if (y<this.lowermostNonzero()&&x>=this.badroot()&&x!==this.columns-1){
      if (this.ancestry(x,this.lowermostNonzero()).includes(this.badroot())||this.getParent(x,y)>this.badroot()&&this.color(this.getParent(x,y),y,ver)==green){
        return green;
      }else{
        return pink;
      }
    }else{
      return "white";
    }
  }else{
    return "#dddddd"
  }
}
var BMV="3.3+4";
var green="#56f442";
var pink="#e841f4";
var lastmatrix;
var changeVersion = function (){
  for(var i=0;i<form.version.length;i++){
    if(form.version[i].checked)BMV=form.version[i].value;
  }
  draw();
}
//display
var dg=function (id){
  return document.getElementById(id);
}
var canvas;
var ctx;
window.onload=function (){
  console.clear();
  canvas=dg("output");
  ctx=canvas.getContext("2d");
  draw();
}
var draw=function (){
  for(var cycle=0;cycle<2;cycle++){ // draw twice because image size
    //parse matrices
    var matricesText=form.input.value.replace(/\n+/g,"\n").replace(/\s/g,"");
    var matrixTextList=matricesText.split("\n");
    var matrices = matrixTextList.length;
    var matrixList = new Array(matrices);
    var height=0;
    for(var m=0;m<matrices;m++){
      matrixList[m]=JSON.parse(
        "["+matrixTextList[m]
          .replace(/\(/g,"[")
          .replace(/\)/g,"]")
          .replace(/\]\[/g,"],[")+"]");
      var matrix=matrixList[m];
      var columns=matrix.length;
      var rows=0;
      for (var i=0;i<columns;i++){
        if (matrix[i].length>rows){
          rows=matrix[i].length;
        }
      }
      for (var i=0;i<columns;i++){
        while (matrix[i].length<rows){
          matrix[i].push(0);
        }
      }
      matrixList[m]=new Matrix(matrix);
    }

    //clear canvas
    ctx.fillStyle="white";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    //draw
    var x=0;
    var y=0;
    for(var m=0;m<matrices;m++){
      var matrix=matrixList[m];
      //draw string
      ctx.fillStyle="black";
      ctx.font = '18px Arial';
      ctx.fillText(matrix.toString(),50,y+30);
      y+=30;

      if(BMV=="3.3+4"){
        // both matrices
        var xx=50;
        var y1=drawMatrix(xx,y, "3.3", matrix);
        xx+=30+(matrix.columns+1)*30;
        var y2=drawMatrix(xx,y, "4"  , matrix);
        xx+=30+(matrix.columns+1)*30;
        x=[x,xx-50].max();
        y=[y1,y2].max();
      }else{
        // single matrix
        var xx=50;
        y=drawMatrix(xx, y, BMV, matrix);
        xx+=30+(matrix.columns+1)*30;
        x=[x,xx-50].max();
      }
    }//m

    //resize
    var data = ctx.getImageData(0, 0, x, y);
    canvas.width=x;
    canvas.height=y;
    ctx.putImageData(data, 0, 0);
    //enable save
    outimg.width  = canvas.width;
    outimg.height = canvas.height;
    outimg.src = canvas.toDataURL('image/jpg');
  }//for cycle
}//draw()
var drawMatrix=function (x, y, ver, matrix){
  var columns=matrix.columns;
  var rows=matrix.rows;
  var rowbase=[x,y];
  for (var y=0;y<matrix.rows;y++){
    //get lowerbound of upper row
    var lowerbound=new Array(matrix.columns);
    if(y>0){
      for(var x=0;x<matrix.columns;x++)lowerbound[x]=+Infinity;
      for(var x=matrix.columns-1;x>=0;x--){
        var z=matrix.get(x,y-1);
        lowerbound[x]=[lowerbound[x],z].min();
        var p=matrix.getParent(x,y-1);
        for(var x2=p+1;x2<=x;x2++){
          lowerbound[x2]=[lowerbound[x2],z].min();
        }
      }
    }else{
      for(var x=0;x<matrix.columns;x++)lowerbound[x]=0;
    }
    //get upperbound of current row
    var upperbound=new Array(matrix.columns);
    for(var x=0;x<matrix.columns;x++)upperbound[x]=0;
    for(var x=matrix.columns-1;x>=0;x--){
      var z=matrix.get(x,y);
      upperbound[x]=[upperbound[x],z].max();
      var p=matrix.getParent(x,y);
      if(p!=-1){
        for(var x2=p+1;x2<=x;x2++){
          upperbound[x2]=[upperbound[x2],z-1].max();
        }
      }
    }
    //make margin
    var margin=0;
    for(var x=0;x<matrix.columns;x++){
      margin = [margin, upperbound[x]-lowerbound[x]].max();
    }
    //row root
    rowbase[1]=rowbase[1]+(margin+1)*30;
    ctx.strokeStyle="black";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(rowbase[0]-20,rowbase[1]+20);
    ctx.lineTo(rowbase[0]-40,rowbase[1]+40);
    ctx.moveTo(rowbase[0]-20,rowbase[1]+40);
    ctx.lineTo(rowbase[0]-40,rowbase[1]+20);
    ctx.stroke();
    for (var x=0;x<matrix.columns;x++){
      //node
      ctx.strokeStyle="black";
      console.log(x+","+y+":"+matrix.getParent(x,y))
      ctx.fillStyle=matrix.color(x,y,ver);
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.arc(rowbase[0]+x*30,rowbase[1]-matrix.get(x,y)*30,7.8,0,2*Math.PI);
      ctx.fill();
      ctx.stroke();
      //number
      ctx.fillStyle="black";
      ctx.font="15px arial";
      ctx.fillText(matrix.get(x,y),rowbase[0]-4+x*30,rowbase[1]+5-matrix.get(x,y)*30);
      //bad root symbol
      if (x==matrix.badroot()){
        ctx.strokeStyle="red";
        ctx.beginPath();
        ctx.moveTo(rowbase[0]+x*30-10,rowbase[1]-matrix.get(x,y)*30+2);
        ctx.lineTo(rowbase[0]+x*30-15,rowbase[1]-matrix.get(x,y)*30-2);
        ctx.lineTo(rowbase[0]+x*30-10,rowbase[1]-matrix.get(x,y)*30-4);
        ctx.lineTo(rowbase[0]+x*30-12,rowbase[1]-matrix.get(x,y)*30-10);
        ctx.lineTo(rowbase[0]+x*30-7,rowbase[1]-matrix.get(x,y)*30-8);
        ctx.lineTo(rowbase[0]+x*30-5,rowbase[1]-matrix.get(x,y)*30-14);
        ctx.lineTo(rowbase[0]+x*30-0,rowbase[1]-matrix.get(x,y)*30-10);
        ctx.stroke();
      }
      //rightmost column symbol
      if (x==matrix.columns-1){
        ctx.strokeStyle="red";
        ctx.beginPath();
        ctx.moveTo(rowbase[0]+x*30+0,rowbase[1]-matrix.get(x,y)*30-15);
        ctx.lineTo(rowbase[0]+x*30+10,rowbase[1]-matrix.get(x,y)*30-5);
        ctx.moveTo(rowbase[0]+x*30+0,rowbase[1]-matrix.get(x,y)*30-5);
        ctx.lineTo(rowbase[0]+x*30+10,rowbase[1]-matrix.get(x,y)*30-15);
        ctx.stroke();
      }
      //parency line
      ctx.strokeStyle="black";;
      ctx.beginPath();
      var parent=matrix.getParent(x,y);
      if (parent==-1){
        ctx.moveTo(rowbase[0]+parent*30+5.5,rowbase[1]+30-5.5);
        ctx.lineTo(rowbase[0]+parent*30+15,rowbase[1]+30-15);
      }else{
        ctx.moveTo(rowbase[0]+parent*30+5.5,rowbase[1]-matrix.get(parent,y)*30-5.5);
        ctx.lineTo(rowbase[0]+parent*30+15,rowbase[1]-matrix.get(parent,y)*30-15);
      }
      ctx.lineTo(rowbase[0]+x*30-15,rowbase[1]-matrix.get(x,y)*30+15);
      ctx.lineTo(rowbase[0]+x*30-5.5,rowbase[1]-matrix.get(x,y)*30+5.5);
      ctx.stroke();
    }
  }
  lastmatrix=matrix;
  return rowbase[1]+50;
}
