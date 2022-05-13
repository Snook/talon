'use strict';

const config = require('../config/config');

const Axios = require('axios');

const AxiosHelix = async function (params) {
	if (config.twitch.client_id) {
		let axiosParams = {
			...params,
			headers: {
				Authorization: `Bearer ${config.twitch.oauth2_token.access_token}`,
				"Client-ID": `${config.twitch.client_id}`,
			}
		};

		axiosParams.url = `https://api.twitch.tv/helix${axiosParams.endpoint}`;

		return Axios(axiosParams).catch(function (err) {

			console.log(err);

		});
	}
};

const AxiosDiscord = async function (discordParams) {
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
};

module.exports = {AxiosDiscord, AxiosHelix};