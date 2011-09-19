function wrapper() {
  var comment_links = document.getElementsByTagName("a");
  var youtube_links = new Array();
  var vimeo_links = new Array();
  
  for (var i = 0; i < comment_links.length; i++) {
    if (comment_links[i].href.split("youtube.com/").length > 1) {
      youtube_links.push(comment_links[i]);
    }
    else if (comment_links[i].href.split("vimeo.com/").length > 1) {
      vimeo_links.push(comment_links[i]);
    }
  }
  
  var width = 480;
  var height = 385;
  var button = "<div style=\"display:inline-block; position:relative; top: -" + (height - 14) + "px; left: 2px; background: #999 url(http://pit.dirty.ru/dirty/1/2010/04/24/11119-071559-e56ce92235e2c35c7531f9cb843ffa0d.png) no-repeat;width:36px;height:20px;font-size:12px;line-height:20px;text-align:center;color:#fff;cursor:pointer\"><b style=\"color: #FFF;\">x</b></div>";
  
  //process youtube links
  for(var i = 0; i < youtube_links.length; i++) {
    var link = youtube_links[i];
    link.addEventListener("click", function(e) {
      var re = processUrl(this.href);
      if(re != false) {
        youtube_id = re.id;
        time = re.time;
        if(this.name == "") {
          if(this.parentNode.tagName.toLowerCase()=="td") {
            //it`s a video-post preview
            this.parentNode.setAttribute('name', this.parentNode.width);
            this.parentNode.setAttribute('width', width+46);
          }
          this.setAttribute('name', this.innerHTML);
          this.style.textDecoration = "none";
          this.innerHTML = '<span style="display:inline-block; clear: both; width: '+(width+36)+'px; "><span><object width="'+width+'" height="'+height+'"><param name="movie" value="http://www.youtube.com/v/'+id+'?autoplay=1&start='+time+'&fs=1"></param><param name="allowFullScreen" value="true"></param></param><param name="allowScriptAccess" value="always"></param><embed src="http://www.youtube.com/v/'+id+'?autoplay=1&start='+time+'&fs=1" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="'+width+'" height="'+height+'"></embed></object></span>'+button+'</span>';
          //adding size change links
          var div = document.createElement('div');
          div.innerHTML = '<sup>Размер: <a class="normal" href="#">нормальный</a> <a class="big" href="#">побольше</a> <a class="bigger" href="#">большой</a></sup>';
          insertAfter(this, div);
          //div.setAttribute("style","position:relative;");
          //div.style.left = (_$.element_position(this).x - div.clientWidth + 30) + "px";
          this.style.display = "block";
          arr = $t('a',div);
          for(var link in arr) {
            link = arr[link];
            link.addEventListener('click',function(e) {
              if(this.className == "normal") {
                w=480; h=385;
              } else if (this.className == "big") {
                w=640; h=480;
              } else {
                w=800; h=600;
              };
              var pDiv = this.parentNode.parentNode.previousSibling;
              //move x button
              $t('span',pDiv)[0].style.width = w+36+"px";
              $t('div',pDiv)[0].style.top = "-"+(h-14)+"px";
              //resize movie
              var elem = $t('embed',pDiv)[0];
              elem.width = w;
              elem.height = h;
              var elem = $t('object',pDiv)[0];
              elem.width = w;
              elem.height = h;
              e.preventDefault();
              return false;
            });
          }
        }
        //						else if (e.target.firstChild.data == 'x')
        else {
          if(this.parentNode.tagName.toLowerCase()=="td") {
            //it`s a video-post preview
            this.parentNode.setAttribute('width', this.parentNode.getAttribute('name'));
          }
          this.innerHTML = this.getAttribute('name');
          this.style.textDecoration = "underline";
          this.setAttribute('name', "");
          this.style.display = "inline";
          this.parentNode.removeChild(this.nextSibling);
        }
        e.preventDefault();
        return false;
      }
    });
  }
  
  function processUrl(url) {
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
  }
  
  function insertAfter(referenceNode, node) {
		referenceNode.parentNode.insertBefore(node, referenceNode.nextSibling);
	}
  
  function $t(name,obj) {
		var obj = obj||document;
		return obj.getElementsByTagName(name);
	}
}

wrapper();