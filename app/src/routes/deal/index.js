import express from 'express'
import checkAuth from '../../helpers/check-auth.js'
import {
	addDeal,
	addPaymentDeal,
	deletePaymentTransaction,
	getAllDeals,
	getCuratorDeals,
	getDealById,
	getDealsByFilter,
	getDelinquency,
	restorePaymentTransaction,
} from '../../controllers/index.js'
import verifyRoles from '../../helpers/verifyRoles.js'
import { USER_ROLES } from '../../config/constants.js'

const router = express.Router()

router.post('/add', checkAuth, verifyRoles(USER_ROLES.Curator), addDeal)

router.get('/all', checkAuth, verifyRoles(USER_ROLES.Admin), getAllDeals)

router.get(
	'/all/filter',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getDealsByFilter,
)

router.get(
	'/curator/all',
	checkAuth,
	verifyRoles(USER_ROLES.Admin, USER_ROLES.Curator),
	getCuratorDeals,
)

router.post(
	'/payment',
	checkAuth,
	verifyRoles(USER_ROLES.Curator),
	addPaymentDeal,
)

router.post(
	'/payment/remove',
	checkAuth,
	verifyRoles(USER_ROLES.Curator),
	deletePaymentTransaction,
)

router.post(
	'/payment/restore',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	restorePaymentTransaction,
)

router.get('/delinquency', getDelinquency)

router.get(
	'/:id',
	checkAuth,
	verifyRoles(USER_ROLES.Admin, USER_ROLES.Curator),
	getDealById,
)

export default router
