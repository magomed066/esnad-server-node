import moment from 'moment'
import { Expense, ExpenseCategory, MainWallet } from '../../models/index.js'
import { Op } from 'sequelize'

export const addExpense = async (req, res) => {
	try {
		const { sum, comment, expenseCategoryId, createdDate } = req.body

		await Expense.create({
			sum: Number(sum),
			comment,
			expense_category_id: Number(expenseCategoryId),
			createdDate: createdDate
				? moment(createdDate).toDate()
				: moment(new Date()).toDate(),
		})

		await MainWallet.decrement('sum', { by: sum, where: { id: 1 } })

		res.json({ success: true, message: 'Расход добавлен' })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось добавить расход' })
	}
}

export const getAllExpenses = async (req, res) => {
	try {
		const data = await Expense.findAll({
			include: [{ model: ExpenseCategory, as: 'expense_category' }],
			order: [['createdAt', 'DESC']],
			where: {
				deleted: 0,
			},
		})

		res.json({ success: true, data })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить расходы' })
	}
}

export const getExpensesByMonth = async (req, res) => {
	try {
		const { from, to } = req.params

		const startDate = moment(from).startOf('day') // Set time to beginning of day
		const endDate = moment(to).endOf('day')

		const data = await Expense.findAll({
			where: {
				createdDate: {
					[Op.between]: [startDate.toDate(), endDate.toDate()],
				},
			},
			order: [['createdAt', 'DESC']],
			include: [{ model: ExpenseCategory, as: 'expense_category' }],
		})

		res.json({
			success: true,
			data,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить расходы' })
	}
}

export const getAllExpenseCategories = async (req, res) => {
	try {
		const data = await ExpenseCategory.findAll()

		res.json({ success: true, data })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить категории' })
	}
}

export const deleteExpense = async (req, res) => {
	try {
		const { id } = req.body

		const expense = await Expense.findByPk(id)
		const mainWallet = await MainWallet.findByPk(1)

		if (!expense) {
			return res
				.status(404)
				.json({ success: false, message: 'Не удалось найти расход' })
		}

		if (!mainWallet) {
			return res
				.status(404)
				.json({ success: false, message: 'Кошелек не найден' })
		}

		const updatedWalletSum =
			Number(mainWallet.dataValues.sum) + Number(expense.dataValues.sum)

		await mainWallet.update({ sum: updatedWalletSum }, { where: { id: 1 } })

		await expense.update({ deleted: 1 }, { where: { id } })

		res.json({ success: true, message: 'Расход удален' })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось удалить расход' })
	}
}

export const updateExpense = async (req, res) => {
	try {
		const { id, sum, comment, expenseCategoryId } = req.body

		const expense = await Expense.findByPk(id)
		const mainWallet = await MainWallet.findByPk(1)

		if (!expense) {
			return res
				.status(404)
				.json({ success: false, message: 'Не удалось найти расход' })
		}

		if (!mainWallet) {
			return res
				.status(404)
				.json({ success: false, message: 'Кошелек не найден' })
		}

		if (Number(expense.dataValues.sum) !== Number(sum)) {
			const updatedWalletSum =
				Number(mainWallet.dataValues.sum) -
				Number(expense.dataValues.sum) +
				Number(sum)

			await mainWallet.update({ sum: updatedWalletSum })
		}

		await expense.update(
			{
				sum: Number(sum),
				comment,
				expense_category_id: Number(expenseCategoryId),
			},
			{ where: { id } },
		)

		res.json({ success: true, message: 'Расход удален' })
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось удалить расход' })
	}
}
