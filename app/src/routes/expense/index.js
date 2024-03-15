import express from 'express'
import checkAuth from '../../helpers/check-auth.js'
import verifyRoles from '../../helpers/verifyRoles.js'
import { USER_ROLES } from '../../config/constants.js'
import {
	addExpense,
	deleteExpense,
	getAllExpenseCategories,
	getAllExpenses,
	getExpensesByMonth,
	updateExpense,
} from '../../controllers/index.js'

const router = express.Router()

router.post('/add', checkAuth, verifyRoles(USER_ROLES.Admin), addExpense)
router.delete(
	'/delete',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	deleteExpense,
)
router.put('/updated', checkAuth, verifyRoles(USER_ROLES.Admin), updateExpense)
router.get('/all', checkAuth, verifyRoles(USER_ROLES.Admin), getAllExpenses)
router.get(
	'/all/:from/:to',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getExpensesByMonth,
)
router.get(
	'/category/all',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getAllExpenseCategories,
)

export default router
