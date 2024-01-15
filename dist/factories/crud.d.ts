import { Response, Request, NextFunction } from "express";
export declare const genrateItemCreate: (prismaTableController: any) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const genrateItemsRead: (prismaTableController: any) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const genrateItemRead: (prismaTableController: any) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const genrateItemUpdate: (prismaTableController: any) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const genrateItemDelete: (prismaTableController: any) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
