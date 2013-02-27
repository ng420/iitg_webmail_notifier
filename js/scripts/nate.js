/***********************************************************
nate
***********************************************************/
var hostString="nate.com";
var supportInboxOnly=true;
var supportShowFolders=true;

function init(){
  this.initStage=ST_PRE;
  this.dataURL="http://mail.nate.com";
  this.viewURL="http://mail.nate.com/";
  this.viewDomain="mail.+?.nate.com";
  var ar=this.user.split("@");
  this.loginData=["https://xo.nate.com/LoginAuth.sk",
                      "","PASSWD",
                      "ID="+encodeURIComponent(ar[1]=="nate.com"?ar[0]:this.user)+"&domain="+encodeURIComponent(ar[1])];

  this.cookieDomain="nate.com";

  this.logoutURL="http://xo.nate.com/commonLogout.jsp";  
}
function getIconURL(){
  return "http://www.nate.com/favicon.ico";
}
function process(aData,aHttp) {
  switch(this.stage){
  case ST_PRE:
    this.getHtml("http://home.mail.nate.com/login/secure/nate/js/xecure_nate.js?v=20110224");
    return false;
  case ST_PRE_RES:
    var fnd=aData.match(/evalue\s*:\s*'(\S+?)'[\s\S]+?nvalue\s*:\s*'(\S+?)'/);
    if(fnd){
      var rsa = new RSAKey();        
	    rsa.setPublic(fnd[1],fnd[2]);
      var ar=this.user.split("@");
	    var fullData = this.getFullToday()+'|^|'+ar[0]+'|^|'+this.password;
	    var res = rsa.encrypt(fullData);
      res=hex2b64(res);
      this.stage=ST_LOGIN_RES;
      this.getHtml(this.loginData[LOGIN_URL],this.loginData[LOGIN_POST]+"&PASSWD_RSA="+encodeURIComponent(res));
      return true;
    }
    break;
  case ST_LOGIN_RES:
    this.getHtml("https://xo.nate.com/cysso/cysso.jsp?from=na&type=oneid&r_url=http%3A%2F%2Fwww.nate.com");
    return false;
  case ST_LOGIN_RES+1:
    var fnd=aData.match(/URL=(\S+?)"/);
    if(fnd){
      this.getHtml(fnd[1]);
      return false;
    }
    this.stage=ST_LOGIN_RES+4;
  case ST_LOGIN_RES+2:
    if(this.stage==ST_LOGIN_RES+2){
      var fnd=aData.match(/URL=(\S+?)"/);
      if(fnd){
        this.getHtml(fnd[1]);
        return false;
      }
    }
    this.stage=ST_LOGIN_RES+4;
  case ST_LOGIN_RES+3:
    if(this.stage==ST_LOGIN_RES+3){
      var fnd=aData.match(/replace\('(\S+?)'/);      
      if(fnd){
        this.getHtml(fnd[1]);
        return false;
      }
    }
    this.stage=ST_LOGIN_RES+4;
  case ST_LOGIN_RES+4:
    this.getHtml("http://mail.nate.com");
    return false;
  case (ST_LOGIN_RES+5):
    var fnd=aData.match(/fo.action="(\S+?)"/);
    if(fnd){
      this.getHtml(fnd[1]);
      return false;
    }
  case ST_LOGIN_RES+6:
    var fnd=aData.match(/<frame src=\"(\S+?)\".+?name=\"h\"/);
    if(fnd)this.dataURL="http://mail3.nate.com"+fnd[1];
    this.stage=ST_DATA;
    break;
  }
  return this.baseProcess(aData,aHttp);
}
function getData(aData){
  var obj={}
  var num=0;
  var found=false;
  if(this.inboxOnly){
    var fnd=aData.match(/mc.unseen={inbox:(\d+)/);
    if(fnd){
      found=true;
      num=parseInt(fnd[1]);
    }
  }else{
    var fnd=aData.match(/mc.unseen={(inbox:.+?)}/);
    if(fnd){
      found=true;
      fnd=fnd[1].match(/:\d+/g);
      for(var i=0;i<fnd.length;i++){
        num+=parseInt(fnd[i].substring(1));
      }
    }
  }
  if(found){
    var fnd=aData.match(/mbx.addUserMboxes\(\[(\S+?)\]\);/);
    if(fnd){
      var ar=[];
      var re=/\[.*?,.*?,"(.+?)",.*?(\d+),\d+\]/g;
      var o;
      while ((o = re.exec(fnd[1])) != null){
        var n=parseInt(o[2]);
        if(!this.inboxOnly)num+=n;
        if(n>0){
          ar.push(o[1]);
          ar.push(o[2]);
        }
      }
    }
    this.count=num;
    if(this.showFolders){
      if(ar)obj.folders=ar;
    }
    return obj;
  }
  this.count=-1;
  return obj;
}
function getFullToday(){
  var today = new Date();
  var buf = "";
  buf += today.getYear() + "y";
  buf += (today.getMonth() + 1) + "m";
  buf += today.getDate() + "d ";
  buf += today.getHours() + "h";
  buf += today.getMinutes() + "m";
  buf += today.getSeconds() + "s";
  return buf;
}