import Render from './render.js';
import Axa from 'axa';

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

export default function (data) {
	return new Response(data);
}
