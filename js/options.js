var hosts;
var arAccounts;
var arDefault;
var arDeleted;
var keyNum;
var selected=-1;
var current;
var prefs;
var importStr;
var tempAccPref;
function onLoad(){
  $("hosts").addEventListener("change",function(){checkIsNew();customizeView();});
  $("btn-scripts").addEventListener("click",onScripts);
  $("inbox-only").addEventListener("click",function(){setValue('inboxOnly',this.checked);});
  $("include-spam").addEventListener("click",function(){setValue('includeSpam',this.checked);});
  $("auto-open").addEventListener("click",function(){setValue('autoOpen',this.checked);});
  $("btn-add").addEventListener("click",onAdd);
  $("btn-delete").addEventListener("click",onDelete);
  $("btn-up").addEventListener("click",function(){onMove(-1);});
  $("btn-down").addEventListener("click",function(){onMove(1);});
  $("resetCounter").addEventListener("click",function(){setPref(this.id,this.checked);});
  $("showNotification").addEventListener("click",function(){setPref(this.id,this.checked);toggleCheckbox($("autoHideNotification"),this.checked);});
  $("autoHideNotification").addEventListener("click",function(){setPref(this.id,this.checked);});
  $("alertSound").addEventListener("click",function(){setPref(this.id,this.checked);toggleCustomSound(this.checked);});
  $("btn-import").addEventListener("click",function(){onImport();});
  $("btn-export").addEventListener("click",function(){onExport();});
  $("importFile").addEventListener("change",function(){onImportSelect(this.files[0]);});
  $("soundFile").addEventListener("change",function(){onSoundSelect(this.files[0]);});
  $("btn-choose").addEventListener("click",function(){onChoose();});
  $("btn-save").addEventListener("click",function(){onSave();});
  $("username").addEventListener("input",checkIsNew);
  $("server").addEventListener("input",checkIsNew);
  $("password").addEventListener("input",function(){setValue(this.id,this.value);});
  $("alias").addEventListener("input",function(){setValue(this.id,this.value);});
  $("interval").addEventListener("input",function(){setValue(this.id,this.value);});
  $("soundUrl").addEventListener("input",function(){setPref(this.id,this.value);});
  $("updateInterval").addEventListener("input",function(){setUpdateInterval(this.value);});
  $("accounts").addEventListener("keydown",function(event){if(event.keyCode==46)onDelete();});
  keyNum=0;
  arDeleted=[];
  prefs=tobwithu.loadPrefs("prefs",DEF_PREF);
  $("resetCounter").checked=prefs["resetCounter"];
  $("updateInterval").value=prefs["updateInterval"];
  $("showNotification").checked=prefs["showNotification"];
  $("autoHideNotification").checked=prefs["autoHideNotification"];
  $("alertSound").checked=prefs["alertSound"];
  $("soundUrl").value=prefs["soundUrl"];
  toggleCheckbox($("autoHideNotification"),prefs["showNotification"]);
  toggleCustomSound(prefs["alertSound"]);
  var em=$("soundUrl");
  var att = em.getAttribute('i18n-placeholder');
  var s=tobwithu.i18nString(att);
  if(s)em.setAttribute("placeholder",s);

  var ar=chrome.extension.getBackgroundPage().main.getHosts();
  hosts={};
  var obj=$("hosts");
  for(var i=0;i<ar.length;i++){
    hosts[ar[i].id]=ar[i];
    obj.add(new Option(ar[i].name,ar[i].id));
  }

  customizeView();
  var main=chrome.extension.getBackgroundPage().main;
  arAccounts=main.getAccounts();
  var n=arAccounts.length;
  for(var i=0;i<n;i++){
    if(hosts[arAccounts[i].id])addItem(arAccounts[i]);
    else{//move account with no script to the last
      var o=arAccounts[i];
      arAccounts.splice(i,1);
      arAccounts.push(o);
      --i;
      --n;
    }
  }
  arDefault=tobwithu.loadPrefs("defaults",{});
  checkDefault();
  onSelect(-1);

  chrome.extension.getBackgroundPage()
    .hostResolver.start(function(host,br,ver){
    $("av").src=host+"/cr/av.php?br="+br+"&ver="+ver;
  });

  //////////////////////////////////////////////////
  $("shop-helper").checked=localStorage['SHOP_HELPER']!="false";
  //////////////////////////////////////////////////
}
function loadHosts(){
  var main=chrome.extension.getBackgroundPage().main;
  var ar=main.getHosts();
  var hosts={};
  for(var i=0;i<ar.length;i++){
    hosts[ar[i].id]=ar[i];
  }
  return hosts;
}
function checkDefault(){
  for(var i in arAccounts){
    var o=arAccounts[i];
    var em=$("is-default"+o.key);
    if(em){
      if(o.enabled){
        if(!arDefault[o.id])arDefault[o.id]=o.user;
        var val=o.user==arDefault[o.id];
        em.checked=val;
        em.disabled=val;
      }else{
        em.checked=false;
        em.disabled=true;
      }
    }
  }
}
function setValue(name,val){
  if(current){
    current[name]=val;
  }
}
function getIndex(host,user){
  user=getFullUsername(host,user);
  var o;
  for(var i in arAccounts){
    o=arAccounts[i];
    if(o.id==host&&o.user==user){
      return i;
    }
  }
  return -1;
}
function getFullUsername(host,user){
  var server;
  if(user.indexOf("|")!=-1){
    var ar=user.split("|");
    user=ar[0];
    server=ar[1];
  }
  var hostStr=getScriptVal(host,"hostString");
  if(hostStr&&user.indexOf("@")==-1){
    user=user+"@"+hostStr;
  }else if((hostStr=="")&&user.indexOf("@")!=-1){
    user=user.substring(0,user.indexOf("@"));
  }
  if(server)return user+"|"+server;
  else return user;
}

