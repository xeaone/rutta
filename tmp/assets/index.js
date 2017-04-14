
var options = {
	name: 'main',
	// mode: false,
	routes: [
		{
			path: '/',
			title: 'Home',
			handler: function (req, res) {
				return res.content('<h1>home</h1>');
			}
		},
		{
			path: '/page',
			title: 'Page',
			handler: function (req, res) {
				console.log(req);
				return res.content('<h1>page</h1>');
			}
		},
		{
			path: '/nested',
			title: 'Nested',
			handler: function (req, res) {
				return res.content(`
					<div r-view="sub">
						<h1>Nested</h1>
					</div>
				`);
			}
		},
		{
			path: '/foo',
			title: 'Foo',
			handler: function (req, res) {
				return res.redirect('/');
			}
		},
		{
			path: '/xhr',
			title: 'xhr',
			handler: function (req, res) {
				return res.file('./public/xhr.html');
			}
		},
		{
			path: /.*?/,
			title: '404',
			handler: function (req, res) {
				return res.content('<h1>404</h1>');
			}
		}
	]
};

var route = [
	{
		path: '/extract',
		title: 'Extract',
		handler: function (req, res) {
			return res.content('<h1>Extract</h1>');
		}
	},
];

Rutta.router(options).add(route).remove('/extract').listen();
