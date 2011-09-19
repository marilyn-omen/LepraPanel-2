self.port.on("setData", function (info) {
    $("#stuff").text(info.stuff);
    if (info.stuff)
        $("#stuff-image").attr("src", "images/stuff_new.png");
    else
        $("#stuff-image").attr("src", "images/stuff.png");
    var width = $("#stuff").width() + 20;
    if(width > 20) width += 5;
    self.port.emit("widthChanged", width);
});

self.port.on("show", function () {
    $("#container").show();
    var width = $("#stuff").width() + 20;
    if(width > 20) width += 5;
    self.port.emit("widthChanged", width);
});

self.port.on("hide", function () {
    $("#container").hide();
    self.port.emit("widthChanged", 0);
});

$(window).click(function (event) {
    event.stopPropagation();
    event.preventDefault();
    var t = event.target;
    if (t.nodeName == "IMG" && t.title)
        self.port.emit("goto", t.title);
});