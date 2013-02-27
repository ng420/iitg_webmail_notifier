/***********************************************************
Library - Web Update
  
  Notify web site update.

  @ver 0.2
***********************************************************/

Handler.prototype.loadDB=function(id,user){
  var str=localStorage["db."+id];
  if(!str)return [];
  var db=JSON.parse(str);
  if(db&&db[user])return db[user];
  else return [];
}

Handler.prototype.saveDB=function(id,user,data){  
  var db=localStorage["db."+id];
  if(!db)db={};
  else db=JSON.parse(db);
  db[user]=data;
  localStorage["db."+id]=JSON.stringify(db);
}
