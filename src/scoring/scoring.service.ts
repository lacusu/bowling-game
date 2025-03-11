import { BadRequestException, Injectable } from '@nestjs/common';
import { FrameDto, FramesDto } from './dto/frames.dto';

@Injectable()
export class ScoringService {
  STRIKE_SYMBOL = 'X';
  SPARE_SYMBOL = '/';
  MAX_FRAMES_SCORE = 10;
  /**
   * Calculates cumulative score for the current frame, considering the previous frame.
   */
  calculateTotalScore(frames: FramesDto) {
    const { previousFrame, currentFrame } = frames;

    // Validate roll input
    this.validateRolls(currentFrame);

    let previousCumulativeScore: number = previousFrame?.cumulativeScore || 0;

    // Apply bonus if previous frame was a strike or spare
    if (previousFrame && previousFrame.frameId) {
      // Validate roll input
      this.validateRolls(previousFrame);
      if (this.isStrike(previousFrame.rolls)) {
        previousCumulativeScore += this.getStrikeBonus(currentFrame);
      } else if (this.isSpare(previousFrame.rolls)) {
        previousCumulativeScore += this.getSpareBonus(currentFrame);
      }
    }

    // Calculate current frame score
    const currentCumulativeScore: number =
      previousCumulativeScore + this.calculateFrameScore(currentFrame);

    return { previousCumulativeScore, currentCumulativeScore };
  }

  /**
   * Calculates the score for a single frame.
   */
  private calculateFrameScore(frame: FrameDto): number {
    const { rolls, frameId } = frame;

    // **10th Frame Special Handling**
    if (frameId === 10) {
      return this.calculateTenthFrameScore(rolls);
    }

    if (this.isStrike(rolls)) return this.MAX_FRAMES_SCORE;
    if (this.isSpare(rolls)) return this.MAX_FRAMES_SCORE;
    return this.getIntValue(rolls[0]) + this.getIntValue(rolls[1]);
  }

  /**
   * Handles scoring for the 10th frame (extra rolls allowed).
   */
  private calculateTenthFrameScore(rolls: string[]): number {
    if (rolls.length < 2 || rolls.length > 3) {
      throw new BadRequestException('10th frame must have 2 or 3 rolls');
    }

    let score = 0;
    for (let i = 0; i < rolls.length; i++) {
      score += this.getRollValue(rolls[i]);

      if (rolls[i] === this.SPARE_SYMBOL && i === 1) {
        score += this.getRollValue(rolls[2]); // Bonus roll after spare
        break;
      }
    }
    return score;
  }

  /**
   * Returns the bonus for a strike (sum of the next two rolls).
   */
  private getStrikeBonus(nextFrame: FrameDto): number {
    return (
      this.getRollValue(nextFrame.rolls[0]) +
      this.getRollValue(nextFrame.rolls[1])
    );
  }

  /**
   * Returns the bonus for a spare (next roll only).
   */
  private getSpareBonus(nextFrame: FrameDto): number {
    return this.getRollValue(nextFrame.rolls[0]);
  }

  /**
   * Determines if a frame is a strike.
   */
  private isStrike(rolls: string[]): boolean {
    return rolls[0].toUpperCase() === this.STRIKE_SYMBOL;
  }

  /**
   * Determines if a frame is a spare.
   */
  private isSpare(rolls: string[]): boolean {
    return rolls[1] === this.SPARE_SYMBOL;
  }

  /**
   * Validates that rolls are valid values.
   */
  validateRolls(frame: FrameDto) {
    const rolls: string[] = frame.rolls;
    const frameId: number = frame.frameId;
    const rollSize: number = rolls.length;

    // Define valid roll values: "X", "/", "0"-"9"
    const validRolls = [this.STRIKE_SYMBOL, this.SPARE_SYMBOL].concat(
      [...Array(10).keys()].map(String),
    );

    // Ensure all rolls are valid
    for (let i = 0; i < rolls.length; i++) {
      if (!validRolls.includes(rolls[i])) {
        throw new BadRequestException(`Invalid roll value: ${rolls[i]}`);
      }
    }

    // Ensure spare (`/`) can only be at index `1`
    if (
      rollSize >= 2 &&
      rolls[1] === this.SPARE_SYMBOL &&
      !this.isNumeric(rolls[0])
    ) {
      throw new BadRequestException(
        `Spare (/) must be the second roll and preceded by a number`,
      );
    }

    // // Ensure strike (`X`) is the first roll only
    // if (this.isStrike(rolls) && rollSize > 1) {
    //   throw new BadRequestException(
    //     `Strike (X) must be the only roll in a frame`,
    //   );
    // }

    // Handle 10th frame separately
    if (frameId === 10) {
      if (rollSize < 2 || rollSize > 3) {
        throw new BadRequestException(`10th frame must have 2 or 3 rolls`);
      }
      const totalScore = rolls.reduce(
        (sum, roll) => sum + this.getRollValue(roll),
        0,
      );
      if (totalScore > 30) {
        throw new BadRequestException(
          `10th frame total score cannot exceed 30`,
        );
      }
      return;
    }

    const isStrike: boolean = this.isStrike(rolls);
    const isSpare: boolean = this.isSpare(rolls);
    // Standard frames (1-9)
    if (isStrike) {
      if (rollSize !== 1) {
        throw new BadRequestException(`Strike frame must have only 1 roll`);
      }
    } else if (isSpare) {
      if (rollSize !== 2) {
        throw new BadRequestException(`Spare frame must have exactly 2 rolls`);
      }
    } else {
      if (rollSize !== 2) {
        throw new BadRequestException(`Normal frame must have exactly 2 rolls`);
      }
    }

    // Ensure sum of rolls does not exceed 10 for standard frames
    const totalScore =
      this.getRollValue(rolls[0]) +
      (rolls[1] ? this.getRollValue(rolls[1]) : 0);
    const maxScore = isSpare ? 20 : 10;
    if (totalScore > maxScore) {
      throw new BadRequestException(`Frame total score cannot exceed 10`);
    }
  }

  /**
   * Returns the numeric value of a roll (handling 'X' and '/').
   */
  private getRollValue(roll: string | undefined): number {
    if (roll === this.STRIKE_SYMBOL) return this.MAX_FRAMES_SCORE;
    if (roll === this.SPARE_SYMBOL) return this.MAX_FRAMES_SCORE;
    return this.getIntValue(roll);
  }

  /**
   * Converts a roll string into a number.
   */
  private getIntValue(roll: string | undefined): number {
    return parseInt(roll || '0');
  }

  /**
   * Helper function to check if a roll is a numeric value (0-9)
   */
  private isNumeric(number: string): boolean {
    return /^[0-9]$/.test(number);
  }
}
