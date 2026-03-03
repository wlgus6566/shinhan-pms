import { createZodDto } from 'nestjs-zod';
import { SaveUnitPricesSchema } from '@repo/schema';

export class SaveUnitPricesDto extends createZodDto(SaveUnitPricesSchema) {}
