import { PrismaClient } from "../src/generated/prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration of base64 images to static files...");
  
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  function saveBase64(imageStr: string | null | undefined, prefix: string): string | null {
    if (!imageStr) return null;
    const trimmed = imageStr.trim();
    if (!trimmed.startsWith("data:image/")) return trimmed;

    const matches = trimmed.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return trimmed;

    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  }

  // 1. Systems
  const systems = await prisma.system.findMany();
  console.log(`Checking ${systems.length} systems...`);
  for (const system of systems) {
    if (system.icon && system.icon.startsWith("data:image/")) {
      const urlPath = saveBase64(system.icon, `system-${system.id}`);
      if (urlPath) {
        await prisma.system.update({
          where: { id: system.id },
          data: { icon: urlPath }
        });
        console.log(`Updated System #${system.id} icon to ${urlPath}`);
      }
    }
  }

  // 2. Services
  const services = await prisma.service.findMany();
  console.log(`Checking ${services.length} services...`);
  for (const service of services) {
    if (service.image && service.image.startsWith("data:image/")) {
      const urlPath = saveBase64(service.image, `service-${service.id}`);
      if (urlPath) {
        await prisma.service.update({
          where: { id: service.id },
          data: { image: urlPath }
        });
        console.log(`Updated Service #${service.id} image to ${urlPath}`);
      }
    }
  }

  // 3. Packages
  const packages = await prisma.package.findMany();
  console.log(`Checking ${packages.length} packages...`);
  for (const pkg of packages) {
    if (pkg.image && pkg.image.startsWith("data:image/")) {
      const urlPath = saveBase64(pkg.image, `package-${pkg.id}`);
      if (urlPath) {
        await prisma.package.update({
          where: { id: pkg.id },
          data: { image: urlPath }
        });
        console.log(`Updated Package #${pkg.id} image to ${urlPath}`);
      }
    }
  }

  // 4. Clients
  const clients = await prisma.client.findMany();
  console.log(`Checking ${clients.length} clients...`);
  for (const client of clients) {
    if (client.image && client.image.startsWith("data:image/")) {
      const urlPath = saveBase64(client.image, `client-${client.id}`);
      if (urlPath) {
        await prisma.client.update({
          where: { id: client.id },
          data: { image: urlPath }
        });
        console.log(`Updated Client #${client.id} image to ${urlPath}`);
      }
    }
  }

  // 5. HeroImages
  const heroImages = await prisma.heroImage.findMany();
  console.log(`Checking ${heroImages.length} hero images...`);
  for (const hero of heroImages) {
    if (hero.image && hero.image.startsWith("data:image/")) {
      const urlPath = saveBase64(hero.image, `hero-${hero.id}`);
      if (urlPath) {
        await prisma.heroImage.update({
          where: { id: hero.id },
          data: { image: urlPath }
        });
        console.log(`Updated HeroImage #${hero.id} image to ${urlPath}`);
      }
    }
  }

  console.log("Migration complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
