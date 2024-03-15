import express from 'express'
import {
	deleteUserById,
	getInvestorById,
	getUserById,
	getUserWallet,
	login,
	logout,
	refreshToken,
	registerUser,
	updateInvestorReinvestmentStatus,
	updateUserById,
} from '../../controllers/user/index.js'
import handleValidationErrors from '../../helpers/handle-validation-errors.js'
import { loginValidation, registerValidation } from '../../validators/index.js'
import checkAuth from '../../helpers/check-auth.js'
import verifyRoles from '../../helpers/verifyRoles.js'
import { USER_ROLES } from '../../config/constants.js'

const router = express.Router()

router.post('/login', loginValidation, handleValidationErrors, login)
router.post(
	'/register',
	registerValidation,
	handleValidationErrors,
	registerUser,
)
router.get('/logout', logout)
router.get('/refresh-token', refreshToken)

router.get('/wallet', checkAuth, getUserWallet)

router.delete(
	'/delete/:id',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	deleteUserById,
)
router.get('/:id', checkAuth, verifyRoles(USER_ROLES.Admin), getUserById)
router.put('/update', checkAuth, verifyRoles(USER_ROLES.Admin), updateUserById)
router.put(
	'/update-reinvestment',
	checkAuth,
	verifyRoles(USER_ROLES.Admin),
	updateInvestorReinvestmentStatus,
)

export default router
