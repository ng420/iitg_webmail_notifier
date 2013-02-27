function getMain(){
  return chrome.extension.getBackgroundPage().main;
}
function onClick(ind,event){
  window_close();
  if(event){
    if(event.button==0&&event.shiftKey||event.button==1){
      getMain().onClickAccount(ind,true);
      return;
    }
  }
  getMain().onClickAccount(ind);
}
function checkNow(){
  window_close();
  getMain().checkNow();
}
function openAll(){
  window_close();
  getMain().openViews();
}
function openOptions(){
  var url=chrome.extension.getURL("options.html");
  chrome.tabs.query({}, function (tabs) {
    for(var i in tabs){
      var tab=tabs[i];
      if(tab.url==url){
        chrome.tabs.update(tab.id, {selected: true});
        return;
      }
    }
    chrome.tabs.create({url: "options.html",selected: true});
  });
}
function openHelp(){
  window_close();
  if(event.ctrlKey&&event.shiftKey){
    getMain().toggleDebug();
    return;
  }
  chrome.tabs.create({url: "about.html",selected: true});
}
function window_close(){
  window.close();
}

function restart(){
  chrome.extension.getBackgroundPage().init();
  document.location.reload();
}


