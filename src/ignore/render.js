
var Render = {
	content: function (data) {
		if (data.title) document.title = data.title || '';
		if (data.text) document.querySelector(data.query).innerText = data.text;
		else if (data.html) document.querySelector(data.query).innerHTML = data.html;
		else document.querySelector(data.query).innerText = '';
	}
};

export default Render;
