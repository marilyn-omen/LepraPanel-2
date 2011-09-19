function wrapper() {
    var found = false;
    var all = document.getElementsByTagName("a")
    for (var i = 0, o; o = all[i]; i++) {
      var m = o.href.match(/youtube\.com\/watch\?.*v=(.+)($|&)/);
      if(m) {
        if(!found) {
          /* init div */
          var d = document.createElement("DIV");
          d.id = "youtube_inline_div";
          d.style.display = "none";
          document.body.appendChild(d);
          var css = "\
            #youtube_inline_div {\
              position: absolute;\
              display: none;\
              border: 1px solid #999;\
              background: #ececec;\
              padding: 1px;\
              text-align: center;\
              z-index: 99;\
            }\
          ";
          style = document.createElement("STYLE");
          style.type = "text/css";
          style.innerHTML = css;
          document.body.appendChild(style);
          found = true;
        }
        var img = document.createElement("IMG");
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHiSURBVDjLpZPLquJAEIbPQ+Wd8gAZnTirPIGIgiLoxo2iCxeuBJGgoggq3trLwoX3a9R4QVGxpv/mJCJzOMMwDUVCur+/qv7qfBDRx//EHx/6/b7U6/W0brerdzodgzFmtFotvdlsavV6XfpWgMMyh9l6vabz+UyPx0PE6XSixWJBtVqNVSoV+UuBT9i8Xq+EhefhcCDTNOlyuYhvEC2Xy2apVJLfBD7LZha82+1ou91SPp8nwzBos9kQqrJEdF1n2WxWsgV4v5p1wIIBOp0/KZfLCXi5XIrAGgwGlEqlNFuAm6VDGaUCtLI6HE4RPKOA4QP8QIJEIqHbAu1224BZ+/1ewMi4Wq047BDhcv2iarVKs9lMCN1uN4pGo4YtwMckBFC+BeMgYFV1kaL8EHvT6dSuIhKJvAQajYYOx9GG1SsOqqr6Bk8mEzGZ4XBI4XD41QKfr4bN5/MpwPl8LspVFEXA2BuPxzQajeh+v1OxWKRgMPgykc9VKhQKDB5gIRsCsAUiKxLgncOMh/R2kTKZjJxOp024j4PH49GuBpcJmSHCQdPn88lfXuVkMinH43HGWxItwBP0jLljlBxkHo9H/vZnisViUigU0gKBgO73+w2v12twSHe73Rp/l/76N/5r/AZGRj/URbdFDAAAAABJRU5ErkJggg%3D%3D";
        img.title = "Смотреть видео";
        img.height = img.width = 16;
        img.style.border = "none";
        img.style.margin = "0 5px -3px 0";
        img.style.cursor = "pointer";
        img.style.opacity = "1";
        img.setAttribute("wtf", m[1]);
        img.addEventListener("click", showdiv, false);
        o.parentNode.insertBefore(img, o);
      }
    }

    function showdiv() {
      var vid = this.getAttribute("wtf"); //video id
      dd = document.getElementById("youtube_inline_div");
      if ((dd.style.display == "block")
      && (vid == dd.getAttribute("videoid"))) {
          dd.style.display = "none";
          return;
      } else {
        //load contents
        dd.setAttribute("videoid", vid);
        dd.innerHTML = "<object width='425' height='350'>" +
          "<param name='movie' value='http://www.youtube.com/v/" +
          vid +
          "&amp;autoplay=1'></param>" +
          "<param name='wmode' value='transparent'></param>" +
          "<embed src='http://www.youtube.com/v/" +
          vid +
          "&amp;autoplay=1' type='application/x-shockwave-flash' " +
          "wmode='transparent' width='425' height='350'>" +
          "</embed></object>";
        // insert it in new place
        var winwidth = document.innerWidth;
        if(winwidth < 450) {
          dd.style.left = Math.max((findPosX(this) - 130), 20) + "px";
        } else {
          if(findPosX(this) + 300 > winwidth) {
            dd.style.left = winwidth - 450 + "px";
          } else {
            dd.style.left = Math.max((findPosX(this) - 130), 20) + "px";
          }
        }
        dd.style.top = (findPosY(this) + 20) + "px";
        dd.style.display = "block";
        dd.focus();
      }
    }

    /* routines */
    function findPosX(obj) {
      var curleft = 0;
      while(obj.offsetParent) {
        curleft += obj.offsetLeft;
        obj = obj.offsetParent;
      }
      return curleft;
    }
    function findPosY(obj) {
      var curtop = 0;
      while(obj.offsetParent) {
        curtop += obj.offsetTop;
        obj = obj.offsetParent;
      }
      return curtop;
    }
}
wrapper();