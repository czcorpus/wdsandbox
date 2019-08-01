.PHONY: devel-server
devel-server :
	nodejs node_modules/webpack-dev-server/bin/webpack-dev-server.js --config webpack.dev.js
server :
	nodejs node_modules/webpack/bin/webpack.js --config webpack.server.js
