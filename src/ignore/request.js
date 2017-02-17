
function Request (data) {
	this.route = data.route;
	this.state = data.state;
}

export default function (data) {
	return new Request(data);
}
