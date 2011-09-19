$(function () {
    $("#tabs").tabs();
    $("#slider").slider({
        value: 5,
        min: 1,
        max: 60,
        step: 1,
        slide: function (event, ui) {
            $("#interval").val(ui.value);
        }
    });
    $("#amount").val("$" + $("#slider").slider("value"));

    $("#showPanel").change(function () {
        if ($("#showPanel").is(':checked'))
            $("#showWelcome").removeAttr("disabled");
        else
            $("#showWelcome").attr("disabled", "disabled");
    });

    $(".affects-interval").change(function () {
        if (!$("#checkKarma").is(':checked') && !$("#checkStuff").is(':checked')) {
            $("#interval").attr("disabled", "disabled");
            $("#slider").slider("disable");
        }
        else {
            $("#interval").removeAttr("disabled");
            $("#slider").slider("enable");
        }
    });

    $("#cancel").click(function () {
        self.port.emit("close");
    });

    $("#save").click(function () {
        var scripts = {};
        $("#list-container :input:checkbox").each(function(index) {
            scripts[$(this).attr("id")] = $(this).is(":checked");
        });
        var settings = {
            showPanel: $("#showPanel").is(':checked'),
            showWelcome: $("#showWelcome").is(':checked'),
            checkKarma: $("#checkKarma").is(':checked'),
            checkStuff: $("#checkStuff").is(':checked'),
            interval: $("#interval").val(),
            scripts: scripts
        };
        self.port.emit("save", settings);
    });
});

self.port.on("loadSettings", function (settings) {
    if (settings.showPanel)
        $("#showPanel").attr("checked", "checked")
    else
        $("#showPanel").removeAttr("checked");
    if (settings.showWelcome)
        $("#showWelcome").attr("checked", "checked")
    else
        $("#showWelcome").removeAttr("checked");
    if (settings.checkKarma)
        $("#checkKarma").attr("checked", "checked")
    else
        $("#checkKarma").removeAttr("checked");
    if (settings.checkStuff)
        $("#checkStuff").attr("checked", "checked")
    else
        $("#checkStuff").removeAttr("checked");
    $("#interval").val(settings.interval);
    $("#slider").slider({ value: settings.interval });
});

self.port.on("loadUserscripts", function (userscripts) {
    var list = $("<ul>").addClass("scripts");
    userscripts.forEach(function (script) {
        list.append($("<li>")
            .append($("<input>")
                .attr({ type: "checkbox", id: script.id, checked: script.enabled })
            )
            .append($("<label>")
                .text(script.name)
                .attr({ for:  script.id})
            )
        );
    });
    $("#list-container").empty();
    $("#list-container").append(list);
});

$(window).click(function (event) {
    var t = event.target;
    if (t.nodeName != "A") return;
    event.stopPropagation();
    event.preventDefault();
    self.port.emit("goto", t.toString());
});