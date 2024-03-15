import moment from 'moment'
import {
	CuratorToMainWalletTransaction,
	CuratorWallet,
	Deal,
	Investment,
	InvestorWallet,
	Payment,
	PaymentTransaction,
	PaymentTransactionCart,
	User,
	Withdrawal,
} from '../../models/index.js'
import MainWallet from '../../models/main-wallet/index.js'
import Transaction from '../../models/transaction/index.js'
import { Op } from 'sequelize'

export const transactBetweenCurator = async (req, res) => {
	try {
		const { fromUserId, toUserId, sum, message } = req.body

		// From curator update logic
		const fromCuratorWallet = await CuratorWallet.findOne({
			where: { curatorId: fromUserId },
		})

		if (!fromCuratorWallet) {
			return res.status(404).json({
				success: false,
				message: 'Такого кошелька нет',
			})
		}

		await CuratorWallet.update(
			{
				sum: Number(fromCuratorWallet?.dataValues?.sum) - Number(sum),
			},
			{ where: { curatorId: fromUserId } },
		)

		// To curator update logic
		const toCuratorWallet = await CuratorWallet.findOne({
			where: { curatorId: toUserId },
		})

		if (!toCuratorWallet) {
			return res.status(404).json({
				success: false,
				message: 'Такого кошелька нет',
			})
		}

		await CuratorWallet.update(
			{
				sum: Number(toCuratorWallet?.dataValues?.sum) + Number(sum),
			},
			{ where: { curatorId: toUserId } },
		)

		await Transaction.create({
			from_user_id: fromUserId,
			to_user_id: toUserId,
			sum,
			message,
		})

		res.json({
			success: true,
			data: 'Перевод доставлен',
		})
	} catch (error) {}
}

export const transactToCurator = async (req, res) => {
	try {
		const { curatorId, sum, message } = req.body

		// Берутся деньги с кассы
		const mainWallet = await MainWallet.findByPk(1)

		if (!mainWallet) {
			return res.status(404).json({
				success: false,
				message: 'Кассы нет',
			})
		}

		if (mainWallet.dataValues.sum < sum) {
			return res.status(404).json({
				success: false,
				message: 'Не достаточно средств в кассе',
			})
		}

		await MainWallet.update(
			{
				sum: Number(mainWallet.dataValues.sum) - Number(sum),
			},
			{
				where: { id: 1 },
			},
		)

		const curator = await User.findByPk(curatorId)

		if (!curator) {
			return res.status(404).json({
				success: false,
				message: 'Такого куратора нет',
			})
		}

		const wallet = await CuratorWallet.findOne({
			where: { curatorId: curator.dataValues.id },
		})

		if (!wallet) {
			return res.status(404).json({
				success: false,
				message: 'Такого кошелька нет',
			})
		}

		await CuratorWallet.update(
			{ sum: Number(wallet.dataValues.sum) + Number(sum) },
			{ where: { curatorId: curator.dataValues.id } },
		)

		await Transaction.create({
			to_user_id: curatorId,
			sum,
			...(message && { message }),
		})

		res.json({
			success: true,
			data: 'Перевод доставлен',
		})
	} catch (error) {}
}

export const investToMainWallet = async (req, res) => {
	try {
		const { sum, investorId, comment, createdDate } = req.body

		const investor = await User.findByPk(investorId)

		if (!investor) {
			return res.status(404).json({
				success: false,
				message: 'Такого инвестора нет',
			})
		}

		const wallet = await MainWallet.findByPk(1)

		if (!wallet) {
			return res.status(404).json({
				success: false,
				message: 'Кассы нет',
			})
		}

		await MainWallet.update(
			{
				sum: Number(wallet.dataValues.sum) + Number(sum),
			},
			{
				where: { id: 1 },
			},
		)

		await InvestorWallet.increment('sum', {
			by: Number(sum),
			where: { investorId },
		})

		await Investment.create({
			sum,
			investor_id: investorId,
			comment,
			createdDate: createdDate
				? moment(createdDate).toDate()
				: moment(new Date()).toDate(),
		})

		res.json({
			success: true,
			data: 'Вложение успешно добавлено',
		})
	} catch (error) {}
}

