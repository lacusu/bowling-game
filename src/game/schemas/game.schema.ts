import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

// Define FramesDto Schema
@Schema()
export class Frame {
  @Prop({ required: true, validate: { validator: (v: null) => v !== null } })
  frameId: number;

  @Prop({ type: [String], required: true }) // Rolls like ["1", "/"]
  rolls: string[];

  @Prop({ default: 0 }) // Score at this frame
  cumulativeScore: number;

  @Prop({ default: Date.now }) // Timestamp
  dateTime: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;
}
export const FrameSchema = SchemaFactory.createForClass(Frame);

// Define Player Schema
@Schema()
export class Player {
  @Prop({ required: true })
  playerName: string;

  @Prop({ default: 0 }) // Player's total score
  totalScore: number;

  @Prop({ type: [FrameSchema] }) // Array of frames
  frames: Frame[];

  @Prop({ required: true, default: 0 }) //Latest frame
  onFrame: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;
}
export const PlayerSchema = SchemaFactory.createForClass(Player);

// export type GameDocument = HydratedDocument<Game>;
// Define Game Schema
@Schema({ timestamps: true }) // Enables createdAt & updatedAt
export class Game {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [PlayerSchema], default: [] }) // Array of players
  players: Player[];

  @Prop({ required: true, default: 0 })
  countOfCompleted: number;

  @Prop({ required: true, default: false })
  completed: boolean;
}
export const GameSchema = SchemaFactory.createForClass(Game);
