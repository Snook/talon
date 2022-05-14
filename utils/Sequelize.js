'use strict';


const Path = require('path');
const {Sequelize, DataTypes, Op} = require('sequelize');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: Path.join(__dirname, '../database/main.sqlite'),
	define: {
		freezeTableName: true,
		paranoid: true
	},
	logging: false
});

const DB = {

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

	user: sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		discord_user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
			primaryKey: true
		}
	}),

	discord_user_auth: sequelize.define('discord_user_auth', {
		discord_user_id: {
			type: DataTypes.INTEGER,
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