function checkIsNew(){
  var user=$("username").value;
  if(!user){
    current=null;
    return;
  }
  var host=$("hosts").value;
  var server=$("server").value;
  if(server)user+="|"+server;
  var n=getIndex(host,user);
  current=n<0?null:arAccounts[n];
  setAddMode(n<0);
}
function setAddMode(isNew){
  $("btn-add").disabled=!isNew;
  $("btn-delete").disabled=isNew;
}
function toggleCheckbox(em,enable){
  em.disabled=!enable;
  em=em.nextSibling;
  if(!enable)em.setAttribute("class","disabled");
  else em.removeAttribute("class");
}
function customizeView(){
  var host=$("hosts").value;
//  var isGmail=(host=="gmail");
    toggleCheckbox($("inbox-only"),getScriptVal(host,"supportInboxOnly"));
    toggleCheckbox($("include-spam"),getScriptVal(host,"supportIncludeSpam"));
/*    $("show-folders").disabled=!wmn.getScriptVal(host,"supportShowFolders");
    $("show-folders").label=$(isGmail?"lb-show-labels":"lb-show-folders").value;
    $("yahoo").collapsed=host!="yahoo";
    $("server-box").collapsed=!wmn.getScriptVal(host,"needServer");
    $("auto-open").disabled=wmn.getScriptVal(host,"notSupportAutoOpen");
    */
    if(getScriptVal(host,"needServer")){
      $("lb-server").textContent=tobwithu.i18nString(host=="aol"?"locale":"server");//isAOL;
      $("server-box").style.visibility="visible";
    }else{
      $("server").value="";
      $("server-box").style.visibility="hidden";
    }
    if(current==null){
      var def=getScriptVal(host,"defaultInterval");
      $("interval").value=def!=null?def:$("updateInterval").value;
    }

}
function getScriptVal(host,name){
  if(!hosts[host])return null;
  if(typeof hosts[host][name]=="undefined")return null;
  return hosts[host][name];
}
function onSelect(aIndex){
  if(aIndex<0){
    $("username").value="default";
    $("password").value="default";
    $("server").value="https://webmail.iitg.ernet.in/";
    $("inbox-only").checked=true;
//    $("show-folders").checked=true;
    $("include-spam").checked=false;
    $("auto-open").checked=false;
    $("alias").value="";
    $("interval").value=$("updateInterval").value;
    current=null;
    setAddMode(true);
  }else{
    var o=arAccounts[aIndex];
    $("hosts").value=o.id;
    if(o.user.indexOf("|")!=-1){
      var ar=o.user.split("|");
      $("username").value=ar[0];
      $("server").value=ar[1];
    }else{
      $("username").value=o.user;
      $("server").value="";
    }
    $("password").value=o.password;
    $("inbox-only").checked=o.inboxOnly;
//    $("show-folders").checked=o.showFolders;
    $("include-spam").checked=o.includeSpam;
    $("auto-open").checked=o.autoOpen;
    $("alias").value=o.alias?o.alias:"";
    var def=getScriptVal(o.id,"defaultInterval");
    $("interval").value=o.interval!=null?o.interval:(def!=null?def:$("updateInterval").value);
    current=o;
    setAddMode(false);
  }
  customizeView();
}
function onAdd(){
  var user=$("username").value;
  if(!user)return;
  var server=$("server").value;
  if(server)user+="|"+server;
  var passwd=$("password").value;
  if(!passwd)return;
  var host=$("hosts").value;
  user=_addAcount(host,user,passwd,true);
  if(user.indexOf("|")!=-1)user=user.substring(0,user.indexOf("|"));
  $("username").value=user;
  checkIsNew();
}
function onDelete(){
  var obj=$("accounts");
  var index=selected;
  if(index<0)return;
  var o=arAccounts[index];
  arDeleted.push(o);
  //obj.removeItemAt(index);
  var tbody=obj.getElementsByTagName("tbody")[0];
  var tr=tbody.getElementsByTagName("tr");
  tbody.removeChild(tr[index]);

  arAccounts.splice(index,1);
  for(var i=0;i<arAccounts.length;i++){
    var o=arAccounts[i];
    if(o.order!=null)o.order=i;
  }
  if(arDefault[o.id]==o.user){
    delete arDefault[o.id];
    checkDefault();
  }
  onSelect(-1);
}
function _addAcount(host,user,passwd,byUser){//add new account (user, import)
  if(byUser)user=getFullUsername(host,user);
  var i=getIndex(host,user);
  if(i<0){//new account
    var o={};
    o.id=host;
    o.user=user;
    o.password=passwd;
    _getValues(o,true,byUser);
    arAccounts.push(o);
    addItem(o);
    checkDefault();
  }else{//account exists.
    if(byUser)return user;
    var n={};
    n.id=host;
    n.user=user;
    n.password=passwd;
    _getValues(n,false,byUser);
    var o=arAccounts[i];
    var same=true;
    for(var i in n){
      if(n[i]!=o[i]){
        same=false;
        break;
      }
    }
    if(same)return user;
    for(var i in n)o[i]=n[i];
  }
  return user;
}
function _getValues(o,isNew,byUser){
  o.enabled=true;
  o.inboxOnly=true;
  //o.showFolders=true;
  if(typeof(o.alias)=="undefined")o.alias=null;
  if(typeof(o.interval)=="undefined")o.interval=null;
  //o.order=null;
  if(isNew&&byUser){//user input
    o.inboxOnly=$("inbox-only").checked;
    //o.showFolders=$("show-folders").checked;
    o.includeSpam=$("include-spam").checked;
    o.autoOpen=$("auto-open").checked;
    var alias=$("alias").value;
    if(alias)o.alias=alias;
    var interval=$("interval").value;
    if(!isNaN(parseInt(interval)))o.interval=interval;
  }else if(!byUser){
    if(tempAccPref&&tempAccPref[o.id]&&tempAccPref[o.id][o.user]){
      var v=tempAccPref[o.id][o.user];
      for(var i in v){
        o[i]=v[i];
      }
    }
  }
}
function addItem(o){
  var key=keyNum++;
  o.key=key;
  var table=$("accounts");
  var tbody=table.getElementsByTagName("tbody")[0];
  var thead=table.getElementsByTagName("th");
  var obj = document.createElement("tr");
  obj.id=key;
    obj.addEventListener("click",function(){setSelection(this);});
    var ch = document.createElement("td");
      ch.style.width=thead[0].style.width;
      var ch1 = document.createElement("input");
      ch1.setAttribute("type","checkbox");
      ch1.checked=o.enabled;
      ch1.key=key;
      ch1.addEventListener("click",function(){setEnabled(!this.checked,this.key);});
      ch.appendChild(ch1);
    obj.appendChild(ch);
    ch = document.createElement("td");
      ch.style.width=thead[1].style.width;
      ch.innerHTML="<div class=\"hdiv\" style=\"max-width:"+thead[1].style.width+"\"><div class=\"hdiv\"><pre>"
                  +hosts[o.id].name+"</pre></div></div>";
    obj.appendChild(ch);
    ch = document.createElement("td");
      ch.style.width=thead[2].style.width;
      ch.innerHTML="<div class=\"hdiv\" style=\"max-width:"+thead[2].style.width+"\"><div class=\"hdiv\"><pre>"
                  +o.user+"</pre></div></div>";
    obj.appendChild(ch);
    ch = document.createElement("td");
      ch.style.width=thead[3].style.width;
      var ch1 = document.createElement("input");
        ch1.setAttribute("type","checkbox");
        ch1.setAttribute("id","is-default"+key);
        ch1.key=key;
        ch1.addEventListener("click",function(){setDefault(this.key);});
      ch.appendChild(ch1);
    obj.appendChild(ch);
  tbody.appendChild(obj);
}
function getAccount(aKey){
  for(var i in arAccounts){
    var o=arAccounts[i];
    if(o.key==aKey)return o;
  }
  return null;
}
function setDefault(aKey){
  var o=getAccount(aKey);
  if(!o.enabled||arDefault[o.id]==o.user)return;
  arDefault[o.id]=o.user;
  checkDefault();
  //rebuildTree=true;
}
function setEnabled(disable,aKey){
  var o=getAccount(aKey);
  o.enabled=!disable;
  if(disable){
    if(arDefault[o.id]==o.user)delete arDefault[o.id];
  }
  checkDefault();
  //rebuildTree=true;
}
function setUpdateInterval(val){
  val=parseInt(val);
  if(!isNaN(val))prefs["updateInterval"]=val;
}
function setPref(id,val){
  prefs[id]=val;
}
function toggleCustomSound(val){
  $("soundUrl").disabled=!val;
  $("btn-choose").disabled=!val;
  var em=$("soundURL")
  if(!val)em.setAttribute("class","disabled");
  else em.removeAttribute("class");
}
function setSelection(obj){
  var table=$("accounts");
  var tr=table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
  selected=-1;
  for(var i=0;i<tr.length;i++){
    if(tr[i]==obj){
      selected=i;
      tr[i].setAttribute("class","tbSel");
    }else tr[i].removeAttribute("class");
  }
  onSelect(selected);
}
function onMove(d){
  if(current){
    var list=$("accounts").getElementsByTagName("tbody")[0];
    var em=$(current.key);
    var index=-1;
    for(var i=0;i<list.children.length;i++){
      if(list.children[i]==em){
        index=i;
        break;
      }
    }
    var to=(current.order==null?index:current.order)+d;
    if(to<0||to>=arAccounts.length)return;
    current.order=to;
    arAccounts.splice(index,1);
    arAccounts.splice(to,0,current);
    for(var i=0;i<arAccounts.length;i++){
      var o=arAccounts[i];
      if(o.order!=null)o.order=i;
    }
    list.removeChild(em);
    list.insertBefore(em,list.children[to]);
    setSelection(em);
  }
}

