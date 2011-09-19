self.port.on("setData", function (info) {
    $("#inbox").text(info.inbox);
    if (info.inbox)
        $("#inbox-image").attr("src", "images/inbox_new.png");
    else
        $("#inbox-image").attr("src", "images/inbox.png");
    var width = $("#inbox").width() + 20;
    if (width > 20) width += 5;
    self.port.emit("widthChanged", width);
});

self.port.on("show", function () {
    $("#container").show();
    var width = $("#inbox").width() + 20;
    if (width > 20) width += 5;
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