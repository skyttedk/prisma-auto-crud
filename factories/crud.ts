import { Response, Request, NextFunction } from "express"
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const genrateItemCreate =
  (prismaTableController: any) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = req.body
        const newItem = await prismaTableController.create({ data })
        res.send(newItem)
      } catch (error) {
        next(error)
      }
    }

export const genrateItemsRead =
  (prismaTableController: any) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {

        //KSS
        if (req.query.request) {
          //@ts-ignore
          req.query = JSON.parse(req.query.request)
          req.query['take'] = req.query['limit']; delete req.query['limit'];
          req.query['skip'] = req.query['offset']; delete req.query['offset'];
          req.query['include'] = JSON.stringify(req.query['include']);
          if (req.query['search']) {
            //@ts-ignore
            if (req.query['search'].length === 1 && req.query['search'][0].field === 'All' && req.query['search'][0].value === '') {
              delete req.query['search'];
            } else {
              //@ts-ignore
              req.query['search'] = convertSearchToPrismaWhere(req.query['model'], req.query); 7
            }
            delete req.query['searchLogic'];
          }
          delete req.query['model'];
        }



        const {
          skip = 0,
          take = 100,
          sort = "id",
          order = "desc",
          search,
          include,
          ...rest
        } = req.query as any

        // Note: offset pagination does not scale well
        // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#-cons-of-offset-pagination
        const query = {
          where: { ...rest, ...(search ? JSON.parse(search) : undefined) },
        }

        const fullQuery = {
          ...query,
          skip: Number(skip),
          take: Number(take),
          orderBy: [{ [sort as string]: order }],
          include: include ? JSON.parse(include) : undefined,
        }

        const items = await prismaTableController.findMany(fullQuery)

        const total = await prismaTableController.count(query)

        res.send({ skip, take, total, items })
      } catch (error) {
        next(error)
      }
    }



async function convertSearchToPrismaWhere(model: any, searchData: any) {

  searchData.search = Array(searchData.search[0])

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
      item.operator = 'startsWith'
    } else if (item.operator === '=') {
      item.operator = 'equals'
      item.value = Number(item.value)
    } else if (item.operator === 'in') {
      item.value = Array(item.value)
    }



    if (field.type === 'text') {
      return {
        [item.field]: {
          [item.operator]: item.value,
          'mode': 'insensitive'
        }
      };

    } else {
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
}


function getEnumValuesForModel(fieldName: String) {
  const prisma = new PrismaClient();
  //@ts-ignore
  const modelEnumType = prisma._dmmf.enums.find((e) => e.name === fieldName);
  //@ts-ignore
  return modelEnumType ? modelEnumType.values.map((v) => v.name) : null;
}



export const genrateItemRead =
  (prismaTableController: any) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { primaryKeyField } = prismaTableController
        const { primaryKey } = req.params
        let { includes = [] } = req.query

        if (typeof includes === "string") includes = [includes]

        const query: any = { where: { [primaryKeyField]: Number(primaryKey) } }
        if (includes.length)
          //@ts-ignore
          query.include = includes.reduce(
            (prev: any, i: any) => ({ ...prev, [i]: true }),
            {}
          )

        const item = await prismaTableController.findUnique(query)
        res.send(item)
      } catch (error) {
        next(error)
      }
    }

export const genrateItemUpdate =
  (prismaTableController: any) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { primaryKeyField } = prismaTableController
        const { primaryKey } = req.params
        const data = req.body

        const query = { where: { [primaryKeyField]: Number(primaryKey) }, data }

        const itemUpdate = await prismaTableController.update(query)
        res.send(itemUpdate)
      } catch (error) {
        next(error)
      }
    }

export const genrateItemDelete =
  (prismaTableController: any) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { primaryKeyField } = prismaTableController
        const { primaryKey } = req.params
        const query = { where: { [primaryKeyField]: Number(primaryKey) } }
        const itemDelete = await prismaTableController.delete(query)
        res.send(itemDelete)
      } catch (error) {
        next(error)
      }
    }
