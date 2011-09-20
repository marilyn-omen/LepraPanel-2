var {Cc, Ci, Cu} = require("chrome");
const data = require("self").data;
const widget = require("widget");
const panel = require("panel");
const timer = require("timer");
const request = require("request").Request;
const storage = require("simple-storage").storage;
const tabs = require("tabs");
const observer = require("observer-service");
const pagemod = require("page-mod");
var userscripts = require("userscripts");
var mods = {};
var { MatchPattern } = require("match-pattern");
var mediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
var addonManager = Cu.import("resource://gre/modules/AddonManager.jsm").AddonManager;

const apiURL = "http://leprosorium.ru/api/lepropanel";
//const apiURL = "http://lepra.sltv.org.ua/files/testapi.htm";

var isLoggedIn = false;
var widgetKarma;
var panelKarma;
var widgetRating;
var panelRating;
var widgetStuff;
var widgetInbox;
var panelData;
var panelSettings;
var requestTimeout;

// main menu used items
var itemHome;
var itemLogin;
var itemStuff;
var itemInbox;
var itemFavs;
var itemProfile;
var itemRefresh;
var menuOther;
var menuExt;
var separatorHome;
var separatorFavs;
var separatorProfile;
var separatorOther;

function initStorage() {
    console.log("init()");
    if(!storage.settings)
        initSettings();
    if(!storage.user)
        initUser();
    initObservers();
}

function initSettings() {
    console.log("initSettings()");
    storage.settings = {
        interval: 5,
        showPanel: true,
        showWelcome: true,
        checkKarma: true,
        checkStuff: true,
        userscripts: {}
    };
}

function initUser() {
    console.log("initUser()");
    storage.user = {
        current: -1,
        "-1": {
            id: -1,
            login: "dummy login",
            karma: 0,
            rating: 0,
            karmaDir: 1,
            ratingDir: 1,
            karmavotes: [],
            lastKarmaChange: {
                login: "",
                newAtt: 0,
                oldAtt: 0
            }
        }
    };
}

function initObservers() {
    console.log("initObservers()");
    observer.add(
        "cookie-changed",
        function onCookieChanged(subject, data) {
            if(subject) {
                subject.QueryInterface(Ci.nsICookie);
                if(subject.name == "lepro.uid") {
                    if(subject.value && subject.value != "") {
                        if(storage.user.current != subject.value) {
                            storage.user.current = subject.value;
                            ensureUserId(storage.user.current);
                            onUserLoggedIn();
                        }
                    }
                    else if(storage.user.current != "-1") {
                        storage.user.current = "-1";
                        onUserLoggedOut();
                    }
                }
            }
        }
    );
}

function saveScriptsSettings(scripts) {
    // 'scripts' here is not like global 'userscripts' (it's object, not array)
    // it contains minimal needed info: string key (id) & bool value (enabled)
    for(var key in scripts) {
        storage.settings.userscripts[key] = !!scripts[key];
    };
    loadScriptsSettings();
    initUserscripts();
}

function loadScriptsSettings() {
    userscripts.userscripts.forEach(function(script) {
        script.enabled = !!storage.settings.userscripts[script.id];
    });
}

function ensureUserId(id) {
    if(!storage.user[id]) {
        console.log("creating user #" + id);
        storage.user[id] = {
            id: id,
            login: "",
            karma: 0,
            rating: 0,
            karmaDir: 1,
            ratingDir: 1,
            karmavotes: [],
            lastKarmaChange: {
                login: "",
                newAtt: 0,
                oldAtt: 0
            }
        }
    }
}

function onUserLoggedIn() {
    console.log("onUserLoggedIn()");
    console.log("  user.id = ", storage.user.current);
    isLoggedIn = true;
    loadUserInfo();
    widgetKarma.port.emit("show");
    widgetRating.port.emit("show");
    widgetStuff.port.emit("show");
    widgetInbox.port.emit("show");
    applyMenu();
    setSavedData();
    initUserscripts();
    getDataRatingContinuous();
}

function onUserLoggedOut() {
    console.log("onUserLoggedOut()");
    isLoggedIn = false;
    timer.clearTimeout(requestTimeout);
    initUserscripts();
    widgetKarma.port.emit("hide");
    widgetRating.port.emit("hide");
    widgetStuff.port.emit("hide");
    widgetInbox.port.emit("hide");
    applyMenu();
}

