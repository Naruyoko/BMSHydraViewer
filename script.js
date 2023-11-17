//RectangularMatrix
function RectangularMatrix(arg0,arg1){
  if (typeof arg0=="number"){
    var matrix=[];
    for (var i=0;i<arg0;i++){
      matrix.push([]);
      for (var j=0;j<arg1;j++){
        matrix[i].push(0);
      }
    }
    this.columns=arg0;
    this.rows=arg1;
  }else{
    var matrix=RectangularMatrix.cloneMatrix(arg0);
    var rows=0;
    for (var i=0;i<matrix.length;i++) rows=Math.max(rows,matrix[i].length);
    for (var i=0;i<matrix.length;i++){
      while (matrix[i].length<rows) matrix[i].push(0);
    }
    this.matrix=matrix;
    this.columns=matrix.length;
    this.rows=rows;
  }
}
RectangularMatrix.cloneMatrix=function (matrix){
  var r=[];
  for (var i=0;i<matrix.length;i++) r.push(matrix[i].slice(0));
  return r;
}
RectangularMatrix.prototype.set=function (x,y,value){
  this.matrix[x][y]=value;
}
RectangularMatrix.prototype.get=function (x,y){
  return this.matrix[x][y];
}
Object.defineProperty(RectangularMatrix.prototype,"constructor",{
  value:RectangularMatrix,
  enumerable:false,
  writable:true
});
//BashicuMatrix extends RectangularMatrix
function BashicuMatrix(arg0,arg1){
  if (typeof arg0=="string") arg0=BashicuMatrix.parseString(arg0);
  RectangularMatrix.call(this,arg0,arg1);
}
BashicuMatrix.parseString=function (s){
  return JSON.parse(
        "["+s
          .replace(/\(/g,"[")
          .replace(/\)/g,"]")
          .replace(/\]\[/g,"],[")+"]");
}
BashicuMatrix.prototype=Object.create(RectangularMatrix.prototype);
BashicuMatrix.prototype.toString=function (){
  var str="";
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
Object.defineProperty(BashicuMatrix.prototype,"constructor",{
  value:BashicuMatrix,
  enumerable:false,
  writable:true
});
//BMver
function BMver(obj){
  this.name=obj.name;
  this.displayname=obj.displayname||obj.name;
  this._parent=obj.parent;
  this._badroot=obj.badroot;
  this._precolor=obj.precolor;
  this._color=obj.color;
  this.vercolor=obj.vercolor||"white";
  BMvers[this.name]=this;
  BMverlist.push(this.name);
}
BMver.prototype.lowermostNonzero=function (matrix){
  if (!(matrix instanceof RectangularMatrix)) matrix=new BashicuMatrix(matrix);
  for (var i=0;i<matrix.rows;i++){
    if (!matrix.get(matrix.columns-1,i)){
      return i-1;
    }
  }
  return matrix.rows-1;
}
BMver.prototype.parent=function (matrix,x,y){
  if (!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0) throw Error("Expected positive integers. Instead got: "+x+","+y);
  if (!(matrix instanceof RectangularMatrix)) matrix=new BashicuMatrix(matrix);
  return this._parent(this,matrix,x,y);
}
BMver.prototype.ancestry=function (matrix,x,y){
  if (!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0) throw Error("Expected positive integers. Instead got: "+x+","+y);
  if (!(matrix instanceof RectangularMatrix)) matrix=new BashicuMatrix(matrix);
  var r=[];
  var i=x;
  while (i>-1){
    r.push(i);
    i=this.parent(matrix,i,y);
  }
  return r;
}
BMver.prototype.badroot=function (matrix){
  if (!(matrix instanceof RectangularMatrix)) matrix=new BashicuMatrix(matrix);
  return this._badroot(this,matrix);
}
BMver.prototype.precolor=function (matrix,x,y){
  if (!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0) throw Error("Expected positive integers. Instead got: "+x+","+y);
  if (!(matrix instanceof RectangularMatrix)) matrix=new BashicuMatrix(matrix);
  return this._precolor(this,matrix,x,y);
}
BMver.prototype.color=function (matrix,x,y){
  if (!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0) throw Error("Expected positive integers. Instead got: "+x+","+y);
  if (!(matrix instanceof RectangularMatrix)) matrix=new BashicuMatrix(matrix);
  return this._color(this,matrix,x,y);
}
Object.defineProperty(BMver.prototype,"constructor",{
  value:BMver,
  enumerable:false,
  writable:true
});
var BMvers={};
var BMverlist=[];
//See https://googology.wikia.org/wiki/User_blog:Koteitan/Categorizing_of_the_rule_sets_for_all_sub_versions_of_bashicu_matrix
var BMalgs={};
BMalgs.parent={};
BMalgs.parent.leftMethod=function (version,matrix,x,y){
  for (var i=x-1;i>-1;i--){
    for (var j=0;j<=y;j++){
      if (matrix.get(i,j)>=matrix.get(x,j)){
        break;
      }
    }
    if (j==y+1) return i;
  }
  return -1;
}
BMalgs.parent.BM1_2=function (version,matrix,x,y){
  var minFirst=Infinity;
  for (var i=x-1;i>-1;i--){
    if (matrix.get(i,0)>minFirst) continue;
    minFirst=Math.min(minFirst,matrix.get(i,0));
    for (var j=0;j<=y;j++){
      if (matrix.get(i,j)>=matrix.get(x,j)){
        break;
      }
    }
    if (j==y+1) return i;
  }
  return -1;
}
BMalgs.parent.concestorMethod=function (version,matrix,x,y){
  for (var i=x-1;i>-1;i--){
    if (matrix.get(i,y)<matrix.get(x,y)){
      return i;
    }
  }
  return -1;
}
BMalgs.parent.upperBranchIgnoringModel=function (version,matrix,x,y){
  if (y===0){
    for (var i=x-1;i>-1;i--){
      if (matrix.get(i,y)<matrix.get(x,y)){
        return i;
      }
    }
    return -1;
  }else{
    var ancestors=version.ancestry(matrix,x,y-1);
    for (var i=0;i<ancestors.length;i++){
      if (matrix.get(ancestors[i],y)<matrix.get(x,y)){
        return ancestors[i];
      }
    }
    return -1;
  }
}
BMalgs.badroot={};
BMalgs.badroot.leftMethod=
BMalgs.badroot.BM1_2=
BMalgs.badroot.upperBranchIgnoringModel=
BMalgs.badroot.concestorMethod=function (version,matrix){
  var lnz=version.lowermostNonzero(matrix);
  return lnz==-1?-1:version.parent(matrix,matrix.columns-1,lnz);
}
BMalgs.precolor={};
BMalgs.precolor.allBranches=function (version,matrix,x,y){
  return green;
}
BMalgs.precolor.BM2=function (version,matrix,x,y){
  if (x==version.badroot(matrix)){
    return green;
  }else{
    for (var p=x;p>=0;p--){
      if (matrix.get(p,0)<matrix.get(x,0)) break;
    }
    if (version.precolor(matrix,p,y)==green&&matrix.get(version.badroot(matrix),y)<matrix.get(x,y)){
      return green;
    }else{
      return pink;
    }
  }
}
BMalgs.precolor.upperBranchIgnoringModel=function (version,matrix,x,y){
  if (version.ancestry(matrix,x,y).includes(version.badroot(matrix))){
    return green;
  }else{
    return pink;
  }
}
BMalgs.precolor.BM2_5=function (version,matrix,x,y){
  if (x==version.badroot(matrix)) x=matrix.columns-1;
  if (x==version.badroot(matrix)+1){
    return green;
  }else if (version.parent(matrix,x,y)>version.badroot(matrix)){
    var fitlowermost=matrix.rows-1;
    while (version.parent(matrix,x,fitlowermost)<=version.badroot(matrix)) fitlowermost--;
    for (var i=0;i<=y;i++){
      if (version.precolor(matrix,version.parent(matrix,x,fitlowermost),i)!=green||matrix.get(version.parent(matrix,x,fitlowermost),i)>=matrix.get(x,i)){
        return pink;
      }
    }
    return green
  }else{
    return pink;
  }
}
BMalgs.precolor.BM3_3=function (version,matrix,x,y){
  if (version.ancestry(matrix,x,version.lowermostNonzero(matrix)).includes(version.badroot(matrix))||version.parent(matrix,x,y)>version.badroot(matrix)&&version.color(matrix,version.parent(matrix,x,y),y)==green){
    return green;
  }else{
    return pink;
  }
}
BMalgs.precolor.BRplusDeltaComp=function (version,matrix,x,y){
  if (x==version.badroot(matrix)){
    return green;
  }else{
    for (var n=version.rows-1;n>0&&matrix.get(x,n)<=matrix.get(n<version.lowermostNonzero(matrix)?matrix.columns-1:version.badroot(matrix),n);n--);
    n++;
    if (y<n){
      return green;
    }else{
      return pink;
    }
  }
}
BMalgs.precolor.UBRABC=function (version,matrix,x,y){
  if (x==version.badroot(matrix)){
    return green;
  }else{
    var label=BMalgs.misc.ABC(version,matrix,x,y);
    if (label=="A"){
      return green;
    }else if (label=="B"){
      var lowermost=version.lowermostNonzero(matrix);
      for (var i=0;i<=lowermost;i++){
        if (BMalgs.misc.ABC(version,matrix,x,i)=="C"){
          return pink;
        }
      }
      return green;
    }else if (label=="C"){
      return pink;
    }
  }
}
BMalgs.precolor.UBRABCplusParentCheck=function (version,matrix,x,y){
  if (x==version.badroot(matrix)){
    return green;
  }else{
    var label=BMalgs.misc.ABC(version,matrix,x,y);
    if (label=="A"){
      if (version.color(matrix,BMalgs.parent.upperBranchIgnoringModel(version,matrix,x,y),y)!=green){
        return pink;
      }else{
        return green;
      }
    }else if (label=="B"){
      var lowermost=version.lowermostNonzero(matrix);
      for (var i=0;i<=lowermost;i++){
        if (BMalgs.misc.ABC(version,matrix,x,i)=="C"){
          return pink;
        }
      }
      return green;
    }else if (label=="C"){
      return pink;
    }
  }
}
BMalgs.precolor.RpakrDef3=function (version,matrix,x,y){
  if (version.ancestry(matrix,x,version.lowermostNonzero(matrix)).includes(version.badroot(matrix))){
    return green;
  }else{
    if (version.badroot(matrix)<version.parent(matrix,x,y)&&version.precolor(matrix,version.parent(matrix,x,y),y)==green){
      return green;
    }else{
      return pink;
    }
  }
}
BMalgs.precolor.RpakrDef4=function (version,matrix,x,y){
  if (version.ancestry(matrix,x,version.lowermostNonzero(matrix)).includes(version.badroot(matrix))){
    return green;
  }else{
    for (var lowermost=matrix.rows-1;lowermost>=0&&!(version.badroot(matrix)<version.parent(matrix,x,lowermost)&&version.precolor(matrix,version.parent(matrix,x,lowermost),lowermost)==green);lowermost--);
    lowermost++;
    if (y<lowermost){
      return green;
    }else{
      return pink;
    }
  }
}
BMalgs.precolor.RpakrDef4p=function (version,matrix,x,y){
  if (version.ancestry(matrix,x,version.lowermostNonzero(matrix)).includes(version.badroot(matrix))){
    return green;
  }else{
    for (var lowermost=0;lowermost<matrix.rows&&version.badroot(matrix)<version.parent(matrix,x,lowermost)&&version.precolor(matrix,version.parent(matrix,x,lowermost),lowermost)==green;lowermost++);
    if (y<lowermost){
      return green;
    }else{
      return pink;
    }
  }
}
BMalgs.color={};
BMalgs.color.none=function (version,matrix,x,y){
  if (y>=version.lowermostNonzero(matrix)||x<version.badroot(matrix)||x==matrix.columns-1){
    return "white";
  }else{
    return version.precolor(matrix,x,y);
  }
}
BMalgs.color.all1orprethen0s=function (version,matrix,x,y){
  if (y>=version.lowermostNonzero(matrix)||x<version.badroot(matrix)||x==matrix.columns-1){
    return "white";
  }else{
    var lowermost=version.lowermostNonzero(matrix);
    for (var i=0;i<=lowermost;i++){
      if (version.precolor(matrix,x,i)!=green){
        if (y==0){
          return green;
        }else{
          return pink;
        }
      }
    }
    return green;
  }
}
BMalgs.color.all1orall0=function (version,matrix,x,y){
  if (y>=version.lowermostNonzero(matrix)||x<version.badroot(matrix)||x==matrix.columns-1){
    return "white";
  }else{
    var lowermost=version.lowermostNonzero(matrix);
    for (var i=0;i<=lowermost;i++){
      if (version.precolor(matrix,x,i)!=green){
        return pink;
      }
    }
    return green;
  }
}
BMalgs.color.BM3=function (version,matrix,x,y){
  if (y>=version.lowermostNonzero(matrix)||x<version.badroot(matrix)||x==matrix.columns-1){
    return "white";
  }else if (y==0||x==version.badroot(matrix)){
    return green;
  }else{
    var bad=matrix.columns-version.badroot(matrix);
    var n=x+bad;
    for (var M=n;M>=0&&(M>=matrix.columns?matrix.get(M-bad,0)+matrix.get(matrix.columns-1,0)-matrix.get(version.badroot(matrix),0):matrix.get(M,0))>=matrix.get(x,0)+matrix.get(matrix.columns-1,0)-matrix.get(version.badroot(matrix),0);M--);
    var left=matrix.get(M-bad,y);
    var mid=M>=matrix.columns?version.color(matrix,M-bad,y)==green?matrix.get(M-bad,y)+matrix.get(matrix.columns-1,y)-matrix.get(version.badroot(matrix),y):matrix.get(M-bad,y):matrix.get(M,y);
    var right=matrix.get(x,y)+matrix.get(matrix.columns-1,y)-matrix.get(version.badroot(matrix),y);
    if (left<mid&&mid<right){
      return green;
    }else{
      return pink;
    }
  }
}
BMalgs.color.Rpakr0319_1=function (version,matrix,x,y){
  if (y>=version.lowermostNonzero(matrix)||x<version.badroot(matrix)||x==matrix.columns-1){
    return "white";
  }else{
    for (var n=0;n<matrix.columns&&matrix.get(n,0)==n;n++);
    var lowermost=version.lowermostNonzero(matrix);
    for (var i=0;i<=lowermost;i++){
      if (version.precolor(matrix,x,i)!=green){
        if (y<n){
          return green;
        }else{
          return pink;
        }
      }
    }
    return version.precolor(matrix,x,y);
  }
}
BMalgs.color.Rpakr0319_2=function (version,matrix,x,y){
  if (y>=version.lowermostNonzero(matrix)||x<version.badroot(matrix)||x==matrix.columns-1){
    return "white";
  }else{
    var lowermost=version.lowermostNonzero(matrix);
    for (var i=0;i<=lowermost;i++){
      if (version.precolor(matrix,x,i)!=green){
        for (var n=0;n<matrix.rows&&matrix.get(version.parent(matrix,x,0),n)<matrix.get(x,n);n++);
        if (y<n){
          return green;
        }else{
          return pink;
        }
      }
    }
    return version.precolor(matrix,x,y);
  }
}
BMalgs.color.UBRAplusParentCheck=function (version,matrix,x,y){
  if (y>=version.lowermostNonzero(matrix)||x<version.badroot(matrix)||x==matrix.columns-1){
    return "white";
  }else{
    var lowermost=version.lowermostNonzero(matrix);
    for (var i=0;i<=lowermost;i++){
      if (version.precolor(matrix,x,i)!=green){
        for (var rightmost=x-1;rightmost>=0;rightmost--){
          for (var j=0;j<y;j++){
            if (!BMvers["1"].ancestry(matrix,x,j).includes(rightmost)) break;
          }
          if (j==y) break;
        }
        if (version.badroot(matrix)<rightmost&&version.color(matrix,rightmost,y)==green){
          return green;
        }else{
          return pink;
        }
      }
    }
    return version.precolor(matrix,x,y);
  }
}
BMalgs.color.RpakrDef1=function (version,matrix,x,y){
  if (y>=version.lowermostNonzero(matrix)||x<version.badroot(matrix)||x==matrix.columns-1){
    return "white";
  }else{
    var lowermost=version.lowermostNonzero(matrix);
    for (var i=0;i<=lowermost;i++){
      if (version.precolor(matrix,x,i)!=green){
        var rightmost=version.parent(matrix,x,y);
        if (version.badroot(matrix)<rightmost&&version.color(matrix,rightmost,y)==green){
          return green;
        }else{
          return pink;
        }
      }
    }
    return version.precolor(matrix,x,y);
  }
}
BMalgs.color.RpakrDef2=function (version,matrix,x,y){
  if (y>=version.lowermostNonzero(matrix)||x<version.badroot(matrix)||x==matrix.columns-1){
    return "white";
  }else{
    var lowermost=version.lowermostNonzero(matrix);
    if (version.precolor(matrix,x,lowermost)!=green){
      var rightmost=version.parent(matrix,x,y);
      if (version.badroot(matrix)<rightmost&&version.color(matrix,rightmost,y)==green){
        return green;
      }else{
        return pink;
      }
    }
    return version.precolor(matrix,x,y);
  }
}
BMalgs.misc={};
BMalgs.misc.ABC=function (version,matrix,x,y){
  var rightmost=BMvers["4"].parent(matrix,x,y);
  if (version.badroot(matrix)<rightmost){
    return "A";
  }else if (version.badroot(matrix)==rightmost){
    return "B";
  }else{
    return "C";
  }
}
new BMver({
  name:"1",
  parent:BMalgs.parent.leftMethod,
  badroot:BMalgs.badroot.leftMethod,
  precolor:BMalgs.precolor.allBranches,
  color:BMalgs.color.none
});
new BMver({
  name:"1.1",
  displayname:"1.1/2.1",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.allBranches,
  color:BMalgs.color.none
});
new BMver({
  name:"1.2",
  displayname:"1.2/4.1",
  parent:BMalgs.parent.BM1_2,
  badroot:BMalgs.badroot.BM1_2,
  precolor:BMalgs.precolor.allBranches,
  color:BMalgs.color.none
});
new BMver({
  name:"2",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.BM2,
  color:BMalgs.color.none
});
new BMver({
  name:"2.2",
  parent:BMalgs.parent.concestorMethod,
  badroot:BMalgs.badroot.concestorMethod,
  precolor:BMalgs.precolor.allBranches,
  color:BMalgs.color.none
});
new BMver({
  name:"4",
  displayname:"4/2.3/2.4",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.upperBranchIgnoringModel,
  color:BMalgs.color.none
});
new BMver({
  name:"2.5",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.BM2_5,
  color:BMalgs.color.none
});
new BMver({
  name:"3",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.allBranches,
  color:BMalgs.color.BM3
});
new BMver({
  name:"3.1",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.BM2,
  color:BMalgs.color.all1orprethen0s
});
new BMver({
  name:"3.1.1",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.BM2,
  color:BMalgs.color.all1orall0
});
new BMver({
  name:"3.2",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.upperBranchIgnoringModel,
  color:BMalgs.color.all1orprethen0s
});
new BMver({
  name:"Rpakr0319_1",
  displayname:"Rpakr Mar. 19 (1)",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.upperBranchIgnoringModel,
  color:BMalgs.color.Rpakr0319_1
});
new BMver({
  name:"Rpakr0319_2",
  displayname:"Rpakr Mar. 19 (2)",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.upperBranchIgnoringModel,
  color:BMalgs.color.Rpakr0319_2
});
new BMver({
  name:"3.3",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.BM3_3,
  color:BMalgs.color.none
});
new BMver({
  name:"BRplusDeltaComp",
  displayname:"BR+Δ comp.",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.BRplusDeltaComp,
  color:BMalgs.color.none
});
new BMver({
  name:"UBRABC",
  displayname:"UBRABC",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.UBRABC,
  color:BMalgs.color.none
});
new BMver({
  name:"UBRABCplusParentCheck",
  displayname:"UBRABC+parent check",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.UBRABCplusParentCheck,
  color:BMalgs.color.none
});
new BMver({
  name:"UBRAplusParentCheck",
  displayname:"UBRA+parent check",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.upperBranchIgnoringModel,
  color:BMalgs.color.UBRAplusParentCheck
});
new BMver({
  name:"RpakrDef1",
  displayname:"Rpakr Def. 1",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.upperBranchIgnoringModel,
  color:BMalgs.color.RpakrDef1
});
new BMver({
  name:"RpakrDef2",
  displayname:"Rpakr Def. 2",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.upperBranchIgnoringModel,
  color:BMalgs.color.RpakrDef2
});
new BMver({
  name:"RpakrDef3",
  displayname:"Rpakr Def. 3",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.RpakrDef3,
  color:BMalgs.color.none
});
new BMver({
  name:"RpakrDef4",
  displayname:"Rpakr Def. 4",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.RpakrDef4,
  color:BMalgs.color.none
});
new BMver({
  name:"RpakrDef4p",
  displayname:"Rpakr Def. 4'",
  parent:BMalgs.parent.upperBranchIgnoringModel,
  badroot:BMalgs.badroot.upperBranchIgnoringModel,
  precolor:BMalgs.precolor.RpakrDef4p,
  color:BMalgs.color.none
});
new BMver({
  name:"empty",
  parent:function(){return -1},
  badroot:function(){return 0},
  precolor:function(){return "white"},
  color:function(){return "white"}
})
BMverlist.pop(); //Remove "empty" from list
var BMVpresets={
  "3.3+4":{
    name:"3.3+4",
    content:["3.3","4"]
  },
  "byBashicu":{
    name:"By Bashicu",
    content:["1","1.1","2","3","4"]
  },
  "byKoteitan":{
    name:"By Koteitan",
    content:["1.1","2.2","4"]
  },
  "byYukito":{
    name:"By Yukito",
    content:["4","2.5"]
  },
  "byNish":{
    name:"By Nish",
    content:["4","3.1","3.2"]
  },
  "byEcl1psed":{
    name:"By Ecl1psed",
    content:["4","3.1.1","3.3","BRplusDeltaComp","UBRABC","UBRABCplusParentCheck"]
  },
  "byRpakr":{
    name:"By Rpakr",
    content:["3.3","Rpakr0319_1","Rpakr0319_2","UBRAplusParentCheck","RpakrDef1","RpakrDef2","RpakrDef3","RpakrDef4","RpakrDef4p"]
  },
  "byPsiCubed2":{
    name:"By PsiCubed2",
    content:["1.2"]
  },
  "empty":{
    name:"Empty",
    content:[]
  },
  "all":{
    name:"All",
    content:BMverlist
  }
};
var BMVpresetlist=["3.3+4","byBashicu","byKoteitan","byYukito","byNish","byEcl1psed","byRpakr","byPsiCubed2","empty","all"];
var presetUsed="";
var BMV=["3.3","4"];
var green="#56f442";
var pink="#e841f4";
//display
var canvas;
var ctx;
window.onload=function (){
  console.clear();
  canvas=document.getElementById("output");
  ctx=canvas.getContext("2d");
  refreshversionlist(true);
  getquery();
  refreshversionlist();
  draw();
  renewlink();
}
var changeVersion=function (){
  presetUsed="";
  renewlink();
}
var refreshversionlist=function (refreshoptions){
  var list=document.getElementById("versionlist");
  var children=list.childNodes;
  for (var i=0;i<children.length;i++){
    if (children[i].id!=="versiondropdown"){
      list.removeChild(children[i]);
      i--;
    }
  }
  for (var i=0;i<BMV.length;i++) addversiondom(BMV[i],i);
  selectedVersionID=-1;
  var menu=document.getElementById("versiondropdown");
  menu.onclick=menu.onmouseenter=mouseenterversionmenu;
  menu.onmouseleave=mouseleaveversionmenu;
  deselectversionitem();
  if (refreshoptions){
    var versionselect=form.version;
    while (versionselect.options.length>0) versionselect.options.remove(0);
    for (var i=0;i<BMverlist.length;i++){
      var node=document.createElement("option");
      node.value=BMverlist[i];
      node.text=BMvers[BMverlist[i]].displayname;
      versionselect.options.add(node);
    }
    var presetselect=form.preset;
    while (presetselect.options.length>0) presetselect.options.remove(0);
    for (var i=0;i<BMVpresetlist.length;i++){
      var node=document.createElement("option");
      node.value=BMVpresetlist[i];
      node.text=BMVpresets[BMVpresetlist[i]].name;
      presetselect.options.add(node);
    }
  }
}
var addversion=function (version,i,update){
  if (typeof version=="undefined") version=form.version.value;
  if (typeof i=="undefined") i=BMV.length;
  if (typeof update=="undefined") update=true;
  BMV.splice(i,0,version);
  addversiondom(version,i);
  changeVersion();
}
var addversiondom=function (version,i){
  var node=document.createElement("div");
  node.id="versionitem"+i;
  node.className="versionitem";
  node.textContent=BMvers[version]?BMvers[version].displayname:"Unknown";
  node.onclick=selectversionitem;
  node.onmouseenter=mouseenterversionitem;
  node.onmouseleave=mouseleaveversionitem;
  document.getElementById("versionlist").appendChild(node);
}
var moveleftversion=function (i){
  if (typeof i=="undefined") i=selectedVersionID;
  if (i<=0||i>BMV.length-1) return;
  var temp=BMV[i];
  BMV[i]=BMV[i-1];
  BMV[i-1]=temp;
  var temp=document.getElementById("versionitem"+i).textContent;
  document.getElementById("versionitem"+i).textContent=document.getElementById("versionitem"+(i-1)).textContent;
  document.getElementById("versionitem"+(i-1)).textContent=temp;
  deselectversionitem();
  changeVersion();
}
var moverightversion=function (i){
  if (typeof i=="undefined") i=selectedVersionID;
  if (i<0||i>=BMV.length-1) return;
  var temp=BMV[i];
  BMV[i]=BMV[i+1];
  BMV[i+1]=temp;
  var temp=document.getElementById("versionitem"+i).textContent;
  document.getElementById("versionitem"+i).textContent=document.getElementById("versionitem"+(i+1)).textContent;
  document.getElementById("versionitem"+(i+1)).textContent=temp;
  deselectversionitem();
  changeVersion();
}
var removeversion=function (i){
  if (typeof i=="undefined") i=selectedVersionID;
  if (i<0||i>BMV.length-1) return;
  BMV.splice(i,1);
  for (var j=i;j<BMV.length;j++){
    document.getElementById("versionitem"+j).textContent=document.getElementById("versionitem"+(j+1)).textContent;
  }
  document.getElementById("versionlist").removeChild(document.getElementById("versionitem"+j));
  deselectversionitem();
  changeVersion();
}
var selectedVersionID=-1;
var ismouseinversionitem=false;
var ismouseinversionmenu=false;
var selectversionitem=function (e){
  var elem=e.target||e.srcElement;
  if (elem.id.slice(0,11)!="versionitem") return;
  var itemid=+elem.id.slice(11)
  selectedVersionID=itemid;
  ismouseinversionitem=true;
  document.getElementById("versiondropdown").style.display="";
  document.getElementById("versiondropdown").style.top=elem.offsetTop+elem.offsetHeight+"px";
  document.getElementById("versiondropdown").style.left=elem.offsetLeft+"px";
}
var mouseenterversionitem=function (e){
  var elem=e.target||e.srcElement;
  if (elem.id.slice(0,11)!="versionitem") return;
  var itemid=+elem.id.slice(11);
  if (itemid==selectedVersionID) ismouseinversionitem=true;
}
var mouseleaveversionitem=function (e){
  var elem=e.target||e.srcElement;
  if (elem.id.slice(0,11)!="versionitem") return;
  var itemid=+elem.id.slice(11);
  if (itemid==selectedVersionID){
    ismouseinversionitem=false;
    if (!ismouseinversionitem&&!ismouseinversionmenu) calldeselectversionitem();
  }
}
var mouseenterversionmenu=function (e){
  var elem=e.target||e.srcElement;
  if (elem.id!="versiondropdown"&&!document.getElementById("versiondropdown").contains(elem)) return;
  ismouseinversionmenu=true;
}
var mouseleaveversionmenu=function (e){
  var elem=e.target||e.srcElement;
  if (elem.id!="versiondropdown"&&!document.getElementById("versiondropdown").contains(elem)) return;
  ismouseinversionmenu=false;
  if (!ismouseinversionitem&&!ismouseinversionmenu) calldeselectversionitem();
}
var calldeselectversionitem=function (){
  setTimeout(function(){if(!ismouseinversionitem&&!ismouseinversionmenu)deselectversionitem();},500);
}
var deselectversionitem=function (){
  //selectedVersionID=-1;
  document.getElementById("versiondropdown").style.display="none";
}
var loadpreset=function (){
  var preset=BMVpresets[form.preset.value];
  if (!preset) return;
  BMV=preset.content.slice(0);
  refreshversionlist();
  presetUsed=form.preset.value;
}
var matrices;
var matrixList;
var draw=function (){
  //parse matrices
  var matricesText=form.input.value.replace(/\[.*\]/g,"").replace(/\n\n+/g,"\n").replace(/ /g,"");
  var matrixTextList=matricesText.split("\n");
  matrices = matrixTextList.length;
  matrixList = new Array(matrices);
  for(var m=0;m<matrices;m++){
    var matrix=new BashicuMatrix(matrixTextList[m]);
    if(matrix.columns!=0){
      matrixList[m]=matrix;
    }else{
      matrices--;
    }
  }

  var vers=new Array(BMV.length);
  for (var i=0;i<BMV.length;i++){
    var ver=BMvers[BMV[i]];
    if (!ver) ver=BMvers.empty;
    vers[i]=ver;
  }

  var offsetList = new Array(matrices);
  var width=0;
  var height=0;
  var ys = new Array(matrices);
  var stroffsetx = 50;//pixel
  ctx.fillStyle="black";
  ctx.font = '18px Arial';
  for(var m=0;m<matrices;m++){
    var matrix=matrixList[m];
    //measure string
    var str = matrix.toString();
    var xx = stroffsetx+ctx.measureText(str).width;
    width = xx>width?xx:width;
    ys[m]=height;
    height+=30;
    //measure drawing
    var xx=(30+(matrix.columns+1)*30)*BMV.length;
    width = xx>width?xx:width;
    offsetList[m]=new Array(BMV.length);
    var yy=0;
    for (var i=0;i<BMV.length;i++){
      var offsets=rowOffsets(vers[i],matrix);
      offsetList[m][i]=offsets;
      var ny=offsets[matrix.rows-1]+50;
      yy=ny>yy?ny:yy;
    }
    height=height+yy;
  }

  //resize and clear canvas
  canvas.width=width;
  canvas.height=height;
  ctx.fillStyle="white";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  //draw string
  ctx.fillStyle="black";
  ctx.font = '18px Arial';
  for(var m=0;m<matrices;m++){
    var matrix=matrixList[m];
    ctx.fillText(matrix.toString(),stroffsetx,ys[m]+30);
  }
  //draw hydra
  for(var m=0;m<matrices;m++){
    var matrix=matrixList[m];
    for (var i=0;i<BMV.length;i++){
      drawMatrix(50+(30+(matrix.columns+1)*30)*i,ys[m]+30,offsetList[m][i],vers[i],matrix);
    }
  }

  //enable save
  outimg.width  = canvas.width;
  outimg.height = canvas.height;
  outimg.src = canvas.toDataURL('image/jpg');
}//draw()
var rowOffsets=function (ver, matrix){
  var offsets=[];
  var currentOffset=0;
  for (var y=0;y<matrix.rows;y++){
    //get lowerbound of upper row
    var lowerbound=new Array(matrix.columns);
    if(y>0){
      for(var x=0;x<matrix.columns;x++)lowerbound[x]=+Infinity;
      for(var x=matrix.columns-1;x>=0;x--){
        var z=matrix.get(x,y-1);
        lowerbound[x]=z<lowerbound[x]?z:lowerbound[x];
        var p=ver.parent(matrix,x,y-1);
        for(var x2=p+1;x2<=x;x2++){
          lowerbound[x2]=z<lowerbound[x2]?z:lowerbound[x2];
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
      upperbound[x]=z>upperbound[x]?z:upperbound[x];
      var p=ver.parent(matrix,x,y);
      if(p!=-1){
        for(var x2=p+1;x2<=x;x2++){
          upperbound[x2]=z-1>upperbound[x2]?z-1:upperbound[x2];
        }
      }
    }
    //make margin
    var margin=0;
    for(var x=0;x<matrix.columns;x++){
      margin = upperbound[x]-lowerbound[x]>margin?upperbound[x]-lowerbound[x]:margin;
    }
    offsets.push(currentOffset+=(margin+1)*30);
  }
  return offsets;
}
var drawMatrix=function (bx, by, offsets, ver, matrix){
  var r=ver.badroot(matrix);
  for (var y=0;y<matrix.rows;y++){
    //row root
    var rx=bx,ry=by+offsets[y];
    ctx.strokeStyle="black";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(rx-20,ry+20);
    ctx.lineTo(rx-40,ry+40);
    ctx.moveTo(rx-20,ry+40);
    ctx.lineTo(rx-40,ry+20);
    ctx.stroke();
    for (var x=0;x<matrix.columns;x++){
      //node
      ctx.strokeStyle="black";
      ctx.fillStyle=ver.color(matrix,x,y);
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.arc(rx+x*30,ry-matrix.get(x,y)*30,7.8,0,2*Math.PI);
      ctx.fill();
      ctx.stroke();
      //number
      ctx.fillStyle="black";
      ctx.font="15px arial";
      ctx.fillText(matrix.get(x,y),rx-4+x*30,ry+5-matrix.get(x,y)*30);
      //bad root symbol
      if (x==r){
        ctx.strokeStyle="red";
        ctx.beginPath();
        ctx.moveTo(rx+x*30-10,ry-matrix.get(x,y)*30+2);
        ctx.lineTo(rx+x*30-15,ry-matrix.get(x,y)*30-2);
        ctx.lineTo(rx+x*30-10,ry-matrix.get(x,y)*30-4);
        ctx.lineTo(rx+x*30-12,ry-matrix.get(x,y)*30-10);
        ctx.lineTo(rx+x*30-7,ry-matrix.get(x,y)*30-8);
        ctx.lineTo(rx+x*30-5,ry-matrix.get(x,y)*30-14);
        ctx.lineTo(rx+x*30-0,ry-matrix.get(x,y)*30-10);
        ctx.stroke();
      }
      //rightmost column symbol
      if (x==matrix.columns-1){
        ctx.strokeStyle="red";
        ctx.beginPath();
        ctx.moveTo(rx+x*30+0,ry-matrix.get(x,y)*30-15);
        ctx.lineTo(rx+x*30+10,ry-matrix.get(x,y)*30-5);
        ctx.moveTo(rx+x*30+0,ry-matrix.get(x,y)*30-5);
        ctx.lineTo(rx+x*30+10,ry-matrix.get(x,y)*30-15);
        ctx.stroke();
      }
      //parency line
      ctx.strokeStyle="black";
      ctx.beginPath();
      var parent=ver.parent(matrix,x,y);
      if (parent==-1){
        ctx.moveTo(rx+parent*30+5.5,ry+30-5.5);
        ctx.lineTo(rx+parent*30+15,ry+30-15);
      }else{
        ctx.moveTo(rx+parent*30+5.5,ry-matrix.get(parent,y)*30-5.5);
        ctx.lineTo(rx+parent*30+15,ry-matrix.get(parent,y)*30-15);
      }
      ctx.lineTo(rx+x*30-15,ry-matrix.get(x,y)*30+15);
      ctx.lineTo(rx+x*30-5.5,ry-matrix.get(x,y)*30+5.5);
      ctx.stroke();
    }
  }
}
var handleauto=function(){
  if (!document.getElementById("autobox").checked) return;
  try{
    draw();
    renewlink();
  }catch(e){
    console.error(e);
  }
}
var handledrawbutton=function(){
  draw();
  renewlink();
}
var renewlink=function(){
  var query="m=";
  for(var m=0;m<matrices;m++){
    query+=matrixList[m].toString()+";";
  }
  query+="&ver="+(presetUsed||BMV.join(","));
  document.getElementById("link").href = location.origin+location.pathname+"?"+query;
}
var getquery=function(){
  var query=location.search.substr(1);
  if(query.length>0){
    //get matrix
    var matrixstr = query.match(/(m=)([(0-9),;]*)(&)/)[2].split(";");
    form.input.value="";
    for(var m=0;m<matrixstr.length-1;m++){
      if(m>0)form.input.value +="\n";
      form.input.value += matrixstr[m];
    }
    //get version
    var versionstring=query.match(/(ver=)(.*)(&*)/)[2];
    if (versionstring){
      if (BMVpresetlist.includes(versionstring)){
        form.preset.value=versionstring;
        loadpreset();
      }else{
        BMV=versionstring.split(",");
      }
    }
  }
}