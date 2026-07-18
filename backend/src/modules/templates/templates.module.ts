import { Body, Controller, Get, Module, Post, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { PrismaService } from '../../platform/prisma.module';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

const jsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ]),
);

const templateSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(1),
  description: z.string(),
  category: z.string(),
  adl: z.record(jsonValueSchema).transform((value): Prisma.InputJsonObject => value),
  schema: z.record(jsonValueSchema).transform((value): Prisma.InputJsonObject => value),
});

@ApiTags('templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List published templates' })
  @ApiQuery({ name: 'category', required: false, type: 'string' })
  async list(@Query('category') category?: string) {
    const templates = await this.prisma.template.findMany({
      where: { status: 'PUBLISHED', ...(category ? { category } : {}) },
      orderBy: { name: 'asc' },
    });

    return templates.map((row) => {
      const adl = (row.adl as any) || {};
      const schema = (row.schema as any) || {};

      const emoji = schema.emoji !== undefined ? schema.emoji : (adl.emoji !== undefined ? adl.emoji : null);
      const accent = schema.accent !== undefined ? schema.accent : (adl.accent !== undefined ? adl.accent : null);
      const blocks = adl.blocks !== undefined ? adl.blocks : (schema.blocks !== undefined ? schema.blocks : null);

      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        category: row.category,
        emoji,
        accent,
        blocks,
        version: row.version,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new template', deprecated: true })
  /**
   * @deprecated Templates should typically not be created dynamically through the client API. Use database seeds.
   */
  create(@Body(new ZodValidationPipe(templateSchema)) body: z.infer<typeof templateSchema>) {
    return this.prisma.template.create({ data: body });
  }
}

@Module({
  controllers: [TemplatesController],
})
export class TemplatesModule {}
