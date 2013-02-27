var tobwithu;
if(!tobwithu)tobwithu={}
tobwithu.getVersion=function(){
  var manifest=tobwithu.loadJSON("manifest.json");  
  return manifest.version;
}
tobwithu.openTab=function(url){
  //chrome.tabs.create({url:url,selected: true});
}

tobwithu.setIcon=function(url){
  chrome.browserAction.setIcon({path:url});
}
tobwithu.setBadgeText=function(s){
  //chrome.browserAction.setBadgeBackgroundColor({color:"#da0018"});
  chrome.browserAction.setBadgeText({text:s});   
}
tobwithu.setTitle=function(s){
  chrome.browserAction.setTitle({title:s});
}

tobwithu.initToolbarUI=function(icon,title){
  chrome.browserAction.setIcon({path:icon});
  chrome.browserAction.setTitle({title:title});
}
tobwithu.getTabs=function(func){
  chrome.tabs.query({}, function (tabs) {
    func(tabs);
  });
}
tobwithu.getURL=function(u){
  return chrome.extension.getURL(u);
}
