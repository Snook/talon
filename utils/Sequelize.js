'use strict';


const Path = require('path');
const {Sequelize, DataTypes, Op} = require('sequelize');

const sequelize = new Sequelize({
	host: 'localhost',
	dialect: 'sqlite',
	storage: Path.join(__dirname, '../database/main.sqlite'),
	define: {
		freezeTableName: true,
		paranoid: true
	},
	logging: false
});

const DB = {

	app_cache_helix: sequelize.define('app_cache_helix', {
		hash: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true,
			autoIncrement: false
		},
		response: {
			type: DataTypes.JSON,
			allowNull: false
		}
	}),

	app_twitch_auth: sequelize.define('app_twitch_auth', {
		client_id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true,
		},
		access_token: {
			type: DataTypes.STRING,
			allowNull: false
		},
		expires_in: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		token_type: {
			type: DataTypes.STRING,
			allowNull: false
		},
		expires: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	}),

	discord_settings_guild: sequelize.define('discord_settings_guild', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true,
			autoIncrement: false
		},
		streamer_name: {
			type: DataTypes.STRING,
			allowNull: true
		},
		streamer_announcement_channel: {
			type: DataTypes.STRING,
			allowNull: true
		},
		streamer_announcement_color: {
			type: DataTypes.STRING,
			allowNull: true
		},
		stream_team: {
			type: DataTypes.STRING,
			allowNull: true
		},
		stream_team_announcement_channel: {
			type: DataTypes.STRING,
			allowNull: true
		},
		stream_team_announcement_color: {
			type: DataTypes.STRING,
			allowNull: true
		},
	}),

	discord_user_auth: sequelize.define('discord_user_auth', {
		discord_user_id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true,
			autoIncrement: false
		},
		access_token: {
			type: DataTypes.STRING,
			allowNull: false
		},
		expires_in: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		refresh_token: {
			type: DataTypes.STRING,
			allowNull: false
		},
		scope: {
			type: DataTypes.STRING,
			allowNull: false
		},
		token_type: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}),

	user: sequelize.define('user', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
		},
		discord_user_id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		twitch_user_id: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true
		}
	}),

	twitch_user_auth: sequelize.define('twitch_user_auth', {
		twitch_user_id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true,
			autoIncrement: false
		},
		access_token: {
			type: DataTypes.STRING,
			allowNull: false
		},
		expires_in: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		refresh_token: {
			type: DataTypes.STRING,
			allowNull: false
		},
		scope: {
			type: DataTypes.STRING,
			allowNull: false
		},
		token_type: {
			type: DataTypes.STRING,
			allowNull: false
		}
	})

};


sequelize.sync({alter: true});

module.exports = {DB, Op};