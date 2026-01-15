import { Module } from '@nestjs/common';

import { LinksModule } from './links/links.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ProjectsModule, LinksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
