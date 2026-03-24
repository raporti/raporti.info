import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Switch publish mode to auto
  await prisma.settings.upsert({
    where: { key: "publish_mode" },
    update: { value: "auto" },
    create: { key: "publish_mode", value: "auto" },
  });
  console.log("Publish mode set to: auto");

  // Publish all draft articles
  const result = await prisma.article.updateMany({
    where: { status: "draft" },
    data: { status: "published", publishedAt: new Date() },
  });
  console.log(`Published ${result.count} draft articles`);

  // Count totals
  const total = await prisma.article.count({ where: { status: "published" } });
  console.log(`Total published articles: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
