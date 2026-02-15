import { db } from "./db";
import { artists, services, portfolios, users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Create mock users for artists
  const artistUsers = [
    {
      id: "user_artist_1",
      email: "sarah@makeup.com",
      firstName: "Sarah",
      lastName: "Lee",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "user_artist_2",
      email: "amanda@makeup.com",
      firstName: "Amanda",
      lastName: "Tan",
      profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "user_artist_3",
      email: "jessica@makeup.com",
      firstName: "Jessica",
      lastName: "Wong",
      profileImageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    }
  ];

  for (const u of artistUsers) {
    await db.insert(users).values(u).onConflictDoNothing();
  }

  // Create Artists
  const newArtists = [
    {
      userId: "user_artist_1",
      name: "Sarah Lee Makeup",
      slug: "sarah-lee-makeup",
      bio: "Professional makeup artist specializing in bridal and dinner makeup. Based in Kuala Lumpur with 5 years of experience.",
      state: "Kuala Lumpur",
      city: "Bukit Bintang",
      priceRange: "RM 300 - RM 800",
      profileImage: "https://images.unsplash.com/photo-1487412947132-23223f268580?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specialties: ["Bridal", "Dinner", "Photoshoot"],
      isVerified: true,
      instagram: "sarahleemua",
      whatsapp: "+60123456789"
    },
    {
      userId: "user_artist_2",
      name: "Amanda Tan Artistry",
      slug: "amanda-tan-artistry",
      bio: "Certified makeup artist for special effects and creative looks. Available for events and halloween parties.",
      state: "Selangor",
      city: "Petaling Jaya",
      priceRange: "RM 200 - RM 600",
      profileImage: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specialties: ["SFX", "Creative", "Event"],
      isVerified: false,
      instagram: "amandatan_art",
      whatsapp: "+60198765432"
    },
    {
      userId: "user_artist_3",
      name: "Glam by Jessica",
      slug: "glam-by-jessica",
      bio: "Natural and glowing makeup looks for your special day. I believe in enhancing your natural beauty.",
      state: "Penang",
      city: "Georgetown",
      priceRange: "RM 250 - RM 500",
      profileImage: "https://images.unsplash.com/photo-1512413914633-b5043f4041ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specialties: ["Natural", "Dinner", "ROM"],
      isVerified: true,
      instagram: "jessicawong_glam",
      whatsapp: "+601122334455"
    }
  ];

  for (const a of newArtists) {
    const [artist] = await db.insert(artists).values(a).onConflictDoNothing().returning();
    
    if (artist) {
      // Create Services for each artist
      const servicesData = [
        { artistId: artist.id, name: "Bridal Makeup", description: "Full bridal makeup with hairdo and false lashes.", price: 60000, duration: 120 },
        { artistId: artist.id, name: "Dinner Makeup", description: "Elegant makeup for annual dinners and events.", price: 25000, duration: 60 },
        { artistId: artist.id, name: "Personal Makeup Class", description: "Learn how to do your own daily makeup.", price: 35000, duration: 180 }
      ];
      
      for (const s of servicesData) {
        await db.insert(services).values(s).onConflictDoNothing();
      }

      // Create Portfolio for each artist
      const portfolioData = [
        { artistId: artist.id, imageUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", description: "Natural bridal look" },
        { artistId: artist.id, imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", description: "Evening glamour" },
        { artistId: artist.id, imageUrl: "https://images.unsplash.com/photo-1596704017254-9b1b1848c1a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", description: "Creative editorial" },
        { artistId: artist.id, imageUrl: "https://images.unsplash.com/photo-1457972729786-02e171690f37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", description: "Soft romantic look" }
      ];

      for (const p of portfolioData) {
        await db.insert(portfolios).values(p).onConflictDoNothing();
      }
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
