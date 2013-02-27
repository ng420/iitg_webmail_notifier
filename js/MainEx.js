
Main.prototype.onMessage=function(event){
  var d=event.data;

  //delete later/////////////////////////////
  if(d.cmd=="convertScript"){
    tobwithu.saveUserscript(d.id,d.data);
    return;
  }
  ///////////////////////////////////////////

  var hd=main.handlers[d.ind];
//dout(hd.user+" "+d.cmd);
  switch(d.cmd){
  case "inited":
    hd.inited=true;
    var o=d.data;
    for(var i in o){
      hd[i]=o[i];
    }
    main.checkInit();
    break;
  case "getHtml":
    Handler.prototype.getHtml.apply(hd,d.data);
    break;
  case "stop":
    hd.stop();
    break;
  case "setResult":
    hd.count=d.count;
    hd.data=d.data;
    main.setResult(hd);
    break;
  case "reset":
    hd.count=d.count;
    hd.data=d.data;
    break;
  case "saveCount":
    hd.saveCount(d.data);
    break;
  case "getCookies":
    hd.getCookies(d.data);
    break;
  case "setCookies":
    hd.setCookies();
    break;
  case "removeCookies":
    hd.removeCookies();
    break;
  case "resetCookies":
    delete hd.cookies;
    break;
  case "openView":
    main.updateCount(hd);
    main.openView(d.data,hd.id,hd.user,hd.multiId,hd.viewDomain);
    break;
  case "updateTab":
    chrome.tabs.update(main.tabList[d.data].tabid,{url:d.url});
    break;
  case "updateCount":
    hd.data.desc=d.data;
    main.setResult(hd);
    break;
  case "openCaptchaDialog":
    main.openCaptchaDialog(d.ind,d.id,d.user,d.url);
    break;
  case "loadDB":
    hd.postMessage({cmd:d.cmd,data:hd.loadDB(d.id,d.user)});
    break;
  case "saveDB":
    hd.saveDB(d.id,d.user,d.data);
    break;
////////////debug////////////////
  case "dlog":
    var str=d.s1;
    var s2=""+d.s2;
    str=new Date()+"\t"+str+"\t"+(s2.replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t"))+"\r\n";
    main.log+=str;
    break;
////////////////////////////////
  }
}
Main.prototype.getView=function(url){
  var ar=chrome.extension.getViews();
  if(url.indexOf("://")==-1)url=chrome.extension.getURL(url);
  for(var i in ar){
    if(ar[i].location.href==url)return ar[i];
  }
  return null;
}
Main.prototype.openView = function(url,id,user,multiId,viewDomain){
  if(typeof url=="object"){//post
    function postHelper(url,data){
      data=atob(data);
      var form = document.createElement("form");
      form.setAttribute("method","post");
      form.setAttribute("action",url);
      var data=data.split("&");
      for(var i=0;i<data.length;i++){
        var f=document.createElement("input");
        var d=data[i].split("=");
        f.setAttribute("type","hidden");
        f.setAttribute("name",d[0]);
        f.setAttribute("value",decodeURIComponent(d[1]));
        form.appendChild(f);
      }
      document.body.appendChild(form);
      form.submit();
    }
    var s="";
    for(var i=0;i<200;i++)s+=" ";
    url="javascript:"+s+postHelper.toString().replace(/(\n|\t)/gm,'')+";postHelper(\""+url[0]+"\",\""+btoa(url[1])+"\")";
  }
  var self=this;
  if(multiId!=null)id="-"+id+multiId;
  if(this.tabList[id]){
    chrome.tabs.get(this.tabList[id].tabid,function(tab){
      if(tab&&self.canReuse(tab.url,viewDomain)){
        chrome.tabs.update(self.tabList[id].tabid, {url:url,selected: true});
      }else{
        chrome.tabs.create({url:url,selected: true},
        function(tab){
          self.tabList[id]={tabid:tab.id,user:user};
        });
      }
    });
  }else{
    chrome.tabs.create({url:url,selected: true},
    function(tab){
      self.tabList[id]={tabid:tab.id,user:user};
    });
  }
}
Main.prototype.setPopupData = function(obj){
  var popup=this.getView("popup.html");
  if(popup)popup.setData(obj);
}
Main.prototype.setLastCheck=function(){
  var popup=this.getView("popup.html");
  if(popup)popup.setLastCheck(this.lastCheck);
}
Main.prototype.setLoadingAni = function(ind){
  var ar=chrome.extension.getViews();
  var url=chrome.extension.getURL("popup.html");
  for(var i in ar){
    if(ar[i].location.href==url){
      ar[i].setLoadingAni(ind);
      break;
    }
  }
}
Main.prototype.reloadPopup = function(){
  var ar=chrome.extension.getViews();
  var url=chrome.extension.getURL("popup.html");
  for(var i in ar){
    if(ar[i].location.href==url){
      ar[i].location.reload();
      break;
    }
  }
}

Main.prototype.updateTab=function(o,tabid){
  o.postMessage({cmd:"updateTab",data:tabid});
}
Main.prototype._updateCount=function(o){
  o.postMessage({cmd:"updateCount"});
}
Main.prototype._openView=function(o){
  o.postMessage({cmd:"openView"})
}

////////////debug////////////////
Main.prototype.toggleDebug=function(){
  this.debug=!this.debug;
  for(i=0;i<this.handlers.length;++i){
    this.handlers[i].postMessage({cmd:"debug",val:this.debug}) ;
  }
}
/////////////////////////////////
