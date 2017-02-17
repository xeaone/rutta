
var Render = {
	html: function (data) {
		data = data || {};
		document.title = data.title || '';
		document.querySelector(data.query).innerHTML = data.content || '';
	},
	text: function (data) {
		data = data || {};
		document.title = data.title || '';
		document.querySelector(data.query).innerText = data.content || '';
	}
};

export default Render;