function loadUserInfo() {
    request({
        url: apiURL + "/" + storage.user.current,
        headers: {
            "User-Agent": "LepraPanel/2.0"
        },
        onComplete: function (response) {
            processUserResponseInfo(response.json);
        }
    }).get();
}

function processUserResponseInfo(info) {
    if(info == null) {
        storage.user[storage.user.current].login = storage.user.current;
    } else {
        storage.user[storage.user.current].login = info.login;
    }
    applyUserInfo();
}

function applyUserInfo() {
    if(storage.user[storage.user.current].login != storage.user.current) {
        itemFavs.setAttribute("data-option", "http://leprosorium.ru/users/" + storage.user[storage.user.current].login + "/favs/");
        itemFavs.setAttribute("disabled", false);
        itemProfile.setAttribute("data-option", "http://leprosorium.ru/users/" + storage.user[storage.user.current].login + "/");
        itemProfile.setAttribute("disabled", false);
    } else {
        itemFavs.setAttribute("disabled", true);
        itemProfile.setAttribute("disabled", true);
    }
}

function applyMenu() {
    itemHome.setAttribute("hidden", !isLoggedIn);
    itemLogin.setAttribute("hidden", isLoggedIn);
    itemStuff.setAttribute("hidden", !isLoggedIn);
    itemInbox.setAttribute("hidden", !isLoggedIn);
    itemFavs.setAttribute("hidden", !isLoggedIn);
    itemProfile.setAttribute("hidden", !isLoggedIn);
    itemRefresh.setAttribute("hidden", !isLoggedIn);
    menuOther.setAttribute("hidden", !isLoggedIn);
    menuExt.setAttribute("hidden", !isLoggedIn);
    separatorHome.setAttribute("hidden", !isLoggedIn);
    separatorFavs.setAttribute("hidden", !isLoggedIn);
    separatorProfile.setAttribute("hidden", !isLoggedIn);
    separatorOther.setAttribute("hidden", !isLoggedIn);
}

function getDataRatingContinuous() {
    console.log("getDataRatingContinuous()");
    request({
        url: apiURL,
        headers: {
            "User-Agent": "LepraPanel/2.0"
        },
        onComplete: function (response) {
            var info = response.json;
            if(info == null) {
                onUserLoggedOut();
            } else {
                processResponseInfo(info);
            }
            var interval = storage.settings.interval * 60 * 1000;
            if(interval < 60000)
                interval = 60000;
            requestTimeout = timer.setTimeout(getDataRatingContinuous, interval);
        }
    }).get();
}

function processResponseInfo(info) {
    console.log("processResponseInfo()");
    var karma = storage.user[storage.user.current].karma;
    var rating = storage.user[storage.user.current].rating;
    if(info.karma && info.karma != storage.user[storage.user.current].karma) {
        processKarmaVotes(info.karmavotes);
        karma = parseInt(info.karma);
        if(karma < storage.user[storage.user.current].karma)
            storage.user[storage.user.current].karmaDir = -1;
        else if(karma > storage.user[storage.user.current].karma)
            storage.user[storage.user.current].karmaDir = 1;
    }
    if(info.rating && info.rating != storage.user[storage.user.current].rating) {
        rating = parseInt(info.rating);
        if(rating < storage.user[storage.user.current].rating)
            storage.user[storage.user.current].ratingDir = -1;
        else if(rating > storage.user[storage.user.current].rating)
            storage.user[storage.user.current].ratingDir = 1;
    }
    console.log("  karma: prev = " + storage.user[storage.user.current].karma + ", now = " + karma + ", dir = " + storage.user[storage.user.current].karmaDir);
    console.log("  rating: prev = " + storage.user[storage.user.current].rating + ", now = " + rating + ", dir = " + storage.user[storage.user.current].ratingDir);
    storage.user[storage.user.current].karma = karma;
    storage.user[storage.user.current].rating = rating;
    // TODO: check if stuff/inbox check is enabled
    var my = "";
    if(info.myunreadposts && info.myunreadposts != "" && info.myunreadposts != "0")
        my = info.myunreadposts;
    if(info.myunreadcomms && info.myunreadcomms != "" && info.myunreadcomms != "0") {
        if(my != "") my += "/";
        my += info.myunreadcomms;
    }
    var inb = "";
    if(info.inboxunreadposts && info.inboxunreadposts != "" && info.inboxunreadposts != "0") {
        inb = info.inboxunreadposts;
    }
    if(info.inboxunreadcomms && info.inboxunreadcomms != "" && info.inboxunreadcomms != "0") {
        if(inb != "") inb += "/";
        inb += info.inboxunreadcomms;
    }
    console.log("  stuff = " + my);
    console.log("  inbox = " + inb);
    widgetKarma.port.emit("setData", {
        karma: karma,
        karmaDir: storage.user[storage.user.current].karmaDir
    });
    widgetRating.port.emit("setData", {
        rating: rating,
        ratingDir: storage.user[storage.user.current].ratingDir
    });
    widgetStuff.port.emit("setData", {
        stuff: my
    });
    widgetInbox.port.emit("setData", {
        inbox: inb
    });
}

