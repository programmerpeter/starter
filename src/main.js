/*
 This file is part of LVL UP Starter. LVL UP Starter is free software: you can
 redistribute it and/or modify it under the terms of the GNU General Public
 License as published by the Free Software Foundation, version 2.
 
 This program is distributed in the hope that it will be useful, but WITHOUT
 ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 details.
 
 You should have received a copy of the GNU General Public License along with
 this program; if not, write to the Free Software Foundation, Inc., 51
 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 
 Copyright (C) 2015 Michał Frąckiewicz
 */
var launcherVersion = 100;
ga_storage._setAccount(atob("VUEtNDcyODQwODEtNQ=="));
ga_storage._trackPageview("/" + os.platform() + "/" + launcherVersion + '/home/');
var mc_path = process.cwd() + path.sep + "mc";
var profileFile = process.cwd() + path.sep + "profile.json";
var settingsFile = process.cwd() + path.sep + "settings.json";
var gui = require('nw.gui');
var settings = [];

var cmdUsername = "lvlup.pro";
var cmdAccessToken = "offline";
var cmdSession = "offline";
var cmdUuid = "offline";

//real browser
$('a[target=_blank]').on('click', function () {
    require('nw.gui').Shell.openExternal(this.href);
    return false;
});

//feedback button
var h = document.getElementsByTagName('head')[0];
(function () {
    var fc = document.createElement('link');
    fc.type = 'text/css';
    fc.rel = 'stylesheet';
    fc.href = 'https://product.feedbacklite.com/feedbacklite.css';
    h.appendChild(fc);
})();
var fbl = {'campaign': {'id': 638, 'type': 2, 'size': 1, 'position': 9, 'tab': 2, 'control': 2}};
(function () {
    var fj = document.createElement('script');
    fj.type = 'text/javascript';
    fj.async = true;
    fj.src = 'https://product.feedbacklite.com/feedbacklite.js';
    h.appendChild(fj);
})();

//update check
httpreq.get("https://launcherminecraft.pl/update.json", function (err, res) {
    if (!err)
    {
        if (res.statusCode == 200)
        {
            var result = JSON.parse(res.body);
            if (result.latest_version > launcherVersion)
            {
                $("#updateMsg").text(result.msg);
                $("#updateTitle").text(result.title);
                $("#updateHref").attr("href", result.href);
            }
        }
    }
});

//prevent selection
var omitformtags = ["input", "textarea", "select"]
omitformtags = omitformtags.join("|")
function disableselect(e) {
    if (omitformtags.indexOf(e.target.tagName.toLowerCase()) == -1)
        return false
}
function reEnable() {
    return true
}
if (typeof document.onselectstart != "undefined")
    document.onselectstart = new Function("return false")
else {
    document.onmousedown = disableselect
    document.onmouseup = reEnable
}

function loadSettings() {
    try {
        settings = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
    } catch(e) {
        console.log(e);
        settings = [];
    }
}

function loadLanguage() {
    if (settings.language == undefined) {
        if (navigator.language == 'pl')
            window.t = locale.pl;
        else
            window.t = locale.en;
    } else {
        window.t = locale[settings.language];
    }

    $.each($("t"), function(index, elem) {
       elem = $(elem);
       var key = elem.html();
       elem.replaceWith(t[key]);
    });
    
    $("#locale-pl").click(function() {
        settings.language = 'pl';
        saveSettings();
        location.reload();
    });
    $("#locale-en").click(function() {
        settings.language = 'en';
        saveSettings();
        location.reload();
    });
}

//handle login form
function loginFormSubmit()
{
    var username = $("#gameUsername").val();
    var password = $("#gamePassword").val();
    onlineLogin(username, password);
}

function onlineLogin(username, password)
{
    if (username.length < 2) { // http://gaming.stackexchange.com/questions/179832/minimum-length-for-minecraft-usernames
        alert(t.loginTooShort.replace('<number>', 2));
        return;
    }
    $("#wrongCredentials").hide();
    $("#signIn").attr("disabled", true).removeClass("btn-success").addClass("btn-default").html(t.working);
    saveProfile(username, password,
            function (err, result) {
                $("#signIn").removeClass("btn-default").addClass("btn-success").text(t.logged);
                $("#username").text(result.selectedProfile.name);
                $("#usernameContainer").show();
                $("#signin").hide();
                $("#logout").show();
                $("#versionListContainer").show();
                $("#start_version").show();
                $('.modal.in').modal('hide');
            },
            function (err, result) {
                $("#wrongCredentials").show();
                $("#signInOffline").show();
                $("#signIn").removeAttr("disabled").removeClass("btn-default").addClass("btn-success").html(t.login);
            }
    );
}

