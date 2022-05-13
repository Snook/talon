'use strict';

const Path = require('path');
const {Sequelize, DataTypes} = require('sequelize');

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

	User: sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
			primaryKey: true,
			autoIncrement: true
		},
		discord_user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true
		}
	}),

	DiscordUserAuth: sequelize.define('discord_user_auth', {
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

module.exports = DB;