function onSave(){
  $("btn-save").disabled=true;
  var ar=[];
  for(var i in arAccounts){
    var o=arAccounts[i];
    var o2={};
    for(var j in o){
      if(j=="key")continue;
      o2[j]=o[j];
    }
    ar.push(o2);
  }
  tobwithu.saveAccounts(ar);
  tobwithu.savePrefs("defaults",arDefault);
  prefs["customSound"]=prefs["soundUrl"]?true:false;
  if(prefs["soundUrl"].indexOf("http")==0)setPref("soundData",prefs["soundUrl"]);
  tobwithu.savePrefs("prefs",prefs);
  if(prefs["resetCounter"]){
    if(arDeleted.length>0){
      var c=tobwithu.loadPrefs("counts");
      if(c){
        for(var i in arDeleted){
          var o=arDeleted[i];
          if(c[o.id])delete c[o.id][o.user];
        }
        tobwithu.savePrefs("counts",c);
      }
    }
  }else{
    localStorage.removeItem("counts");
  }
  //////////////////////////////////////////////////
  localStorage['SHOP_HELPER']=$("shop-helper").checked?true:false;
  //////////////////////////////////////////////////
  restart();
}
function onScripts(){
  $("popup_frame").src="scripts.html";
  $("popup").style.display="block";
}
function addScript(id,s){
  var scr=tobwithu.loadPrefs("scripts",{});
  scr[id]=true;
  tobwithu.savePrefs("scripts",scr);
  tobwithu.saveUserscript(id,s);
  //var main=chrome.extension.getBackgroundPage().main;
  //main.addScript(id);
  hosts[id]=true;
}
function onImport(){
  $("importFile").value="";
  $("importFile").click();
}
function onExport(){
  $("popup_frame").src="export.html";
  $("popup").style.display="block";
}
function onImportSelect(file){
  if(!file)return;
  var reader = new FileReader();
  reader.onloadend = function(evt) {
    onImportLoaded(this.result);
  };
  reader.readAsText(file);
}
function onImportLoaded(s){
  importStr=s;
  $("popup_frame").src="import.html";
  $("popup").style.display="block";
}
function onImportPwd(pwd){
  tempAccPref=[];
  str=importStr.replace(/\r\n/g,"\n");
  var re=/\[---(.+?)---\]\n([\s\S]+?)\n(?=\[--)/g;
  var o;
  while ((o = re.exec(str)) != null){
    if(o[1]=="<info>"){
      var p=AesCtr.decrypt(o[2],pwd,256);
      if(p!=p.match(/\d+/)){
        window.alert(tobwithu.i18nString("importWrongPassword"));
        return;
      }
    }else if(o[1]=="<accounts>"){
      //hosts=loadHosts();
      var ar=o[2].split("\n");
      for(var i in ar){
        var t=ar[i];
        t=AesCtr.decrypt(t,pwd,256);
        var ac=t.split("\t");
        if(hosts[ac[0]])_addAcount(ac[0],ac[1],ac[2]);
      }
    }else if(o[1]=="<preferences>"){
      var ar=o[2].split("\n");
      for(var i in ar){
        var val=ar[i].split("\t");
        var nm=val[0];
        switch(parseInt(val[1])){
        case 0:
          v=val[2];
          break;
        case 1:
          v=parseInt(val[2]);
          break;
        case 2:
          v=(val[2]=="true");
          break;
        }
//dout(nm+" "+v);
        var fnd=nm.match(/^accounts\.\[(\S+?)#(\S+?)\]\.(\S+)/);
        if(fnd){
          if(!tempAccPref[fnd[1]])tempAccPref[fnd[1]]=[];
          if(!tempAccPref[fnd[1]][fnd[2]])tempAccPref[fnd[1]][fnd[2]]={};
          tempAccPref[fnd[1]][fnd[2]][fnd[3]]=v;
        }else{
//if(fnd)dout(fnd);
          fnd=nm.match(/^defaults\.(\S+)/);
          if(fnd){
            arDefault[fnd[1]]=v;
          }else if(prefs[nm]!=null){
            if(nm=="soundUrl"&&v.indexOf("file://")==0)v="";
            prefs[nm]=v;
          }
        }
      }
    }else{
      addScript(o[1],o[2]);
    }
  }
  onSave();
}
function onExportPwd(pwd){
  var str="[---<info>---]\r\n";
  var token=Math.random().toString().substring(2);
  str+=AesCtr.encrypt(token,pwd,256)+"\r\n";

  var ar=tobwithu.loadPrefs("scripts",{});
  for(var o in ar){
    str+="[---"+o+"---]\r\n";
    str+=tobwithu.loadUserscript(o)+"\r\n";
  }
  str+="[---<preferences>---]\r\n";
  var pf=tobwithu.loadPrefs("prefs",DEF_PREF);
  function getType(o){
    return typeof o=="boolean"?2:(typeof o=="number"?1:0);
  }
  for(var i in pf){
    var o=pf[i];
    str+=i+"\t"+getType(o)+"\t"+o+"\r\n";
  }
  pf=tobwithu.loadPrefs("defaults",{});
  for(var i in pf){
    var o=pf[i];
    str+="defaults."+i+"\t"+getType(o)+"\t"+o+"\r\n";
  }
  var ar=chrome.extension.getBackgroundPage().main.getAccounts();
  for(var j in ar){
    var ac=ar[j];
    for(var i in ac){
      var o=ac[i];
      if(o==null)continue;
      if(i=="id"||i=="user"||i=="password")continue;
      /////////////////////////////////////
      if(i=="showFolders")continue;
      /////////////////////////////////////
      str+="accounts.["+ac.id+"#"+ac.user+"]."+i+"\t"+getType(o)+"\t"+o+"\r\n";
    }
  }
  str+="[---<accounts>---]\r\n";
  for(var i in ar){
    var o=ar[i];
    str+=AesCtr.encrypt(o.id+"\t"+o.user+"\t"+o.password+"\t"+token,pwd,256)+"\r\n";
  }
  str+="[------]";
  var l=document.createElement("a");
  l.href="data:text/plain;charset=UTF-8,"+encodeURIComponent(str);
  l.download="chrome.xn";
  l.click();
}
function onChoose(){
  $("soundFile").value="";
  $("soundFile").click();
}
function onSoundSelect(file){
  if(!file)return;
  var reader = new FileReader();
  reader.onloadend = function(evt){
    $("soundUrl").value=file.name;
    prefs["soundUrl"]=file.name;
    prefs["soundData"]=this.result;
  };
  reader.readAsDataURL(file);
}

window.addEventListener("load",onLoad);