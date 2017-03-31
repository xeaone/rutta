import Render from './render.js';
import Axa from 'axa';

function Response (data) {
	this.query = data.query;
	this.route = data.route;
}

Response.prototype.content = function (html) {
	var self = this;

	Render.content({
		query: self.query,
		title: self.route.title,
		html: html
	});
};

Response.prototype.file = function (path, callback) {
	var self = this;

	Axa.request({
		action: path,
		responseType: 'html',
		success: function (xhr) {
			Render.content({
				query: self.query,
				title: self.route.title,
				html: xhr.response
			});

			if (callback) return callback();
		},
		error: function (xhr) {
			Render.content({
				query: self.query,
				title: self.route.title,
				text: xhr.response
			});

			if (callback) return callback();
		}
	});
};

Response.prototype.redirect = function (path) {
	window.location = path;
};

export default function (data) {
	return new Response(data);
}
