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
  var button = "<div style=\"display: inline-block; position: relative; top: -" + (height - 13) + "px; left: 2px; background: #888; width: 20px; height: 20px; font-size: 14px; line-height: 16px; text-align: center; cursor: pointer;\"><b style=\"color: #fff;\">x</b></div>";
  
  //process youtube links
  for(var i = 0; i < youtube_links.length; i++) {
    var link = youtube_links[i];
    link.style.paddingLeft = "19px";
    link.style.backgroundRepeat = "no-repeat";
    link.style.backgroundImage = "url(http://favicon.yandex.net/favicon/youtube.com)";
    link.addEventListener("click", function(e) {
      var re = document.$lp.processUrl(this.href);
      if(re != false) {
        if(this.name == "") {
          if(this.parentNode.tagName.toLowerCase() == "td") {
            //it's a video-post preview
            this.parentNode.setAttribute("name", this.parentNode.width);
            this.parentNode.setAttribute("width", width + 46);
          }
          this.setAttribute("name", this.innerHTML);
          this.style.textDecoration = "none";
          this.innerHTML = "<span style=\"display: inline-block; clear: both; width: " + (width + 36) + "px; \"><span><object width=\"" + width + "\" height=\"" + height + "\"><param name=\"movie\" value=\"http://www.youtube.com/v/" + re.id + "?autoplay=1&start=" + re.time + "&fs=1\" /><param name=\"allowFullScreen\" value=\"true\" /><param name=\"allowScriptAccess\" value=\"always\" /><embed src=\"http://www.youtube.com/v/" + re.id + "?autoplay=1&start=" + re.time + "&fs=1\" type=\"application/x-shockwave-flash\" allowscriptaccess=\"always\" allowfullscreen=\"true\" width=\"" + width + "\" height=\"" + height + "\" /></object></span>" + button + "</span>";
          //adding size change links
          var div = document.createElement("div");
          div.innerHTML = "<sup><a class=\"normal\" href=\"#\">нормальный</a> | <a class=\"big\" href=\"#\">побольше</a> | <a class=\"bigger\" href=\"#\">большой</a></sup>";
          document.$lp.insertAfter(this, div);
          this.style.display = "block";
          var arr = document.$lp.$t("a", div);
          for(var link in arr) {
            link = arr[link];
            link.addEventListener("click", function(e) {
              var w, h;
              if(this.className == "normal") {
                w = 480; h = 385;
              } else if (this.className == "big") {
                w = 640; h = 480;
              } else {
                w = 800; h = 600;
              };
              var pDiv = this.parentNode.parentNode.previousSibling;
              //move x button
              document.$lp.$t("span", pDiv)[0].style.width = w + 36 + "px";
              document.$lp.$t("div", pDiv)[0].style.top = "-" + (h - 14) + "px";
              //resize movie
              var elem = document.$lp.$t("embed", pDiv)[0];
              elem.width = w;
              elem.height = h;
              var elem = document.$lp.$t("object", pDiv)[0];
              elem.width = w;
              elem.height = h;
              e.preventDefault();
              return false;
            });
          }
        } else {
          if(this.parentNode.tagName.toLowerCase() == "td") {
            //it's a video-post preview
            this.parentNode.setAttribute("width", this.parentNode.getAttribute("name"));
          }
          this.innerHTML = this.getAttribute("name");
          this.style.textDecoration = "underline";
          this.setAttribute("name", "");
          this.style.display = "inline";
          this.parentNode.removeChild(this.nextSibling);
        }
        e.preventDefault();
        return false;
      }
    });
  }
}

wrapper();