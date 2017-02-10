/*
	Title: Rutta
	Version: 1.0.0
	Author: Alexander Elias
*/

var HASH = 2;
var HISTORY = 3;

function isPushState () {
	return !!(
		typeof window !== 'undefined' &&
		'onhashchange' in window
	);
}

function isHashChange () {
	return !!(
		typeof window !== 'undefined' &&
		'onhashchange' in window
	);
}

function clearSlashes (path) {
	path = path.toString();
	path = path.trim();
	path = path.replace(/\/$/, '');
	path = path.replace(/^\//, '');
	return path;
}

function sameOrigin(href) {
	var origin = location.protocol + '//' + location.hostname;
	if (location.port) origin += ':' + location.port;
	return (href && (0 === href.indexOf(origin)));
}

window.Rutta = {

	HASH: HASH,
	HISTORY: HISTORY,

	root: '/',
	routes: [],
	redirects: [],
	mode: isPushState() ? HISTORY : HASH,

	setup: function(options) {
		var self = this;

		options = options || {};

		if (options.root) {
			self.root = '/' + clearSlashes(options.root) + '/';
		}

		if (options.mode) {
			if (options.mode.constructor.name === 'Number') {
				self.mode = options.mode;
			} else if (options.mode.constructor.name === 'String') {
				self.mode = options.mode.toLowerCase() === 'history' ? HISTORY : HASH;
			}
		}

		return self;
	},

	path: function () {
		var self = this;
		var path = '';
		var match = null;

		if (self.mode === HISTORY) {
			path = decodeURI(window.location.pathname + window.location.search);
			path = clearSlashes(path);
			path = path.replace(/\?(.*)$/, '');
			path = self.root !== '/' ? path.replace(self.root, '') : path;
		} else {
			match = window.location.href.match(/#(.*)$/);
			path = match ? match[1] : '';
		}

		path = clearSlashes(path);

		return path === '' ? '/' : path;
	},

	show: function (path) {
		var self = this;

		path = path || self.path();

		for (var i = 0, l = self.routes.length; i < l; i++) {
			var route = self.routes[i];

			if (route.path === path) {
				self.view.innerHTML = route.handler();
				break;
			}
		}

		return self;
	},

	add: function (routes) {
		var self = this;

		if (routes.constructor.name === 'Object') {
			self.routes.push(routes);
		} else if (routes.constructor.name === 'Array') {
			self.routes = self.routes.concat(routes);
		}

		return self;
	},

	remove: function (path) {
		var self = this;

		for (var i = 0, l = self.routes.length; i < l; i++) {
			var route = self.routes[i];

			if (route.path === path) {
				self.routes.splice(i, 1);
				break;
			}
		}

		return self;
	},

	flush: function () {
		var self = this;

		self.routes = [];
		self.mode = null;
		self.root = '/';

		return self;
	},

	// TODO might want to look into dynamic
	check: function (f) {
		var self = this;
		var path = f || self.path();

		for (var i = 0, l = self.routes.length; i < l; i++) {
			var match = path.match(self.routes[i].path);

			if (match) {
				match.shift();
				self.routes[i].handler.apply({}, match);
				break;
			}
		}

		return self;
	},

	listen: function () {
		var self = this;

		window.addEventListener('DOMContentLoaded', function () {
			self.view = document.querySelector('[r-view]');
			self.show(window.location.pathname);
		}, false);

		window.addEventListener('click', function (e) {

			if (e.metaKey || e.ctrlKey || e.shiftKey) return;
			if (e.defaultPrevented) return;

			// ensure link. use shadow dom when available
			var el = e.path ? e.path[0] : e.target;
			while (el && 'A' !== el.nodeName) el = el.parentNode;
			if (!el || 'A' !== el.nodeName) return;

			var path = el.href.replace(window.location.origin + self.root, '');
			var href = el.getAttribute('href');

			// ignore if tag has atributes: download, rel=external
			if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

			// ensure non-hash for the same path
			if (!self.mode === HASH && el.pathname === location.pathname && (el.hash || '#' === href)) return;

			// check for mailto: and tel: in the href
			if (href && href.indexOf('mailto:') > -1) return;
			if (href && href.indexOf('tel:') > -1) return;
			if (href && href.indexOf('file:') > -1) return;
			if (href && href.indexOf('ftp:') > -1) return;

			// check target
			if (el.target) return;

			// check origin
			if (!sameOrigin(el.href)) return;

			// check for same path
			if (window.location.pathname === '/' + path) return;

			e.preventDefault();
			self.navigate(path);
		}, false);

		if (self.mode === HISTORY) {
			window.addEventListener('popstate', function () {
				self.show();
			}, false);
		} else if (self.mode === HASH) {
			window.addEventListener('hashchange', function () {
				self.show();
			}, false);
		}

		return self;
	},

	navigate: function (path) {
		var self = this;

		path = path ? path : '';

		if (self.mode === HISTORY) {
			window.history.pushState(null, null, self.root + clearSlashes(path));
		} else {
			window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
		}

		self.show();

		return self;
	}
};
