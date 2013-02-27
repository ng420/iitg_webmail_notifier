const TIMER=60000;

function Main(){
}
Main.prototype.init=function(){
////////////debug////////////////
  this.debug=false;
  this.log="";
////////////////////////////////
  this.countTotal=localStorage["countTotal"];
  if(this.countTotal==null)this.countTotal=0;
  this.prefs=tobwithu.loadPrefs("prefs",DEF_PREF);
  if(this.prefs["resetCounter"]){
    this.counts=tobwithu.loadPrefs("counts",{});
  }
  if(this.prefs["customSound"]&&this.prefs["soundData"]){
    $("sound").src=this.prefs["soundData"];
  }else $("sound").src="notify.ogg";

  this.userScripts={};
  this.scripts={};
  this.dir0=tobwithu.getURL("js/scripts/");
  this.order=tobwithu.loadJSON(this.dir0+"list.json");
  for(var i in this.order){
    this.scripts[i]=this.getScriptInfo(i);
  }

  var scr=tobwithu.loadPrefs("scripts",{});
  for(var i in scr){
    this.addScript(i);
  }

  this.tabList={};
  this.initHandlers();
  this.checkFirstrun();
  this.stopTimer();
  this.startTimer();
}
Main.prototype.addScript=function(id){
  this.userScripts[id]=true;
  this.scripts[id]=this.getScriptInfo(id);
}
Main.prototype.getAccounts = function() {
  var accounts=tobwithu.loadAccounts();
  for(var i=0;i<accounts.length;i++){
    var o=accounts[i];
    if(this.order[o.id])o.key=this.order[o.id].toString();
  }
  accounts.sort(this.sortFunc);
  for(var i=0;i<accounts.length;i++){
    delete accounts[i].key;
  }

  var ar0=[];
  var ar1=[];
  for(var j=0;j<accounts.length;j++){
    var o=accounts[j];
    if(o.order!=null){
      var ind=ar1.length;
      for(var i=0;i<ar1.length;i++){
        if(o.order<ar1[i].order){
          ind=i;
          break;
        }
      }
      ar1.splice(ind,0,o);
    }
    else ar0.push(o);
  }
  for(var i in ar1){
    var o=ar1[i];
    ar0.splice(o.order,0,o);
  }
  return ar0;
}
Main.prototype.initHandlers = function(onInit) {
  this.handlers=[];
  var accounts=this.getAccounts();
  for(var i=0;i<accounts.length;i++){
    var o=new Handler(this);
    var acc=accounts[i];
    for(var k in acc)o[k]=acc[k];
    this.handlers.push(o);
  }
  var i;

  for(i=0;i<this.handlers.length;++i){
    this.handlers[i].ind=i;
  }

  var defaults=tobwithu.loadPrefs("defaults",{});
  this.hdlTable={};
  for(var i in this.scripts){
    this.hdlTable[i]=[];
  }
  for(var i in this.handlers){
    var o=this.handlers[i];
    if(o.enabled&&this.hdlTable[o.id]){
      if(o.user==defaults[o.id])this.hdlTable[o.id].splice(0,0,o);//default account inserted into index 0
      else this.hdlTable[o.id].push(o);
      o.name=this.getHostName(o.id);
    }
  }

  for(var i in this.hdlTable){
    var o=this.hdlTable[i];
    if(o.length>0){
      if(!defaults[i]){
        defaults[i]=o[0].user;
        tobwithu.savePrefs("defaults",defaults);
      }
      //set account name
      for(var j in o){
        var obj=o[j];
        if(obj.alias)obj.accName=obj.alias;
        else if(o.length>1){
          obj.accName=obj.name+" ["+obj.user+"]";
        }else obj.accName=obj.name;
      }
    }
  }

  for(i=0;i<this.handlers.length;++i){
    var hd=this.handlers[i];
    if(hd.enabled&&this.hdlTable[hd.id]){
      var iframe=document.createElement("iframe");
      iframe.src="js/sandbox/index.html?id="+i;
      iframe.hid=hd.id;
      iframe.ind=i;
      iframe.onload=function(){
        var data={cmd:"init",scr:main.loadScript(this.hid)};
        var o={}
        var h=main.handlers[this.ind];
        for(var i in h){
          var v=h[i];
          if(typeof v == "string"||typeof v == "number"||typeof v == "boolean")o[i]=h[i];
        }
        o.resetCounter=main.prefs["resetCounter"];
        o.savedCount=o.resetCounter?h.loadCount():0;
        data.acc=o;
        h.postMessage(data);
      }
      this.handlers[i].iframe=iframe;
      document.body.appendChild(iframe);
    }
  }
}
Main.prototype.checkInit=function(){
  var inited=true;
  for(var i in this.handlers){
    var o=this.handlers[i];
    if(o.enabled&&!o.inited){
      inited=false;
      break;
    }
  }
  if(inited){
    for(var i in this.hdlTable){
      var o=this.hdlTable[i];
      for(var j in o){
        var obj=o[j];
        obj.active=(j==0||obj.supportMulti);
        if(obj.supportMulti){
          obj.multiId=j;
          obj.postMessage({cmd:"multiId",data:j});
        }
      }
    }
    this.checkNow(false);
  }
}

