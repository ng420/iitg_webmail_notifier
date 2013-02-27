var sHelper={
  getUID:function(){
    var userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    }).toUpperCase();
    return btoa(userId).substr(0,22);
  }
}
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.msg == "enabled"){
      var uid=localStorage['sfid'];
      if(!uid){
        uid=sHelper.getUID();
        localStorage['sfid']=uid;
      }
      sendResponse({enabled:localStorage['SHOP_HELPER']!="false",uid:uid});
    }
  });
