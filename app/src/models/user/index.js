import { Sequelize, DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const User = sequelize.define('user', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	firstName: {
		type: DataTypes.STRING,
	},
	lastName: {
		type: DataTypes.STRING,
	},
	middleName: {
		type: DataTypes.STRING,
	},
	fullName: {
		type: DataTypes.STRING,
	},
	email: {
		type: DataTypes.STRING,
		unique: true,
	},
	phone: DataTypes.STRING,
	password: {
		type: DataTypes.STRING,
	},

	roles: {
		type: DataTypes.STRING,
	},
})

export default User
