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
  artistId: integer("artist_id").notNull().references(() => artists.id),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // stored in cents/sen
  duration: integer("duration_minutes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").notNull().references(() => artists.id),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").notNull().references(() => artists.id),
  clientId: varchar("client_id").notNull().references(() => users.id),
  serviceId: integer("service_id").references(() => services.id),
  bookingDate: date("booking_date").notNull(),
  bookingTime: text("booking_time").notNull(), // e.g., "14:00"
  location: text("location"), // Address for house calls
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

export const servicesRelations = relations(services, ({ one }) => ({
  artist: one(artists, {
    fields: [services.artistId],
    references: [artists.id],
  }),
}));

export const portfoliosRelations = relations(portfolios, ({ one }) => ({
  artist: one(artists, {
    fields: [portfolios.artistId],
    references: [artists.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  artist: one(artists, {
    fields: [bookings.artistId],
    references: [artists.id],
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
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Request Types
export type CreateArtistRequest = Omit<InsertArtist, 'userId'>; // userId comes from auth
export type UpdateArtistRequest = Partial<CreateArtistRequest>;
export type CreateServiceRequest = Omit<InsertService, 'artistId'>;
export type CreatePortfolioRequest = Omit<InsertPortfolio, 'artistId'>;
export type CreateBookingRequest = Omit<InsertBooking, 'artistId' | 'clientId'> & { artistId: number };
export type UpdateBookingStatusRequest = { status: 'confirmed' | 'declined' | 'completed' | 'cancelled' };

// Response Types
export type ArtistWithDetails = Artist & { services: Service[], portfolio: Portfolio[] };
