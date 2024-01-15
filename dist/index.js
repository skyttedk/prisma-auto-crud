"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This file is the middleware
const express_1 = require("express");
const router_1 = require("./factories/router");
const http_errors_1 = __importDefault(require("http-errors"));
// Note: Middleware cannot be async
const middleware = (prismaClient, opts = {}) => {
    const router = (0, express_1.Router)();
    // @ts-ignore
    const modelsMap = prismaClient._runtimeDataModel.models;
    const modelNames = Object.keys(modelsMap);
    router.get("/models", (req, res) => {
        res.send(modelNames);
    });
    router.get("/models/:modelName", (req, res) => {
        const { modelName } = req.params;
        const model = modelsMap[modelName];
        if (!model)
            throw (0, http_errors_1.default)(404, `Model ${modelName} does not exist`);
        res.send(model);
    });
    // Generate routes and their controllers for each table
    modelNames.forEach((name) => {
        var _a;
        const { fields } = modelsMap[name];
        const tableRoute = `/${name}`;
        const prismaTableController = prismaClient[name];
        // Adding the field used as id
        prismaTableController.primaryKeyField = (_a = fields.find(({ isId }) => isId)) === null || _a === void 0 ? void 0 : _a.name;
        const tableRouter = (0, router_1.generateTableRouter)(prismaTableController);
        router.use(tableRoute, tableRouter);
    });
    return router;
};
exports.default = middleware;
