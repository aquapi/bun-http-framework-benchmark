const jsonHeaders = { headers: [['Content-Type', 'application/json']] },
	queryHeaders = { headers: [['X-Powered-By', 'benchmark']] },
	notFound = new Response(null, { status: 404 }),
	hiRes = new Response('Hi')

function toResponse(json: unknown) {
	return new Response(JSON.stringify(json), jsonHeaders)
}

// json -> [106, 115, 111, 110]
// id/ -> [105, 100, 47]
// Simulate the maximum performance you can get with Bun.serve
// We should appreciate how frameworks make all these stuff easier :) - Reve
Bun.serve({
    static: {
        '/': new Response('Hi', { headers: { 'content-type': 'text/plain;charset=utf8' } })
    },
	fetch(req): Response | Promise<Response> {
		const url = req.url

		const pathIndex = url.indexOf('/', 12) + 1
		const queryIndex = url.indexOf('?', pathIndex)
		const path = url.substring(pathIndex, queryIndex >>> 0)

    let len = path.length;
		if (len === 0)
			return req.method === 'GET' ? hiRes.clone() : notFound

		switch (path.charCodeAt(0)) {
			case 105:
				if (
				  len === 3 &&
					path.charCodeAt(1) === 100 &&
					path.charCodeAt(2) === 47 &&
					req.method === 'GET'
				) {
					// Shouldn't include a slash and should have query
					if (queryIndex === -1 || path.indexOf('/', 3) !== -1)
						return notFound

					const nameQueryIdx = url.indexOf('name=', queryIndex + 1)
					if (nameQueryIdx === -1) return notFound

					return new Response(
						`${path.substring(3, queryIndex)} ${url.substring(nameQueryIdx + 5, url.indexOf('&', nameQueryIdx + 1) >>> 0)}`,
						queryHeaders
					)
				}

				return notFound

			case 106:
				return len === 4 &&
				  path.charCodeAt(1) === 115 &&
					path.charCodeAt(2) === 111 &&
					path.charCodeAt(3) === 110 &&
					req.method === 'POST'
					? req.json().then(toResponse)
					: notFound

			default:
				return notFound
		}
	}
})
