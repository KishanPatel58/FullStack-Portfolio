import {Router} from 'express';
import { getAdmin, loginAdmin, logoutAdmin, resendEmailOtp, resendForgotPasswordOtp, sendForgotPasswordOtp, setNewPassword, verifyEmail, verifyForgotPasswordOtp } from '../controllers/auth.controller.js';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware.js';
const authRouter = Router();


authRouter.post("/login", loginAdmin)
authRouter.post("/verifyemail", verifyEmail)
authRouter.post("/forgotpasswordotp", sendForgotPasswordOtp)
authRouter.post("/verifyforgotpasswordotp", verifyForgotPasswordOtp)
authRouter.post("/resendotp", resendEmailOtp);
authRouter.post("/resendforgotpasswordotp", resendForgotPasswordOtp);

authRouter.put("/setnewpassword", setNewPassword)

authRouter.get("/getadmin",optionalAuthMiddleware, getAdmin)

authRouter.use(authMiddleware)
authRouter.post("/logout", logoutAdmin)

export default authRouter;