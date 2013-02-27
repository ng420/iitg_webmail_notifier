
function Handler(main){
  this.main=main;
}
Handler.prototype={
  count:-1,
  data:{desc:""},
  user: "",
  password: null,
  loginData:[],
  started:false,

  reset : function(){
    this.postMessage({cmd:"reset"});
  },
  check : function(){
    this.started=true;
    this.postMessage({cmd:"check"});
  },
  stop : function(){
    if(this.xhr){
      this.xhr.onreadystatechange=null;
      this.xhr.abort();
      delete this.xhr;
    }
  },

  getHtml:function(aURL,aPostData,aHeaders,aMethod){
    this.xhr = new XMLHttpRequest();
    var tmp=this;
    this.xhr.onreadystatechange=function(){
      tmp.onStateChange();
    };
    if(aPostData||aPostData==""){
      this.xhr.open(aMethod?aMethod:"POST", aURL, true);
      this.xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }else this.xhr.open(aMethod?aMethod:"GET", aURL, true);
    if(aHeaders){
      for(var t in aHeaders){
        this.xhr.setRequestHeader(t,aHeaders[t]);
      }
    }
    try{
      this.xhr.send(aPostData);
    }catch(e){
      this.doNext("");
    }
  },
  onStateChange:function(){
    if(this.xhr.readyState==4){
      this.doNext(this.xhr.responseText,this.xhr);
    }
  },
  doNext:function(aData,aHttp){
    this.iframe.contentWindow.postMessage({cmd:"doNext",data:aData},"*");
  },
  getIconURL : function(){
    return this.icon;
  },
  getIconPage : function(){
    return this.iconPage;
  },
  getDesc : function(){
    return this.data.desc;
  },
  calcCount : function() {
    var aCount=this.count;
    if(this.main.prefs["resetCounter"]){
      if(aCount>=0){
        var count=this.loadCount();
        if(aCount>=count)aCount-=count;
        else{
          this.saveCount(aCount>0?aCount:0)
          aCount=0;
        }
      }
    }
    return aCount;
  },
  loadCount:function(){
    var count=0;
    if(!this.main.counts)this.main.counts=tobwithu.loadPrefs("counts",{});
    var o1=this.main.counts;
    if(!o1[this.id])o1[this.id]={};
    var o=o1[this.id];
    if(typeof o[this.user]!="undefined")count=o[this.user];
    else{
      o[this.user]=0;
      tobwithu.savePrefs("counts",o1);
    }
    return count;
  },
  saveCount:function(n){
    if(!this.main.counts)this.main.counts=tobwithu.loadPrefs("counts",{});
    var o=this.main.counts;
    if(!o[this.id])o[this.id]={};
    o[this.id][this.user]=n;
    tobwithu.savePrefs("counts",o);
  },

  //for chrome
  getCookies:function(domain){
    var self=this;
    chrome.cookies.getAll({domain:domain},
      function(cookies){
        self.cookies=cookies;
      });
  },
  setCookies:function(){
    if(this.cookies.length==0){
      this.doNext("");
      return;
    }
    for(var i=0;i<this.cookies.length;i++){
      var ck=this.cookies[i];
      var domain=ck.domain;
      ck.url=(ck.secure?"https":"http")+"://"+ck.domain;
      if(ck.hostOnly)delete ck.domain;
      delete ck["hostOnly"];
      delete ck["session"];
      var self=this;
      chrome.cookies.set(ck,i==this.cookies.length-1?function(){
        self.doNext("");
      }:null);
    }
  },
  removeCookies:function(){
    var self=this;
    chrome.cookies.getAll({domain:this.cookieDomain},
      function(cookies){
        self._removeCookies(cookies);
      });
  },
  _removeCookies:function(cookies){
    if(cookies.length==0){
      this.doNext("");
      return;
    }
    for(var i=0;i<cookies.length;i++){
      var ck=cookies[i];
      var domain=ck.domain;
      if(domain.charAt(0)=='.')domain="www"+domain;
      var obj={};
      obj.url=(ck.secure?"https":"http")+"://"+domain+ck.path;
      obj.name=ck.name;
      var self=this;
      chrome.cookies.remove(obj,i==cookies.length-1?function(){
        self.doNext("");
      }:null);
    }
  },

  postMessage:function(data){
    this.iframe.contentWindow.postMessage(data,"*");
  }
}
Handler.prototype.baseProcess=Handler.prototype.process;