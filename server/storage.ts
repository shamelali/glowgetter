import { artists, services, portfolios, bookings, studios, type Artist, type InsertArtist, type UpdateArtistRequest, type Service, type InsertService, type Portfolio, type InsertPortfolio, type Booking, type InsertBooking, type UpdateBookingStatusRequest, type ArtistWithDetails, type Studio, type InsertStudio, type UpdateStudioRequest, type StudioWithDetails } from "@shared/schema";
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

  // Studio Operations
  getStudios(filters?: { search?: string, state?: string, city?: string }): Promise<Studio[]>;
  getStudio(id: number): Promise<Studio | undefined>;
  getStudioBySlug(slug: string): Promise<StudioWithDetails | undefined>;
  getStudioByUserId(userId: string): Promise<Studio | undefined>;
  createStudio(studio: InsertStudio): Promise<Studio>;
  updateStudio(id: number, updates: UpdateStudioRequest): Promise<Studio>;

  // Service Operations
  getServices(artistId?: number, studioId?: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Portfolio Operations
  getPortfolio(artistId?: number, studioId?: number): Promise<Portfolio[]>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  deletePortfolio(id: number): Promise<void>;

  // Booking Operations
  getBookings(userId: string, role: 'client' | 'artist' | 'studio'): Promise<(Booking & { artist?: Artist, studio?: Studio, client?: any, service?: Service })[]>;
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

  async getStudios(filters?: { search?: string, state?: string, city?: string }): Promise<Studio[]> {
    let query = db.select().from(studios);
    const conditions = [];

    if (filters?.search) {
      conditions.push(or(
        like(studios.name, `%${filters.search}%`),
        like(studios.description, `%${filters.search}%`)
      ));
    }
    if (filters?.state) {
      conditions.push(eq(studios.state, filters.state));
    }
    if (filters?.city) {
      conditions.push(eq(studios.city, filters.city));
    }
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async getStudio(id: number): Promise<Studio | undefined> {
    const [studio] = await db.select().from(studios).where(eq(studios.id, id));
    return studio;
  }

  async getStudioBySlug(slug: string): Promise<StudioWithDetails | undefined> {
    const [studio] = await db.select().from(studios).where(eq(studios.slug, slug));
    if (!studio) return undefined;

    const studioServices = await db.select().from(services).where(eq(services.studioId, studio.id));
    const studioPortfolio = await db.select().from(portfolios).where(eq(portfolios.studioId, studio.id));

    return { ...studio, services: studioServices, portfolio: studioPortfolio };
  }

  async getStudioByUserId(userId: string): Promise<Studio | undefined> {
    const [studio] = await db.select().from(studios).where(eq(studios.userId, userId));
    return studio;
  }

  async createStudio(insertStudio: InsertStudio): Promise<Studio> {
    const [studio] = await db.insert(studios).values(insertStudio).returning();
    return studio;
  }

  async updateStudio(id: number, updates: UpdateStudioRequest): Promise<Studio> {
    const [updated] = await db.update(studios).set(updates).where(eq(studios.id, id)).returning();
    return updated;
  }

  async getServices(artistId?: number, studioId?: number): Promise<Service[]> {
    if (artistId) {
      return await db.select().from(services).where(eq(services.artistId, artistId));
    }
    if (studioId) {
      return await db.select().from(services).where(eq(services.studioId, studioId));
    }
    return [];
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async getPortfolio(artistId?: number, studioId?: number): Promise<Portfolio[]> {
    if (artistId) {
      return await db.select().from(portfolios).where(eq(portfolios.artistId, artistId));
    }
    if (studioId) {
      return await db.select().from(portfolios).where(eq(portfolios.studioId, studioId));
    }
    return [];
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const [portfolio] = await db.insert(portfolios).values(insertPortfolio).returning();
    return portfolio;
  }

  async deletePortfolio(id: number): Promise<void> {
    await db.delete(portfolios).where(eq(portfolios.id, id));
  }

  async getBookings(userId: string, role: 'client' | 'artist' | 'studio'): Promise<(Booking & { artist?: Artist, studio?: Studio, client?: any, service?: Service })[]> {
    if (role === 'artist') {
       const artist = await this.getArtistByUserId(userId);
       if (!artist) return [];
       return await db.query.bookings.findMany({
         where: eq(bookings.artistId, artist.id),
         with: { client: true, service: true },
         orderBy: (bookings, { desc }) => [desc(bookings.bookingDate)]
       });
    } else if (role === 'studio') {
       const studio = await this.getStudioByUserId(userId);
       if (!studio) return [];
       return await db.query.bookings.findMany({
         where: eq(bookings.studioId, studio.id),
         with: { client: true, service: true },
         orderBy: (bookings, { desc }) => [desc(bookings.bookingDate)]
       });
    } else {
       return await db.query.bookings.findMany({
         where: eq(bookings.clientId, userId),
         with: { artist: true, studio: true, service: true },
         orderBy: (bookings, { desc }) => [desc(bookings.bookingDate)]
       });
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
