var sandbox={
  init:function(){
  },
  onMessage:function (event){
    var d=event.data;
    var cmd = d.cmd;    
    switch(cmd){
    case "convertScript":
      eval("tmp={"+d.data+"}");        
      var str="";
      for(var j in tmp){        
        if(typeof tmp[j]=="function")str+=tmp[j].toString().replace(/^function\s*\(/,"function "+j+"(")+"\n";
        else if(typeof tmp[j]=="string")str+="var "+j+"=\""+tmp[j]+"\";\n";
        else str+="var "+j+"="+tmp[j]+";\n";
      }    
      d.data=str;
      event.source.postMessage(d,event.origin);
      break;
    }
  }
}
window.addEventListener('message',sandbox.onMessage);