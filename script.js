//matrix
function Matrix(matrix){
  this.matrix=matrix;
  this.columns=matrix.length;
  this.rows=matrix[0].length;
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
Matrix.prototype.color=function (x,y){
  if (BMV=="4"){
    if (y<this.lowermostNonzero()&&x>=this.badroot()&&x!==this.columns-1){
      if (this.ancestry(x,y).includes(this.badroot())){
        return green;
      }else{
        return pink;
      }
    }else{
      return "white";
    }
  }else if (BMV=="3.3"){
    if (y<this.lowermostNonzero()&&x>=this.badroot()&&x!==this.columns-1){
      if (this.ancestry(x,this.lowermostNonzero()).includes(this.badroot())||this.getParent(x,y)>this.badroot()&&this.color(this.getParent(x,y),y)==green){
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
var BMV="4";
var green="#56f442";
var pink="#e841f4";
var lastmatrix;
function changeVersion(){
  BMV=dg("version").value;
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

function draw(){
  //get matrix
  var matrixText=dg("input").textContent;
  var matrix=JSON.parse("["+matrixText.replace(/\(/g,"[").replace(/\)/g,"]").replace(/\]\[/g,"],[")+"]");
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
  matrix=new Matrix(matrix);
  
  //set up canvas
  ctx.fillStyle="white";
  ctx.fillRect(0,0,640,960);
  
  //draw
  for (var y=0;y<matrix.rows;y++){
    var rowbase=[50,y*150+150];
    //row root
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
      ctx.fillStyle=matrix.color(x,y);
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.arc(rowbase[0]+x*30,rowbase[1]-matrix.get(x,y)*30,7.8,0,2*Math.PI);
      ctx.fill();
      ctx.stroke();
      //number
      ctx.fillStyle="black";
      ctx.fillText(matrix.get(x,y),rowbase[0]-4+x*30,rowbase[1]+4-matrix.get(x,y)*30);
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
}