function processKarmaVotes(aKarmaVotes) {
    var login = "";
    var newAtt = "";
    var oldAtt = "";
    var oldKarmaVotes = storage.user[storage.user.current].karmavotes;
    if(aKarmaVotes.length > oldKarmaVotes.length) { // new voter here, or old one returned
        for(var i = aKarmaVotes.length - 1; i >= 0; i--) {
            var vote = aKarmaVotes[i];
            var found = false;
            for(var j = oldKarmaVotes.length - 1; j >= 0; j--) {
                if(oldKarmaVotes[j].uid == vote.uid) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                login = vote.login;
                newAtt = vote.attitude > 0 ? "+" + vote.attitude : vote.attitude;
                break;
            }
        }
    } else if(aKarmaVotes.length < oldKarmaVotes.length) { // somebody changed his attitude to 0
        for(var i = oldKarmaVotes.length - 1; i >=0; i--) {
            var vote = oldKarmaVotes[i];
            var found = false;
            for(var j = aKarmaVotes.length - 1; j >= 0; j--) {
                if(aKarmaVotes[j].uid == vote.uid) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                login = vote.login;
                newAtt = "0";
                oldAtt = vote.attitude > 0 ? "+" + vote.attitude : vote.attitude;
                break;
            }
        }
    } else { // somebody changed his attitude (not to 0)
        for(var i = aKarmaVotes.length - 1; i >= 0; i--) {
            if(aKarmaVotes[i].attitude != oldKarmaVotes[i].attitude) {
                login = aKarmaVotes[i].login;
                newAtt = aKarmaVotes[i].attitude > 0 ? "+" + aKarmaVotes[i].attitude : aKarmaVotes[i].attitude;
                oldAtt = oldKarmaVotes[i].attitude > 0 ? "+" + oldKarmaVotes[i].attitude : oldKarmaVotes[i].attitude;
                break;
            }
        }
    }
    if(login != "") {
        panelKarma.port.emit("setData", {
            login: login,
            newAtt: newAtt,
            oldAtt: oldAtt
        });
        storage.user[storage.user.current].lastKarmaChange.login = login;
        storage.user[storage.user.current].lastKarmaChange.newAtt = newAtt;
        storage.user[storage.user.current].lastKarmaChange.oldAtt = oldAtt;
    }
    storage.user[storage.user.current].karmavotes = aKarmaVotes;
}

function createKarmaPanel() {
    panelKarma = panel.Panel({
        contentURL: data.url("panelKarma.htm"),
        contentScriptFile: [
            data.url("js/jquery-1.5.1.js"),
            data.url("panelKarma.js")
        ],
        width: 250,
        height: 50
    });
    panelKarma.port.on(
        "goto",
        function(url) {
            tabs.open({
                url: url
            });
        }
    );
}

function createRatingPanel() {
    panelRating = panel.Panel({
        contentURL: data.url("panelRating.htm"),
        contentScriptFile: [
            data.url("js/jquery-1.5.1.js"),
            data.url("panelRating.js")
        ],
        width: 400,
        height: 300
    });
    panelRating.port.on(
        "goto",
        function(url) {
            tabs.open({
                url: url
            });
        }
    );
}

