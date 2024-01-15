"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTableRouter = void 0;
const express_1 = require("express");
const crud_1 = require("./crud");
const generateTableRouter = (prismaTableController) => {
    const router = (0, express_1.Router)();
    router
        .route("/")
        .post((0, crud_1.genrateItemCreate)(prismaTableController))
        .get((0, crud_1.genrateItemsRead)(prismaTableController));
    router
        .route("/:primaryKey")
        .get((0, crud_1.genrateItemRead)(prismaTableController))
        .patch((0, crud_1.genrateItemUpdate)(prismaTableController))
        .delete((0, crud_1.genrateItemDelete)(prismaTableController));
    return router;
};
exports.generateTableRouter = generateTableRouter;
