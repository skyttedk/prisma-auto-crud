"use strict";
// This file is used in the Docker container
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./index"));
const prismaClient_1 = __importDefault(require("./prismaClient"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { PORT = 80 } = process.env;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send({
        application_name: "Prisma Auto CRUD",
    });
});
app.use((0, index_1.default)(prismaClient_1.default));
app.listen(PORT, () => {
    console.log(`[Express] Listening on port ${PORT}`);
});