export const getAllInvestments = async (req, res) => {
	try {
		const data = await Investment.findAll({
			include: {
				model: User,
				as: 'investor',
				attributes: {
					exclude: ['password'],
				},
			},
			where: {
				deleted: 0,
			},
			order: [['createdAt', 'DESC']],
		})

		res.json({
			success: true,
			data: data,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить инвестиции' })
	}
}

export const getAdminTransaction = async (req, res) => {
	try {
		const data = await Transaction.findAll({
			where: { from_user_id: null },
			include: [{ model: User, as: 'toUser', foreignKey: 'to_user_id' }],
			order: [['id', 'DESC']],
		})

		res.json({
			success: true,
			data: data,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить транзакции' })
	}
}

export const getCuratorTransaction = async (req, res) => {
	try {
		const curatorId = req.userId

		const data = await Transaction.findAll({
			where: { from_user_id: curatorId },
			include: [{ model: User, as: 'toUser', foreignKey: 'to_user_id' }],
			order: [['id', 'DESC']],
		})

		res.json({
			success: true,
			data: data,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить транзакции' })
	}
}

export const getAdminCuratorsTransaction = async (req, res) => {
	try {
		const data = await Transaction.findAll({
			where: {
				from_user_id: {
					[Op.ne]: null,
				},
			},
			include: [
				{
					model: User,
					as: 'toUser',
					foreignKey: 'to_user_id',
				},

				{
					model: User,
					as: 'fromUser',
					foreignKey: 'from_user_id',
				},
			],
			order: [['createdAt', 'DESC']],
		})

		res.json({
			success: true,
			data: data,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить транзакции' })
	}
}

export const transactCuratorToMainWallet = async (req, res) => {
	try {
		const { sum, message } = req.body
		const curatorId = req.userId

		const mainWallet = await MainWallet.findByPk(1)

		const curatorWallet = await CuratorWallet.findOne({
			where: {
				curatorId,
			},
		})

		if (curatorWallet?.dataValues.sum < sum) {
			return res.json({
				success: false,
				data: 'Недостаточно средств для перевода',
			})
		}

		await CuratorWallet.update(
			{
				sum: Number(curatorWallet?.dataValues.sum) - Number(sum),
			},
			{
				where: {
					curatorId,
				},
			},
		)

		await await MainWallet.update(
			{
				sum: Number(mainWallet?.dataValues.sum) + Number(sum),
			},
			{
				where: {
					id: 1,
				},
			},
		)

		await CuratorToMainWalletTransaction.create({
			sum,
			message: message || '',
			curatorId,
		})

		res.json({
			success: true,
			data: 'Деньги успешно переведены',
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось перевести деньги' })
	}
}

export const getAllToMainWalletTransactions = async (req, res) => {
	try {
		const data = await CuratorToMainWalletTransaction.findAll({
			include: [
				{
					model: User,
					as: 'curator',
					attributes: ['firstName', 'lastName', 'middleName'],
				},
			],
			order: [['createdAt', 'DESC']],
		})

		res.json({
			success: true,
			data,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить транзакции' })
	}
}

export const getCuratorToMainWalletTransactions = async (req, res) => {
	try {
		const curatorId = req.userId

		const data = await CuratorToMainWalletTransaction.findAll({
			include: [
				{
					model: User,
					as: 'curator',
					attributes: ['firstName', 'lastName', 'middleName'],
				},
			],

			where: {
				curatorId,
			},
			order: [['id', 'DESC']],
		})

		res.json({
			success: true,
			data,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить транзакции' })
	}
}

export const getDeletedPaymentTransactions = async (req, res) => {
	try {
		const data = await PaymentTransactionCart.findAll({
			include: [
				{
					model: PaymentTransaction,
					as: 'transaction',
					include: [{ model: Payment }],
				},
			],
			order: [['createdAt', 'DESC']],
		})

		res.json({
			success: true,
			data,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить транзакции' })
	}
}

// Investment

export const deleteInvestment = async (req, res) => {
	try {
		const { id } = req.params

		const investment = await Investment.findByPk(id)
		const mainWallet = await MainWallet.findByPk(1)

		if (!investment) {
			return res
				.status(404)
				.json({ success: false, message: 'Не удалось найти инвестицию' })
		}

		if (!mainWallet) {
			return res
				.status(404)
				.json({ success: false, message: 'Кошелек не найден' })
		}

		const investorWallet = await InvestorWallet.findOne({
			where: { investorId: investment.dataValues.investor_id },
		})

		if (!investorWallet) {
			return res
				.status(404)
				.json({ success: false, message: 'Кошелек инвестора не найден' })
		}

		investorWallet.update({
			sum:
				Number(investorWallet.dataValues.sum) -
				Number(investment.dataValues.sum),
		})

		await mainWallet.update(
			{
				sum:
					Number(mainWallet.dataValues.sum) - Number(investment.dataValues.sum),
			},
			{ where: { id: 1 } },
		)

		await investment.update({ deleted: 1 }, { where: { id } })

		res.json({ success: true, message: 'Инвестиция удалена' })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось удалить инвестицию' })
	}
}

export const updateInvestment = async (req, res) => {
	try {
		const { id, sum, comment } = req.body

		const investment = await Investment.findByPk(id)
		const mainWallet = await MainWallet.findByPk(1)

		if (!investment) {
			return res
				.status(404)
				.json({ success: false, message: 'Не удалось найти инвестицию' })
		}

		if (!mainWallet) {
			return res
				.status(404)
				.json({ success: false, message: 'Кошелек не найден' })
		}

		const investorWallet = await InvestorWallet.findOne({
			where: { investorId: investment.dataValues.investor_id },
		})

		if (!investorWallet) {
			return res
				.status(404)
				.json({ success: false, message: 'Кошелек инвестора не найден' })
		}

		const updatedMainWalletSum =
			Number(mainWallet.dataValues.sum) -
			Number(investment.dataValues.sum) +
			Number(sum)

		const updatedInvestorWalletSum =
			Number(investorWallet.dataValues.sum) -
			Number(investment.dataValues.sum) +
			Number(sum)

		await investorWallet.update(
			{
				sum: updatedInvestorWalletSum,
			},
			{
				where: { investorId: investment.dataValues.investor_id },
			},
		)

		await mainWallet.update(
			{
				sum: updatedMainWalletSum,
			},
			{
				where: { id: 1 },
			},
		)

		const payload = {
			...(sum && { sum }),
			...(comment && { comment }),
		}

		await investment.update(payload, { where: { id } })

		res.json({ success: true, message: 'Инвестиция обновлена' })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось обновить инвестицию' })
	}
}

export const withdrawInvestment = async (req, res) => {
	try {
		const { investorId, sum } = req.body

		const mainWallet = await MainWallet.findOne({ where: { id: 1 } })

		const investorWallet = await InvestorWallet.findOne({
			where: { investorId },
		})

		if (!mainWallet) {
			return res
				.status(404)
				.json({ success: false, message: 'Кошелек не найден' })
		}

		if (!investorWallet) {
			return res
				.status(404)
				.json({ success: false, message: 'Кошелек инвестора не найден' })
		}

		await mainWallet.update(
			{ sum: Number(mainWallet.dataValues.sum) - Number(sum) },
			{ where: { id: 1 } },
		)

		await investorWallet.update({
			sum: Number(investorWallet.dataValues.sum) - Number(sum),
		})

		await Withdrawal.create({
			investor_id: investorId,
			sum,
		})

		res.json({ success: true, message: 'Деньги успешно сняты' })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось вывести деньги' })
	}
}

export const getAllWithdrawals = async (req, res) => {
	try {
		const data = await Withdrawal.findAll({
			include: [
				{
					model: User,
					as: 'investor',
					attributes: {
						exclude: ['password'],
					},
				},
			],
			order: [['id', 'DESC']],
		})

		res.json({ success: true, data })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить снятые деньги' })
	}
}

export const getAllInvestorWithdrawals = async (req, res) => {
	try {
		const investorId = req.userId

		const data = await Withdrawal.findAll({
			where: { investor_id: investorId },
			order: [['id', 'DESC']],
		})

		res.json({ success: true, data })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить снятые деньги' })
	}
}
