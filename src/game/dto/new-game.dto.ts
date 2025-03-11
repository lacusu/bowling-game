import {
  IsString,
  IsArray,
  ArrayMaxSize,
  ArrayUnique,
  MinLength,
  ArrayMinSize,
} from 'class-validator';

export class NewGameDto {
  @IsString()
  @MinLength(3)
  name?: string; // Optional game name

  @IsArray()
  @ArrayMaxSize(5)
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true }) // Each element must be a string
  players: string[];
}
