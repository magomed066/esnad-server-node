import express from 'express'
import checkAuth from '../../helpers/check-auth.js'
import verifyRoles from '../../helpers/verifyRoles.js'
import { USER_ROLES } from '../../config/constants.js'
import {
	addAllMainProfit,
	getAllCuratorsProfitByMonth,
	getAllInvestorProfit,
	getAllMainProfit,
	getAllProfitByMonth,
	getCostPriceByMonth,
	getDailyDealsInfo,
	getMarginalIncome,
	getMarkupByMonth,
	getOperatingIncome,
} from '../../controllers/index.js'
import {
	getAllOutProfit,
	getAllOutProfitByMonth,
} from '../../controllers/out-profit/index.js'

const router = express.Router()

router.get(
	'/all/:year/:month',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getAllProfitByMonth,
)

router.get(
	'/cost-price/:year/:month',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getCostPriceByMonth,
)

router.get(
	'/markup-price/:year/:month',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getMarkupByMonth,
)

router.get(
	'/curators/:year/:month',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getAllCuratorsProfitByMonth,
)

router.get(
	'/marginal-income/:year/:month',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getMarginalIncome,
)

router.get(
	'/operating-income/:year/:month',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getOperatingIncome,
)

router.get(
	'/close-profit-month/:year/:month',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	addAllMainProfit,
)

router.get(
	'/out-profit/:from/:to',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getAllOutProfitByMonth,
)

router.get(
	'/out-profit/all',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getAllOutProfit,
)

router.get(
	'/main-profit',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getAllMainProfit,
)

router.get(
	'/investors-profit',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getAllInvestorProfit,
)
router.get(
	'/daily-deals-info',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getDailyDealsInfo,
)

export default router
