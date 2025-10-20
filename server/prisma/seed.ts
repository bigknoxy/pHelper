import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const passwordHash = await bcrypt.hash('testpassword', 10);
  const user = await prisma.user.upsert({
    where: { email: 'testuser@example.com' },
    update: {},
    create: {
      email: 'testuser@example.com',
      passwordHash,
    },
  });

  // Seed weight entries
  await prisma.weightEntry.createMany({
    data: [
      {
        userId: user.id,
        date: new Date('2025-09-01'),
        weight: 180,
        note: 'Morning weigh-in',
        createdAt: new Date('2025-09-01T08:00:00Z'),
        updatedAt: new Date('2025-09-01T08:00:00Z'),
      },
      {
        userId: user.id,
        date: new Date('2025-09-02'),
        weight: 179.5,
        note: 'Evening weigh-in',
        createdAt: new Date('2025-09-02T20:00:00Z'),
        updatedAt: new Date('2025-09-02T20:00:00Z'),
      },
    ],
  });

  // Seed workouts
  await prisma.workout.createMany({
    data: [
      {
        userId: user.id,
        date: new Date('2025-09-01'),
        type: 'Running',
        duration: 30,
        notes: '5k run',
        createdAt: new Date('2025-09-01T09:00:00Z'),
        updatedAt: new Date('2025-09-01T09:00:00Z'),
      },
      {
        userId: user.id,
        date: new Date('2025-09-02'),
        type: 'Cycling',
        duration: 45,
        notes: 'Indoor bike',
        createdAt: new Date('2025-09-02T18:00:00Z'),
        updatedAt: new Date('2025-09-02T18:00:00Z'),
      },
    ],
  });

  // Seed tasks
  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
        status: 'PENDING',
        dueDate: new Date('2025-09-03'),
        createdAt: new Date('2025-09-01T10:00:00Z'),
        updatedAt: new Date('2025-09-01T10:00:00Z'),
      },
      {
        userId: user.id,
        title: 'Read book',
        description: 'Finish reading chapter 5',
        status: 'COMPLETED',
        dueDate: new Date('2025-09-04'),
        createdAt: new Date('2025-09-02T11:00:00Z'),
        updatedAt: new Date('2025-09-02T11:00:00Z'),
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
