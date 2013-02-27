var changed;
function onLoad(){
  $("pwd").addEventListener("input",checkPwd);
  $("pwd2").addEventListener("input",checkPwd);
  $("btn-ok").addEventListener("click",onAccept);
  $("btn-cancel").addEventListener("click",onCancel);
  $("pwd").addEventListener("keydown",function(event){if(event.keyCode==13)$("pwd2").focus();},false);
  $("pwd2").addEventListener("keydown",function(event){if(event.keyCode==13)onAccept();},false);
  $("pwd").focus();
}
function checkPwd(){
  var p1=$("pwd").value;
  var p2=$("pwd2").value;
  var disabled=p1==""||p1!=p2;
  $("btn-ok").disabled=disabled;
}
function onAccept(){
  parent.$("popup").style.display="none";
  parent.onExportPwd($("pwd").value);
}
function onCancel(){
  parent.$("popup").style.display="none";
}
window.addEventListener("load",onLoad);