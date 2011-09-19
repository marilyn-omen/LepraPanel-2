self.port.on("setData", function (info) {
    if (info.rating && info.ratingDir) {
        $("#rating").text(info.rating);
        if (info.ratingDir < 0)
            $("#rating-image").attr("src", "images/bullet_minus.png");
        else
            $("#rating-image").attr("src", "images/bullet_plus.png");
    }
    self.port.emit("widthChanged", $("#rating").width() + 20);
});

self.port.on("show", function () {
    $("#container").show();
    self.port.emit("widthChanged", $("#rating").width() + 20);
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