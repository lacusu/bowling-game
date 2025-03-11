import { ScoringService } from './scoring.service';
import { BadRequestException } from '@nestjs/common';
import { FramesDto, FrameDto } from './dto/frames.dto';

describe('ScoringService', () => {
  let scoringService: ScoringService;

  beforeEach(() => {
    scoringService = new ScoringService();
  });

  function createFrames(
    previousFrame: Partial<FrameDto> | null,
    currentFrame: Partial<FrameDto>,
  ): FramesDto {
    return <FramesDto>{
      previousFrame: previousFrame ? ({ ...previousFrame } as FrameDto) : null,
      currentFrame: { ...currentFrame } as FrameDto,
    };
  }

  test('should allow valid strike frame', () => {
    const frame = { frameId: 3, rolls: ['X'], cumulativeScore: 0 };
    expect(() => scoringService.validateRolls(frame)).not.toThrow();
  });

  test('should allow valid spare frame', () => {
    const frame = { frameId: 4, rolls: ['6', '/'], cumulativeScore: 0 };
    expect(() => scoringService.validateRolls(frame)).not.toThrow();
  });

  test('should allow valid normal frame', () => {
    const frame = { frameId: 5, rolls: ['3', '5'], cumulativeScore: 0 };
    expect(() => scoringService.validateRolls(frame)).not.toThrow();
  });

  test('should allow valid 10th frame with three rolls', () => {
    const frame = { frameId: 10, rolls: ['X', '7', '2'], cumulativeScore: 0 };
    expect(() => scoringService.validateRolls(frame)).not.toThrow();
  });

  test('should throw error for extra roll in normal frame', () => {
    const frame = { frameId: 2, rolls: ['3', '5', '1'], cumulativeScore: 0 };
    expect(() => scoringService.validateRolls(frame)).toThrow(
      BadRequestException,
    );
  });

  test('should throw error for sum exceeding 10 in normal frame', () => {
    const frame = { frameId: 3, rolls: ['7', '6'], cumulativeScore: 0 }; // Invalid sum = 13
    expect(() => scoringService.validateRolls(frame)).toThrow(
      BadRequestException,
    );
  });

  test('should throw error for sum exceeding 30 in 10th frame', () => {
    const frameInvalid = {
      frameId: 10,
      rolls: ['X', 'X', '11'],
      cumulativeScore: 0,
    }; // Sum = 31
    expect(() => scoringService.validateRolls(frameInvalid)).toThrow(
      BadRequestException,
    );
  });

  test('should allow valid spare frame', () => {
    const frame = { frameId: 4, rolls: ['6', '/'], cumulativeScore: 0 };
    expect(() => scoringService.validateRolls(frame)).not.toThrow();
  });

  test('should throw error if spare (/) is not at index 1', () => {
    const frame = { frameId: 5, rolls: ['/', '5'], cumulativeScore: 0 };
    expect(() => scoringService.validateRolls(frame)).toThrow(
      BadRequestException,
    );
  });

  test('should throw error if strike but having 2 rolls', () => {
    const frame = { frameId: 6, rolls: ['X', '/'], cumulativeScore: 0 };
    expect(() => scoringService.validateRolls(frame)).toThrow(
      BadRequestException,
    );
  });

  test('should return 8 for an open frame (3,5)', () => {
    const frames = createFrames(null, {
      frameId: 1,
      rolls: ['3', '5'],
      cumulativeScore: 0,
    });
    expect(scoringService.calculateTotalScore(frames)).toEqual({
      previousCumulativeScore: 0,
      currentCumulativeScore: 8,
    });
  });

  test('should return 19 for a strike followed by (7,2)', () => {
    const frames = createFrames(
      { frameId: 1, rolls: ['X'], cumulativeScore: 10 },
      { frameId: 2, rolls: ['7', '2'], cumulativeScore: 0 },
    );

    expect(scoringService.calculateTotalScore(frames)).toEqual({
      previousCumulativeScore: 10 + 7 + 2, // Strike bonus applied
      currentCumulativeScore: 19 + 7 + 2,
    });
  });

  test('should handle the 10th frame correctly with a strike (X,8,1)', () => {
    const frames = createFrames(
      { frameId: 9, rolls: ['X'], cumulativeScore: 130 },
      { frameId: 10, rolls: ['X', '8', '1'], cumulativeScore: 0 },
    );

    expect(scoringService.calculateTotalScore(frames)).toEqual({
      previousCumulativeScore: 148, // Strike bonus applied
      currentCumulativeScore: 167, // 10 + 8 + 1
    });
  });

  test('should handle the 10th frame correctly with a spare (8,/,8)', () => {
    const frames = createFrames(
      { frameId: 9, rolls: ['8', '/'], cumulativeScore: 130 },
      { frameId: 10, rolls: ['8', '/', '8'], cumulativeScore: 0 },
    );

    expect(scoringService.calculateTotalScore(frames)).toEqual({
      previousCumulativeScore: 138,
      currentCumulativeScore: 164,
    });
  });

  test('should throw an error for rolls greater than 10', () => {
    const frames = createFrames(null, {
      frameId: 1,
      rolls: ['11', '0'],
      cumulativeScore: 0,
    });
    expect(() => scoringService.calculateTotalScore(frames)).toThrow(
      BadRequestException,
    );
  });

  test('should throw an error for negative rolls', () => {
    const frames = createFrames(null, {
      frameId: 1,
      rolls: ['-1', '5'],
      cumulativeScore: 0,
    });
    expect(() => scoringService.calculateTotalScore(frames)).toThrow(
      BadRequestException,
    );
  });

  test('should throw an error if sum of two rolls exceeds 10 (invalid frame)', () => {
    const frames = createFrames(null, {
      frameId: 1,
      rolls: ['6', '6'],
      cumulativeScore: 0,
    }); // Invalid: 6 + 6 = 12
    expect(() => scoringService.calculateTotalScore(frames)).toThrow(
      BadRequestException,
    );
  });

  test('should throw an error for invalid extra roll outside 10th frame', () => {
    const frames = createFrames(null, {
      frameId: 1,
      rolls: ['5', '2', '3'],
      cumulativeScore: 0,
    }); // Invalid: Extra roll
    expect(() => scoringService.calculateTotalScore(frames)).toThrow(
      BadRequestException,
    );
  });

  test('should throw an error if sum of two rolls exceeds 10 at 10th frame (invalid frame)', () => {
    const frames = createFrames(null, {
      frameId: 10,
      rolls: ['X', '2', '11'],
      cumulativeScore: 0,
    }); // Invalid roll
    expect(() => scoringService.calculateTotalScore(frames)).toThrow(
      BadRequestException,
    );
  });
});
