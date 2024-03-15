import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const Token = sequelize.define('token', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	userId: DataTypes.INTEGER,
	refreshToken: DataTypes.TEXT,
})

export default Token
