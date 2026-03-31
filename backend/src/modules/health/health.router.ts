//deploy
import { Router } from "express";
import { asyncHandler } from "../common/async-handler";
import { prisma } from "../../lib/prisma";

export const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (_request, response) => {
    await prisma.$queryRawUnsafe("SELECT 1");
    response.json({
      status: "ok",
      database: "up",
      timestamp: new Date().toISOString(),
    });
  }),
);
