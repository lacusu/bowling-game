export class FramesDto {
  previousFrame: null | FrameDto;
  currentFrame: FrameDto;
}

export class FrameDto {
  frameId: number;

  rolls: string[];

  cumulativeScore: number;
}
