tobwithu.loadPrefs=function(name,def){
  var o=localStorage[name];
  if(o==null){
    if(def)o={};
    else return null;
  }else o=JSON.parse(o);
  if(def){
    for(var i in def){
      if(typeof o[i]=="undefined")o[i]=def[i];
    }
  }
  return o;
}
tobwithu.savePrefs=function(name,o){
  localStorage[name]=JSON.stringify(o);
}

tobwithu.loadAccounts=function(){
  if(localStorage["s"]==null)return [];
  var key=localStorage["s"]+"app";
  var ac=localStorage["accounts"];
  if(ac==null)return [];
  var accounts=JSON.parse(ac);  
  for(var i=0;i<accounts.length;i++){
    var o=accounts[i];
    var data=AesCtr.decrypt(o.data,key,256);
    data=data.split("\t");
    if(data.length!=3)continue;
    o.id=data[0];
    o.user=data[1];
    o.password=data[2];
    delete o.data;
    /////////////////////////////////
    o.showFolders=true;
    /////////////////////////////////
  }
  return accounts;
}
tobwithu.saveAccounts=function(accounts){
  if(localStorage["s"]==null){
    localStorage["s"]=Math.random().toString().substring(2);  
  }
  var key=localStorage["s"]+"app";
  for(var i=0;i<accounts.length;i++){
    var o=accounts[i];
    o.data=AesCtr.encrypt(o.id+"\t"+o.user+"\t"+o.password,key,256);
    delete o.id;
    delete o.user;
    delete o.password;
  }
  localStorage["accounts"]=JSON.stringify(accounts);
}

tobwithu.loadUserscript=function(id){
  var s=localStorage["scripts."+id];
  return s;
}
tobwithu.saveUserscript=function(id,s){
  localStorage["scripts."+id]=s;
}