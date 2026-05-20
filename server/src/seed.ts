/**
 * Cria uma conta de demonstracao para testar o app rapidamente.
 * Rode com: npm run seed
 */
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

async function main() {
  const email = "demo@dealnote.ai";
  const password = "demo123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Conta de demo ja existe: ${email} / ${password}`);
    return;
  }

  await prisma.user.create({
    data: {
      name: "Conta Demo",
      email,
      password: await bcrypt.hash(password, 10),
    },
  });

  console.log("Conta de demonstracao criada:");
  console.log(`  e-mail: ${email}`);
  console.log(`  senha:  ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
