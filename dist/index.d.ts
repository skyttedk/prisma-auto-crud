import { PrismaClient } from "@prisma/client";
declare const middleware: (prismaClient: PrismaClient, opts?: {}) => import("express-serve-static-core").Router;
export default middleware;
