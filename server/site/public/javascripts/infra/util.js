$.fn.parseParam = function (key, defaultValue) {
	if(!key && !defaultValue) return '';
	var regex = new RegExp("[\\?&]"+key+"=([^&]*)");
	var qs = regex.exec(window.location.href);
	if(qs == null) return defaultValue;
	else return qs[1];
};
$.fn.removeParam = function(key) {
	var split = window.location.search.substring(1).split(/[&;]/g);
	for (var i = 0; i < split.length; i++) {
		if(split[i].split('=')[0] === key) {
			split.splice(i, 1);
			break;
		}
	};
	return '?' + split.join('&');
};