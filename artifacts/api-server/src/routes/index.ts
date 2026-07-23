import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import fotosRouter from "./fotos";
import quizRouter from "./quiz";
import curiosidadesRouter from "./curiosidades";
import cacaPalavrasRouter from "./cacapalavras";
import labRouter from "./lab";
import statsRouter from "./stats";
import configRouter from "./config";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(fotosRouter);
router.use(quizRouter);
router.use(curiosidadesRouter);
router.use(cacaPalavrasRouter);
router.use(labRouter);
router.use(statsRouter);
router.use(configRouter);

export default router;
