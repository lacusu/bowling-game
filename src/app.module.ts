import { Module } from '@nestjs/common';
import { GameController } from './game/game.controller';
import { GameService } from './game/game.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './game/schemas/game.schema';
import { ScoringService } from './scoring/scoring.service';

@Module({
  controllers: [GameController],
  providers: [GameService, ScoringService],
  imports: [
    ConfigModule.forRoot(), // Loads environment variables
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/bowling',
      {
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASSWORD,
        dbName: process.env.MONGO_DB,
      },
    ),
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]), // Register Game schema
  ],
})
export class AppModule {}
