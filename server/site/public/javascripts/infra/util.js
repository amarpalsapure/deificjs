$.fn.parseParam = function (key, defaultValue) {
	if(!key && !defaultValue) return '';
	var regex = new RegExp("[\\?&]"+key+"=([^&]*)");
	var qs = regex.exec(window.location.href);
	if(qs == null) return defaultValue;
	else return qs[1];
}