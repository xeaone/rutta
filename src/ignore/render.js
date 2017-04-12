
var Render = {
	content: function (data) {
		var inner = data.text || data.html;

		if (data.title !== null && data.title !== undefined) document.title = data.title;
		if (data.text !== null && data.text !== undefined) document.querySelector(data.query).innerText = data.text;
		else if (data.html !== null && data.html !== undefined) document.querySelector(data.query).innerHTML = data.html;
		else document.querySelector(data.query).innerText = '505 Router Error';

		// execute scripts
		var scripts = inner.match(/<script>(.*?)<\/script>/g);
		scripts.forEach(function (script) {
			script = script.replace(/(<script>)|(<\/script>)/g, '');
			new Function (script);
		});

	}
};

export default Render;
