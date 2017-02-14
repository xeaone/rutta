/*
	Title: Rutta
	Version: 1.0.0
	Author: Alexander Elias

	TODO
		- hash not routing
		- test add remove
		- write readme
		- test nested instance
*/

var PUSH = 2;
var REPLACE = 3;
var ORIGIN = document.location.origin;

function has (string, search) {
	return string.indexOf(search) !== -1;
}

function clean (path) {
	return decodeURI(path).trim()
	.replace(ORIGIN, '')
	.replace(/(^\/#\/)|(^#\/)|(^\/)/g, '')
	.replace(/(\/$)/, '');
}

function strip (path) {
	return decodeURI(path).trim()
	.replace(ORIGIN, '')
	.replace(/(^\/#\/)|(^#\/)|(^\/)/g, '')
	.replace(/(\?.*?)$/, '')
	.replace(/(#.*?)$/, '')
	.replace(/(\/$)/, '');
}

// function join () {
// 	var paths = '', path = '';
//
// 	for (var i = 0, l = arguments.length; i < l; i++) {
// 		path = clean(arguments[i]);
// 		if (path !== '' && i !== l-1) path += '/';
// 		paths += path;
// 	}
//
// 	return paths;
// }

function Router (options) {

	this.name = options.name;

	this._isHistory = 'history' in window && 'pushState' in window.history;

	this._html5 = options.html5 === null || options.html5 === undefined ? true : options.html5;
	this._html5 = this._isHistory ? this._html5 : false;

	this._base = this._html5 ? '/' : '/#/';
	this._base = options.base ? options.base + this._base : this._base;

	this._permitChangeEvent = true;
	this._state = options.state || {};
	this._routes = options.routes || [];
	this._redirects = options.redirects || [];
	this._query = options.query || '[r-view="'+ this.name +'"]';
}

Router.prototype.isOrigin = function (path) {
	return path && path.indexOf(ORIGIN) === 0;
};

Router.prototype.isSame = function (p1, p2) {
	return p1 && p2 && clean(p1) === clean(p2);
};

Router.prototype.request = function (data) {
	return new function () {
		this.route = data.route;
		this.state = data.state;
	};
};

Router.prototype.response = function (data) {
	var self = this;

	return new function () {
		this.content = function (content) {
			document.title = data.route.title || '';
			document.querySelector(self._query).innerHTML = content;
		};
		this.redirect = function (path) {
			window.location = path;
		};
	};
};

Router.prototype.add = function (route) {
	var self = this;

	if (route.constructor.name === 'Object') {
		self._routes.push(route);
	} else if (route.constructor.name === 'Array') {
		self._routes = self._routes.concat(route);
	}

	return self;
};

Router.prototype.remove = function (path) {
	var self = this;

	for (var i = 0, l = self._routes.length; i < l; i++) {
		var route = self._routes[i];

		if (path === route.path) {
			self._routes.splice(i, 1);
			break;
		}
	}

	return self;
};

Router.prototype.redirect = function (redirect) {
	var self = this;

	if (redirect.constructor.name === 'Object') {
		self._redirects.push(redirect);
	} else if (redirect.constructor.name === 'Array') {
		self.redirect = self._redirects.concat(redirect);
	}

	return self;
};

Router.prototype.unredirect = function (redirect) {
	var self = this;

	for (var i = 0, l = self._redirects.length; i < l; i++) {
		if (redirect.from === self._redirects[i].from && redirect.to === self._redirects[i].to) {
			self._redirects.splice(i, 1);
			break;
		}
	}

	return self;
};

Router.prototype.show = function (state) {
	var self = this;

	var path = '/' + strip(state.path || '');
	var length = self._routes.length;
	var route = null;
	var index = 0;

	for (index; index < length; index++) {
		route = self._routes[index];
		if (path === route.path) {
			var data = { state: state, route: route };
			return route.handler(self.request(data), self.response(data));
		}
	}

	return self;
};

Router.prototype.navigate = function (state, type) {
	var self = this;

	self._state.title = state.title ? state.title : '';
	self._state.path = state.path ? self._base + clean(state.path) : self._base;

	if (self._html5) {
		if (type === PUSH) window.history.pushState(self._state, self._state.title, self._state.path);
		if (type === REPLACE) window.history.replaceState(self._state, self._state.title, self._state.path);
	} else if (!self._html5) {
		self._permitChangeEvent = false;
		window.location.hash = self._state.path.replace(/^\//, '');
	}

	// self._state.host = window.location.host;
	// self._state.hash = window.location.hash;
	// self._state.hostname = window.location.hostname;
	// self._state.href = window.location.href;
	// self._state.origin = window.location.origin;
	// self._state.pathname = window.location.pathname;
	// self._state.port = window.location.port;
	// self._state.protocol = window.location.protoco;
	//
	// if (!self._html5) self._state.hash = self._state.hash.replace(/^#\/(.*?)#/, '#');
	// // if (!self._html5) self._state.pathname = // TODO FIXME

	self.show(self._state);

	return self;
};

Router.prototype.listen = function () {
	var self = this;

	window.addEventListener('DOMContentLoaded', function () {
		var state = { title: document.title, path: document.location.href };
		self.navigate(state, REPLACE);
	}, false);

	window.addEventListener(self._html5 ? 'popstate' : 'hashchange', function (e) {
		if (self._permitChangeEvent) {
			var state = {};

			if (self._html5) state = e.state || {};
			else state = { path: e.newURL };

			self.navigate(state);
		} else {
			self._permitChangeEvent = true;
		}
	}, false);

	window.addEventListener('click', function (e) {
		if (e.metaKey || e.ctrlKey || e.shiftKey) return;

		// ensure target is anchor tag use shadow dom if available
		var target = e.path ? e.path[0] : e.target;
		while (target && 'A' !== target.nodeName) target = target.parentNode;
		if (!target || 'A' !== target.nodeName) return;

		// check non acceptable attributes
		if (target.hasAttribute('download') || target.getAttribute('rel') === 'external') return;

		var state = {
			path: target.href || '',
			title: target.title || ''
		};

		// check non acceptable href
		if (has(state.path, 'mailto:')) return;
		if (has(state.path, 'tel:')) return;
		if (has(state.path, 'file:')) return;
		if (has(state.path, 'ftp:')) return;

		// check non acceptable origin
		if (!self.isOrigin(state.path)) return;

		e.preventDefault();

		// check for same path
		if (self.isSame(state.path, self._state.path) === true) return;

		self.navigate(state, PUSH);
	}, false);

	return self;
};

if (!window.Rutta) {
	window.Rutta = {
		routers: {},
		router: function (name, options) {

			if (!options && typeof name === 'object') {
				options = name;
				name = null;
			} else {
				options = options || {};
				options.name = name;
			}

			if (!options.name) throw new Error('Router - name parameter required');
			if (this.routers[options.name]) throw new Error('Router - ' + options.name + ' already exists');

			var router = new Router(options);
			this.routers[options.name] = router;
			return router;
		}

	};
}
