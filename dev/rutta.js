(function () {
	'use strict';

	/*
		Title: Rutta
		Version: 1.0.0
		Author: Alexander Elias
	*/

	/*
		TODO
			- hash not routing
			- test add remove
			- write readme
			- test nested instance
	*/

	var HASH = 2;
	var HISTORY = 3;

	function clean (path) {
		return decodeURI(path).trim()
		.replace(/^\//, '')
		.replace(/\/$/, '')
		.replace(/\?(.*?)$/, '')
		.replace(/\/#\/(.*?)$/, '');
	}

	function join () {
		var paths = '', path = '';

		for (var i = 0, l = arguments.length; i < l; i++) {
			path = clean(arguments[i]);
			if (path !== '' && i !== l-1) path += '/';
			paths += path;
		}

		return paths;
	}

	function Router (options) {

		if (options.mode && options.isHistory) {
			if (options.mode.constructor.name === 'Number') {
				this.mode = options.mode;
			} else if (options.mode.constructor.name === 'String') {
				options.mode = options.mode.toLowerCase();
				this.mode = options.mode === 'history' ? HISTORY : HASH;
			}
		} else if (options.isHistory) {
			this.mode = HISTORY;
		} else {
			this.mode = HASH;
		}

		this.root = options.root ? clean(options.root) + '/' : '/';
		this.root = this.mode === HASH ? this.root + '#/' : this.root;

		this.name = options.name;
		this.routes = options.routes || [];
		this.query = options.query || '[r-view="'+ this.name +'"]';

		this.title = options.title || document.title;
		this.origin = options.origin || document.location.origin;

		this.state = options.state || { url: null, title: null };
	}

	Router.prototype.pushState = function (state) {
		var self = this;

		self.state.title = state.title;
		self.state.url = state.url.replace(self.origin, '');
		self.state.url = join(self.origin, self.root, self.state.url);

		window.history.pushState(self.state, self.state.title, self.state.url);
	};

	Router.prototype.popState = function (state) {
		var self = this;

		self.state.url = state ? state.url : self.root;
		self.state.title = state ? state.title : self.title;
	};

	Router.prototype.currentPath = function () {
		var self = this;
		var path = null;

		path = document.location.href;
		path = path.replace(document.location.origin, '');
		path = self.root + clean(path);

		return path;
	};

	Router.prototype.isOrigin = function (path) {
		return path && path.indexOf(this.origin) === 0;
	};

	Router.prototype.request = function (route) {
		return new function () {
			this.path = route.path;
			this.title = route.title;
		};
	};

	Router.prototype.response = function (route) {
		var self = this;

		return new function () {
			this.content = function (content) {
				document.title = route.title;
				document.querySelector(self.query).innerHTML = content;
			};
		};
	};

	Router.prototype.route = function (path) {
		var self = this;

		path = path || self.currentPath();

		var l = self.routes.length;
		var route = null;
		var i = 0;

		for (i; i < l; i++) {
			route = self.routes[i];
			if (path === route.path) {
				return route.handler(self.request(route), self.response(route));
			}
		}

		return self;
	};

	Router.prototype.add = function (route) {
		var self = this;

		if (route.constructor.name === 'Object') {
			self.routes.push(route);
		} else if (route.constructor.name === 'Array') {
			self.routes = self.routes.concat(route);
		}

		return self;
	};

	Router.prototype.remove = function (path) {
		var self = this;

		for (var i = 0, l = self.routes.length; i < l; i++) {
			var route = self.routes[i];

			if (route.path === path) {
				self.routes.splice(i, 1);
				break;
			}
		}

		return self;
	};

	Router.prototype.listen = function () {
		var self = this;

		window.addEventListener('DOMContentLoaded', function () {
			self.route();
		}, false);

		window.addEventListener('click', function (e) {

			if (e.metaKey || e.ctrlKey || e.shiftKey) return;

			// ensure link use shadow dom when available
			var target = e.path ? e.path[0] : e.target;
			while (target && 'A' !== target.nodeName) target = target.parentNode;
			if (!target || 'A' !== target.nodeName) return;

			var href = target.getAttribute('href');

			// ignore if tag has download or rel=external
			if (target.hasAttribute('download') || target.getAttribute('rel') === 'external') return;

			// check for mailto: and tel: in the href
			if (href && href.indexOf('mailto:') > -1) return;
			if (href && href.indexOf('tel:') > -1) return;
			if (href && href.indexOf('file:') > -1) return;
			if (href && href.indexOf('ftp:') > -1) return;

			if (!self.isOrigin(target.href)) return;

			e.preventDefault();

			self.pushState({ title: target.title, url: target.href });
			self.route();
		}, false);

		window.addEventListener(self.mode === HISTORY ? 'popstate' : 'hashchange', function (e) {
			if (self.mode === HISTORY) self.popState(e.state);
			self.route();
		}, false);

		return self;
	};

	if (!window.Rutta) {
		window.Rutta = {

			HASH: HASH,
			HISTORY: HISTORY,

			routers: {},

			router: function (name, options) {

				if (!options && typeof name === 'object') {
					options = name;
					name = null;
				} else {
					options = options || {};
					options.name = name;
				}

				options.isHistory = 'history' in window && 'pushState' in window.history;

				if (!options.name) throw new Error('Router - name parameter required');
				if (this.routers[options.name]) throw Error('Router - name is already in use');

				var router = new Router(options);
				this.routers[options.name] = router;

				return router;
			}

		};
	}

}());