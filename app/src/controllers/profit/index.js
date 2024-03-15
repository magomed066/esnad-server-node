import moment from 'moment'
import {
	Deal,
	DepositTransaction,
	Expense,
	Investment,
	InvestorInfo,
	InvestorWallet,
	MainProfit,
	OutProfit,
	Payment,
	PaymentTransaction,
	User,
} from '../../models/index.js'
import { Op, Sequelize, col, fn, literal } from 'sequelize'
import sequelize from '../../config/db.js'
import Profit from '../../models/profit/index.js'

// Helpers функции для получение выручки и себестоимости
const getAllProfitByMonthHelper = async (year, month) => {
	try {
		const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD')
		const endDate = startDate.clone().add(1, 'months')

		const data = await PaymentTransaction.findAll({
			where: {
				deleted: 0,
				createdAt: {
					[Op.gte]: startDate.toDate(),
					[Op.lt]: endDate.toDate(),
				},
			},
		})

		return data.reduce((prev, curr) => {
			prev += Number(curr.dataValues.amount)

			return prev
		}, 0)
	} catch (error) {
		console.log(error)
		throw Error('Что-то пошло не так')
	}
}

const getMarkupByMonthHelper = async (year, month) => {
	try {
		const revenue = await getAllProfitByMonthHelper(year, month)

		const costPrice = await getCostPriceByMonthHelper(year, month)

		return revenue - costPrice
	} catch (error) {
		console.log(error)
		throw Error('Что-то пошло не так')
	}
}

const getCostPriceByMonthHelper = async (year, month) => {
	try {
		const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD')
		const endDate = startDate.clone().add(1, 'months')

		const data = await Deal.findAll({
			attributes: ['originPrice', 'price'],
			include: [
				{
					model: Payment,
					include: [
						{
							model: PaymentTransaction,
							as: 'transactions',

							attributes: ['amount'],
							where: {
								deleted: 0,
								createdAt: {
									[Op.gte]: startDate.toDate(),
									[Op.lt]: endDate.toDate(),
								},
							},
						},
					],
				},
			],
		})

		return data.reduce((acc, curr) => {
			const originPrice = Number(curr.dataValues.originPrice)
			const price = Number(curr.dataValues.price)

			curr.dataValues.payments.forEach((payment) => {
				payment.transactions.forEach((transaction) => {
					acc += Number(transaction.amount) * (originPrice / price)
				})
			})

			return acc
		}, 0)
	} catch (error) {
		console.log(error)
		throw Error('Что-то пошло не так')
	}
}

const getCuratorsProfitByMonthHelper = async (year, month) => {
	try {
		const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD')
		const endDate = startDate.clone().add(1, 'months')

		// Все транзакции за текущий месяц
		const allPaymentTransactions = await PaymentTransaction.findAll({
			where: {
				deleted: 0,
				createdAt: {
					[Op.gte]: startDate.toDate(),
					[Op.lt]: endDate.toDate(),
				},
			},
		})

		const allDepositTransactions = await DepositTransaction.findAll({
			where: {
				createdAt: {
					[Op.gte]: startDate.toDate(),
					[Op.lt]: endDate.toDate(),
				},
			},
		})

		const allTransactionsCuratorProfit = allPaymentTransactions.reduce(
			(acc, cur) => {
				acc += Number(cur.dataValues.curatorProfit)
				return acc
			},
			0,
		)

		const allDepositTransactionsCuratorProfit = allDepositTransactions.reduce(
			(acc, curr) => {
				acc += Number(curr.dataValues.curatorProfit)
				return acc
			},
			0,
		)

		return allTransactionsCuratorProfit + allDepositTransactionsCuratorProfit
	} catch (error) {
		console.log(error)
		throw Error('Что-то пошло не так')
	}
}

const getOperatingIncomeHelper = async (year, month) => {
	try {
		const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD')
		const endDate = startDate.clone().add(1, 'months')

		const expenses = await Expense.findAll({
			where: {
				createdDate: {
					[Op.gte]: startDate.subtract(1, 'months').toDate(),
					[Op.lt]: endDate.subtract(1, 'months').toDate(),
				},
			},
		})

		const allCuratorsProfit = await getCuratorsProfitByMonthHelper(year, month)

		const markup = await getMarkupByMonthHelper(year, month)

		const expensesAmount = expenses.reduce((acc, curr) => {
			acc += Number(curr.dataValues.sum)
			return acc
		}, 0)

		const marginalIncome = Number(markup) - Number(allCuratorsProfit)

		return {
			operatingIncome: marginalIncome - expensesAmount,
			expenses: expensesAmount,
		}
	} catch (error) {
		console.log(error)
		throw Error('Что-то пошло не так')
	}
}

// Controllers ------------------

