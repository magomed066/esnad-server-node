import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const Client = sequelize.define('client', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	first_name: DataTypes.STRING,
	last_name: DataTypes.STRING,
	middle_name: DataTypes.STRING,
	full_name: DataTypes.STRING,
	passport_series: DataTypes.INTEGER,
	passport_number: DataTypes.INTEGER,
	address: DataTypes.STRING,
	phone: DataTypes.STRING,
	email: DataTypes.STRING,
})

export default Client
