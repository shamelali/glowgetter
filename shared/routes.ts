import { z } from "zod";
import { insertArtistSchema, insertStudioSchema, insertServiceSchema, insertPortfolioSchema, insertBookingSchema, artists, services, portfolios, bookings, studios } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  artists: {
    list: {
      method: "GET" as const,
      path: "/api/artists" as const,
      input: z.object({
        search: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        specialty: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof artists.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/artists/:slug" as const,
      responses: {
        200: z.custom<typeof artists.$inferSelect & { services: typeof services.$inferSelect[], portfolio: typeof portfolios.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/artists" as const,
      input: insertArtistSchema.omit({ userId: true, id: true, createdAt: true, isVerified: true }),
      responses: {
        201: z.custom<typeof artists.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/artists/:id" as const,
      input: insertArtistSchema.omit({ userId: true, id: true, createdAt: true, isVerified: true }).partial(),
      responses: {
        200: z.custom<typeof artists.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  studios: {
    list: {
      method: "GET" as const,
      path: "/api/studios" as const,
      input: z.object({
        search: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof studios.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/studios/:slug" as const,
      responses: {
        200: z.custom<typeof studios.$inferSelect & { services: typeof services.$inferSelect[], portfolio: typeof portfolios.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/studios" as const,
      input: insertStudioSchema.omit({ userId: true, id: true, createdAt: true, isVerified: true }),
      responses: {
        201: z.custom<typeof studios.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/studios/:id" as const,
      input: insertStudioSchema.omit({ userId: true, id: true, createdAt: true, isVerified: true }).partial(),
      responses: {
        200: z.custom<typeof studios.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  services: {
    list: {
      method: "GET" as const,
      path: "/api/artists/:artistId/services" as const,
      responses: {
        200: z.array(z.custom<typeof services.$inferSelect>()),
      },
    },
    studioList: {
      method: "GET" as const,
      path: "/api/studios/:studioId/services" as const,
      responses: {
        200: z.array(z.custom<typeof services.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/services" as const,
      input: insertServiceSchema.omit({ id: true, createdAt: true }),
      responses: {
        201: z.custom<typeof services.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/services/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  portfolios: {
    list: {
      method: "GET" as const,
      path: "/api/artists/:artistId/portfolio" as const,
      responses: {
        200: z.array(z.custom<typeof portfolios.$inferSelect>()),
      },
    },
    studioList: {
      method: "GET" as const,
      path: "/api/studios/:studioId/portfolio" as const,
      responses: {
        200: z.array(z.custom<typeof portfolios.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/portfolios" as const,
      input: insertPortfolioSchema.omit({ id: true, createdAt: true }),
      responses: {
        201: z.custom<typeof portfolios.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/portfolios/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  bookings: {
    list: {
      method: "GET" as const,
      path: "/api/bookings" as const,
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect & { artist?: typeof artists.$inferSelect, studio?: typeof studios.$inferSelect, client?: any, service?: typeof services.$inferSelect }>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/bookings" as const,
      input: insertBookingSchema.omit({ id: true, createdAt: true, status: true, clientId: true }),
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: "PATCH" as const,
      path: "/api/bookings/:id/status" as const,
      input: z.object({ status: z.enum(["confirmed", "declined", "completed", "cancelled"]) }),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
