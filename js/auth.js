var hdInd;
function init(ind,id,user,url){
  hdInd=ind;
  if(!url){
    $("lb1").style.display="none";
    $("lb2").style.display="inline";
    $("img").style.display="none";
  }else $("img").src=url;
  $("host").innerText+=" : "+id;
  $("username").innerText+=" : "+user;

  $("btn-ok").addEventListener("click",onAccept);
  $("val").focus();
}
function onAccept(){
  chrome.extension.getBackgroundPage().main.enterAuth(hdInd,$("val").value);
  window.close();
}
function getParam(s){
  var re=/=(.+?)(&|$)/g;
  var ar=[];
  var o;
  while((o=re.exec(s))!=null){
    ar.push(decodeURIComponent(o[1]));
  }
  return ar;
}
function load(){
  $("val").addEventListener("keydown",function(event){if(event.keyCode==13)onAccept();},false);
  var p=getParam(window.location.search);
  init.apply(this,p);
}
window.addEventListener("load",load,false);