Main.prototype.updateCount=function(obj) {
  if(this.prefs["resetCounter"]&&!obj.noCounterReset){
    var o=this.counts;
    if(!o[obj.id])o[obj.id]={};
    o[obj.id][obj.user]=obj.count>0?obj.count:0;
    tobwithu.savePrefs("counts",o);
    this._updateCount(obj);
  }
}
Main.prototype.onClickAccount = function(ind,check) {
  var o=this.handlers[ind];
  if(o.active){
    if(check)o.check();
    else this._openView(o);
  }else{
    this.checkOne(o);
  }
}

Main.prototype.openViews = function(){
  for(var i in this.hdlTable){
    var o=this.hdlTable[i];
    for(var j=0;j<o.length;j++){
      var obj=o[j];
      if(obj.active&&obj.calcCount()>0){
        this._openView(obj);
      }
    }
  }
}
Main.prototype._findTab=function(tabid){
  for(var i in this.tabList){
    if(i.indexOf("-")==0)continue;
    if(this.tabList[i].tabid==tabid){
      var ar=this.hdlTable[i];
      for(var j=0;j<ar.length;j++){
        if(ar[j].user==this.tabList[i].user)return ar[j];
      }
    }
  }
  return null;
}
Main.prototype.stopAll=function(){
  for(var i in this.hdlTable){
    var o=this.hdlTable[i];
    for(var j=0;j<o.length;j++)o[j].stop();
  }
}
Main.prototype.checkNow=function(isTimer){
  this.stopAll();
  this.isTimer=isTimer;
  this.checkList={};
  for(var i in this.hdlTable){
    var ar=[];
    if(this.scripts[i].isGoogle)ar=this.checkList["gmail"];
    else this.checkList[i]=ar;
    var o=this.hdlTable[i];
    if(this.scripts[i].supportMulti){
      for(var j in o)ar.push(o[j]);
    }else{
      for(var j in o){
        if(o[j].enabled&&!o[j].active){
          ar.push(o[j]);
        }
      }
      for(var j in o){
        if(o[j].enabled&&o[j].active){
          ar.push(o[j]);
        }
      }
    }
  }
  if(isTimer){
    tobwithu.getTabs(function(tabs){
      for(var i in tabs){
        var tab=tabs[i];
        var obj=main._findTab(tab.id);
        if(obj!=null){
          main.checkList[obj.id]=[obj];
        }
      }
      main._checkAll0(isTimer);
    });
  }else this._checkAll0(isTimer);
}
Main.prototype.setActive = function(o){
  if(o.supportMulti)return;
  var ar=this.hdlTable[o.id];
  for(var i=0;i<ar.length;i++){
    if(ar[i].active){
      ar[i].active=false;
      this.setPopupData(ar[i]);
    }else ar[i].active=false;
  }
  o.active=true;
  this.setPopupData(o);
  o.reset();
}
Main.prototype._checkAll0 = function(isTimer){
  var now=new Date().getTime();
  for(var i in this.checkList){
    var o=this.checkList[i]
    for(var j=0;j<o.length;j++){
      var obj=o[j];
      var interval=(obj.interval!=null?obj.interval:(obj.defaultInterval!=null?obj.defaultInterval:this.prefs["updateInterval"]))*60000;
      var check=false;
      if(!obj.supportMulti&&obj.active&&o.length>1)check=true;
      else if(isTimer){
        if(interval>0&&(obj.lastCheck==null||obj.lastCheck+interval-500<=now))check=true;
      }else if(interval>=0)check=true;
      if(check)obj.lastCheck=now;
      else{
        o.splice(j,1);
        --j;
      }
    }
  }
  this._checkAll(isTimer);
}
Main.prototype.checkOne = function(obj){
  this.setActive(obj);
  this.setLoadingAni(obj.ind);
  obj.check();
}
Main.prototype._checkAll = function(isTimer){
try{
  var workTable=[];
  if(isTimer){
    this.lastCheck=new Date();
    this.setLastCheck(this.lastCheck);
  }
  for(var i in this.checkList){
    var o=this.checkList[i]
    if(o.length>0){
      var obj=o[0];
      o.splice(0,1);
      this.setActive(obj);
      workTable.push(obj);
    }
  }
  var showAni=false;
  for(var i in workTable){
    if(workTable[i].count<0){
      showAni=true;
      break;
    }
  }
  if(showAni||(!isTimer&&workTable.length>0))loadingAnimation.start();

  for(var i in workTable){
    this.setLoadingAni(workTable[i].ind);
    workTable[i].check();
  }
}catch(e){
dout(e);
}
}

