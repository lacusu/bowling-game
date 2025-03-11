import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Promise, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Frame, Game, Player } from './schemas/game.schema';
import { NewGameDto } from './dto/new-game.dto';
import { NewFrameDto } from './dto/new-frame.dto';
import { ScoringService } from '../scoring/scoring.service';
import { FrameDto, FramesDto } from '../scoring/dto/frames.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    private readonly scoringService: ScoringService,
  ) {}

  /**
   * Creates a new game.
   * Converts an array of player names to player subdocuments with empty frames and totalScore = 0.
   */
  async create(createGameDto: NewGameDto): Promise<Game> {
    const { name, players } = createGameDto;

    // Use provided name or generate one
    const gameName = name?.trim() || this.generateRandomName();

    // Map each player name to a Player object
    const gamePlayers = players.map((playerName) => ({
      playerName,
      totalScore: 0,
      // frames: [], // Initially, no frames are recorded
    }));

    const createdGame = new this.gameModel({
      name: gameName,
      players: gamePlayers,
    });

    return createdGame.save();
  }

  /**
   * Adds a new frame for a player and updates their cumulative score.
   */
  async addPlayerFrame(
    gameId: string,
    playerId: string,
    frameData: NewFrameDto,
  ): Promise<Game> {
    // Convert string IDs to ObjectId
    const gameObjectId = new Types.ObjectId(gameId);
    // const playerObjectId = new Types.ObjectId(playerId);

    // Find the game first
    const game = await this.gameModel.findById(gameObjectId).exec();

    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    // Find the player in the game
    const playerIndex = this.findPlayerIndex(game.players, playerId);

    if (playerIndex === -1) {
      throw new NotFoundException(
        `Player with ID ${playerId} not found in game ${gameId}`,
      );
    }

    const currentFrame = game.players[playerIndex].onFrame + 1;

    if (currentFrame > 10) {
      throw new BadRequestException(
        `Exceeded the frame limit. Players cannot have more than 10 frames.`,
      );
    }

    const player: Player = game.players[playerIndex];

    // Get the previous frame to calculate scoring
    const previousFrame: Frame | null =
      currentFrame == 1 ? null : this.getFrame(player, player.onFrame);

    // Init new frame
    const newFrame: Frame = new Frame();
    newFrame.rolls = frameData.rolls;
    newFrame.frameId = currentFrame;

    //Get Scoring
    const framesDto: FramesDto = new FramesDto();
    let previousFrameDto: FrameDto | null = null;
    if (previousFrame) {
      previousFrameDto = new FrameDto();
      previousFrameDto.rolls = previousFrame.rolls;
      previousFrameDto.cumulativeScore = previousFrame.cumulativeScore;
      previousFrameDto.frameId = previousFrame.frameId;
    }
    framesDto.previousFrame = previousFrameDto;
    framesDto.currentFrame = newFrame;

    const { previousCumulativeScore, currentCumulativeScore } =
      this.scoringService.calculateTotalScore(framesDto);
    if (previousFrame) {
      const frameObjectId = previousFrame._id;
      const frameIndex = game.players[playerIndex].frames.findIndex(
        (frame) => frame._id === frameObjectId,
      );
      // Update the cumulative score for previous frame
      game.players[playerIndex].frames[frameIndex].cumulativeScore =
        previousCumulativeScore;
    }

    // Set cumulative score for new frame
    newFrame.cumulativeScore = currentCumulativeScore;

    // Add the new frame
    game.players[playerIndex].frames.push(newFrame);

    //Update the total score
    game.players[playerIndex].totalScore = newFrame.cumulativeScore;

    // Set current frame
    game.players[playerIndex].onFrame = currentFrame;

    //Check the game status
    if (currentFrame == 10) {
      game.countOfCompleted = game.countOfCompleted + 1;
      if (game.countOfCompleted === game.players.length) {
        game.completed = true;
      }
    }

    return game.save();
  }

  /**
   * Retrieves the for a specific game result
   */
  async getGameResult(gameId: string): Promise<{
    name: string;
    players: { rank: number; playerName: string; totalScore: number }[];
  }> {
    if (!Types.ObjectId.isValid(gameId)) {
      throw new NotFoundException(`Invalid game ID: ${gameId}`);
    }

    const game = await this.gameModel.findById(gameId);
    if (!game) {
      throw new NotFoundException(`Game with id ${gameId} not found`);
    }

    const sortedPlayers = [...game.players].sort(
      (a, b) => b.totalScore - a.totalScore,
    );

    let rank = 1;
    const rankedPlayers = sortedPlayers.map((player, index) => {
      if (
        index > 0 &&
        sortedPlayers[index].totalScore < sortedPlayers[index - 1].totalScore
      ) {
        rank = index + 1;
      }

      return {
        rank,
        playerName: player.playerName,
        totalScore: player.totalScore,
      };
    });

    return {
      name: game.name || 'Untitled Game',
      players: rankedPlayers,
    };
  }

  /**
   * Generate a random game name if none is provided.
   */
  private generateRandomName(): string {
    const adjectives = [
      'Fast',
      'Fierce',
      'Epic',
      'Legendary',
      'Mighty',
      'Dynamic',
    ];
    const nouns = [
      'Battle',
      'Strike',
      'Bowl',
      'Showdown',
      'Challenge',
      'Arena',
    ];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdj} ${randomNoun} #${Math.floor(1000 + Math.random() * 9000)}`; // Example: "Epic Bowl #2345"
  }

  /**
   * Retrieves a list of all games with basic details.
   */
  async getGames(): Promise<
    {
      id: string;
      name: string;
      players: { id: string; playerName: string; totalScore: number }[];
    }[]
  > {
    const games = await this.gameModel.find().sort({ createdAt: -1 }).exec(); // Fetch all games sorted by creation date

    return games.map((game) => ({
      id: game._id.toString(),
      name: game.name,
      players: game.players.map((player) => ({
        id: player._id.toString(),
        playerName: player.playerName,
        totalScore: player.totalScore,
      })),
    }));
  }

  private getFrame(player: Player, frameId: number): Frame {
    if (isNaN(frameId)) {
      throw new NotFoundException(`Invalid frame ID: ${frameId}`);
    }

    // Find the frame inside the player
    const frame = player.frames.find((f) => f.frameId === frameId);

    // Throw error if frame is not found
    if (!frame) {
      throw new NotFoundException(
        `Frame ${frameId} not found for player ${player.playerName}`,
      );
    }

    return frame;
  }

  // private createFramesForScoring(
  //   previousFrame: Frame | null,
  //   currentFrame: Frame,
  // ): FramesDto {
  //   return <FramesDto>{
  //     previousFrame: previousFrame ? ({ ...previousFrame } as FrameDto) : null,
  //     currentFrame: { ...currentFrame } as FrameDto,
  //   };
  // }

  private findPlayerIndex(players: Player[], playerId: string): number {
    if (!playerId) {
      return -1;
    }
    return players.findIndex((player) => player._id.toString() === playerId);
  }
}
