import { IsString, IsArray } from 'class-validator';

export class NewFrameDto {
  @IsArray()
  @IsString({ each: true }) // Each element must be a string
  rolls: string[];
}
