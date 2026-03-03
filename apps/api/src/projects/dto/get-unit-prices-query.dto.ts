import { createZodDto } from 'nestjs-zod';
import { GetUnitPricesQuerySchema } from '@repo/schema';

export class GetUnitPricesQueryDto extends createZodDto(GetUnitPricesQuerySchema) {}
