import express from 'express'
import checkAuth from '../../helpers/check-auth.js'
import { getAllCurators } from '../../controllers/user/index.js'
import verifyRoles from '../../helpers/verifyRoles.js'
import { USER_ROLES } from '../../config/constants.js'

const router = express.Router()

router.get(
	'/all',
	checkAuth,
	verifyRoles(USER_ROLES.Admin, USER_ROLES.Curator),
	getAllCurators,
)

export default router
