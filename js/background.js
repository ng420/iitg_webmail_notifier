var hostResolver={
  hosts:["http://xnotifier.tobwithu.com",
    "http://tobwithu96.cafe24.com/xnotifier"],
  index:0,
  hostSet:false,
  fnc:null,
  start:function(f){
    if(this.hostSet){
      if(f)f(this.hosts[this.index],"cr",tobwithu.getVersion());
      return;
    }
    this.fnc=f;
    var xhr = new XMLHttpRequest();
    var self=this;
    xhr.onreadystatechange=function(){
      if(this.readyState==4)self.onLoad(this);
    };
    xhr.open("GET", this.hosts[this.index]+"/alive.php", true);
    xhr.send();
  },
  onLoad:function(xhr){
    if(xhr.responseText!="alive"){
      ++this.index;
      if(this.index==this.hosts.length-1)this.hostSet=true;
    }else this.hostSet=true;
    this.start(this.fnc);
  }
}

var main;
var icons=["icon_no_msg.png","icon.png"];
function init(){
  tobwithu.initToolbarUI(icons[0],tobwithu.i18nString("app_name"));
  if(!main)main=new Main();
  main.init();

  window.addEventListener('message',main.onMessage);
}
window.addEventListener("load",init);
