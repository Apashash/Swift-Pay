import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import transactionsRouter from "./transactions";
import ratesRouter from "./rates";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(transactionsRouter);
router.use(ratesRouter);

export default router;
