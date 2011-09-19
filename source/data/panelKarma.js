$("#oldAttWrapper").hide();

self.port.on("setData", function (info) {
    $("#login").text(info.login);
    $("#login").attr("href", "http://leprosorium.ru/users/" + info.login + "/");
    $("#newAtt").text(info.newAtt);
    if (info.newAtt.indexOf("+") === 0)
        $("#newAtt").attr("class", "pos")
    else if (info.newAtt.indexOf("-") === 0)
        $("#newAtt").attr("class", "neg")
    else
        $("#newAtt").attr("class", "");
    if (info.oldAtt) {
        $("#oldAtt").text(info.oldAtt);
        $("#oldAttWrapper").show();
        if (info.oldAtt.indexOf("+") === 0)
            $("#oldAtt").attr("class", "pos")
        else if (info.oldAtt.indexOf("-") === 0)
            $("#oldAtt").attr("class", "neg")
        else
            $("#oldAtt").attr("class", "");
    } else {
        $("#oldAttWrapper").hide();
    }
});

$(window).click(function (event) {
    var t = event.target;
    if (t.nodeName != "A") return;
    event.stopPropagation();
    event.preventDefault();
    self.port.emit("goto", t.toString());
});