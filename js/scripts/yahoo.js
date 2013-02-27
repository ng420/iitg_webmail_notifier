/***********************************************************
Yahoo
***********************************************************/
 var supportInboxOnly=true;
 var supportShowFolders=true;
 var supportIncludeSpam=true;

function init(){
  this.initStage=ST_PRE;
  var ar=this.user.split("@");
  if(ar[1]=="yahoo.co.jp"){
    this.loginData=["https://login.yahoo.co.jp/config/login?",
                        "","passwd","login="+encodeURIComponent(ar[0])];
    this.dataURL="http://mail.yahoo.co.jp/"
    this.viewURL="http://mail.yahoo.co.jp/";
    this.viewDomain="mail.yahoo.co.jp";
    this.domain="yahoo.co.jp";
    this.loginData[3]+="&.persistent=y";
    this.cookieDomain="yahoo.co.jp";
    this.logoutURL="http://login.yahoo.co.jp/config/login?logout=1";
  }else{
    this.loginData=["https://login.yahoo.com/config/login?",
                        "login","passwd",".ws=1&.persistent=y"];
    this.dataURL="http://mail.yahoo.com/"
    this.viewURL="http://mail.yahoo.com/";
    this.viewDomain="mail.yahoo.com";
    this.domain="yahoo.com";
    this.cookieDomain="yahoo.com";
    this.logoutURL="http://login.yahoo.com/config/login?logout=1";
  }
  this.mode=-1;
}
function checkLogin(aData){
  switch(this.stage){
  case ST_CHECK:
    if(this.cookies){
      this.stage=ST_DATA;
      this.setCookies();
      return true;
    }
    this.getHtml(this.viewURL);
    return false;
  case ST_CHECK+1:
    var fnd=aData.match(/<form.+?name="login_form"/);
    if(!fnd){
      var reg=this.domain=="yahoo.co.jp"?new RegExp("jptoppimemail>"+this.user,"i"):new RegExp("\"loginAlias\":\""+this.user+"\"","i");
      var fnd2=aData.match(reg);
      var reg2=this.domain=="yahoo.co.jp"?new RegExp("<defaultID>"+this.user+"<","i"):new RegExp("\"defaultID\":\""+this.user+"\"","i");
      var fnd3=aData.match(reg2);
      if(fnd2||fnd3){//logged in already
        this.stage=ST_DATA;
        return this.process(aData);
      }else{
        this.stage=this.initStage;
        this.getHtml(this.logoutURL);
        return true;
      }
    }else if(aData.match(/login_verify2/)){//session expired
      this.stage=ST_LOGIN;
      this.getHtml(this.logoutURL);
      return true;
    }else{
      this.stage=this.initStage;
      return this.process(aData);
    }
  }
  this.onError();
  return true;
}
function process(aData,aHttp){
if(this.debug)dlog(this.user+"\t"+this.stage,aData);
  switch(this.stage){
  case ST_PRE:
    this.stage=this.domain=="yahoo.co.jp"?ST_PRE+1:ST_LOGIN;
    this.getHtml(this.viewURL);//set cookie for login
    return true;
  case ST_PRE+1://yahoo.co.jp
    var fnd=aData.match(/\(".albatross"\)\[0\].value\s*=\s*"(\S+?)"/);
    if(fnd)this.albatross="&.albatross="+encodeURIComponent(fnd[1]);
    this.stage=ST_LOGIN;
    this.delay(4000);
    return true;
  case ST_LOGIN:
    if(this.albatross){
      this.getHtml(this.loginData[LOGIN_URL],this.loginData[LOGIN_POST]+this.albatross);
      delete this.albatross;
      return false;
    }
    break;
  case ST_LOGIN_RES:
    var fnd=aData.match(/"code"\s*:\s*"1213"/);
    if(fnd){
      this.stage=ST_LOGIN_RES+4;
      this.getHtml("https://login.yahoo.com/captcha/CaptchaWSProxyService.php?action=createlazy&initial_view=&.intl=us&.lang=en-US&rnd="+new Date().getTime());
      return true;
    }
    this.stage=ST_LOGIN_RES+1;
  case (ST_LOGIN_RES+1):
    this.getHtml(this.dataURL);
    return false;
  case (ST_LOGIN_RES+2):
    var fnd=aData.match(/href="(http:\/\/\S+?\/neo\/optOut\?rs=1\S+?once=true|http:\/\/\S+?\/neo\/launch\?reason=ignore&rs=1)/);
    if(fnd){//not supported os or browser
      this.dataURL=fnd[1];
      this.stage=ST_DATA;
      break;
    }
    this.stage=ST_DATA_RES;
    break;
  case (ST_LOGIN_RES+4)://captcha
    aData=aData.replace(/&amp;/g,"&").replace(/&quot;/g,"\"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&apos;/g,"'");
    this.post=this.getForm(aData);
    var fnd=aData.match(/id="captchaV5ClassicCaptchaImg".+?src="(\S+?)"/);
    if(this.post&&fnd){
      this.openCaptchaDialog(this.id,this.user,fnd[1]);
      return false;
    }
    break;
  case (ST_LOGIN_RES+5):
    if(aData){
      this.post=this.post+"&captchaAnswer="+encodeURIComponent(aData);
      this.stage=ST_LOGIN;
      this.getHtml(this.loginData[LOGIN_URL],this.loginData[LOGIN_POST]+"&.cp=1&"+this.post);
      delete this.post;
      return false;
    }
  }
  return this.baseProcess(aData,aHttp);
}

function getData(aData){
  var obj={};
  var ar=[];
  this.folders={};//used for direct link

  if(this.mode==-1||this.mode==2){
    fnd=aData.match(/\.folders\s*?=\s*?{([\s\S]+?)}\s*;/);
    if(fnd)this.mode=2;
    else this.mode=-1;
  }
  if(this.mode==-1||this.mode==1){
    fnd=aData.match(/<div.+?folderlist.+?>([\s\S]+?)<\/ol>/);
    if(fnd)this.mode=1;
    else this.mode=-1;
  }
  if(this.mode==2){
    if(this.includeSpam&&this.spamName==null){
      var fnd2=aData.match(/str_nav_spam:"(.+?)"/);
      if(fnd2)this.spamName=fnd2[1];
      else this.spamName="Spam--";
    }
    var num=0;
    var re=/"fid":"(.+?)".+?"name":"(.+?)".+?"unread":(\d+)/g;
    var o;
    while ((o = re.exec(fnd[1])) != null){
      if(!this.includeSpam&&o[1]=="%40B%40Bulk")continue;
      if(o[1]=="Draft")continue;
      if(o[1]=="Sent")continue;
      if(o[1]=="Trash")continue;
      var n=0
      if(o[3])n=parseInt(o[3]);
      if(this.inboxOnly){
        if(o[1]=="Inbox"||o[1]=="%40B%40Bulk")num+=n;
      }else num+=n;
      if(n>0&&o[1]!="Inbox"){
        if(o[1]=="%40B%40Bulk")ar.push(this.spamName);
        else ar.push(unescape(o[2].replace(/\\u/g,"%u")));
        ar.push(n);
      }
    }
    this.count=num;
    if(this.showFolders){
      if(ar)obj.folders=ar;
    }
    return obj;
  }else if(this.mode==1){//original mode
    fnd=fnd[1];
    if(!this.inboxOnly||this.showFolders){
    var fnd2=aData.match(/<div\s+id="customfolders">([\s\S]+?)<\/ol>/);
      if(fnd2){
        fnd+=fnd2[1];
      }
    }
    fnd=fnd.match(/<li .+?<\/a>/g);
    if(fnd){
      var s;
      var num=0;
      for(var i=0;i<fnd.length;i++){
        s=fnd[i].replace(/<wbr>/g,"");
        var t=s.match(/li\s+id=\"(.+?)\".+?<a.+?>(?:<em>)?(.+?)(?:\s\S+?(\d+)\S+)?<\/a>/);
        if(t){
          if(!this.includeSpam&&t[1]=="bulk")continue;
          if(t[1]=="draft"||t[1]=="sent"||t[1]=="receipt"||t[1]=="trash")continue;
          var n=0;
          if(t[3])n=parseInt(t[3]);
          if(this.inboxOnly){
            if(t[1]=="inbox"||t[1]=="bulk")num+=n;
          }else num+=n;
          if(n>0&&t[1]!="inbox"){
            var fid=t[1];
            if(fid.indexOf("%")==0)fid=fid.substring(1,fid.length-1);
            this.folders[t[2]]=fid;
            ar.push(t[2]);
            ar.push(n);
          }
        }
      }
      this.count=num;
      if(this.showFolders){
        if(ar)obj.folders=ar;
      }
      return obj;
    }
  }else{
    fnd=aData.match(/<ListFoldersResponse>([\s\S]+?)<\/ListFoldersResponse>/);
    if(fnd){
      fnd=fnd[1].match(/<folder.+?<\/folder>/g);
      if(fnd){
        var s;
        var num=0;
        for(var i=0;i<fnd.length;i++){
          s=fnd[i];
          s=s.match(/unread=\\?\"(\d+)\\?\".+?fid=\\?\"(.+?)\\?\".+?name=\\?\"(.+?)\\?\"/);
          if(s){
            if(s[2]=="%40B%40Bulk"||s[2]=="Draft"
              ||s[2]=="Sent"||s[2]=="Trash")continue;
            var n=0;
            if(s[1])n=parseInt(s[1]);
            if(this.inboxOnly){
              if(s[2]=="Inbox")num=n;
            }else num+=n;
            if(n>0&&s[2]!="Inbox"){
              var name=s[3];
              name=unescape(name.replace(/&#x(\w+);/g,function(){return "%u"+RegExp.$1;}));
              ar.push(name);
              ar.push(n);
            }
          }
        }
        this.count=num;
        if(this.showFolders){
          if(ar)obj.folders=ar;
        }
        return obj;
      }
    }
  }
  this.count=-1;
  return obj;
}
function getViewURL(aFolder){
  if(this.mode==1&&aFolder&&this.dataURLCopy){
    var n=this.dataURLCopy.indexOf("/",7);
    var url=this.dataURLCopy.substring(0,n)
              +"/mc/showFolder?fid="+encodeURIComponent(this.folders[aFolder]);
    return url;
  }
  return this.viewURL;
}
