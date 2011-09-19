$(window).click(function (event) {
	var t = event.target;
	if (t.nodeName != "A") return;
	event.stopPropagation();
	event.preventDefault();
	self.port.emit("goto", t.toString());
});