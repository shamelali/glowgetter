import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { insertArtistSchema, insertServiceSchema, insertPortfolioSchema, insertBookingSchema, insertStudioSchema, type InsertArtist, type InsertService, type InsertPortfolio, type InsertBooking, type InsertStudio } from "@shared/schema";
import { isAuthenticated } from "./replit_integrations/auth/replitAuth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Routes
  await setupAuth(app);
  registerAuthRoutes(app);

  // === ARTIST ROUTES ===

  app.get(api.artists.list.path, async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        state: req.query.state as string,
        city: req.query.city as string,
        specialty: req.query.specialty as string,
      };
      const artists = await storage.getArtists(filters);
      res.json(artists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  app.get(api.artists.get.path, async (req, res) => {
    try {
      const artist = await storage.getArtistBySlug(req.params.slug);
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      res.json(artist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artist" });
    }
  });

  app.post(api.artists.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existingArtist = await storage.getArtistByUserId(userId);
      if (existingArtist) {
        return res.status(400).json({ message: "Artist profile already exists" });
      }

      const input = api.artists.create.input.parse(req.body);
      const artistData: InsertArtist = {
        ...input,
        userId: userId,
        slug: input.slug || input.name.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random() * 1000),
      };

      const artist = await storage.createArtist(artistData);
      res.status(201).json(artist);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create artist profile" });
    }
  });

  app.put(api.artists.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const artistId = parseInt(req.params.id);
      const artist = await storage.getArtist(artistId);
      if (!artist || artist.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const input = api.artists.update.input.parse(req.body);
      const updatedArtist = await storage.updateArtist(artistId, input);
      res.json(updatedArtist);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update artist" });
    }
  });

  // === STUDIO ROUTES ===

  app.get(api.studios.list.path, async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        state: req.query.state as string,
        city: req.query.city as string,
      };
      const studios = await storage.getStudios(filters);
      res.json(studios);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch studios" });
    }
  });

  app.get(api.studios.get.path, async (req, res) => {
    try {
      const studio = await storage.getStudioBySlug(req.params.slug);
      if (!studio) {
        return res.status(404).json({ message: "Studio not found" });
      }
      res.json(studio);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch studio" });
    }
  });

  app.post(api.studios.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existingStudio = await storage.getStudioByUserId(userId);
      if (existingStudio) {
        return res.status(400).json({ message: "Studio profile already exists" });
      }

      const input = api.studios.create.input.parse(req.body);
      const studioData: InsertStudio = {
        ...input,
        userId: userId,
        slug: input.slug || input.name.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random() * 1000),
      };

      const studio = await storage.createStudio(studioData);
      res.status(201).json(studio);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create studio" });
    }
  });

  app.put(api.studios.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const studioId = parseInt(req.params.id);
      const studio = await storage.getStudio(studioId);
      if (!studio || studio.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const input = api.studios.update.input.parse(req.body);
      const updatedStudio = await storage.updateStudio(studioId, input);
      res.json(updatedStudio);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update studio" });
    }
  });

  // === SERVICE ROUTES ===

  app.get(api.services.list.path, async (req, res) => {
    try {
      const services = await storage.getServices(parseInt(req.params.artistId));
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get(api.services.studioList.path, async (req, res) => {
    try {
      const services = await storage.getServices(undefined, parseInt(req.params.studioId));
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post(api.services.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.services.create.input.parse(req.body);
      if (input.artistId) {
        const artist = await storage.getArtist(input.artistId);
        if (!artist || artist.userId !== userId) return res.status(403).json({ message: "Unauthorized" });
      } else if (input.studioId) {
        const studio = await storage.getStudio(input.studioId);
        if (!studio || studio.userId !== userId) return res.status(403).json({ message: "Unauthorized" });
      }
      const service = await storage.createService(input);
      res.status(201).json(service);
    } catch (err) {
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.delete(api.services.delete.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteService(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // === PORTFOLIO ROUTES ===

  app.get(api.portfolios.list.path, async (req, res) => {
    try {
      const portfolio = await storage.getPortfolio(parseInt(req.params.artistId));
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.get(api.portfolios.studioList.path, async (req, res) => {
    try {
      const portfolio = await storage.getPortfolio(undefined, parseInt(req.params.studioId));
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post(api.portfolios.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.portfolios.create.input.parse(req.body);
      const portfolio = await storage.createPortfolio(input);
      res.status(201).json(portfolio);
    } catch (err) {
      res.status(500).json({ message: "Failed to add portfolio item" });
    }
  });

  app.delete(api.portfolios.delete.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deletePortfolio(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete portfolio item" });
    }
  });

  // === BOOKING ROUTES ===

  app.get(api.bookings.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const role = req.query.role as any || 'client';
      const bookings = await storage.getBookings(userId, role);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post(api.bookings.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.bookings.create.input.parse(req.body);
      const booking = await storage.createBooking({ ...input, clientId: userId, status: 'pending' });
      res.status(201).json(booking);
    } catch (err) {
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch(api.bookings.updateStatus.path, isAuthenticated, async (req: any, res) => {
    try {
      const { status } = api.bookings.updateStatus.input.parse(req.body);
      const updatedBooking = await storage.updateBookingStatus(parseInt(req.params.id), status);
      res.json(updatedBooking);
    } catch (err) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  return httpServer;
}