function offlineLogin(username) 
{
    if (username.length < 3) {
        alert(t.loginTooShort.replace('<number>', 3));
        return;
    }
    saveOfflinetoken(username, function () {
        $("#username").text(username);
        $("#usernameContainer").show();
        $("#signin").hide();
        $("#logout").show();
        $("#versionListContainer").show();
        $("#start_version").show();
        $(".modal.in").modal("hide");
    });
}

function saveSettings() 
{
    fs.writeFileSync(settingsFile, JSON.stringify({
        version: settings.version,
        language: settings.language
    }));
}

//start!
$(document).ready(function () {
    loadSettings();
    loadLanguage();
    downloadVersionList();
    loadProfile(//online callback
            function (username)
            {
                $("#username").text(cmdUsername);
                $("#usernameContainer").show();
                $("#logout").show();
                $("#versionListContainer").show();
                $("#start_version").show();
            }, //offline callback
            function (username)
            {
                $("#username").text(cmdUsername);
                $("#usernameContainer").show();
                $("#logout").show();
                $("#versionListContainer").show();
                $("#start_version").show();
            }, //no account callback
            function () {
                $("#signin").show();
            }
    );
    /*
     * Listeners
     */
    //closing window
    $("#close").on("click", function () {
        window.close();
    });
    //close button hover
    $("#close").mouseenter(function () {
        $("#close img").attr('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAATdJREFUeNpiPHH6TDwDA4MiA/ngPhOFBoCAIhMDFQBVDGFBFzA3Ma4H0W/fvT9w5969gzBxFSUle2EhQQcQ++SZs404XbJuzRp4+IA0gDSC2EIC/O4wA4hyyekzZy6ZmpjowQxiZlZRFeDnl4bJv3v//iC6HuaUtDS4DX/+/mE4cvjIRwEBAUZpKSlxkBgHBwcfTP7O3bsnnzx7vgevS3R19T6A6DVr1l6QkZYRk5SUkIDJffjw4fHb9x92EBU7IINioqO1kA0AAaDrZGFhRNAQUCDq6uqYwPgvX716hS2wcRpy+fIlAVUVFQs4/8qVc319/TtAgY1sEN4wuX3zliByIH778XOHqrqaACiMQGKwWEMHjMAM2ICeToAa38MCGeZCmAVBISH38RoyoHkHZMgdCs24AxBgAArScCh0FiY/AAAAAElFTkSuQmCC');
    }).mouseleave(function () {
        $("#close img").attr('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAOhJREFUeNpi/P//PwOlgImBCoAFRFjb2pKl+ejhw1R2CZrpsECqB7qwCUm8Dkg1Ql3OiC9MkEO5EaqRobmxcR/MAKICdv6CBcjcxlUrVtx3cnJyRBJrImRI05y5c1EMkpaWVoCx9+3ffwjolXpChtTDDDp77hyKxOPHj+/X1tXZE5tO6gvy8+8bGxmhCMrKyirCwoigIaBADA0JUYTxL126xIAtsPEZUocciGvWrn2UmZ2NEdiEDGlEDsT+CRPksQU2OmAEZUCkZP8fKRrr0QyHeYMRPdmjp1hGHJbVoxmK6ZJBURQABBgAxBJeei2YDBYAAAAASUVORK5CYII=');
    });
    //clickable lvlup.pro logo
    $("#logo").on("click", function () {
        gui.Shell.openExternal('https://lvlup.pro/#pk_campaign=app&pk_kwd=starter');
    });
    //login form on enter press
    $("#loginFormContainer").submit(function (event) {
        event.preventDefault();
        loginFormSubmit();
    });
    //modal with login form
    $("#signin").on("click", function () {
        $('#loginModal').modal('show');
    });
    //login form focus on username
    $('#loginModal').on('shown.bs.modal', function () {
        $("#gameUsername").focus();
    });
    //login form on button click
    $("#signIn").on("click", function () {
        loginFormSubmit();
    });
    //offline mode sign in
    $("#signInOffline").on("click", function () {
        offlineLogin($("#gameUsername").val());
    });
    //logout
    $("#logout").on("click", function () {
        logout(function () {
            $("#versionListContainer").hide();
            $("#start_version").hide();
            $("#logout").hide();
            $("#username").val("");
            $("#usernameContainer").hide();
            $("#signin").show();
            $("#signIn").attr("disabled", false).val(t.login);
        });
    });
    $("#start_version").on("click", function () {
        $("#start_version").hide();
        
        var ver = $("#versions option:selected").val();
        settings["version"] = ver;
        saveSettings();
        
        $("div .progress").show();
        
        downloadVersionFiles(ver, function () {
            downloadLibs(ver, function () {
                downloadAssets(ver, function () {
                    generateCmd(ver, function () {
                        $("div .progress").hide();
                        $("#start_version").show();
                    });
                });
            });
        });
    });
    /*
     * End of listeners
     */

//    downloadAssets(ver, function () {
//        console.log("done?!");
//    });

});
