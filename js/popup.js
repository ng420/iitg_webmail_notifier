function adjustSize(){
  var em=document.body;
  if(em.clientHeight<em.scrollHeight){
    var em2=$("accounts");
    em2.style.height=(em2.clientHeight-em.scrollHeight+em.clientHeight)+"px";
    //em.style.width=(em.offsetWidth+em2.offsetWidth-em2.clientWidth)+"px";
  }
}
function onLoad(){
  var main=chrome.extension.getBackgroundPage().main;
////////////debug////////////////
  if(main.debug){
    function saveLog(){
      var l=document.createElement("a");
      l.href="data:text/plain;charset=UTF-8,"+encodeURIComponent(main.log);
      l.download="xn-chrome.log";
      l.click();
    }
    $("log").style.display="inherit";
    $("log").addEventListener("click",saveLog);
  }


////////////////////////////////

  $("chk").addEventListener("click",checkNow);
  $("open").addEventListener("click",openAll);
  $("options").addEventListener("click",openOptions);
  $("help").addEventListener("click",openHelp);

  if(main.lastCheck)setLastCheck(main.lastCheck);
  var handlers=main.handlers;
  var obj=$("accounts");
  for(var i in handlers){
    var o=handlers[i];
    if(o.enabled){
      var n=o.calcCount();
      var em=document.createElement("div");
        em.setAttribute("id",o.ind);
        em.addEventListener("click",function(){
          onClick(this.id,event);
        });

          var em2=document.createElement("div");
          em2.setAttribute("id","i"+o.ind);
          em2.setAttribute("class","icon");
        em.appendChild(em2);

          var em2=document.createElement("pre");
          var em3=document.createTextNode(o.accName);
          em2.appendChild(em3);
        em.appendChild(em2);

        var em2=document.createElement("div");
          em2.setAttribute("id","n"+o.ind);
          em2.setAttribute("class","num");
          var em3=document.createTextNode(n>0?o.getDesc():"");
          em2.appendChild(em3);
        em.appendChild(em2);

      obj.appendChild(em);
      setData(o);
    }
  }
  window.setTimeout(adjustSize,10);
}
function setLastCheck(d){
  function getS(s){
    if(s.toString().length<2)return "0"+s;
    else return s;
  }
  var ds=getS(d.getHours())+":"+getS(d.getMinutes())
         +":"+getS(d.getSeconds())
  var em=$("chk");
  var att = em.getAttribute('i18n-title');
  var s=tobwithu.i18nString(att);
  if(s)em.setAttribute("title",s+" "+ds);
}
function setData(o){
  if(!loaded)return;
  var em=$(o.ind);
  var n=o.calcCount();
  em.setAttribute("class","menu"
    +(n>0?" newMsg":"")+(!o.active?" inactive":(n<0?" error":"")));
  em=$("n"+o.ind);
  em.innerText=n>=0?o.getDesc():"";
  em=$("i"+o.ind);
  if(o.started){
    em.style.backgroundImage="url('loading.gif')";
  }else{
    var url=o.getIconPage();
    if(url!=null)url="chrome://favicon/"+url;
    else url=o.getIconURL();
    if(n>=0&&url!=null){
      em.style.backgroundImage="url("+url+")";
    }else em.style.backgroundImage="none";
  }
  if(o.data.folders){
    var str=o.accName+(o.count>=0&&o.data.desc?" : "+o.data.desc:"");
    var ar=o.data.folders;
    for(var i=0;i<ar.length;i+=2){
      str+="\n - "+ar[i]+" : "+ar[i+1];
    }
    em=$(o.ind).setAttribute("title",str);
  }
}
function setLoadingAni(ind){
  if(!loaded)return;
  var em=$("i"+ind);
  em.style.backgroundImage="url('loading.gif')";
}
var loaded=false;
var now=new Date().getTime();
var prevClick=chrome.extension.getBackgroundPage().prevClick;
chrome.extension.getBackgroundPage().prevClick=now;
if(prevClick&&now-prevClick<500){
  loaded=false;
  window.close();
  checkNow();
}else{
  loaded=true;
  window.addEventListener("load",onLoad);
}