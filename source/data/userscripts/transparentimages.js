function wrapper() {
	    var css = "\
      div.post .dt img { \
        opacity: 0.25; \
      } \
      div.post .dt img:hover { \
        opacity: 1; \
      }";

    var style = document.createElement("STYLE");
    style.type = "text/css";
    style.innerHTML = css;
    document.body.appendChild(style);
}
wrapper();