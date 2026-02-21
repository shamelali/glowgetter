import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import auth schema to extend/link
export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  bio: text("bio"),
  slug: text("slug").unique().notNull(), // For SEO friendly URLs
  state: text("state").notNull(),
  city: text("city").notNull(),
  instagram: text("instagram"),
  whatsapp: text("whatsapp"),
  priceRange: text("price_range"), // e.g., "RM 100 - RM 300"
  profileImage: text("profile_image"),
  specialties: text("specialties").array(), // e.g., ["Wedding", "Dinner", "SFX"]
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").references(() => artists.id),
  studioId: integer("studio_id").references(() => studios.id),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // stored in cents/sen
  duration: integer("duration_minutes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").references(() => artists.id),
  studioId: integer("studio_id").references(() => studios.id),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studios = pgTable("studios", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  address: text("address").notNull(),
  state: text("state").notNull(),
  city: text("city").notNull(),
  contactNumber: text("contact_number"),
  profileImage: text("profile_image"),
  images: text("images").array(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").references(() => artists.id),
  studioId: integer("studio_id").references(() => studios.id),
  clientId: varchar("client_id").notNull().references(() => users.id),
  serviceId: integer("service_id").references(() => services.id),
  bookingDate: date("booking_date").notNull(),
  bookingTime: text("booking_time").notNull(), // e.g., "14:00"
  location: text("location"), // Address for house calls or studio location
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, cancelled, declined
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const artistsRelations = relations(artists, ({ one, many }) => ({
  user: one(users, {
    fields: [artists.userId],
    references: [users.id],
  }),
  services: many(services),
  portfolio: many(portfolios),
  bookings: many(bookings),
}));

export const studiosRelations = relations(studios, ({ one, many }) => ({
  user: one(users, {
    fields: [studios.userId],
    references: [users.id],
  }),
  services: many(services),
  portfolio: many(portfolios),
  bookings: many(bookings),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  artist: one(artists, {
    fields: [services.artistId],
    references: [artists.id],
  }),
  studio: one(studios, {
    fields: [services.studioId],
    references: [studios.id],
  }),
}));

export const portfoliosRelations = relations(portfolios, ({ one }) => ({
  artist: one(artists, {
    fields: [portfolios.artistId],
    references: [artists.id],
  }),
  studio: one(studios, {
    fields: [portfolios.studioId],
    references: [studios.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  artist: one(artists, {
    fields: [bookings.artistId],
    references: [artists.id],
  }),
  studio: one(studios, {
    fields: [bookings.studioId],
    references: [studios.id],
  }),
  client: one(users, {
    fields: [bookings.clientId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertArtistSchema = createInsertSchema(artists).omit({ 
  id: true, 
  createdAt: true, 
  isVerified: true 
});

export const insertStudioSchema = createInsertSchema(studios).omit({ 
  id: true, 
  createdAt: true, 
  isVerified: true 
});

export const insertServiceSchema = createInsertSchema(services).omit({ 
  id: true, 
  createdAt: true 
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({ 
  id: true, 
  createdAt: true 
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  createdAt: true,
  status: true
});

// === TYPES ===

export type Artist = typeof artists.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Studio = typeof studios.$inferSelect;
export type InsertStudio = z.infer<typeof insertStudioSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Request Types
export type CreateArtistRequest = Omit<InsertArtist, 'userId'>;
export type CreateStudioRequest = Omit<InsertStudio, 'userId'>;
export type UpdateArtistRequest = Partial<CreateArtistRequest>;
export type UpdateStudioRequest = Partial<CreateStudioRequest>;
export type CreateServiceRequest = Omit<InsertService, 'artistId' | 'studioId'> & { artistId?: number, studioId?: number };
export type CreatePortfolioRequest = Omit<InsertPortfolio, 'artistId' | 'studioId'> & { artistId?: number, studioId?: number };
export type CreateBookingRequest = Omit<InsertBooking, 'artistId' | 'studioId' | 'clientId'> & { artistId?: number, studioId?: number };
export type UpdateBookingStatusRequest = { status: 'confirmed' | 'declined' | 'completed' | 'cancelled' };

// Response Types
export type ArtistWithDetails = Artist & { services: Service[], portfolio: Portfolio[] };
export type StudioWithDetails = Studio & { services: Service[], portfolio: Portfolio[] };
