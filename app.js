'use strict';


const config = require('./config/config');

const Hapi = require('@hapi/hapi');
const Path = require('path');

const Api = require('./utils/Api');
const DB = require('./utils/Sequelize');

const start = async () => {

	const server = Hapi.server({
		port: config.port,
		host: config.hostname,
		routes: {
			files: {
				relativeTo: Path.join(__dirname, 'public')
			}
		},
		app: config
	});

	await server.register([
		{plugin: require('@hapi/vision')},
		{plugin: require('@hapi/inert')},
		{plugin: require('@hapi/bell')},
		{plugin: require('@hapi/cookie')}
	]);

	server.auth.strategy('discord', 'bell', {
		provider: 'discord',
		password: config.cookie_secret,
		clientId: config.discord.client_id,
		clientSecret: config.discord.app_secret,
		isSecure: config.isSecure
	});

	server.auth.strategy('session', 'cookie', {
		cookie: {
			name: 'sid',
			path: '/',
			password: config.cookie_secret,
			isSecure: config.isSecure
		},
		keepAlive: true,
		validateFunc: async (request, session) => {

			if (!session) {
				// Must return { valid: false } for invalid cookies
				return {valid: false};
			}

			return {valid: true, credentials: session};
		}
	});

	server.auth.default({strategy: 'session', mode: 'try'});

	server.views({
		engines: {
			hbs: require('handlebars')
		},
		relativeTo: __dirname,
		partialsPath: 'views/partials',
		layoutPath: 'views/layout',
		layout: 'default',
		path: 'views'
	});

	server.route([
		{
			method: 'GET',
			path: '/{param*}',
			handler: {
				directory: {
					path: Path.join(__dirname, 'public'),
					index: false
				}
			}
		},
		{
			method: 'GET',
			path: '/',
			handler: async (request, h) => {

				let team = await Api.helix({
					endpoint: `/teams`,
					params: {
						name: server.settings.app.options.team_name
					}
				});

				let userList = ``;
				let streamList = ``;

				for (let user of team.data.data[0].users) {
					userList += `&id=${user.user_id}`;
					streamList += `&user_id=${user.user_id}`;
				}

				let users = await Api.helix({
					endpoint: `/users?${userList}`
				});

				let streams = await Api.helix({
					endpoint: `/streams?${streamList}`
				});

				let onlineStreamsById = [];

				for (let stream of streams.data.data) {
					onlineStreamsById[stream.user_id] = stream;
				}

				// add stream data to user object
				for (let [i, user] of users.data.data.entries()) {
					users.data.data[i].stream = onlineStreamsById[user.id];
				}

				return server.render('index', {title: 'Talon - Discord Bot', team: team.data.data[0], users: users.data.data, credentials: request.auth.credentials});
			}
		},
		{
			method: ['GET', 'POST'],
			path: '/oauth/discord',
			options: {
				auth: {
					mode: 'try',
					strategy: 'discord'
				},
				handler: async (request, h) => {

					if (!request.auth.isAuthenticated) {
						return h.redirect('/');
						//return `Authentication failed due to: ${request.auth.error.message}`;
					}

					let user = await DB.user.upsert({discord_user_id: request.auth.credentials.profile.id});

					let discord_user_auth = await DB.discord_user_auth.upsert({
						discord_user_id: request.auth.credentials.profile.id,
						access_token: request.auth.artifacts.access_token,
						expires_in: request.auth.artifacts.expires_in,
						refresh_token: request.auth.artifacts.refresh_token,
						scope: request.auth.artifacts.scope,
						token_type: request.auth.artifacts.token_type
					});

					request.cookieAuth.set({
						user_id: user.id,
						discord_id: request.auth.credentials.profile.id,
						avatar_id: request.auth.credentials.profile.avatar.id,
						email: request.auth.credentials.profile.email,
						username: request.auth.credentials.profile.username,
						discriminator: request.auth.credentials.profile.discriminator
					});

					return h.redirect('/');
				}
			}
		},
		{
			method: 'GET',
			path: '/logout',
			options: {
				handler: (request, h) => {

					request.cookieAuth.clear();
					return h.redirect('/');
				}
			}
		}
	]);

	await server.start();
	console.log('Server running on', server.info.uri);
};

process.on('unhandledRejection', (err) => {

	console.log(err);
	process.exit(1);
});

start();