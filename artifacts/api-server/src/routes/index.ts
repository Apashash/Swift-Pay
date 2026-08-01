import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import transactionsRouter from "./transactions";
import ratesRouter from "./rates";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";
import cryptoAssetsRouter from "./cryptoAssets";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(transactionsRouter);
router.use(ratesRouter);
router.use(notificationsRouter);
router.use(adminRouter);
router.use(cryptoAssetsRouter);

export default router;
