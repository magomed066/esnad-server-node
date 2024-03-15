import { CuratorWallet, User } from '../../models/index.js'
import MainWallet from '../../models/main-wallet/index.js'

export const transactToCurator = async (req, res) => {
	try {
		const { id, sum, role } = req.body

		const curator = await User.findOne({ where: { id, role } })

		if (!curator) {
			return res.json({
				success: false,
				data: 'Такого куратора нет',
			})
		}

		const wallet = await CuratorWallet.findOne({ where: { curatorId: id } })

		if (!wallet) {
			return res.json({
				success: false,
				data: 'Не удалось перевести деньги',
			})
		}

		await CuratorWallet.update(
			{
				sum: wallet?.dataValues?.sum + sum,
			},
			{
				where: { curatorId: id },
			},
		)

		res.json({
			success: true,
			data: { ...curator?.dataValues },
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось сделать перевод' })
	}
}

export const getMainWallet = async (req, res) => {
	try {
		const wallet = await MainWallet.findByPk(1)

		if (!wallet) {
			return res.status(404).json({
				success: false,
				message: 'Кассы нет',
			})
		}

		res.json({
			success: true,
			data: wallet,
		})
	} catch (error) {
		return res.status(404).json({
			success: false,
			message: 'Что-то пошло не так',
		})
	}
}
