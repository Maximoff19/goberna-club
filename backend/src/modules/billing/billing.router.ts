//hola
import { Router } from "express";

export const billingRouter = Router();

billingRouter.get("/", (_request, response) => {
  response.json({
    module: "billing",
    enabled: false,
    reason: "Payments are intentionally out of scope for this phase.",
  });
});
