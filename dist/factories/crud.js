"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genrateItemDelete = exports.genrateItemUpdate = exports.genrateItemRead = exports.genrateItemsRead = exports.genrateItemCreate = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const genrateItemCreate = (prismaTableController) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const newItem = yield prismaTableController.create({ data });
        res.send(newItem);
    }
    catch (error) {
        next(error);
    }
});
exports.genrateItemCreate = genrateItemCreate;
const genrateItemsRead = (prismaTableController) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //KSS
        if (req.query.request) {
            //@ts-ignore
            req.query = JSON.parse(req.query.request);
            req.query['take'] = req.query['limit'];
            delete req.query['limit'];
            req.query['skip'] = req.query['offset'];
            delete req.query['offset'];
            req.query['include'] = JSON.stringify(req.query['include']);
            if (req.query['search']) {
                //@ts-ignore
                if (req.query['search'].length === 1 && req.query['search'][0].field === 'All' && req.query['search'][0].value === '') {
                    delete req.query['search'];
                }
                else {
                    //@ts-ignore
                    req.query['search'] = convertSearchToPrismaWhere(req.query['model'], req.query);
                    7;
                }
                delete req.query['searchLogic'];
            }
            delete req.query['model'];
        }
        const _a = req.query, { skip = 0, take = 100, sort = "id", order = "desc", search, include } = _a, rest = __rest(_a, ["skip", "take", "sort", "order", "search", "include"]);
        // Note: offset pagination does not scale well
        // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#-cons-of-offset-pagination
        const query = {
            where: Object.assign(Object.assign({}, rest), (search ? JSON.parse(search) : undefined)),
        };
        const fullQuery = Object.assign(Object.assign({}, query), { skip: Number(skip), take: Number(take), orderBy: [{ [sort]: order }], include: include ? JSON.parse(include) : undefined });
        const items = yield prismaTableController.findMany(fullQuery);
        const total = yield prismaTableController.count(query);
        res.send({ skip, take, total, items });
    }
    catch (error) {
        next(error);
    }
});
exports.genrateItemsRead = genrateItemsRead;
function convertSearchToPrismaWhere(model, searchData) {
    return __awaiter(this, void 0, void 0, function* () {
        searchData.search = Array(searchData.search[0]);
        const { search, searchLogic } = searchData;
        // Map each search term to a corresponding Prisma condition
        //@ts-ignore
        const conditions = search.map(item => {
            // Convert w2ui terminology to Prisma terminology
            // model.fields is an array of field objects
            //@ts-ignore
            const field = model.fields.find(({ name }) => name === item.field);
            const type = field.type;
            //we cant trust that searchData is using the correct operator. Therefor we must check type from model.
            //if (type === 'Int') {
            //    if (item.operator === 'begins') {
            //        item.operator = 'startsWith'
            //    } else if (item.operator === '=') {
            //        item.operator = 'equals'
            //        item.value = Number(item.value)
            //    }
            //}
            if (field.kind == 'enum') {
                const fieldType = field.type; // ex. ViewType
                //@ts-ignore
                getEnumValuesForModel(fieldType).then((values) => {
                    console.log(values); // Output: ['USER', 'ADMIN', 'MODERATOR']
                });
                // get values from this prisma enum
                //const enumValues = model[fieldType].enumValues; not available in prisma 2.0
            }
            //const prismaOperator = item.operator === 'begins' ? 'startsWith' : item.operator;
            if (item.operator === 'begins') {
                item.operator = 'startsWith';
            }
            else if (item.operator === '=') {
                item.operator = 'equals';
                item.value = Number(item.value);
            }
            else if (item.operator === 'in') {
                item.value = Array(item.value);
            }
            if (field.type === 'text') {
                return {
                    [item.field]: {
                        [item.operator]: item.value,
                        'mode': 'insensitive'
                    }
                };
            }
            else {
                return {
                    [item.field]: {
                        [item.operator]: item.value,
                    }
                };
            }
        });
        // Combine the conditions using the specified search logic ('AND' or 'OR')
        const whereClause = searchLogic === 'OR' ? { OR: conditions } : { AND: conditions };
        return whereClause;
    });
}
function getEnumValuesForModel(fieldName) {
    const prisma = new client_1.PrismaClient();
    //@ts-ignore
    const modelEnumType = prisma._dmmf.enums.find((e) => e.name === fieldName);
    //@ts-ignore
    return modelEnumType ? modelEnumType.values.map((v) => v.name) : null;
}
const genrateItemRead = (prismaTableController) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { primaryKeyField } = prismaTableController;
        const { primaryKey } = req.params;
        let { includes = [] } = req.query;
        if (typeof includes === "string")
            includes = [includes];
        const query = { where: { [primaryKeyField]: Number(primaryKey) } };
        if (includes.length)
            //@ts-ignore
            query.include = includes.reduce((prev, i) => (Object.assign(Object.assign({}, prev), { [i]: true })), {});
        const item = yield prismaTableController.findUnique(query);
        res.send(item);
    }
    catch (error) {
        next(error);
    }
});
exports.genrateItemRead = genrateItemRead;
const genrateItemUpdate = (prismaTableController) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { primaryKeyField } = prismaTableController;
        const { primaryKey } = req.params;
        const data = req.body;
        const query = { where: { [primaryKeyField]: Number(primaryKey) }, data };
        const itemUpdate = yield prismaTableController.update(query);
        res.send(itemUpdate);
    }
    catch (error) {
        next(error);
    }
});
exports.genrateItemUpdate = genrateItemUpdate;
const genrateItemDelete = (prismaTableController) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { primaryKeyField } = prismaTableController;
        const { primaryKey } = req.params;
        const query = { where: { [primaryKeyField]: Number(primaryKey) } };
        const itemDelete = yield prismaTableController.delete(query);
        res.send(itemDelete);
    }
    catch (error) {
        next(error);
    }
});
exports.genrateItemDelete = genrateItemDelete;
