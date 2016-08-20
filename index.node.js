'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var hapi = require('hapi');
var Vision = _interopDefault(require('vision'));
var Handlebars = _interopDefault(require('handlebars'));
var ubcFarmViewsUtils = require('ubc-farm-views-utils');
var path = require('path');

function pageViews(pagename, path$$ = pagename, context) {
	let moduleFolder;
	try {
		moduleFolder = require.resolve(`ubc-farm-page-${pagename}`);
	} catch (err) {
		// TODO: Make a better resolution algorithm
		// If no module found, check for a sibling package folder.
		moduleFolder = path.resolve(__dirname, `../page-${pagename}`);
	}

	console.log(moduleFolder);
	return {
		method: 'GET',
		path: `/${path$$}/{param*}`,
		handler(request, reply) {
			const reqPath = request.params.param;

			let filePath;
			if (reqPath) {
				filePath = path.join(moduleFolder, 'views', reqPath);
			} else {
				// get index
				filePath = path.join(moduleFolder, 'views', 'index');
			}
			filePath = path.relative(__dirname, filePath);

			reply.view(filePath, context);
		},
	};
}

var packagePages = [
	pageViews('calendar'),
	pageViews('directory'),
	pageViews('fields'),
	pageViews('invoice', 'finances/sales'),
	pageViews('map-editor', 'fields/editor'),
	pageViews('add-items', 'finances/add-item'),
	pageViews('planner', 'calendar/planner'),
];

var homepage = {
	method: 'GET',
	path: '/',
	handler: {
		view: {
			template: 'pages/homepage.html',
		},
	},
};

var config = {"port":3040};

const server = new hapi.Server();
server.connection(config);
server.path(__dirname);

server.register(Vision, err => {if (err) throw err});

server.views({
	engines: {
		html: Handlebars,
		hbs: Handlebars
	},
	defaultExtension: 'html',
	relativeTo: __dirname,
	path: '.',
	partialsPath: ubcFarmViewsUtils.partials,
	helpersPath: ubcFarmViewsUtils.helpers,
	isCached: process.env.NODE_ENV !== 'development'
})

server.route(packagePages);
server.route(homepage);

/*eslint no-console: "off"*/

function startServer(server, name) {
	process.title = name;

	server.start().then(() => {
		console.log(`[+] ${name} server running at: ${server.info.uri}`);
	}).catch(err => {
		console.error(`[X] ${name} server issue: ${err}`)
	})
}

startServer(server, 'View');
//# sourceMappingURL=index.node.js.map
