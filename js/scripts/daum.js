/***********************************************************
daum(hanmail)
***********************************************************/
var hostString="";
var supportInboxOnly=true;
var supportShowFolders=true;

function init(){
  this.loginData=["https://logins.daum.net/accounts/login.do",
                      "id","pw","stln=on"];
  this.dataURL="http://mail2.daum.net/hanmailex/Top.daum";                      
  this.viewURL="http://mail.daum.net/hanmail/Index.daum";
  this.viewDomain="mail.*?.daum.net";

  this.cookieDomain="daum.net";
  
  this.logoutURL="https://logins.daum.net/accounts/logout.do";  
}

function process(aData,aHttp) {
  switch(this.stage){
  case ST_LOGIN_RES:
    this.getHtml("http://mail2.daum.net/hanmailex/Top.daum");
    return false;
  case (ST_LOGIN_RES+1):
    var fnd=aData.match(/g_folderList\s*=/);
    this.isBasic=false;
    if(!fnd){
      this.isBasic=true;
      this.dataURL="http://mail2.daum.net/hanmail/mail/TotalMailList.daum?FOLDER=%EC%A0%84%EC%B2%B4%ED%8E%B8%EC%A7%80%ED%95%A8&order=4&_top_hm=l_sort_newmail"
    }else this.dataURL="http://mail2.daum.net/hanmailex/Top.daum";
    this.stage=ST_DATA;
    break;
  }
  return this.baseProcess(aData,aHttp);
}

function getData(aData){
  var obj={}
  if(this.isBasic){
    var fnd=aData.match(/id="new_cnt">(\d+)</);
    if(fnd){
      this.count=parseInt(fnd[1]);
    }else{
      this.count=-1;
    }    
    return obj;    
  }else{
    var fnd=aData.match(/folderList:\[([\s\S]+?)\]/);
    if(fnd){
      var ar=[];    
      var num=0;
      var re=/{.+?\'name\':\"(.+?)\".+?\'newCount'\:(\d+)/g;
      var o;
      while ((o = re.exec(fnd[1])) != null){ 
        if(o[1]=="\\uBCF4\\uB0B8\\uD3B8\\uC9C0\\uD568")continue;
        if(o[1]=="\\uC784\\uC2DC\\uBCF4\\uAD00\\uD568")continue;
        if(o[1]=="\\uC2A4\\uD338\\uD3B8\\uC9C0\\uD568")continue;
        if(o[1]=="\\uD734\\uC9C0\\uD1B5")continue;
        if(o[1]==":\\uC218\\uC2E0\\uD655\\uC778:")continue;
        if(o[1]==":UNREAD:")continue;
        var n=0
        if(o[2])n=parseInt(o[2]);        
        if(this.inboxOnly){
          if(o[1]=="\\uBC1B\\uC740\\uD3B8\\uC9C0\\uD568")num=n;
        }else num+=n;
        if(n>0&&o[1]!="\\uBC1B\\uC740\\uD3B8\\uC9C0\\uD568"){
          var name=unescape(o[1].replace(/\\/g,"%"));
          ar.push(name);
          ar.push(n);
        }                
      }
      this.count=num;
      if(this.showFolders){
        if(ar)obj.folders=ar;
      }
      return obj;
    }else{
      this.count=-1;
      return obj;
    }
  }
}
function getViewURL(aFolder){
  if(!this.isBasic&&aFolder){
    return "http://mail.daum.net/hanmail/Index.daum?COMMAND=list&FOLDER="+encodeURIComponent(aFolder);
  }
  return this.viewURL;  
}