function dout(s) {
	console.info(s);
}

var tmp=new Handler();
for(var i in tmp)this[i]=tmp[i];
delete tmp;

var sandbox={
  init:function(){
    sandbox.ind=window.location.search.match(/id=(\d+)/)[1];
  },
  onMessage:function (event){
    var cmd = event.data.cmd;
    switch(cmd){
    case "init":
      sandbox.main=event.source;
      sandbox.origin=event.origin;
      var acc=event.data.acc;
      for(var i in acc){
        this[i]=acc[i];
      }
      var d=event.data.scr;
      var script=document.createElement("script");
      script.text=d;//loaded synchronously
      document.body.appendChild(script);

      var obj=this;
      if(obj.needServer)obj.server=obj.user.split("|")[1];
      if(obj.init)obj.init();
      if(obj.loginData){
        var post=(obj.loginData[LOGIN_DATA]?obj.loginData[LOGIN_DATA]:"");
        if(obj.loginData[LOGIN_ID]){
          if(post)post+="&";
          var user;
          if(obj.needServer)user=obj.user.split("|")[0];
          else user=obj.user;
          post+=obj.loginData[LOGIN_ID]+"="+encodeURIComponent(user);
        }
        if(obj.loginData[LOGIN_PW]){
          if(post)post+="&";
          post+=obj.loginData[LOGIN_PW]+"="+encodeURIComponent(obj.password);
        }
        obj.loginData.splice(1,obj.loginData.length-1);
        obj.loginData[LOGIN_POST]=post;
      }
      obj.stage=(obj.checkLogin?ST_CHECK:obj.initStage);

      sandbox.postMessage(
        {cmd:"inited",data:{
          icon:obj.getIconURL(),
          iconPage:obj.getIconPage(),
          viewDomain:obj.viewDomain,
          cookieDomain:obj.cookieDomain,
          logoutURL:obj.logoutURL,
          noCounterReset:obj.noCounterReset,
          supportMulti:obj.supportMulti}});
      break;
    case "check":
      check();
      break;
    case "doNext":
      doNext(event.data.data);
      break;
    case "multiId":
      this.multiId=event.data.data;
      break;
    case "openView":
      sandbox.postMessage({cmd:"openView",data:this.getViewURL()});
      break;
    case "updateTab":
      sandbox.postMessage({cmd:"updateTab",data:event.data.data,url:this.getViewURL()});
      break;
    case "reset":
      reset();
      break;
    case "updateCount":
      this.savedCount=this.count>0?this.count:0;
      sandbox.postMessage({cmd:cmd,data:this.getDesc()});
      break;

    case "loadDB":
      this.localDB=event.data.data;
      break;
////////////debug////////////////
    case "debug":
      this.debug=event.data.val;
      break;
////////////////////////////////
    }
  },
  postMessage:function(msg){
    msg.ind=sandbox.ind;
    sandbox.main.postMessage(msg,sandbox.origin);
  }
}
window.addEventListener("load",sandbox.init);
window.addEventListener('message',sandbox.onMessage);