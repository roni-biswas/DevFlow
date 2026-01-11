import mongoose, { Schema, model, models, Document, Model } from "mongoose";

/**
 * Event document interface
 */
export interface EventDocument extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Helper to generate a URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Event schema definition
 */
const EventSchema = new Schema<EventDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    overview: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      required: true,
      trim: true,
    },
    audience: {
      type: String,
      required: true,
      trim: true,
    },
    agenda: {
      type: [String],
      required: true,
      validate: (v: string[]) => v.length > 0,
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: (v: string[]) => v.length > 0,
    },
  },
  {
    timestamps: true, // auto-manages createdAt & updatedAt
  }
);

/**
 * Pre-save hook
 * - Generates slug only if title changes
 * - Normalizes date to ISO format
 * - Ensures time consistency (HH:mm)
 * - Validates required non-empty fields
 */
EventSchema.pre<EventDocument>("save", function (next) {
  if (this.isModified("title")) {
    this.slug = generateSlug(this.title);
  }

  // Normalize date to ISO format
  const parsedDate = new Date(this.date);
  if (Number.isNaN(parsedDate.getTime())) {
    return next(new Error("Invalid date format"));
  }
  this.date = parsedDate.toISOString().split("T")[0];

  // Normalize time (HH:mm)
  const timeMatch = this.time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!timeMatch) {
    return next(new Error("Invalid time format. Expected HH:mm"));
  }
  this.time = timeMatch[0];

  next();
});

/**
 * Export Event model
 */
export const Event: Model<EventDocument> =
  models.Event || model<EventDocument>("Event", EventSchema);
