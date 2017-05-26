var express = require("express");
var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var validUrl = require("valid-url");
var Base62 = require("./base62");

var app = express();

let port = process.env.PORT || 3000;

let connection = mongoose.createConnection("mongodb://localhost/fcc-url-shortener");
autoIncrement.initialize(connection);

let shortLinkSchema = new mongoose.Schema({
	slug: { type: Number, unique: true },
	url: { type: String, required: true }
});
shortLinkSchema.plugin(autoIncrement.plugin, { model: "ShortUrl", field: "slug" });


let nextSlugId = 0;

app.get("/api/v1/new/:url", (req, res) => {

	let url = req.params.url;

	if (!validUrl.isWebUri(url)) {
		console.log("Invalid URL: " + url);
		return res.status(400).json({
			error: "Your HTTP Url is not valid."
		});
	}

	let shortUrl = connection.model("ShortUrl", shortLinkSchema);
	
	if (nextSlugId === 0) {
		shortUrl.nextCount((err, count) => {
			if (err) {
				console.log("There was an error getting the next count: " + err);
				res.status(500).json({
					error: err
				});
				return;
			} 
			nextSlugId = count;
		});
	}

	let newUrl = new shortUrl({
		url: url
	});

	newUrl.save((err) => {
		if (err) {
			console.log("There was an error saving the new URL: " + err);
			return;
		}
		res.status(200).json({
			original_url: url,
			short_url: req.protocol + "://www." + req.host + "/" + Base62.toBase62(newUrl.slug)
		});
	});
	
});

app.listen(port, () => {
	console.log("Listening in port " + port);
});