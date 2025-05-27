function devTo({ id, snippet: { description, title, tags, thumbnails } }) {
	if (isSyndicatedToDevTo(id)) {
		Logger.log({
			message: `Already posted ${id} to Dev.To`,
		});
		return;
	}

	const article = DevTo.post("https://dev.to/api/articles", {
		article: {
			title,
			description: `${description.split("\n")[0].substring(0, 250)} ...`,
			body_markdown: `{% youtube ${id} %}\n\n${description.replace(/#([a-zA-Z0-9]*)/gi, "[#$1](https://www.youtube.com/hashtag/$1)")}\n\n{% cta https://youtube.com/@googleworkspacedevs %}Follow youtube.com/@googleworkspacedevs{% endcta %}`,
			published: true,
			tags: [...tags, "googleworkspace", "google"]
				.map((tag) => tag.toLowerCase().replace(/[^a-z]*/gi, ""))
				.slice(0, 4),
			main_image: (thumbnails.maxres ?? [])[0]?.url,
			social_image: (thumbnails.maxres ?? [])[0]?.url,
			canonical_url: canonicalUrl(id),
			series: "YouTube@GoogleWorkspaceDevs",
			organization_id: 7950,
		},
	});

	Logger.log({
		message: `Posted ${id} to Dev.to`,
		article,
	});
}

class DevTo {
	static paginate(url) {
		let page = 1;
		const all = [];
		while (true) {
			const items = DevTo.get(`${url}?page=${page}`);
			if (items.length === 0) {
				return all;
			}

			page += 1;
			all.push(...items);
		}
	}

	static fetch(url, options, retries = DevTo.retries) {
		const response = UrlFetchApp.fetch(url, {
			...options,
			headers: {
				"api-key": DEVTO_API_KEY,
				...(options.headers ?? {}),
			},
			muteHttpExceptions: true,
		});

		if (response.getResponseCode() === 429 && retries > 0) {
			Utilities.sleep(2 ** (DevTo.retries - retries) * 10 * 1000);
			retries -= 1;
			return DevTo.fetch(url, options, retries);
		}

		if (response.getResponseCode() >= 400) {
			throw response.getContentText();
		}

		return JSON.parse(response.getContentText());
	}

	static post(url, json) {
		return DevTo.fetch(url, {
			method: "POST",
			contentType: "application/json",
			payload: JSON.stringify(json),
		});
	}

	static get(url) {
		console.log(url);
		return DevTo.fetch(url, {
			method: "GET",
		});
	}
}

DevTo.retries = 3;
DevTo.articles = {
	list: () => DevTo.paginate("https://dev.to/api/articles/me/all"),
};
DevTo.organizations = {
	articles: {
		list: (org = "googleworkspace") =>
			DevTo.paginate(`https://dev.to/api/organizations/${org}/articles`),
	},
};

function isSyndicatedToDevTo(id) {
	return memoize(() => {
		return [
			...DevTo.articles.list(),
			...DevTo.organizations.articles.list(),
		].map((article) => article.canonical_url);
	}, 30)().includes(canonicalUrl(id));
}