Main.prototype.setResult=function(hd){
  var o=hd;
  o.started=false;

  var stop=false;
  if(hd.autoOpen&&hd.count>0&&hd.calcCount()>0){
    this._openView(hd);
    if(!hd.supportMulti)stop=true;
  }else{
    var tabid=o.multiId!=null?"-"+o.id+o.multiId:o.id;
    if(o.count>=0&&this.tabList[tabid]){
      if(this.tabList[tabid].user!=o.user){
        this.tabList[tabid].user=o.user;
        this.updateTab(o,tabid);
      }
    }
  }
  if(!stop){
    var obj=this.checkList[this.scripts[hd.id].isGoogle?"gmail":hd.id];
    if(obj.length>0){
      var t=obj[0];
      obj.splice(0,1);
      this.checkOne(t);
      this.setPopupData(hd);
      return;
    }
  }

  var finished=true;
  for(var i in this.handlers){
    if(this.handlers[i].started){
      finished=false;
      break;
    }
  }

  if(finished){
    var list=[];
    var total=0;
    for(var i in this.handlers){
      var o=this.handlers[i];
      if(o.enabled&&o.count>0){
        var n=o.calcCount();
        if(n>0){
          total+=n;
          list.push(o);
        }
      }
    }
    if(total>this.countTotal){
      //this.notification();
      if(this.prefs["showNotification"]){
        if(this.notification)this.notification.cancel();
        this.notification=webkitNotifications.createHTMLNotification("notification.html");
        this.notification.show();
        if(this.prefs["autoHideNotification"]){
          var self=this;
          setTimeout(function(){
            if(self.notification)self.notification.cancel();
            delete self.notification;
          },5*1000);
        }
      }
      if(this.prefs["alertSound"])$("sound").play();
    }else if(this.countTotal>0&&total==0){
      if(this.notification){
        this.notification.cancel();
        delete this.notification;
      }
    }
    this.countTotal=total;
    localStorage["countTotal"]=this.countTotal;
//////////////////////////////////////
    setCount(total,list);

//////////////////////////////////////

//dout("all done");
  }
  this.setPopupData(hd);
}
Main.prototype.sortFunc = function(a,b) {
  var keyA=a.key?a.key:a.id;
  var keyB=b.key?b.key:b.id;
  if(keyA<keyB)return -1;
  else if(keyA==keyB){
    if(a.user<b.user)return -1;
    else if(a.user==b.user)return 0;
    else return 1;
  }else return 1;
}
Main.prototype.getHosts = function() {
  var ar=[];
  for(var i in this.scripts){
    var o={id:i};
    if(this.order[i])o.key=this.order[i].toString();
    ar.push(o);
  }
  ar.sort(this.sortFunc);
  var ar2=[];
  for(var i in ar){
    var id=ar[i].id;
    ar2.push(this.getScriptInfo(id));
  }
  return ar2;
}
Main.prototype.getScriptInfo=function(id){
  var o={};
  var scr=this.loadScript(id);
  if(!scr)return null;
  var fnd=scr.match(/([\S\s]+?)function/);
  if(fnd)scr=fnd[1];
  var re=/var\s+(\S+?)\s*=\s*(.+?)\s*[;$]/g;
  var f;
  while ((f = re.exec(scr)) != null){
    var val=f[2];
    if(val=="true")val=true;
    else if(val=="false")val=false;
    else if(val.match(/^\d+$/))val=parseInt(val);
    else val=val.replace(/^["']/,"").replace(/["']$/,"");
    o[f[1]]=val;
  }
  o.id=id;
  o.name=this.getHostName(id);
  return o;
}
Main.prototype.getHostName = function(id){
  var str=tobwithu.i18nString(id);
  if(str)return str;
  try{
    var scr=this.loadScript(id);
    var fnd=scr.match(/var\s+name\s*=\s*['"](.+?)['"]/);
    return fnd?fnd[1]:id;
  }catch(e){
dout("getHostName:"+id+" "+e);
    return id;
  }
}

Main.prototype.checkFirstrun=function(){
  var currVersion = tobwithu.getVersion();
  var prevVersion = localStorage['version'];
  if (currVersion != prevVersion) {
    this.postInstall();
    localStorage['version'] = currVersion;

    hostResolver.start(function(host){
      tobwithu.openTab(host+"/updated.php?br=cr&ver="+currVersion);
    });
  }
}
Main.prototype.postInstall=function(){
  var acc=tobwithu.loadAccounts();
  for(var i=0;i<acc.length;i++){
    if(acc[i].id=="app_forums")return;
  }
  acc.push({id:"app_forums",user:"default",password:"1"});
  tobwithu.saveAccounts(acc);
}
Main.prototype.startTimer=function(){
  var self=this;
  this.timerId=window.setInterval(function(){self.timerCall();},TIMER);
}
Main.prototype.stopTimer=function(){
  window.clearInterval(this.timerId);
}
Main.prototype.timerCall=function(){
  this.checkNow(true);
}
///////////////////////////////////////////////////////////
Main.prototype.canReuse = function(cur,viewDomain) {
  if(cur=="about:blank"||!viewDomain)return true;
  var f=cur.match(/(((\S+):\/\/([^\/]+))(\S*\/)?)([^\/]*)/);
  if(!f||!f[4])return true;
  try{
    var reg=new RegExp(viewDomain);
    if(!f[4].match(reg))return false;
  }catch(e){}
  return true;
}
Main.prototype.openCaptchaDialog=function(ind,id,user,url){
  tobwithu.openTab(tobwithu.getURL("auth.html?ind="+ind+"&id="+id+"&user="+encodeURIComponent(user)+"&url="+(url?encodeURIComponent(url):"")));
}
Main.prototype.enterAuth=function(ind,val){
  if(ind!=null){
    var hd=main.handlers[ind];
    hd.doNext(val);
  }
}

Main.prototype.loadScript = function(id) {
//if(id=="youtube")return tobwithu.loadFile(this.dir0+"/test/"+id+".js");
  if(this.userScripts[id]){
    return tobwithu.loadUserscript(id);
  }else return tobwithu.loadFile(this.dir0+id+".js");
}
////////////////////////delete//////////////////////////////
/*function log(s){
dout(s);
}
function print(a){
 switch(typeof(a)){
 case "object":
 if(a.constructor==Array){
  var str="";
  for(var i in a){
   if(str)str+=",";
   str+=print(a[i]);
  }
  return "["+str+"]";
 }else{
 var str="";
 for(var i in a){
   if(str)str+=",";
   str+=i+":"+print(a[i]);
 }
 return "{"+str+"}";
 }
 case "string":
   return "\""+a+"\"";
 default: return a;
 }
}
*/