import { artists, services, portfolios, bookings, type Artist, type InsertArtist, type UpdateArtistRequest, type Service, type InsertService, type Portfolio, type InsertPortfolio, type Booking, type InsertBooking, type UpdateBookingStatusRequest, type ArtistWithDetails } from "@shared/schema";
import { db } from "./db";
import { eq, like, and, or } from "drizzle-orm";

export interface IStorage {
  // Artist Operations
  getArtists(filters?: { search?: string, state?: string, city?: string, specialty?: string }): Promise<Artist[]>;
  getArtist(id: number): Promise<Artist | undefined>;
  getArtistBySlug(slug: string): Promise<ArtistWithDetails | undefined>;
  getArtistByUserId(userId: string): Promise<Artist | undefined>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: number, updates: UpdateArtistRequest): Promise<Artist>;

  // Service Operations
  getServices(artistId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Portfolio Operations
  getPortfolio(artistId: number): Promise<Portfolio[]>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  deletePortfolio(id: number): Promise<void>;

  // Booking Operations
  getBookings(userId: string, role: 'client' | 'artist'): Promise<(Booking & { artist?: Artist, client?: any, service?: Service })[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
}

export class DatabaseStorage implements IStorage {
  async getArtists(filters?: { search?: string, state?: string, city?: string, specialty?: string }): Promise<Artist[]> {
    let query = db.select().from(artists);
    const conditions = [];

    if (filters?.search) {
      conditions.push(or(
        like(artists.name, `%${filters.search}%`),
        like(artists.bio, `%${filters.search}%`)
      ));
    }
    if (filters?.state) {
      conditions.push(eq(artists.state, filters.state));
    }
    if (filters?.city) {
      conditions.push(eq(artists.city, filters.city));
    }
    // Note: Filtering by array column (specialties) with 'like' is a simplification. 
    // In a real app, unnest or array operators would be better, but 'like' works for simple string matching if formatted correctly or using contains if available.
    // Drizzle with Postgres supports array operators.
    // For now, let's skip specialty filter in query or implement properly if needed.
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async getArtist(id: number): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist;
  }

  async getArtistBySlug(slug: string): Promise<ArtistWithDetails | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.slug, slug));
    if (!artist) return undefined;

    const artistServices = await db.select().from(services).where(eq(services.artistId, artist.id));
    const artistPortfolio = await db.select().from(portfolios).where(eq(portfolios.artistId, artist.id));

    return { ...artist, services: artistServices, portfolio: artistPortfolio };
  }

  async getArtistByUserId(userId: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    return artist;
  }

  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const [artist] = await db.insert(artists).values(insertArtist).returning();
    return artist;
  }

  async updateArtist(id: number, updates: UpdateArtistRequest): Promise<Artist> {
    const [updated] = await db.update(artists).set(updates).where(eq(artists.id, id)).returning();
    return updated;
  }

  async getServices(artistId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.artistId, artistId));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async getPortfolio(artistId: number): Promise<Portfolio[]> {
    return await db.select().from(portfolios).where(eq(portfolios.artistId, artistId));
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const [portfolio] = await db.insert(portfolios).values(insertPortfolio).returning();
    return portfolio;
  }

  async deletePortfolio(id: number): Promise<void> {
    await db.delete(portfolios).where(eq(portfolios.id, id));
  }

  async getBookings(userId: string, role: 'client' | 'artist'): Promise<(Booking & { artist?: Artist, client?: any, service?: Service })[]> {
    // This needs joins.
    // For MVP, we can fetch bookings then enrich, or use Drizzle's query builder with relations if setup in db.ts with schema.
    // Let's use db.query which is cleaner for relations.
    
    if (role === 'artist') {
       // Get artist ID first
       const artist = await this.getArtistByUserId(userId);
       if (!artist) return [];
       
       const results = await db.query.bookings.findMany({
         where: eq(bookings.artistId, artist.id),
         with: {
           client: true,
           service: true
         },
         orderBy: (bookings, { desc }) => [desc(bookings.bookingDate)]
       });
       return results;
    } else {
       const results = await db.query.bookings.findMany({
         where: eq(bookings.clientId, userId),
         with: {
           artist: true,
           service: true
         },
         orderBy: (bookings, { desc }) => [desc(bookings.bookingDate)]
       });
       return results;
    }
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updated] = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
