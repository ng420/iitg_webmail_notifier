/***********************************************************
XN-forums
  @require lib-update.js
***********************************************************/
var name="XN-forums";
var defaultInterval=120;

function init(){
  initUpdateHandler(this);
  if(this.user=="default"){
    this.noCookie=true;
  }else{
    this.initStage=ST_LOGIN;
    this.loginData=["http://xnotifier.tobwithu.com/wp/wp-login.php","log","pwd","wp-submit=Log+In&redirect_to=%2Fwp%2Fforums&testcookie=1"];
    //this.logoutURL="http://webmailnotifier.mozdev.org/drupal/logout";
  }

  this.dataURL="http://xnotifier.tobwithu.com/wp/forums/forum/cr";
  this.viewURL="http://xnotifier.tobwithu.com/wp/"+(this.user=="default"?"forums/forum/cr":"topics");
  this.viewDomain="xnotifier.tobwithu.com";
  this.start="class=\"bbp-body\">";
  this.end="class=\"bbp-footer\">";
}
function findString(aData){
  if(this.user!="default"){
    var fnd=aData.match(/wp-login.php?redirect_to/);
    if(fnd)return null;
  }
  var reg=new RegExp(this.start+"([\\s\\S]+?)"+this.end);
  var fnd=aData.match(reg);
  if(fnd){
    fnd=fnd[1].replace(/<li class=\"bbp-topic-freshness\">[\s\S]+?<\/li>/g,"");
    fnd=fnd.replace(/<p class=\"bbp-topic-meta\">[\s\S]+?<\/p>/g,"");
    return fnd;
  }
  return null;
}