// Выручка
export const getAllProfitByMonth = async (req, res) => {
	try {
		const { year, month } = req.params

		const allProfit = await getAllProfitByMonthHelper(year, month)

		res.json({ success: true, data: allProfit })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить доход' })
	}
}

// Себестоимость
export const getCostPriceByMonth = async (req, res) => {
	try {
		const { year, month } = req.params

		const costPrice = await getCostPriceByMonthHelper(year, month)

		res.json({ success: true, data: costPrice })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить себестоимость' })
	}
}

//Наценка
export const getMarkupByMonth = async (req, res) => {
	try {
		const { year, month } = req.params

		const profit = await getMarkupByMonthHelper(year, month)

		res.json({ success: true, data: profit })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить наценку' })
	}
}

//Доля кураторов
export const getAllCuratorsProfitByMonth = async (req, res) => {
	try {
		const { year, month } = req.params

		const allCuratorsProfit = await getCuratorsProfitByMonthHelper(year, month)

		res.json({
			success: true,
			data: allCuratorsProfit,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить долю кураторов' })
	}
}

// Маржинальный доход
export const getMarginalIncome = async (req, res) => {
	try {
		const { year, month } = req.params

		const allCuratorsProfit = await getCuratorsProfitByMonthHelper(year, month)

		const markup = await getMarkupByMonthHelper(year, month)

		res.json({
			success: true,
			data: markup - allCuratorsProfit,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			success: false,
			message: 'Не удалось получить маржинальный доход',
		})
	}
}

//Операционная прибыль
export const getOperatingIncome = async (req, res) => {
	try {
		const { year, month } = req.params

		const { operatingIncome } = await getOperatingIncomeHelper(year, month)

		res.json({
			success: true,
			data: operatingIncome,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			success: false,
			message: 'Не удалось получить операционную прибыль',
		})
	}
}

export const addAllMainProfit = async (req, res) => {
	try {
		const { year, month } = req.params

		const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD')
		const endDate = startDate.clone().add(1, 'months')

		const isAlreadyClosedMonth = await Profit.findOne({
			where: {
				createdAt: {
					[Op.gte]: startDate.subtract(1).toDate(),
					[Op.lt]: endDate.subtract(1).toDate(),
				},
			},
		})

		if (isAlreadyClosedMonth) {
			res.status(404).json({
				success: false,
				message: 'Текущий месяц уже закрыт',
			})

			return
		}

		const outProfit = await OutProfit.findAll({
			where: {
				createdDate: {
					[Op.gte]: startDate.toDate(),
					[Op.lt]: endDate.toDate(),
				},
			},
		})

		const allInvestorsWallets = await InvestorWallet.findAll()

		const currentDate = startDate.add(-1, 'month').format('YYYY-MM-DD')
		const nextDate = startDate.add(1, 'month').format('YYYY-MM-DD')

		const allInvestorCash = (await sequelize?.query(
			`SELECT sum(i.sum) as amount FROM investments i WHERE DATE_FORMAT(i.createdDate, '%Y-%m-%d') >='${currentDate}' and DATE_FORMAT(i.createdDate, '%Y-%m-%d') < '${nextDate}';`,

			{
				plain: true,
			},
		)) || { amount: 0 }

		const allOutProfit = outProfit.reduce((acc, curr) => {
			acc += Number(curr.dataValues.amount)
			return acc
		}, 0)

		// Выручка
		const earnings = await getAllProfitByMonthHelper(year, month)
		// Себестоимость
		const costPrice = await getCostPriceByMonthHelper(year, month)
		// Наценка
		const markup = await getMarkupByMonthHelper(year, month)
		// Доля кураторов
		const curatorsShare = await getCuratorsProfitByMonthHelper(year, month)
		// Маржинальный доход
		const marginalIncome = markup - curatorsShare
		// Операционная прибыль и расходы
		const { operatingIncome, expenses } = await getOperatingIncomeHelper(
			year,
			month,
		)

		// Добавление профита инвестора
		for (let i = 0; i < allInvestorsWallets.length; i++) {
			const allSingleInvestorInvestments = (await sequelize?.query(
				`SELECT sum(i.sum) as amount FROM investments i WHERE DATE_FORMAT(i.createdDate, '%Y-%m-%d') >='${currentDate}' and DATE_FORMAT(i.createdDate, '%Y-%m-%d') < '${nextDate}' AND i.investor_id = ${allInvestorsWallets[i]?.dataValues.investorId};`,

				{
					plain: true,
				},
			)) || { amount: 0 }

			const sharePercentage = Number(
				(
					(Number(allSingleInvestorInvestments.amount) /
						Number(allInvestorCash.amount)) *
					100
				).toFixed(2),
			)

			const profitShare =
				((operatingIncome + allOutProfit) / 100) * sharePercentage
			// Чистая прибыль инвестора
			const investorNetProfit =
				profitShare -
				(profitShare / 100) *
					(100 - Number(allInvestorsWallets[i]?.dataValues.tariff))

			const allSingleInvestorCash = (await sequelize?.query(
				`SELECT sum(i.sum) as amount FROM investments i WHERE DATE_FORMAT(i.createdDate, '%Y-%m-%d') >='${currentDate}' and DATE_FORMAT(i.createdDate, '%Y-%m-%d') < '${nextDate}' AND i.investor_id = ${allInvestorsWallets[i].dataValues.investorId};`,

				{
					plain: true,
				},
			)) || { amount: 0 }

			await InvestorInfo.create({
				capital_share: allSingleInvestorCash.amount || 0,
				share_percentage: sharePercentage,
				profit_share: profitShare,
				tariff: allInvestorsWallets[i]?.dataValues.tariff,
				investor_net_profit: investorNetProfit,
				investorId: allInvestorsWallets[i]?.dataValues.investorId,
				reinvested: allInvestorsWallets[i]?.dataValues.reinvestment
					? true
					: false,
			})

			if (allInvestorsWallets[i]?.dataValues.reinvestment)
				await InvestorWallet.increment('sum', {
					by: Number(investorNetProfit) || 0,
					where: {
						investorId: allInvestorsWallets[i]?.dataValues.investorId,
					},
				})
		}

		const allInvestorProfit = await InvestorInfo.findAll({
			where: {
				createdAt: {
					[Op.gte]: startDate.toDate(),
					[Op.lt]: endDate.toDate(),
				},
			},
		})

		const allInvestorNetProfit = allInvestorProfit.reduce((acc, curr) => {
			acc += Number(curr.dataValues.investor_net_profit)
			return acc
		}, 0)

		await MainProfit.create({
			earnings,
			costPrice,
			markup,
			curatorsShare,
			allInvestorCash: allInvestorCash.amount ? allInvestorCash.amount : 0,
			marginalIncome,
			expense: expenses,
			operatingIncome,
			fixedIncome: operatingIncome + allOutProfit,
			lucre: operatingIncome + allOutProfit - allInvestorNetProfit,
		})

		res.json({
			success: true,
			message: 'Текущий месяц закрыт',
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			success: false,
			message: 'Не удалось получить всю прибыль на месяц',
		})
	}
}

export const getAllMainProfit = async (req, res) => {
	try {
		const data = await MainProfit.findAll()

		res.json({
			success: true,
			data,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			success: false,
			message: 'Не удалось получить всю прибыль ',
		})
	}
}

export const getAllInvestorProfit = async (req, res) => {
	try {
		const data = await InvestorInfo.findAll({
			include: [
				{
					model: User,
					as: 'investor',
					attributes: ['firstName', 'lastName', 'middleName', 'email', 'phone'],
				},
			],
		})

		res.json({
			success: true,
			data,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			success: false,
			message: 'Не удалось получить всю прибыль инвесторов',
		})
	}
}

export const getDailyDealsInfo = async (req, res) => {
	try {
		const today = moment()

		const dealsToday = await Deal.findAll({
			where: {
				createdAt: {
					[Op.gte]: today.startOf('day').toDate(),
					[Op.lt]: today.add(1, 'day').startOf('day').toDate(),
				},
			},
		})

		// Get the current date
		const todayDate = new Date()
		todayDate.setHours(0, 0, 0, 0)

		// Get the next day for comparison
		const tomorrow = new Date(todayDate)
		tomorrow.setDate(todayDate.getDate() + 2)

		const allPaymentTransactions = await PaymentTransaction.sum('amount', {
			where: {
				deleted: {
					[Op.ne]: 1,
				},
				createdAt: {
					[Op.gte]: today.subtract(1, 'day'),
					[Op.lt]: tomorrow.setHours(0, 0, 0, 0),
				},
			},
		})

		// Себестоимость всех сделок на сегодня

		const totalProductionCost = dealsToday.reduce(
			(sum, deal) => sum + Number(deal.dataValues.originPrice),
			0,
		)

		//Выручка
		// Calculate the total profit using JavaScript
		const totalProfit = dealsToday.reduce((sum, deal) => {
			const price = Number(deal.dataValues.price) || 0
			const originPrice = Number(deal.dataValues.originPrice) || 0
			return Number(sum) + (price - originPrice)
		}, 0)

		res.json({
			success: true,
			data: {
				allDeals: dealsToday.length,
				allPayments: allPaymentTransactions,
				productionCost: totalProductionCost,
				totalProfit: totalProfit,
			},
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			success: false,
			message: 'Не удалось получить информацию за день',
		})
	}
}
