function wrapper() {
  function lp() {
  }
  lp.prototype = {
    processUrl: function(url) {
      var rawid = url.split("v=")[1];
      if(rawid == null || rawid.length==0) {
        return false;
      }
      id = rawid.replace(/(&|#).+/g, "");
      var time = -1;
      var timeraw = url.split("t=")[1];
      if(!(timeraw == null || timeraw.length==0)) {
        //process time
        timeraw = timeraw.replace(/(&|#).+/g, "");
        if(timeraw.match(/[0-9]+/gi) && timeraw > -1) {
          time = timeraw;
        } else {
          var values = timeraw.match(/([0-9]+m)?([0-9]+(s)?){1}/gi);
          if(values != null) {
            minutes = timeraw.split("m")[0];
            if(minutes == timeraw || minutes == null || minutes.length == 0) {
              minutes = 0;
            }
            seconds = timeraw.split("m")[1];
            if(seconds == null || seconds.length == 0) {
              seconds = timeraw;
            }
            seconds = seconds.replace("s", "");
            if(minutes > -1 && seconds > -1) {
              time = 60*minutes + 1*seconds;
            }
          }
        }
      }
      return {id: id, time: time};
    },
    
    insertAfter: function(referenceNode, node) {
  		referenceNode.parentNode.insertBefore(node, referenceNode.nextSibling);
  	},
    
    $t: function(name,obj) {
  		var obj = obj||document;
  		return obj.getElementsByTagName(name);
  	}
  }
  
  document.$lp = new lp();
}

wrapper();