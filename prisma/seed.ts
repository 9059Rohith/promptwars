import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATS = [
  { category: "transport", subtype: "car", unit: "km", factor: 0.192 },
  { category: "transport", subtype: "metro", unit: "km", factor: 0.041 },
  { category: "transport", subtype: "cycling", unit: "km", factor: 0 },
  { category: "electricity", subtype: "electricity", unit: "kWh", factor: 0.475 },
  { category: "food", subtype: "non_veg", unit: "meal", factor: 5.0 },
  { category: "food", subtype: "vegetarian", unit: "meal", factor: 1.2 },
  { category: "waste", subtype: "plastic", unit: "kg", factor: 6.0 },
];

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Deterministic pseudo-random so seeds are reproducible.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

async function seedUser(email: string, name: string, password: string, intensity: number) {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash },
  });
  await prisma.activity.deleteMany({ where: { userId: user.id } });

  const rand = rng(email.length * 7 + intensity);
  const data = [];
  let xp = 0;
  for (let day = 0; day < 30; day++) {
    const count = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < count; i++) {
      const c = CATS[Math.floor(rand() * CATS.length)];
      const amount = Math.round((1 + rand() * 30 * intensity) * 10) / 10;
      const co2 = Math.round(c.factor * amount * 100) / 100;
      xp += co2 === 0 ? 25 : co2 < 10 ? 10 : 5;
      data.push({
        userId: user.id,
        category: c.category,
        subtype: c.subtype,
        amount,
        unit: c.unit,
        co2,
        date: isoDaysAgo(day),
      });
    }
  }
  await prisma.activity.createMany({ data });
  await prisma.user.update({ where: { id: user.id }, data: { xp, streak: 5, lastLogDate: isoDaysAgo(0) } });
  console.log(`Seeded ${name} with ${data.length} activities (${xp} XP).`);
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
