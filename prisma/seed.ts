import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateHistory } from "../src/lib/sample-data";
import { daysAgoISO } from "../src/lib/utils";

const prisma = new PrismaClient();

async function seedUser(email: string, name: string, password: string, intensity: number) {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash },
  });
  await prisma.activity.deleteMany({ where: { userId: user.id } });

  const { activities, xp } = generateHistory(email.length * 7 + Math.round(intensity * 100), 30, intensity);
  await prisma.activity.createMany({ data: activities.map((a) => ({ ...a, userId: user.id })) });
  await prisma.user.update({
    where: { id: user.id },
    data: { xp, streak: 5, lastLogDate: daysAgoISO(0) },
  });
  console.log(`Seeded ${name} with ${activities.length} activities (${xp} XP).`);
}

async function main() {
  await seedUser("demo@carbonwise.app", "Demo User", "password123", 0.6);
  await seedUser("rohith@carbonwise.app", "Rohith", "password123", 0.3);
  await seedUser("sneha@carbonwise.app", "Sneha", "password123", 0.4);
  await seedUser("rahul@carbonwise.app", "Rahul", "password123", 0.9);
  console.log("\n✅ Seed complete. Log in with demo@carbonwise.app / password123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
