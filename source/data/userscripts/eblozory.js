function wrapper() {
    function PhotoLoaded() {
      if(this.width != 100 || this.height != 75) {
        loading.style.display = "none";
        var imgs = picture_place.getElementsByTagName("IMG");
        if(imgs && imgs.length == 2) {
          imgs[0].style.display = "none";
        }
        user_portret.style.display = "inline";
      } else {
        loading.innerHTML = "Фото юзера не найдено";
      }
    }

    var usernick = document.getElementsByClassName("username")[0];
    if(!usernick) {
      return;
    }
    var a = usernick.getElementsByTagName("A")[0];
    if(!a) {
      return;
    }
    var usernick_name = a.innerHTML;

    //var usernick = document.getElementById("usernick");
    //var usernick_name = usernick.getElementsByTagName("H2")[0].getElementsByTagName("A")[0].innerHTML;
    //var picture_place = usernick.nextSibling.nextSibling.rows[0].cells[0].childNodes[1].rows[0].cells[0];
    var picture_place = document.getElementsByClassName("userpic")[0];
    if(!picture_place) {
      return;
    }
    picture_place = picture_place.rows[0].cells[0];

    var loading = document.createElement("span");
    loading.id = "loading_photo";
    loading.innerHTML = "Ищем фотку на Еблозории...<br/>";
    picture_place.insertBefore(loading, picture_place.firstChild);

    var user_portret = new Image();
    user_portret.id = "user_portret";
    user_portret.style.maxWidth = "340px";
    user_portret.style.display = "none";
    user_portret.src = "http://faces.leprosorium.com/image.php?nc=1&cat=&image=" + usernick_name + ".jpg";
    user_portret.addEventListener("load", PhotoLoaded, false);

    var picLink = document.createElement("A");
    picLink.setAttribute("href", "http://faces.leprosorium.com/full.php?cat=&img=" + usernick_name + ".jpg");
    picLink.setAttribute("target", "_blank");
    picLink.style.textAlign = "center";
    picLink.appendChild(user_portret);
    picture_place.appendChild(picLink);
}
wrapper();