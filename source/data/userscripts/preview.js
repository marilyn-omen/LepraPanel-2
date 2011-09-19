function wrapper() {
    var form = document.forms.namedItem("comments-form");
    if(!form) {
      return;
    }
    var d = form.firstChild;
    while(d && d.className != "bottom") {
      d = d.nextSibling;
    }
    d = d.firstChild;
    while(d && d.className != "bottom_right") {
      d = d.nextSibling;
    }
    if(!d) {
      return;
    }
    var submit = createPreviewButton();
    var previewPane = createPreviewPane();

    function createPreviewButton() {
      var p = document.createElement("IMG");
      p.width = p.height = 16;
      p.style.margin = "0px 5px -5px 2px";
      p.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAG8SURBVDjLjZNJS8NAGIarv0PBuzcV/4MHwYMHL/4CPQsexYvoSW2RioiguJ9cigtFKhpxqVtBXGqtVRO62TbJNFMb+zpfNKJVMQMPCWTeZ+YdMi4ALjGqBPWCxn+oEVRSxsb1IajnnGeLxeKraZr4DfEdbrd7sFxiCxoprOs6GGOf5HI5ZDIZxONxS6IoCjwezzcJjQoS0ATDMFAoFKwnoWkastksEomEJcjn86BFvF6vJfkhoLANCSigqiqSyeSPSh9nUvFNIGp8TqB36m1XSaVS1k5kWf5bUM5XCe2EziOdTjsXmGYRgVAMi9I1JrbuMbPzBF/wAS8F5kywfX6PlWAcNwrDXYpj/1bF2mkS/pOYM8G8JOPiUcNBNA8pwrArCMkcs9vR/wXUf9wfRTjBId3q2Anr8F9qCMY4pgKPzgSzovPFE0Pg+j1MHD1wjPqunFUIhBTsh1Uci9Be1MChWH35TIN3cgl97XU95YJSueBZ4zi8ecaCOIu5XRljm3cYmfQhtDYGabidTXfWttl3oUH8fUyE/rxMNpGD1dLReEcpsj4EX28TswXVJHFwnS26mqu6NwdajY3+FrwBN5GpoomTEloAAAAASUVORK5CYII%3D";
      p.style.cursor = "pointer";
      p.title = "Предварительный просмотр";
      p.addEventListener("click", doPreview, false);
      d.insertBefore(p, d.firstChild);
      return p;
    }

    function createPreviewPane() {
      var p = document.createElement("DIV");
      p.style.display = "none";
      p.style.position = "absolute";
      p.style.zIndex = "150";
      p.style.fontSize = "0.8em";
      p.style.padding = "5px";
      p.style.border = "1px solid #ddd";
      p.style.backgroundColor = "#fff";
      document.body.appendChild(p);
      return p;
    }

    function doPreview() {
      if(previewPane.style.display == "block") {
        previewPane.style.display = "none";
      } else {
        var txt = document.getElementById("comment_textarea").value;
        previewPane.innerHTML = previewParse(txt);
        previewPane.style.display = "block";
        positionatePreviewPane();
      }
    }

    function positionatePreviewPane() {
      var textarea = document.getElementById("comment_textarea");
      var pos = documentPosition(textarea, document);
      previewPane.style.width = textarea.offsetWidth - 10 + "px";
      previewPane.style.top = pos.y + textarea.offsetHeight + 35 + "px";
      previewPane.style.left = pos.x + "px";
    }
    
  function previewParse(aText) {
    aText = aText.replace(/^\s+|\s+$/g, "");
    if(/^lol$|^лол$/i.test(aText)) {
      aText = "Пару дней назад я познакомился с мальчиком и с тех пор постоянно думаю о нем. У него невероятно красивые голубые глаза, темные волосы, и огромный, толстый член, которые еле помещается в мою за... Черт, по–моему не туда пишу...";
      return aText;
    }
    aText = aText.replace(/ {2,}/g, " ");
    aText = aText.replace(/^- +/g, "— ");// —&mdash;
    aText = aText.replace(/ +-{1,2} +/g, " — ");// —&mdash;
    aText = aText.replace(/<irony>/ig, "<span class='irony'>");
    aText = aText.replace(/<\/irony>/ig, "</span>");
    aText = aText.replace(/[\f\n\r]/g, "<br />");
    aText = aText.replace(/\.{3,}/g, "&#133;");
    aText = aText.replace(/!\s+!/g, "!!");
    aText = aText.replace(/!{15,}/g, "! я идиот! убейте меня, кто–нибудь!");
    aText = aText.replace(/[=%]\)+/g, ":)");
    aText = aText.replace(/[=%]\(+/g, ":(");
    aText = aText.replace(/\([cс]\)/ig, '&copy;');
    aText = aText.replace(/\(tm\)/ig, '&#153;');
    aText = aText.replace(/\(r\)/ig, '&#174;');
    aText = parseLinks(aText);
    aText = aText.replace(/<ninja>/ig, "<img height='15' width='15' border='0' src='http://img.dirty.ru/pics/ninja.gif'/>");
    aText = aText.replace(/<jarost>/ig, "<img height='50' width='50' border='0' src='http://img.dirty.ru/lepro/panda.gif'/>");

    return aText;
  }

  function parseLinks(aText) {
    //aText = aText.replace(/ricn.ru/ig, "goatse.cx");
    return aText;
  }

  function documentPosition(aElement, aDocument) {
    var pos = { x: 0, y: 0 };
    while(aElement != null && aElement != aDocument.body) {
      try {
        pos.x += aElement.offsetLeft;
        pos.y += aElement.offsetTop;
        aElement = aElement.offsetParent;
      } catch(e) {
        // do nothing
      }
    }
    return pos;
  }

}
wrapper();