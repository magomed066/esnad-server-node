import express from 'express'
import checkAuth from '../../helpers/check-auth.js'
import {
	investToMainWallet,
	transactBetweenCurator,
	transactToCurator,
	getAllInvestments,
	getCuratorTransaction,
	getAdminTransaction,
	getAdminCuratorsTransaction,
	transactCuratorToMainWallet,
	getCuratorToMainWalletTransactions,
	getAllToMainWalletTransactions,
	getDeletedPaymentTransactions,
	deleteInvestment,
	updateInvestment,
	getAllWithdrawals,
	withdrawInvestment,
	getAllInvestorWithdrawals,
} from '../../controllers/transaction/index.js'
import verifyRoles from '../../helpers/verifyRoles.js'
import { USER_ROLES } from '../../config/constants.js'
import { addOutProfitTransaction } from '../../controllers/out-profit/index.js'

const router = express.Router()

router.post(
	'/invest',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	investToMainWallet,
)

router.delete(
	'/investment/delete/:id',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	deleteInvestment,
)
router.put(
	'/investment/update',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	updateInvestment,
)

router.get(
	'/investments',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getAllInvestments,
)

router.get(
	'/curator',
	checkAuth,
	verifyRoles(USER_ROLES.Admin, USER_ROLES.Curator),
	getCuratorTransaction,
)
router.get(
	'/curators',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getAdminCuratorsTransaction,
)

router.get(
	'/admin',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getAdminTransaction,
)

router.post(
	'/to-curator',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	transactToCurator,
)

router.post(
	'/between-curators',
	checkAuth,
	verifyRoles(USER_ROLES.Admin, USER_ROLES.Curator),
	transactBetweenCurator,
)

router.post(
	'/to-main-wallet',
	checkAuth,
	verifyRoles(USER_ROLES.Curator),
	transactCuratorToMainWallet,
)

router.get(
	'/to-main-wallet/all',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getAllToMainWalletTransactions,
)
router.get(
	'/to-main-wallet/curator',
	checkAuth,
	verifyRoles(USER_ROLES.Admin, USER_ROLES.Curator),
	getCuratorToMainWalletTransactions,
)

router.get(
	'/payment-transactions/cart',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getDeletedPaymentTransactions,
)

router.post(
	'/out-profit/add',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	addOutProfitTransaction,
)

router.get(
	'/withdrawal/all',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	getAllWithdrawals,
)

router.post(
	'/withdrawal/add',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	withdrawInvestment,
)

router.get(
	'/withdrawal/investor/all',
	checkAuth,
	verifyRoles(USER_ROLES.Investor),
	getAllInvestorWithdrawals,
)

export default router