function createSettingsPanel() {
    panelSettings = panel.Panel({
        width: 300,
        height: 400,
        contentURL: data.url("panelSettings.htm"),
        contentScriptFile: [
            data.url("js/jquery-1.5.1.js"),
            data.url("js/jquery-ui-1.8.14.js"),
            data.url("panelSettings.js")
        ]
    });
    panelSettings.port.on(
        "goto",
        function(url) {
            tabs.open({
                url: url
            });
        }
    );
    panelSettings.port.on(
        "close",
        function() {
            panelSettings.hide();
        }
    );
    panelSettings.port.on(
        "save",
        function(settings) {
            panelSettings.hide();
            storage.settings.showPanel = settings.showPanel;
            storage.settings.showWelcome = settings.showWelcome;
            storage.settings.checkKarma = settings.checkKarma;
            storage.settings.checkStuff = settings.checkStuff;
            storage.settings.interval = settings.interval;
            saveScriptsSettings(settings.scripts);
        }
    );
}

function createKarmaWidget() {
    widgetKarma = widget.Widget({
        id: "widgetKarma",
        label: "Карма",
        width: 0,
        contentURL: data.url("widgetKarma.htm"),
        contentScriptWhen: "ready",
        contentScriptFile: [
            data.url("js/jquery-1.5.1.js"),
            data.url("widgetKarma.js")
        ],
        panel: panelKarma
    });
    widgetKarma.port.on(
        "widthChanged",
        function(width) {
            widgetKarma.width = width;
        }
    );
    widgetKarma.port.on(
        "goto",
        function(url) {
            tabs.open({
                url: url
            });
        }
    );
}

function createRatingWidget() {
    widgetRating = widget.Widget({
        id: "widgetRating",
        label: "Рейтинг",
        width: 0,
        contentURL: data.url("widgetRating.htm"),
        contentScriptWhen: "ready",
        contentScriptFile: [
            data.url("js/jquery-1.5.1.js"),
            data.url("widgetRating.js")
        ]
    });
    widgetRating.port.on(
        "widthChanged",
        function(width) {
            widgetRating.width = width;
        }
    );
    widgetRating.port.on(
        "goto",
        function(url) {
            tabs.open({
                url: url
            });
        }
    );
}

function createStuffWidget() {
    widgetStuff = widget.Widget({
        id: "widgetStuff",
        label: "Мои вещи",
        width: 0,
        contentURL: data.url("widgetStuff.htm"),
        contentScriptWhen: "ready",
        contentScriptFile: [
            data.url("js/jquery-1.5.1.js"),
            data.url("widgetStuff.js")
        ]
    });
    widgetStuff.port.on(
        "widthChanged",
        function(width) {
            widgetStuff.width = width;
        }
    );
    widgetStuff.port.on(
        "goto",
        function(url) {
            tabs.open({
                url: url
            });
        }
    );
}

function createInboxWidget() {
    widgetInbox = widget.Widget({
        id: "widgetInbox",
        label: "Инбокс",
        width: 0,
        contentURL: data.url("widgetInbox.htm"),
        contentScriptWhen: "ready",
        contentScriptFile: [
            data.url("js/jquery-1.5.1.js"),
            data.url("widgetInbox.js")
        ]
    });
    widgetInbox.port.on(
        "widthChanged",
        function(width) {
            widgetInbox.width = width;
        }
    );
    widgetInbox.port.on(
        "goto",
        function(url) {
            tabs.open({
                url: url
            });
        }
    );
}

function initPanels() {
    createKarmaPanel();
    createRatingPanel();
    createSettingsPanel();
}

function initWidgets(doc) {
    createKarmaWidget();
    createRatingWidget();
    createStuffWidget();
    createInboxWidget();

    // fix widgets toolbaritem width
    var addonBar = doc.getElementById("addon-bar");
    if (!addonBar) return;
    for(var i = 0; i < addonBar.children.length; i++) {
        if(addonBar.children[i].id && addonBar.children[i].id.indexOf("widget:panel2@leprosorium.ru") != -1) {
            addonBar.children[i].setAttribute("width", 0);
            addonBar.children[i].setAttribute("style", addonBar.children[i].getAttribute("style") + ";margin:0;");
        }
    }
}

