import { PlayerListDto } from './player-list.dto';

export class GameListDto {
  id: string;
  name: string;
  players: PlayerListDto[];
  createdAt: Date;
}
