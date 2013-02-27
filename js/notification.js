function onLoad(){
  document.getElementById("icon").addEventListener("click",openAll);
  document.getElementById("title").addEventListener("click",function(){window.close();});
  var main=chrome.extension.getBackgroundPage().main;
  var handlers=main.hdlTable;
  var obj=document.getElementById("accounts");
  var s="";
  var list=[];
  for(var i in handlers){
    var ar=handlers[i];
    for(var j=0;j<ar.length;j++){
      var o=ar[j];
      if(o.enabled){
        var n=o.calcCount();
        if(n>0){
          list.push(o.ind);
          s+="<tr id=\""+o.ind+"\"><td><div class=\"div1\"><div class=\"div2\"><a href=\"#\"><pre>"
                    +o.accName+"</pre></a></div></div></td><td>:&nbsp;"+n+"</td></tr>";
        }
      }
    }
  }
  obj.innerHTML=s;
  for(var i in list){
    var o=list[i];
    document.getElementById(o).addEventListener("click",function(){onClick(this.id);});
  }  
}
window.addEventListener("load",onLoad);
