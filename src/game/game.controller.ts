import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { NewGameDto } from './dto/new-game.dto';
import { GameService } from './game.service';

@Controller('games')
// @Controller('game.interface.ts')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  createGame(@Body() body: NewGameDto) {
    return this.gameService.create(body);
  }

  @Patch(':gameId/players/:playerName/frames')
  addPlayerFrame(
    @Param('gameId') gameId: string,
    @Param('playerName') playerName: string,
    @Body() frameData: { rolls: string[] },
  ) {
    if (!frameData.rolls) {
      throw new NotFoundException('FramesDto data is required');
    }

    return this.gameService.addPlayerFrame(gameId, playerName, frameData);
  }

  @Get(':gameId/result')
  getGameResult(@Param('gameId') gameId: string) {
    return this.gameService.getGameResult(gameId);
  }

  @Get()
  getGames() {
    return this.gameService.getGames();
  }
}
