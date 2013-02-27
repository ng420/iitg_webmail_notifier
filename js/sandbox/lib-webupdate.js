/***********************************************************
Library - Web Update
  
  Notify web site update.

  @ver 0.2
***********************************************************/

Handler.prototype.wuGetVal=function(n){
  return this.localDB[n];
}
Handler.prototype.wuSetVal=function(n,val){
  this.localDB[n]=val;
  this.saveDB(this.id,this.user,this.localDB);
}

/**********************************************************/
Handler.prototype.loadDB=function(id,user){
  sandbox.postMessage({cmd:"loadDB",id:id,user:user});
}

Handler.prototype.saveDB=function(id,user,data){  
  sandbox.postMessage({cmd:"saveDB",id:id,user:user,data:data});
}

Handler.prototype.wuCompare=function(aData){
  var fnd=this.findString(aData);
  if(fnd){    
    if(this.localDB.length>0){
      for(var i=0;i<this.cache;++i){
        if(this.localDB[i]==fnd)return 0;
      }
      //no match
      this.newData=fnd;
      return 1;
    }else{
      for(var i=0;i<this.cache;++i){
        this.localDB[i]=fnd;
      }
      this.saveDB(this.id,this.user,this.localDB);
      return 0;
    }
  }else{
    return -1;
  }
}
Handler.prototype.wuCheckUpdate=function(){
  if(this.newData){
    for(var i=this.cache-1;i>0;--i){
      this.localDB[i]=this.localDB[i-1];
    }
    this.localDB[0]=this.newData;
    delete this.newData;
    this.saveDB(this.id,this.user,this.localDB);
    this.count=0;
    this.data.desc=this.getDesc();    
    sandbox.postMessage({cmd:"setResult",count:this.count,data:this.data});
    return true;
  }
  return false;
}

function initUpdateHandler(handler){
  handler.cache=1;
  handler.initStage=ST_DATA;
  handler.start="";
  handler.capture="[\\s\\S]+";
  handler.end="";
  handler.noCounterReset=true;
  handler.loadDB(handler.id,handler.user);
  handler.getCount=function(aData){
     return this.wuCompare(aData);
  };
  handler.calcCount=function(){
     return this.count;
  };  

  handler.getViewURL=function(){
    this.wuCheckUpdate();
    return this.viewURL;
  }

  handler.getDesc = function(){
    var aData=this.count;
    return aData>0?"!":(aData==0?"=":"");
  }    
  if(!handler.findString){
    handler.findString=function(aData){
      var reg=new RegExp(this.start+"("+this.capture+")"+this.end);
      var fnd=aData.match(reg);
      return fnd?fnd[1]:null;
    }
  }
}
