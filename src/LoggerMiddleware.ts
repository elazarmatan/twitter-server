import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {

    console.log('========================================');
    console.log(`method: ${req.method} url: ${req.originalUrl}`);
    console.log(new Date().toLocaleString());
    console.log('========================================');

    next();
  }
}