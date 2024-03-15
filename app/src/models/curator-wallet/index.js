import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const CuratorWallet = sequelize.define('curator_wallet', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	curatorId: { type: DataTypes.INTEGER, primaryKey: true },
	sum: DataTypes.DECIMAL(15, 2),
})

export default CuratorWallet