function startupCheckAuthorization() {
    console.log("startupCheckAuthorization()");
    storage.user.current = "-1";
    var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    var uri = ios.newURI("http://leprosorium.ru/", null, null);
    var cookieSvc = Cc["@mozilla.org/cookieService;1"].getService(Ci.nsICookieService);
    var cookie = cookieSvc.getCookieString(uri, null);
    if(cookie) {
        var m = cookie.match(/lepro\.uid=([0-9]+)/);
        if(m && m[1]) {
            storage.user.current = m[1];
            ensureUserId(storage.user.current);
            onUserLoggedIn();
            return;
        }
    }
    onUserLoggedOut();
};

function initUserscripts() {
    if(!isLoggedIn) {
        if(mods)
            for(var id in mods) {
                console.log("  destroying pagemod for: " + id);
                mods[id].destroy();
                mods[id] = null;
            }
        return;
    }
    console.log("Loading userscripts:");
    // load common js
    if(mods["common"]) {
      console.log("  destroying pagemod for: common");
      mods["common"].destroy();
      mods["common"] = null;
    }    
    console.log("  common");
    mods["common"] = pagemod.PageMod({
      include: /http:\/\/([a-zA-Z0-9]+\.)?leprosorium\.ru.*/,
      contentScriptWhen: "ready",
      contentScriptFile: [data.url("userscripts/common.js")],
      onAttach: function onAttach(worker) {
        console.log("  attached script: common");
      }
    });
    
    userscripts.userscripts.forEach(function(script) {
        if(mods[script.id]) {
            console.log("  destroying pagemod for: " + script.id);
            mods[script.id].destroy();
            mods[script.id] = null;
        }
        if(script.enabled) {
            console.log("  " + script.id);
            mods[script.id] = pagemod.PageMod({
                include: script.include,
                contentScriptWhen: "ready",
                contentScriptFile: [data.url("userscripts/" + script.filename)],
                onAttach: function onAttach(worker) {
                    console.log("  attached script: " + script.id);
                }
            });
        }
    });
}

function initToolbarButton(doc) {
    var addonBar = doc.getElementById("addon-bar");
    if (!addonBar) return;

    var toolbarbutton = doc.createElement("toolbarbutton"); 	
    toolbarbutton.id = 'leprapanel2-toolbarbutton';
    toolbarbutton.setAttribute('type', 'menu');
    toolbarbutton.setAttribute('class', 'toolbarbutton-1');
    toolbarbutton.setAttribute('image', data.url('images/lepra.png'));
    toolbarbutton.setAttribute('orient', 'horizontal');
    toolbarbutton.setAttribute('label', 'LepraPanel');
    toolbarbutton.appendChild(createMenuPopup(doc));
    var tbItem = doc.createElement("toolbaritem");
    tbItem.setAttribute("id", "leprapanel2-tb-btn-item");
    tbItem.setAttribute("label", "LepraPanel");
    tbItem.setAttribute("tooltiptext", "LepraPanel");
    tbItem.setAttribute("removable", true);
    tbItem.appendChild(toolbarbutton);
    addonBar.appendChild(tbItem);
        
    toolbarbutton.addEventListener("mousedown", function(e) {
        var target = e.target;
            var action = target.getAttribute("data-option");
            if(!action) return;
            switch(action) {
                case "settings":
                    panelSettings.show();
                    panelSettings.port.emit("loadSettings", storage.settings);
                    panelSettings.port.emit("loadUserscripts", userscripts.userscripts);
                    break;
                case "refresh":
                    timer.clearTimeout(requestTimeout);
                    getDataRatingContinuous();
                    break;
                default:
                    tabs.open({ url: action });
            }
    }, false);

    addonManager.addAddonListener({
        onDisabled: function(addon) {
            if (addon.id === "panel2@leprosorium.ru") {
                removeOddElements(doc);
            }
        }
    });
}

function removeOddElements(doc) {
    var addonBar = doc.getElementById("addon-bar");
    if (!addonBar) return;
    var btnItem = doc.getElementById("leprapanel2-tb-btn-item");
    if(btnItem) {
        addonBar.removeChild(btnItem);
    }
}

