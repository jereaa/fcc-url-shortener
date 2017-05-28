const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const autoIncrement = require("mongoose-auto-increment");
const validUrl = require("valid-url");
const Base62 = require("./base62");

const app = express();

app.use(cors());

let port = process.env.PORT || 3000;

let connection = mongoose.createConnection("mongodb://localhost/fcc-url-shortener");
autoIncrement.initialize(connection);

let shortLinkSchema = new mongoose.Schema({
	slug: { type: Number, unique: true },
	url: { type: String, required: true }
});
shortLinkSchema.plugin(autoIncrement.plugin, { model: "ShortUrl", field: "slug" });


let nextSlugId = 0;

app.get("/api/v1/new/:url(*)", (req, res) => {

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

		let resultSlug = Base62.toBase62(newUrl.slug);

		while (resultSlug.length < 7) {
			resultSlug = "a" + resultSlug;
		}

		console.log("URL saved as: " + JSON.stringify(newUrl));

		res.status(200).json({
			original_url: url,
			short_url: req.protocol + "://www." + req.hostname + "/" + resultSlug
		});
	});
});

app.get("/:slug", (req, res) => {
	let ShortUrl = mongoose.model("ShortUrl", shortLinkSchema);
	console.log("Going to fetch the slug in the DB");

	let slugInNum = Base62.toDecimal(req.params.slug);
	console.log("Going to search for slug number: " + slugInNum);

	ShortUrl.findOne({ "slug": slugInNum }, (err, shortUrl) => {
		if (err) {
			console.log("Error fetching URL: " + err);
			return res.status(500).send("Server error :(");
		}
		console.log("Got Shortlink: " + shortUrl + " - Trying to redirect...");
		return res.redirect(shortUrl.url);
	});
});

app.listen(port, () => {
	console.log("Listening in port " + port);
});