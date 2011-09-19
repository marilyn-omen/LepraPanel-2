self.port.on("setData", function (info) {
    if (info.karma && info.karmaDir) {
        $("#karma").text(info.karma);
        if (info.karmaDir < 0)
            $("#karma-image").attr("src", "images/bullet_minus.png");
        else
            $("#karma-image").attr("src", "images/bullet_plus.png");
    }
    self.port.emit("widthChanged", $("#karma").width() + 16);
});

self.port.on("show", function () {
    $("#container").show();
    self.port.emit("widthChanged", $("#karma").width() + 16);
});

self.port.on("hide", function () {
    $("#container").hide();
    self.port.emit("widthChanged", 0);
});

$(window).click(function (event) {
    event.stopPropagation();
    event.preventDefault();
    var t = event.target;
    if (t.nodeName == "IMG") {
        if(t.title)
            self.port.emit("goto", t.title);
    }
});