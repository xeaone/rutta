(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('Rutta', factory) :
	(global.Rutta = factory());
}(this, (function () { 'use strict';

	function has (string, search) {
		return string.indexOf(search) !== -1;
	}

	function clean (s) {
		return decodeURI(s)
		.replace(document.location.origin, '')
		.replace(/(^\/?#?\/)/, '')
		.replace(/(\/$)/, '');
	}

	function strip (s) {
		return clean(s).replace(/(\?.*?$)|(#.*?$)/g, '');
	}

	function getSearch (s) {
		return clean(s).split('?')[1] || '';
	}

	function getHash (s) {
		return clean(s).split('?')[0].split('#')[1] || '';
	}

	function getPathname (s) {
		return clean(s).split('?')[0].split('#')[0] || '';
	}

	var Utility = {
		has: has,
		clean: clean,
		strip: strip,
		getSearch: getSearch,
		getHash: getHash,
		getPathname: getPathname
	};

	function Render (data) {
		if (data.title !== null && data.title !== undefined) document.title = data.title;
		if (data.type === 'text') document.querySelector(data.query).innerText = data.content;
		else if (data.type === 'html') document.querySelector(data.query).innerHTML = data.content;
		else document.querySelector(data.query).innerText = '505 Router Error';

		window.scroll(0, 0);

		// execute scripts
		var scripts = data.content.match(/<script>[\s\S]+<\/script>/g);

		if (scripts) {
			scripts.forEach(function (script) {
				script = script.replace(/(<script>)|(<\/script>)/g, '');
				eval(script);
			});
		}

	}

	function Request (data) {
		this.route = data.route;
		this.state = data.state;
	}

	var Request$1 = function (data) {
		return new Request(data);
	};

	/*
		@preserve
		title: axa
		version: 1.0.5
		author: Alexander Elias
		descript: Axa a low level Ajax Xhr library.
	*/

	var mime = {
		script: 'text/javascript, application/javascript, application/x-javascript',
		json: 'application/json, text/javascript',
		xml: 'application/xml, text/xml',
		html: 'text/html',
		text: 'text/plain',
		urlencoded: 'application/x-www-form-urlencoded'
	};

	function serialize (data) {
		var string = '';

		for (var name in data) {
			string = string.length > 0 ? string + '&' : string;
			string = string + encodeURIComponent(name) + '=' + encodeURIComponent(data[name]);
		}

		return string;
	}

	function request (options) {
		if (!options) throw new Error('Axa: requires options');
		if (!options.action) throw new Error('Axa: requires options.action');
		if (!options.method) options.method = 'GET';
		if (!options.headers) options.headers = {};

		if (options.data) {
			if (options.method === 'GET') {
				options.action = options.action + '?' + serialize(options.data);
				options.data = null;
			} else {
				options.requestType = options.requestType.toLowerCase();
				options.responseType = options.responseType.toLowerCase();

				switch (options.requestType) {
					case 'script': options.contentType = mime.script; break;
					case 'json': options.contentType = mime.json; break;
					case 'xml': options.contentType = mime.xm; break;
					case 'html': options.contentType = mime.html; break;
					case 'text': options.contentType = mime.text; break;
					default: options.contentType = mime.urlencoded;
				}

				switch (options.responseType) {
					case 'script': options.accept = mime.script; break;
					case 'json': options.accept = mime.json; break;
					case 'xml': options.accept = mime.xml; break;
					case 'html': options.accept = mime.html; break;
					case 'text': options.accept = mime.text; break;
				}

				if (options.contentType === mime.json) options.data = JSON.stringify(options.data);
				if (options.contentType === mime.urlencoded) options.data = serialize(options.data);
			}
		}

		var xhr = new XMLHttpRequest();
		xhr.open(options.method.toUpperCase(), options.action, true, options.username, options.password);

		if (options.mimeType) xhr.overrideMimeType(options.mimeType);
		if (options.withCredentials) xhr.withCredentials = options.withCredentials;

		if (options.accept) options.headers['Accept'] = options.accept;
		if (options.contentType) options.headers['Content-Type'] = options.contentType;

		if (options.headers) {
			for (var name in options.headers) {
				xhr.setRequestHeader(name, options.headers[name]);
			}
		}

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 400) {
					return options.success(xhr);
				} else {
					return options.error(xhr);
				}
			}
		};

		xhr.send(options.data);
	}

	var Axa = {
		mime: mime,
		request: request,
		serialize: serialize
	};

	function Response (data) {
		this.query = data.query;
		this.route = data.route;
	}

	Response.prototype.send = function (content, callback) {
		var self = this;

		Render({
			type: 'html',
			query: self.query,
			title: self.route.title,
			content: content
		});

		if (callback) return callback();
	};

	Response.prototype.file = function (path, callback) {
		var self = this;

		Axa.request({
			action: path,
			responseType: 'html',
			success: function (xhr) {
				Render({
					type: 'html',
					query: self.query,
					title: self.route.title,
					content: xhr.response
				});

				if (callback) return callback();
			},
			error: function (xhr) {
				Render({
					type: 'text',
					query: self.query,
					title: self.route.title,
					content: xhr.response
				});

				if (callback) return callback();
			}
		});
	};

	Response.prototype.redirect = function (path) {
		window.location = path;
	};

	var Response$1 = function (data) {
		return new Response(data);
	};

	/*
		@preserve
		title: rutta
		version: 1.2.7
		author: alexander elias
	*/

	var PUSH = 2;
	var REPLACE = 3;
	var MODE = 'history' in window && 'pushState' in window.history;

	function Router (options) {
		this.name = options.name;

		this.base = options.base;
		this.routes = options.routes || [];
		this.redirects = options.redirects || [];
		this.query = options.query || '[r-view="'+ this.name +'"]';
		this.authorize = options.authorize || function () { return true; };

		this.isListening = false;
		this.permitChangeEvent = true;
		this.state = options.state || {};
		this.location = document.location;

		this.mode = options.mode === null || options.mode === undefined ? MODE : options.mode;
		this.root = options.root === null || options.root === undefined ? (this.mode ? '/' : '#/') : options.root;
	}

	Router.prototype.isSameOrigin = function (path) {
		return path && path.indexOf(document.location.origin) > -1;
	};

	Router.prototype.isSamePath = function (pathOne, pathTwo) {
		return Utility.clean(pathOne || '') === Utility.clean(pathTwo || '');
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

			if (path === route.path) {
				self.routes.splice(i, 1);
				break;
			}
		}

		return self;
	};

	Router.prototype.get = function (path) {
		var self = this;

		var length = self.routes.length;
		var route = null;
		var index = 0;

		path = Utility.strip(path);

		for (index; index < length; index++) {
			route = self.routes[index];
			if (typeof route.path === 'string') {
				if (route.path === path || route.path === '/' + path) {
					return route;
				}
			} else if (route.path.test(path)) {
				return route;
			}
		}
	};

	Router.prototype.navigate = function (state, type) {
		var self = this;
		var route = self.get(state.path);

		self.state.title = route && route.title ? route.title : state.title;
		self.state.path = self.mode ? self.root + Utility.clean(state.path) : self.root + Utility.clean(state.path);

		var data = {
			route: route,
			state: this.state,
			query: this.query,
			href: document.location.href,
			hash: Utility.getHash(this.href),
			search: Utility.getSearch(this.href),
			pathname: Utility.getPathname(this.href)
		};

		if (self.authorize(Request$1(data), Response$1(data)) === false) {
			Render({
				type: 'text',
				title: '401',
				text: '{"statusCode":401,"error":"Missing Authentication"}'
			});

			return self;
		}

		if (self.mode) {
			if (type === PUSH) window.history.pushState(self.state, self.state.title, self.state.path);
			if (type === REPLACE) window.history.replaceState(self.state, self.state.title, self.state.path);
		} else {
			self.permitChangeEvent = false;
			window.location.hash = self.state.path;
		}

		if (route) {
			route.handler(Request$1(data), Response$1(data));
		} else {
			Render({
				type: 'text',
				title: '404',
				text: '{"statusCode":404,"error":"Not Found"}'
			});
		}

		return self;
	};

	Router.prototype.listen = function () {
		var self = this;

		if (self.isListening) return self;
		else self.isListening = true;

		window.addEventListener('DOMContentLoaded', function () {
			var state = { title: document.title, path: document.location.href };
			self.navigate(state, REPLACE);
		}, false);

		window.addEventListener(self.mode ? 'popstate' : 'hashchange', function (e) {
			if (self.permitChangeEvent) {
				var state = {};

				if (self.mode) state = e.state || {};
				else state = { path: e.newURL };

				self.navigate(state);
			} else {
				self.permitChangeEvent = true;
			}
		}, false);

		window.addEventListener('click', function (e) {
			if (e.metaKey || e.ctrlKey || e.shiftKey) return;

			// ensure target is anchor tag use shadow dom if available
			var target = e.path ? e.path[0] : e.target;
			while (target && 'A' !== target.nodeName) target = target.parentNode;
			if (!target || 'A' !== target.nodeName) return;

			// check non acceptable attributes
			if (target.hasAttribute('r-ignore') || target.hasAttribute('download') || target.getAttribute('rel') === 'external') return;

			var state = {
				path: target.href || '',
				title: target.title || ''
			};

			// if base and base not equal the url then ignore
			if (self.base && Utility.getPathname(state.path).indexOf(self.base) !== 0) return;

			// check non acceptable href
			if (Utility.has(state.path, 'mailto:')) return;
			if (Utility.has(state.path, 'tel:')) return;
			if (Utility.has(state.path, 'file:')) return;
			if (Utility.has(state.path, 'ftp:')) return;

			// check non acceptable origin
			if (!self.isSameOrigin(state.path)) return;

			e.preventDefault();

			// check for same path
			if (self.isSamePath(state.path, self.state.path)) return;

			self.navigate(state, PUSH);
		}, false);

		return self;
	};

	var Rutta = {
		routers: {},
		fetch: Axa.request,
		router: function (options) {
			// if (!options.name) options.name = Object.keys(this.routers).length.toString();
			if (!options.name) throw new Error('Router - name parameter required');
			if (this.routers[options.name]) throw new Error('Router - name ' + options.name + ' exists');
			this.routers[options.name] = new Router(options);
			return this.routers[options.name];
		}
	};

	return Rutta;

})));
