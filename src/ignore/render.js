
var Render = {
	content: function (data) {
		if (data.title !== null && data.title !== undefined) document.title = data.title;
		if (data.text !== null && data.text !== undefined) document.querySelector(data.query).innerText = data.text;
		else if (data.html !== null && data.html !== undefined) document.querySelector(data.query).innerHTML = data.html;
		else document.querySelector(data.query).innerText = '505 Router Error';
	}
};

export default Render;
