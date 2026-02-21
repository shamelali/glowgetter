import { db } from "./db";
import { artists, services, portfolios, users, studios } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Create mock users
  const mockUsers = [
    { id: "user_artist_1", email: "sarah@makeup.com", firstName: "Sarah", lastName: "Lee", profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" },
    { id: "user_artist_2", email: "amanda@makeup.com", firstName: "Amanda", lastName: "Tan", profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" },
    { id: "user_artist_3", email: "jessica@makeup.com", firstName: "Jessica", lastName: "Wong", profileImageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" },
    { id: "user_studio_1", email: "glam_studio@makeup.com", firstName: "Studio", lastName: "Owner", profileImageUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" }
  ];

  for (const u of mockUsers) {
    await db.insert(users).values(u).onConflictDoNothing();
  }

  // Create Artists
  const newArtists = [
    { userId: "user_artist_1", name: "Sarah Lee Makeup", slug: "sarah-lee-makeup", bio: "Professional makeup artist specializing in bridal and dinner makeup.", state: "Kuala Lumpur", city: "Bukit Bintang", priceRange: "RM 300 - RM 800", profileImage: "https://images.unsplash.com/photo-1487412947132-23223f268580?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", specialties: ["Bridal", "Dinner", "Photoshoot"], isVerified: true, instagram: "sarahleemua", whatsapp: "+60123456789" },
    { userId: "user_artist_2", name: "Amanda Tan Artistry", slug: "amanda-tan-artistry", bio: "Certified makeup artist for special effects and creative looks.", state: "Selangor", city: "Petaling Jaya", priceRange: "RM 200 - RM 600", profileImage: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", specialties: ["SFX", "Creative", "Event"], isVerified: false, instagram: "amandatan_art", whatsapp: "+60198765432" },
    { userId: "user_artist_3", name: "Glam by Jessica", slug: "glam-by-jessica", bio: "Natural and glowing makeup looks for your special day.", state: "Penang", city: "Georgetown", priceRange: "RM 250 - RM 500", profileImage: "https://images.unsplash.com/photo-1512413914633-b5043f4041ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", specialties: ["Natural", "Dinner", "ROM"], isVerified: true, instagram: "jessicawong_glam", whatsapp: "+601122334455" }
  ];

  for (const a of newArtists) {
    const [artist] = await db.insert(artists).values(a).onConflictDoNothing().returning();
    if (artist) {
      await db.insert(services).values({ artistId: artist.id, name: "Bridal Makeup", price: 60000, duration: 120 }).onConflictDoNothing();
      await db.insert(portfolios).values({ artistId: artist.id, imageUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }).onConflictDoNothing();
    }
  }

  // Create Studios
  const [studio] = await db.insert(studios).values({
    userId: "user_studio_1",
    name: "Luxe Beauty Studio",
    slug: "luxe-beauty-studio",
    description: "A premium makeup studio located in the heart of Kuala Lumpur. We offer professional makeup and hair styling services.",
    address: "Level 2, Pavilion Kuala Lumpur",
    state: "Kuala Lumpur",
    city: "Bukit Bintang",
    contactNumber: "+603-12345678",
    profileImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }).onConflictDoNothing().returning();

  if (studio) {
    await db.insert(services).values({ studioId: studio.id, name: "Professional Event Makeup", price: 30000, duration: 60 }).onConflictDoNothing();
    await db.insert(portfolios).values({ studioId: studio.id, imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }).onConflictDoNothing();
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
