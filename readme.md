# Twilio Router

(Note: this project was *heavily* inspired by [Speech router](https://github.com/lukasolson/speech-router))

Twilio Router is a wrapper for Twilio's SMS APIs. It enables you to declare "routes" which map speech to functionality within your Express application.

## Usage
```javascript
	app.post('/twilio', new TwilioRouter({
		routes: {
			"feedback *comments": "saveComments",
			"signup :email": "signup",
			"search :engine for *query": "search"
		},

		saveComments: function (comments,req,res) {
			Comments.create({/*...*/},function(err,comment) {
				twilioClient.sms.messages.post({to:'+15555555555',from:'+1yournumber',body:'Your comment has been recorded'})
			});
		},

		signup: function (email,req,res) {
			//...
		},

		search: function (engine, query,req,res) {
			//...
		}
	});


```

## API

#### `new TwilioRouter(properties)`
Constructor. All `properties` will be copied onto the object. `properties` should contain a `routes` hash that maps formats to functions:

The function can either be a string that maps to a function or an inline function. The format can contain parameters:
- `:param` Matches any text not containing whitespace
- `*param` Matches any text (with/without spaces)
- `(optional)` Makes the selection optional (i.e., the route will fire the associated function regardless of whether or not the given text is found)

#### `route(transcript, callback)`
Associate the given callback function with the given format. This can be used to add routes on the fly. If the first argument is an object instead of a string, it is assumed that it is a hash of routes, similar what is expected in the constructor.
```javascript
router.route("say hello to :name", function (name) {
	console.log("Hi, " + name + "!");
});
```

#### `trigger(transcript)`
Manually invoke the function associated with a transcript. This function is also used internally to invoke functions associated with a speech recognition transcript.
```javascript
router.trigger("say hello to Lukas");
```