function createMenuPopup(doc) {
    var menupopup = doc.createElement("menupopup");
    var menupopupOther = doc.createElement("menupopup");
    var menupopupExt = doc.createElement("menupopup");
    menuOther = doc.createElement("menu");
    menuOther.setAttribute("label", "Другие места");
    menuOther.appendChild(menupopupOther);
    menuExt = doc.createElement("menu");
    menuExt.setAttribute("label", "Внешние ресурсы");
    menuExt.appendChild(menupopupExt);
    
    separatorHome = doc.createElement("menuseparator");
    separatorFavs = doc.createElement("menuseparator");
    separatorProfile = doc.createElement("menuseparator");
    separatorOther = doc.createElement("menuseparator");
    
    itemHome = doc.createElement("menuitem");
    itemHome.setAttribute("label", "Глагне");
    itemHome.setAttribute("data-option", "http://leprosorium.ru");
    itemHome.setAttribute("class", "menuitem-iconic");
    itemHome.setAttribute("image", data.url("images/lepra.png"));

    itemLogin = doc.createElement("menuitem");
    itemLogin.setAttribute("label", "Стучите, и отворят вам");
    itemLogin.setAttribute("data-option", "http://leprosorium.ru/login/");
    itemLogin.setAttribute("class", "menuitem-iconic");
    itemLogin.setAttribute("image", data.url("images/lepra.png"));
    
    itemStuff = doc.createElement("menuitem");
    itemStuff.setAttribute("label", "Мои вещи");
    itemStuff.setAttribute("data-option", "http://leprosorium.ru/my");
    itemStuff.setAttribute("class", "menuitem-iconic");
    itemStuff.setAttribute("image", data.url("images/stuff.png"));

    itemInbox = doc.createElement("menuitem");
    itemInbox.setAttribute("label", "Инбокс");
    itemInbox.setAttribute("data-option", "http://leprosorium.ru/my/inbox");
    itemInbox.setAttribute("class", "menuitem-iconic");
    itemInbox.setAttribute("image", data.url("images/inbox.png"));

    itemFavs = doc.createElement("menuitem");
    itemFavs.setAttribute("label", "Избранное");
    itemFavs.setAttribute("data-option", "http://leprosorium.ru/users/%username%/favs/");
    itemFavs.setAttribute("class", "menuitem-iconic");
    itemFavs.setAttribute("disabled", true);
    itemFavs.setAttribute("image", data.url("images/favourites.png"));

    itemProfile = doc.createElement("menuitem");
    itemProfile.setAttribute("label", "Профайл");
    itemProfile.setAttribute("data-option", "http://leprosorium.ru/users/%username%/");
    itemProfile.setAttribute("class", "menuitem-iconic");
    itemProfile.setAttribute("disabled", true);
    itemProfile.setAttribute("image", data.url("images/user.png"));

    var itemPost = doc.createElement("menuitem");
    itemPost.setAttribute("label", "Написать пост");
    itemPost.setAttribute("data-option", "http://leprosorium.ru/asylum");
    
    var itemSearch = doc.createElement("menuitem");
    itemSearch.setAttribute("label", "Супер поиск");
    itemSearch.setAttribute("data-option", "http://search.leprosorium.ru");

    var itemPedius = doc.createElement("menuitem");
    itemPedius.setAttribute("label", "Лепропедиус");
    itemPedius.setAttribute("data-option", "http://maksimus.leprosorium.ru");

    var itemWhite = doc.createElement("menuitem");
    itemWhite.setAttribute("label", "Белый дом");
    itemWhite.setAttribute("data-option", "http://leprosorium.ru/democracy");

    var itemElect = doc.createElement("menuitem");
    itemElect.setAttribute("label", "Выборы ПГ");
    itemElect.setAttribute("data-option", "http://leprosorium.ru/elections/president");

    var itemOld = doc.createElement("menuitem");
    itemOld.setAttribute("label", "Старый Лепрозорий");
    itemOld.setAttribute("data-option", "http://old.leprosorium.com");

    var itemSearch2 = doc.createElement("menuitem");
    itemSearch2.setAttribute("label", "Лепросёрч.ру");
    itemSearch2.setAttribute("data-option", "http://leprosearch.ru");

    var itemImgStuff = doc.createElement("menuitem");
    itemImgStuff.setAttribute("label", "Leprastuff - хостинг картинок");
    itemImgStuff.setAttribute("data-option", "http://leprastuff.ru");

    var itemImg = doc.createElement("menuitem");
    itemImg.setAttribute("label", "Скучный хостинг для веселых картинок");
    itemImg.setAttribute("data-option", "http://img.leprosorium.com");

    var itemKoll = doc.createElement("menuitem");
    itemKoll.setAttribute("label", "Маленький Лепро–Коллайдер");
    itemKoll.setAttribute("data-option", "http://lepra.oidigu.ru");

    var itemUisky = doc.createElement("menuitem");
    itemUisky.setAttribute("label", "Уйские игрушки");
    itemUisky.setAttribute("data-option", "http://romakhin.ru/lepra");

    var itemEblo = doc.createElement("menuitem");
    itemEblo.setAttribute("label", "Еблозорий");
    itemEblo.setAttribute("data-option", "http://faces.leprosorium.com");

    var itemTorrent = doc.createElement("menuitem");
    itemTorrent.setAttribute("label", "ЛепроТоррент");
    itemTorrent.setAttribute("data-option", "http://leproshara.ru");

    itemRefresh = doc.createElement("menuitem");
    itemRefresh.setAttribute("label", "Обновить данные");
    itemRefresh.setAttribute("data-option", "refresh");
    itemRefresh.setAttribute("class", "menuitem-iconic");
    itemRefresh.setAttribute("image", data.url("images/reload.png"));

    var itemSettings = doc.createElement("menuitem");
    itemSettings.setAttribute("data-option", "settings");
    itemSettings.setAttribute("label", "Настройки");
    itemSettings.setAttribute("class", "menuitem-iconic");
    itemSettings.setAttribute('image', data.url('images/settings.png'));

    menupopup.appendChild(itemHome);
    menupopup.appendChild(itemLogin);
    menupopup.appendChild(separatorHome);
    menupopup.appendChild(itemStuff);
    menupopup.appendChild(itemInbox);
    menupopup.appendChild(itemFavs);
    menupopup.appendChild(separatorFavs);
    menupopup.appendChild(itemProfile);
    menupopup.appendChild(separatorProfile);
    menupopup.appendChild(menuOther);
    menupopup.appendChild(separatorOther);
    menupopup.appendChild(menuExt);
    menupopupOther.appendChild(itemPost);
    menupopupOther.appendChild(doc.createElement("menuseparator"));
    menupopupOther.appendChild(itemSearch);
    menupopupOther.appendChild(itemPedius);
    menupopupOther.appendChild(doc.createElement("menuseparator"));
    menupopupOther.appendChild(itemWhite);
    menupopupOther.appendChild(itemElect);
    menupopupExt.appendChild(itemOld);
    menupopupExt.appendChild(doc.createElement("menuseparator"));
    menupopupExt.appendChild(itemSearch2);
    menupopupExt.appendChild(doc.createElement("menuseparator"));
    menupopupExt.appendChild(itemImgStuff);
    menupopupExt.appendChild(itemImg);
    menupopupExt.appendChild(doc.createElement("menuseparator"));
    menupopupExt.appendChild(itemKoll);
    menupopupExt.appendChild(itemUisky);
    menupopupExt.appendChild(itemEblo);
    menupopupExt.appendChild(itemTorrent);
    menupopup.appendChild(doc.createElement("menuseparator"));
    menupopup.appendChild(itemRefresh);
    menupopup.appendChild(itemSettings);
    
    return menupopup;
}

function setSavedData() {
    widgetKarma.port.emit("setData", {
        karma: storage.user[storage.user.current].karma,
        karmaDir: storage.user[storage.user.current].karmaDir
    });
    widgetRating.port.emit("setData", {
        rating: storage.user[storage.user.current].rating,
        ratingDir: storage.user[storage.user.current].ratingDir
    });
    if(storage.user[storage.user.current].lastKarmaChange.login != "") {
        panelKarma.port.emit("setData", {
            login: storage.user[storage.user.current].lastKarmaChange.login,
            newAtt: storage.user[storage.user.current].lastKarmaChange.newAtt,
            oldAtt: storage.user[storage.user.current].lastKarmaChange.oldAtt
        });
    }
}

exports.main = function() {
    var doc = mediator.getMostRecentWindow("navigator:browser").document;
    initStorage();
    initToolbarButton(doc);
    initPanels();
    initWidgets(doc);
    loadScriptsSettings();
    initUserscripts();
    startupCheckAuthorization();
}