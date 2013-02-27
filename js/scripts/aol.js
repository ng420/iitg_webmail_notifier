/***********************************************************
AOL
***********************************************************/
var supportInboxOnly=true;
var needServer=true;

function init(){
  this.initStage=ST_PRE;
  this.loginData=["https://my.screenname.aol.com/_cqr/login/login.psp"];
  this.dataURL="http://mail.aol.com/Lite/MsgList.aspx?showUserFolders=True";
  this.viewURL="http://mail.aol.com/";
  this.viewDomain="mail.aol.com";
  if(this.server){
    var ar=this.server.split("-");
    if(ar.length==2){
      this.lang=ar[0];
      this.locale=ar[1];
    }else{
      this.lang=this.server;
      this.locale=this.server;
    }
  }else{
    this.lang="en";
    this.locale="us";
  }
  this.logoutURL="http://my.screenname.aol.com/_cqr/logout/mcLogout.psp";  
  this.cookieDomain="aol.com";  
}
function getCount(aData){
  var fnd=aData.match(/id="InboxCount">(<span>(\d+))?<\/span>/);
  if(fnd){
    var num=fnd[2]?parseInt(fnd[2]):0;
    if(this.inboxOnly)return num;
    var re=/<div class=\"navItem userFolder.+?<\/div>.+?(?:\((\d+)\))?<\/a><\/div>/g;
    var o;
    while ((o = re.exec(aData)) != null){
      if(o[1])num+=parseInt(o[1]);
    }
    return num;
  }else return -1;
}
function process(aData,aHttp) {
  switch(this.stage){
  case ST_PRE:
    this.getHtml("http://my.screenname.aol.com/_cqr/login/login.psp?sitedomain=sns.webmail.aol.com&lang="+this.lang+"&locale="+this.locale);
    return false;
  case ST_PRE_RES:
    var reg=new RegExp("<form.+name\\s*=\\s*[\"\']AOLLoginForm[\"\']([\\S\\s]+?)<script");
    var s=aData.match(reg);
    if(s){
      this.loginData[LOGIN_DATA]=this.getForm(s[1]);
    }
    this.stage=ST_LOGIN;
  case ST_LOGIN:
    var user=this.user.split("|")[0];
    var ar=user.split("@");
    if(ar[1]=="aol.com" || ar[1] =="aim.com" || ar[1]=="netscape.net" || ar[1] =="aol.fr" || ar[1] =="aol.de" || ar[1] =="cs.com" || ar[1]=="aol.co.uk") {
      user=ar[0];
    }
    this.loginData[LOGIN_POST]="loginId="+encodeURIComponent(user)
                                +"&password="+encodeURIComponent(this.password);
    this.getHtml(this.loginData[LOGIN_URL],this.loginData[LOGIN_POST]+"&"+this.loginData[LOGIN_DATA]);
    return false;
  case ST_LOGIN_RES:
    var fnd=aData.match(/gSuccessURL\s+=\s+"(\S+?)"/);
    if(fnd){
      this.viewURL="http://mail.aol.com"+fnd[1];
      this.getHtml("http://mail.aol.com/Lite/MsgList.aspx?showUserFolders=True");
      return false;
    }
    break;
  case ST_LOGIN_RES+1:
    var fnd=aData.match(/gSuccessURL\s+=\s+"(\S+?)"[\s\S]+?gErrorURL\s*=\s*"(http:\/\/\S+?)\//);
    if(fnd){//for compuserve
      this.dataURL=fnd[2]+fnd[1];
      this.stage=ST_DATA;
    }else this.stage=ST_DATA_RES;
    break;
  }
  return this.baseProcess(aData,aHttp);
}
