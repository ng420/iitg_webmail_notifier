function setCount(n,list){
  loadingAnimation.stop();
  tobwithu.setIcon(icons[n>0?1:0]);
  tobwithu.setBadgeText(n>0?""+n:""); 
  var title=tobwithu.i18nString("app_name");
  if(n>0){
    for(var i in list){
      var o=list[i];
      title+="\n"+o.accName+" : "+o.calcCount();
    }
  }else title+="\n"+tobwithu.i18nString("noNewMsg");
  tobwithu.setTitle(title);  
}

var loadingAnimation = new LoadingAnimation();
function LoadingAnimation() {
  this.timerId_ = 0;
  this.maxCount_ = 8;  // Total number of states in animation
  this.current_ = 0;  // Current state
  this.maxDot_ = 4;  // Max number of dots in animation
}

LoadingAnimation.prototype.paintFrame = function() {
  var text = "";
  for (var i = 0; i < this.maxDot_; i++) {
    text += (i == this.current_) ? "." : " ";
  }
  if (this.current_ >= this.maxDot_)
    text += "";

  tobwithu.setBadgeText(text);
  this.current_++;
  if (this.current_ == this.maxCount_)
    this.current_ = 0;
}

LoadingAnimation.prototype.start = function() {
  if (this.timerId_)
    return;

  var self = this;
  this.timerId_ = window.setInterval(function() {
    self.paintFrame();
  }, 100);
}

LoadingAnimation.prototype.stop = function() {
  if (!this.timerId_)
    return;

  window.clearInterval(this.timerId_);
  this.timerId_ = 0;
}
