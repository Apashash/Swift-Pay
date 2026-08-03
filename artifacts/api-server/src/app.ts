import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes";
import webhookRouter from "./routes/webhooks";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());

// Webhooks OxaPay — delivered as plain JSON, no raw body needed
app.use("/webhooks", webhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve the built React frontend for all non-API routes (production / Plesk deployment).
// In development the Vite dev server handles the frontend separately.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(__dirname, "../../swift-pay/dist/public");
app.use(express.static(frontendDist));
app.get(/^(?!\/api).*$/, (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// Global JSON error handler — must have 4 params for Express to recognise it as an error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error && err.name === "ValidationError") {
    res.status(400).json({ message: err.message });
    return;
  }
  const message =
    err instanceof Error ? err.message : "Une erreur interne est survenue.";
  logger.error({ err }, "Unhandled error");
  const statusCode =
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    typeof err.statusCode === "number"
      ? err.statusCode
      : 500;
  res.status(statusCode).json({ message });
});

export default app;
