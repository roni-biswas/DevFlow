import mongoose, {
  Schema,
  model,
  models,
  Document,
  Model,
  Types,
} from "mongoose";
import { Event } from "./event.model";

/**
 * Booking document interface
 */
export interface BookingDocument extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Simple email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Booking schema definition
 */
const BookingSchema = new Schema<BookingDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true, // speeds up event-based queries
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value: string) => EMAIL_REGEX.test(value),
        message: "Invalid email format",
      },
    },
  },
  {
    timestamps: true, // auto-manages createdAt & updatedAt
  }
);

/**
 * Pre-save hook
 * - Verifies referenced Event exists before creating a booking
 */
BookingSchema.pre<BookingDocument>("save", async function (next) {
  const eventExists = await Event.exists({ _id: this.eventId });
  if (!eventExists) {
    return next(new Error("Referenced event does not exist"));
  }
  next();
});

/**
 * Export Booking model
 */
export const Booking: Model<BookingDocument> =
  models.Booking || model<BookingDocument>("Booking", BookingSchema);
