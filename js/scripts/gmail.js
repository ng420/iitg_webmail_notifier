/***********************************************************
Gmail
***********************************************************/
var supportInboxOnly=true;
var supportShowFolders=true;
var supportIncludeSpam=true;
var supportMulti=true;

function init(){
  this.initStage=ST_PRE;
  this.loginData=["https://accounts.google.com/ServiceLoginAuth?service=mail",
                    "Email","Passwd","PersistentCookie=yes"];
  this.baseURL="https://mail.google.com/mail/";
  this.viewDomain="(mail|accounts).google.com";
  this.dataURL=this.baseURL;
  this.viewURL=this.baseURL;

  this.logoutURL="https://mail.google.com/mail/?logout";
}
function getIconURL(){
  return "http://mail.google.com/favicon.ico";
}
function getURL(url,n){
  if(n==null)return url;
  else return url.replace(/(\?\S+)?$/,"u/"+n+"/$1");
}
function checkLogin(aData){
  switch(this.stage){
  case ST_CHECK:
    if(this.multiId==0)this.viewURL=this.baseURL;
    else this.viewURL=this.getURL(this.baseURL,this.multiId);
    this.getHtml(this.viewURL);
    return false;
  case ST_CHECK+1:
    var fnd=aData.match(/<form[\S\s]+?id="gaia_loginform"/);
    if(!fnd){//logged in
      var rs=this.isLoggedIn(aData);
      if(rs==1){
        this.stage=ST_LOGIN_RES+1;
        return this.process(aData);
      }else if(rs==0){//switch account;
        this.stage=ST_LOGIN_RES+1;
        this.getHtml(this.viewURL);
        return true;
      }else if(this.multiId==0){
        this.stage=ST_PRE;
        this.getHtml(this.logoutURL);
        return true;
      }else{
        this.stage=ST_PRE_RES;
        this.getHtml("https://accounts.google.com/AddSession?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F");
        return true;
      }
    }
    fnd=aData.match(/<input[^>]+?"Email"\s+value="(\S+?)"/);
    if(fnd){
      var user=this.user.indexOf("@")==-1?this.user+"@\\S+?":this.user;
      user=user.replace(/@googlemail.com/,"@(?:g|google)mail.com");
      if(!fnd[1].match(new RegExp(user,"i"))){
        this.stage=ST_PRE;
        this.getHtml(this.logoutURL);
        return true;
      }
    }
    this.stage=ST_PRE_RES;
    return this.process(aData);
  }
}
function isLoggedIn(aData,brief){
  var user=this.user.indexOf("@")==-1?this.user+"@\\S+?":this.user;
  user=user.replace(/@googlemail.com/,"@(?:g|google)mail.com");
  var isCurrent=true;
  var reg=new RegExp("\"\\/mail(?:\\/u\\/(\\d+))?\",\\S+?,\"(\\S+?)\",\""+user+"\"","i");
  var fnd=aData.match(reg);
  if(!fnd){
    if(brief&&this.UI==2)return 0;//mla is off
    isCurrent=false;
    reg=new RegExp("\""+user+"\",\\d+,\\d+,(\\d+)","i");
    fnd=aData.match(reg);
  }
  if(fnd){
    if(fnd[1]){
      this.mid=fnd[1];
      if(this.multiId==0&&this.mid!=0)return -2;
    }
    this.viewURL=this.getURL(this.baseURL,this.mid);
    if(isCurrent){
      this.dataURL=this.viewURL+"?ui=2&ik="+fnd[2]+"&view=tl&start=0&num=25&rt=c&as_has=is%3Aunread&as_subset="+(this.inboxOnly?"inbox":"all")+"&search=adv";
      var fnd3=aData.match(/"sx_iosc","(\S+?)"/);
      if(fnd3&&(fnd3[1]=="^u|"||fnd3[1]=="^t|"))this.useInboxCount=true;
      var fnd4=aData.match(/"ix_ioiut","(\S+?)"/);
      if(fnd4&&fnd4[1]=="1")this.useInboxCount=true;
      this.UI=2;
      return 1;
    }else return 0;
  }
  //basic HTML
  fnd=aData.match(/<base\s+href="(https:\/\/mail.google.com\/mail(?:\/u\/(\d+))?\/h\S+?)"/);
  reg=new RegExp("id=(?:gbf|gbgs4dn).+?>"+user+"<","i");
  var fnd2=aData.match(reg);
  if(fnd&&fnd2){
    if(fnd[2]){
      this.mid=fnd[2];
      if(this.multiId==0&&this.mid!=0)return -2;
    }
    this.viewURL=fnd[1];
    this.dataURL=fnd[1]+"?s=q&q=is%3Aunread"+(this.inboxOnly?"+in%3Ainbox":"");
    this.UI=0;
    return 1;
  }
  return -1;
}
function process(aData,aHttp) {
//dout(this.ind+" "+this.user+" "+this.stage);
if(this.debug)dlog(this.user+"\t"+this.stage,aData);
  switch(this.stage){
  case ST_PRE:
    this.getHtml(this.baseURL);
    return false;
  case ST_PRE_RES:
    var form=this.getForm(aData,"gaia_loginform",true);
    if(form){
      if(form[0].match(/^AccountChooser/)){
        var user=this.user.indexOf("@")==-1?this.user+"@gmail.com":this.user;
        this.stage=ST_CHECK+1;
        this.getHtml("https://accounts.google.com/"+form[0],"Email="+encodeURIComponent(user)+"&"+form[1]);
        return true;
      }
      this.stage=ST_LOGIN;
      form[1]=form[1].replace(/Email=\S+&/,"");//reauth
      this.getHtml(form[0],this.loginData[LOGIN_POST]+"&"+form[1]);
      return false;
    }
    break;
  case ST_LOGIN_RES:
    var form=this.getForm(aData,"verify-form",true);
    if(form){//2-step verification
      this.form=form;
      this.stage=ST_LOGIN_RES+3;
      this.openCaptchaDialog(this.id,this.user,null);
      return true;
    }
    ++this.stage;
  case ST_LOGIN_RES+1:
    var fnd=aData.match(/action="AccountChooserTrainer"/);
    if(fnd){
      this.getHtml(this.viewURL);
      return false;
    }
    ++this.stage;
  case ST_LOGIN_RES+2:
    if(this.isLoggedIn(aData)==1)this.stage=ST_DATA;
    break;
  case (ST_LOGIN_RES+3)://2-step verification
    if(aData){
      this.getHtml(this.form[0],this.form[1]+"&smsUserPin="+encodeURIComponent(aData)+"&PersistentCookie=yes");
      delete this.form;
      return false;
    }
    break;
  case (ST_LOGIN_RES+4)://2-step verification
    var form=this.getForm(aData,"hiddenpost",true);
    if(form){
      this.stage=ST_LOGIN_RES;
      this.getHtml(form[0],form[1]);
      return true;
    }
    break;
  //case ST_LOGIN_RES+6: //error
  }
  return this.baseProcess(aData,aHttp);
}
function getCount(aData){
  if(this.multiId==0&&this.isLoggedIn(aData,true)<0)return -1;
  var fnd;
  if(this.UI==2){
    if(this.inboxOnly)fnd=aData.match(this.useInboxCount?/"ld",\[[\S\s]*?\["\^i",(\d+)/:/"ld",\[\["\^ig?",(\d+)/);
    else fnd=aData.match(/\["ti",.+?,(\d+)/);
    if(fnd){
      if(this.includeSpam){
        var fnd2=aData.match(/"ld",\[\[[\S\s]+?"\^s",(\d+)/);
        if(fnd2){
          var spam=parseInt(fnd2[1]);
          if(spam>0){
            this.spam=spam;
            return parseInt(fnd[1])+this.spam;
          }
        }
      }
      return fnd[1];
    }else return -1;
  }else{
    var spam=0;
    if(this.includeSpam){
      fnd=aData.match(/<a href="\?s=m"\s*\S+?\((\d+)\)/);
      if(fnd){
        spam=parseInt(fnd[1]);
        if(spam>0)this.spam=spam;
      }
    }
    if(this.inboxOnly){
      fnd=aData.match(/<\/h2>\s*<tr>\s*<td[\s\S]+?<a[\s\S]+?>.+?(?:&nbsp;\s*\(\s*(\d+)\s*\))?\s*</);
      return fnd?((fnd[1]?parseInt(fnd[1]):0)+spam):-1;
    }else{
      fnd=aData.match(/nvp_bbu_go[\s\S]+?<\/td>([\s\S]+?)<\/table>/);
      if(fnd){
        var n=0;
        var fnd2=fnd[1].match(/<b>(\S+)<\/b>(.+?)<b>(\d+)<\/b>(.+?)<b>(\S+)<\/b>/);
        if(fnd2){
          if(fnd2[2].indexOf("-")!=-1)n=isNaN(parseInt(fnd2[5]))?200:fnd2[5];
          else if(fnd2[4].indexOf("-")!=-1)n=isNaN(parseInt(fnd2[1]))?200:fnd2[1];
        }
        return parseInt(n)+spam;
      }else return -1;
    }
  }
}
function getViewURL(aFolder){
  if(aFolder){
    if(aFolder=="Spam"){
      if(this.UI==2)return this.viewURL+"#spam";
      else return this.viewURL+"?s=m";
    }
    if(this.UI==2)return this.viewURL+"#label/"+encodeURIComponent(aFolder);
    else return this.viewURL+"?s=l&l="+encodeURIComponent(aFolder);
  }
  return this.viewURL;
}
function getData(aData){
  var obj={};
  if(!this.showFolders)return obj;
  var ar=[];
  var fnd;
  if(this.UI==2){
    fnd=aData.match(/\["ld"\s*,\s*\[(?:,?\[.+?\]\n)+\]\n,\[((?:,?\[.+?\]\n)+)\]\n/);
    if(fnd){
      var re=/\[\"(.+)\"\s*,\s*(\d+)/g;
      var o;
      while ((o = re.exec(fnd[1])) != null){
        if(parseInt(o[2])>0){
          ar.push(o[1]);
          ar.push(o[2]);
        }
      }
    }
  }else{
    fnd=aData.match(/<td class="?lb"?>([\s\S]+?)<a class="ml"/);
    if(fnd){
      var re=/<a href="(\S+?)">\s*<font[\s\S]+?>(.+?)(?:&nbsp;\s*\(\s*(\d+)\s*\))?\s*</g;
      var o;
      while ((o = re.exec(fnd[1])) != null){
        if(parseInt(o[3])>0){
          ar.push(o[2]);
          ar.push(o[3]);
        }
      }
    }
  }
  if(this.spam!=null){
    ar.push("Spam");
    ar.push(this.spam);
    delete this.spam;
  }
  if(ar)obj.folders=ar;
  return obj;
}
