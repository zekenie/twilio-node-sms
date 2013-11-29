
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g,
	optionalParam = /\((.*?)\)/g,
	namedParam    = /(\(\?)?:\w+/g,
	splatParam    = /\*\w+/g,
	convertFormatToRegExp = function (format) {
		format = format
			.replace(escapeRegExp, "\\$&")
			.replace(optionalParam, "(?:$1)?")
			.replace(namedParam, function (match, optional) {
				return optional ? match : "(\\w+)";
			})
			.replace(splatParam, "(.*?)");
		return new RegExp("^" + format + "$", "i");
	},
	trigger = function (transcript,req,res) {
		for (var i = 0; i < routes.length; i++) {
			var result = routes[i].regex.exec(transcript);
			if (result && result.length) {
				result.splice(0, 1);
				result.push(req,res);
				routes[i].callback.apply(routes[i].context, result);
			}
		}
	};

var routes = [],
	recognizing = false;

function TwilioRouter(properties) {
	if (!properties) return;

	for (var property in properties) {
		this[property] = properties[property];
	}
	this.route(properties["routes"]);
	var self = this;
	return function(req,res,next) {
		res.sms = function(text) {
			//this is an express response in this case
			req.From = req.body.From || req.query.From;
			req.To = req.body.To || req.query.To;
			this.set("content-type","text/xml");
			var response = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
			response += "<Response><Sms>" + text + "</Sms></Response>";
			this.send(response);
		};
		trigger(req.body.Body || req.query.Body,req,res)
	};
}

TwilioRouter.prototype = {
	route: function (format, callback) {
		if (typeof format === "object") {
			var routesObj = format;
			for (var format in routesObj) {
				this.route(format, routesObj[format]);
			}
		} else {
			routes.push({
				regex: convertFormatToRegExp(format),
				callback: this[callback] || callback,
				context: this
			});
		}
	},

	trigger: function (transcript) {
		trigger(transcript);
	},

	start: function () {
		if (!recognizing) {
			recognizing = true;
			speechRecognition.start();
		}
	},

	stop: function () {
		if (recognizing) {
			recognizing = false;
			speechRecognition.stop();
		}
	}
};

module.exports = TwilioRouter;