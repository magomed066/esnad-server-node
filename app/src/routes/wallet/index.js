import express from 'express'
import checkAuth from '../../helpers/check-auth.js'
import { getMainWallet } from '../../controllers/curator-wallet/index.js'
import verifyRoles from '../../helpers/verifyRoles.js'
import { USER_ROLES } from '../../config/constants.js'

const router = express.Router()

router.get('/', checkAuth, verifyRoles(USER_ROLES.Admin), getMainWallet)

export default router
