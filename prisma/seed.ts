import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@raporti.info";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
      role: "admin",
    },
  });

  // Create default categories
  const categories = [
    { name: "Botë", slug: "botë", color: "#6366f1" },
    { name: "Politikë", slug: "politikë", color: "#8b5cf6" },
    { name: "Konflikt", slug: "konflikt", color: "#ef4444" },
    { name: "Ekonomi", slug: "ekonomi", color: "#10b981" },
    { name: "Teknologji", slug: "teknologji", color: "#3b82f6" },
    { name: "Sport", slug: "sport", color: "#f59e0b" },
    { name: "Shëndetësi", slug: "shëndetësi", color: "#ec4899" },
    { name: "Shkencë", slug: "shkencë", color: "#14b8a6" },
    { name: "Kulturë", slug: "kulturë", color: "#f97316" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { color: cat.color },
      create: cat,
    });
  }

  // Create default settings
  const defaultSettings = [
    { key: "publish_mode", value: "auto" },
    { key: "image_mode", value: "generated" },
    { key: "site_name", value: "Raporti" },
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // Create default source
  await prisma.source.upsert({
    where: { channelName: "ClashReport" },
    update: {},
    create: {
      name: "Clash Report",
      type: "telegram",
      channelName: "ClashReport",
      channelUrl: "https://t.me/ClashReport",
      isActive: true,
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
