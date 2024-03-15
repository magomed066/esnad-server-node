import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const MainWallet = sequelize.define('main_wallet', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	sum: DataTypes.DECIMAL(15, 2),
})

export default MainWallet
