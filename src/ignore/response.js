import Render from './render.js';
import Axa from 'axa';

function Response (data) {
	this.query = data.query;
	this.route = data.route;
}

Response.prototype.content = function (content) {
	var self = this;

	Render.html({
		query: self.query,
		title: self.route.title,
		content: content
	});
};

Response.prototype.file = function (path) {
	var self = this;

	Axa.request({
		action: path,
		responseType: 'html',
		success: function (xhr) {
			Render.html({
				query: self.query,
				title: self.route.title,
				content: xhr.response
			});
		},
		error: function (xhr) {
			Render.text({
				query: self.query,
				title: self.route.title,
				content: xhr.response
			});
		}
	});
};

Response.prototype.redirect = function (path) {
	window.location = path;
};

export default function (data) {
	return new Response(data);
}
