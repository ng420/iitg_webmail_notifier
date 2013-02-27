function dout(s){
	console.info(s);
  if(s.stack)console.info(s.stack);
}
function $(id){
  return document.getElementById(id);
}

var tobwithu;
if(!tobwithu)tobwithu={}
tobwithu.i18nString=function(s){
  return chrome.i18n.getMessage(s);
}
tobwithu.loadFile=function(name) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', name.indexOf("://")>=0?name:chrome.extension.getURL(name), false);
  xhr.send(null);
  return xhr.responseText;
}
tobwithu.loadJSON=function(name) {
  return JSON.parse(tobwithu.loadFile(name));
}