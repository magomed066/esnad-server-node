import moment from 'moment'
import { OutProfit } from '../../models/index.js'
import { Op } from 'sequelize'

export const addOutProfitTransaction = async (req, res) => {
	try {
		const { amount, comment, createdDate } = req.body

		await OutProfit.create({
			amount,
			comment,
			deleted: 0,
			createdDate: createdDate
				? moment(createdDate).toDate()
				: moment(new Date()).toDate(),
		})

		res.json({
			success: true,
			data: 'Прибыль успешно добавлена',
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось добавить прибыль' })
	}
}

export const getAllOutProfit = async (req, res) => {
	try {
		const data = await OutProfit.findAll({
			where: {
				order: [['createdAt', 'DESC']],
				deleted: 0,
			},
		})

		res.json({
			success: true,
			data,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить прибыль' })
	}
}

export const getAllOutProfitByMonth = async (req, res) => {
	try {
		const { from, to } = req.params

		const startDate = moment(from).startOf('day') // Set time to beginning of day
		const endDate = moment(to).endOf('day')

		const data = await OutProfit.findAll({
			where: {
				createdDate: {
					[Op.between]: [startDate.toDate(), endDate.toDate()],
				},
			},
		})

		res.json({
			success: true,
			data,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить прибыль' })
	}
}
