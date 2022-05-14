'use strict';


const config = require('../config/config');
const Axios = require('axios');
const Hash = require('object-hash');
const DB = require('./Sequelize');

const Api = {

	app_twitch_auth: async function () {

		let app_twitch_auth = await DB.app_twitch_auth.findOne({where: {client_id: config.twitch.client_id}});

		if (app_twitch_auth === null || app_twitch_auth.dataValues.expires <= Date.now()) {

			app_twitch_auth = await Axios({

				url: `https://id.twitch.tv/oauth2/token`,
				method: `POST`,
				data: `client_id=${config.twitch.client_id}&client_secret=${config.twitch.app_secret}&grant_type=client_credentials`,
				headers: {
					'content-type': `application/x-www-form-urlencoded`
				}

			}).catch(function (err) {

				console.log(err);

			});

			if (app_twitch_auth.data.expires_in) {

				app_twitch_auth = {
					client_id: config.twitch.client_id,
					access_token: app_twitch_auth.data.access_token,
					expires_in: app_twitch_auth.data.expires_in,
					token_type: app_twitch_auth.data.token_type,
					expires: (Date.now() + (app_twitch_auth.data.expires_in * 1000))
				};

				DB.app_twitch_auth.upsert(app_twitch_auth);
			}
		} else {
			app_twitch_auth = app_twitch_auth.dataValues;
		}

		return app_twitch_auth;
	},

	// fetch wrapper for Twitch api
	helix: async function (params) {

		let app_twitch_auth = await this.app_twitch_auth();

		if (config.twitch.client_id) {

			// setup Axios parameters
			let axiosParams = {
				defeatCache: false,
				headers: {
					Authorization: `Bearer ${app_twitch_auth.access_token}`,
					"Client-ID": `${config.twitch.client_id}`,
				},
				...params
			};

			axiosParams.url = `https://api.twitch.tv/helix${axiosParams.endpoint}`;

			// get unique hash for Axios parameters to use as cache identification
			let hash = Hash(axiosParams);

			// check cache for recent data
			let cacheFetch = await DB.app_cache_helix.findOne({where: {hash: hash}});

			let response;

			if (cacheFetch === null || axiosParams.defeatCache) {
				// no recent cache so query the remote API
				response = await Axios(axiosParams).catch(function (err) {

					console.log(err);

				});

				await DB.app_cache_helix.upsert({hash: hash, response: response.data});
			} else {
				response = {
					data: cacheFetch.dataValues.response
				}
			}

			return response;
		}
	},

	// fetch wrapper for Discord api
	discord: async function (discordParams) {

		let axiosParams = {
			...discordParams,
			params: {
				wait: true
			},
			headers: {
				Authorization: `Bot ${config.discord.bot_token}`
			}
		};

		axiosParams.url = `https://discordapp.com/api${axiosParams.endpoint}`;

		return Axios(axiosParams).catch(function (err) {

			console.log(err);

		});
	}

};

module.exports = Api;