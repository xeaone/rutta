function join () {
	var paths = '', path = '';

	for (var i = 0, l = arguments.length; i < l; i++) {
		path = clean(arguments[i]);
		if (path !== '' && i !== l-1) path += '/';
		paths += path;
	}

	return paths;
}

function clearSlashes (s) {
	s = s.trim();
	s = s.replace(/(^\/)|(\/$)/g, '');
	s = s === '' ? '/' : s;
	return s;
}

function clearHashes (s) {
	s = s.trim();
	s = s.replace(/(^#)|(#$)/g, '');
	return s;
}

function clearRoot (s) {
	s = s.replace(/(^\/?#?\/)/, '');
	s = s === '' ? '/' : s;
	return s;
}

function clearOrigin (s) {
	s = s.replace(document.location.origin, '');
	s = s === '' ? '/' : s;
	return s;
}

function getPathname (s) {
	s = s.replace(document.location.origin, '');
	s = s.replace(/(^\/?#?\/)/, '');
	s = s.replace(/(#(.*?)$)|(\?(.*?)$)/g, '');
	s = s === '' ? '/' : s;
	return s;
}

function getHash (s) {
	s = s.replace(document.location.origin, '');
	s = s.replace(/(^\/?#?\/)/, '');
	if (s.indexOf('#') === -1) return '';
	s = s.replace(/(^(.*?)#)/, '');
	s = s.replace(/(\?(.*?)$)/, '');
	return s;
}

function getSearch (s) {
	return s.replace(/(^(.*?)\?)/, '');
}

Router.prototype.redirect = function (redirect) {
	var self = this;

	if (redirect.constructor.name === 'Object') {
		self.redirects.push(redirect);
	} else if (redirect.constructor.name === 'Array') {
		self.redirect = self.redirects.concat(redirect);
	}

	return self;
};

Router.prototype.unredirect = function (redirect) {
	var self = this;

	for (var i = 0, l = self.redirects.length; i < l; i++) {
		if (redirect.from === self.redirects[i].from && redirect.to === self.redirects[i].to) {
			self.redirects.splice(i, 1);
			break;
		}
	}

	return self;
};
