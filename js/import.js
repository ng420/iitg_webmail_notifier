var changed;
function onLoad(){
  $("btn-ok").addEventListener("click",onAccept);
  $("btn-cancel").addEventListener("click",onCancel);
  $("pwd").addEventListener("keydown",function(event){if(event.keyCode==13)onAccept();},false);  
  $("pwd").focus();
}
function onAccept(){
  parent.$("popup").style.display="none";
  parent.onImportPwd($("pwd").value);
}
function onCancel(){
  parent.$("popup").style.display="none";
}
window.addEventListener("load",onLoad);