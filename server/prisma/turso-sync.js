/**
 * UNFOLD — Turso Database Migration, Full Editorial Seed, and Verification Script
 * This script applies the UNFOLD schema to Turso libSQL, seeds all 7 editorial personas,
 * 11 posts, 7 comments, 16 likes, 16 follows, bookmarks, and verifies live persistence.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const rawUrl = process.env.TURSO_DATABASE_URL;
const rawAuthToken = process.env.TURSO_AUTH_TOKEN;

const url = rawUrl ? rawUrl.trim().replace(/^["']|["']$/g, '') : '';
const authToken = rawAuthToken ? rawAuthToken.trim().replace(/^["']|["']$/g, '') : '';

if (!url || !authToken) {
  console.error('\n❌ ERROR: Turso credentials missing.');
  console.error('Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your environment or server/.env.');
  console.error('Example:');
  console.error('  $env:TURSO_DATABASE_URL="libsql://unfold-db-username.turso.io"');
  console.error('  $env:TURSO_AUTH_TOKEN="your_turso_token"');
  console.error('  node prisma/turso-sync.js\n');
  process.exit(1);
}

console.log(`🔗 Connecting to Turso endpoint: ${url}`);

const libsql = createClient({ url, authToken });
const adapter = new PrismaLibSQL({ url, authToken });
const prisma = new PrismaClient({ adapter });

async function createSchema() {
  console.log('📦 Step 1: Ensuring UNFOLD schema on Turso libSQL database...');

  const statements = [
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "username" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "bio" TEXT DEFAULT '',
      "location" TEXT DEFAULT '',
      "website" TEXT DEFAULT '',
      "avatarUrl" TEXT DEFAULT '',
      "bannerUrl" TEXT DEFAULT '',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");`,

    `CREATE TABLE IF NOT EXISTS "Post" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "content" TEXT NOT NULL,
      "imageUrl" TEXT,
      "category" TEXT DEFAULT 'Thought',
      "published" BOOLEAN NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "authorId" TEXT NOT NULL,
      CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS "Comment" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "content" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "authorId" TEXT NOT NULL,
      "postId" TEXT NOT NULL,
      CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS "Like" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "userId" TEXT NOT NULL,
      "postId" TEXT NOT NULL,
      CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Like_userId_postId_key" ON "Like"("userId", "postId");`,

    `CREATE TABLE IF NOT EXISTS "Follow" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "followerId" TEXT NOT NULL,
      "followingId" TEXT NOT NULL,
      CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");`,

    `CREATE TABLE IF NOT EXISTS "Bookmark" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "userId" TEXT NOT NULL,
      "postId" TEXT NOT NULL,
      CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Bookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Bookmark_userId_postId_key" ON "Bookmark"("userId", "postId");`,

    `CREATE TABLE IF NOT EXISTS "Notification" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "type" TEXT NOT NULL,
      "read" BOOLEAN NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "recipientId" TEXT NOT NULL,
      "actorId" TEXT NOT NULL,
      "postId" TEXT,
      "commentId" TEXT,
      CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`
  ];

  for (const stmt of statements) {
    await libsql.execute(stmt);
  }

  console.log('  ✅ Schema verified & ready on Turso.');
}

async function seedFullData() {
  console.log('\n🌱 Step 2: Seeding complete full-production editorial dataset into Turso...');

  // Clean out existing data cleanly
  await prisma.notification.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create All 7 Editorial Personas
  const usersData = [
    {
      email: 'demo@unfold.io',
      username: 'praneel_k',
      name: 'Praneel Kulkarni',
      passwordHash,
      bio: 'Exploring the intersections of human-first design, thoughtful engineering, and digital craft. Building UNFOLD.',
      location: 'Mumbai, India',
      website: 'https://unfold.io',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
    },
    {
      email: 'elena.rostova@unfold.io',
      username: 'elena_rostova',
      name: 'Elena Rostova',
      passwordHash,
      bio: 'Architectural theorist & spatial essayist. Writing about light, quiet spaces, and how physical environments shape consciousness.',
      location: 'Kyoto / Milan',
      website: 'https://rostovastudio.design',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    },
    {
      email: 'marcus.vance@unfold.io',
      username: 'marcus_vance',
      name: 'Marcus Vance',
      passwordHash,
      bio: 'Creative Technologist & Type Designer. Obsessed with editorial typography, grid systems, and poetic computing.',
      location: 'San Francisco, CA',
      website: 'https://marcusvance.xyz',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
    },
    {
      email: 'clara.dupont@unfold.io',
      username: 'clara_dupont',
      name: 'Clara Dupont',
      passwordHash,
      bio: 'Documentary photographer & visual chronicler. Capturing the fleeting warmth between ordinary moments.',
      location: 'Paris, France',
      website: 'https://claradupont.photos',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80',
    },
    {
      email: 'arjun.mehta@unfold.io',
      username: 'arjun_mehta',
      name: 'Arjun Mehta',
      passwordHash,
      bio: 'Product thinker & slow systems advocate. Believer in intentional software that respects human dignity.',
      location: 'Bengaluru, India',
      website: 'https://arjunm.blog',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    },
    {
      email: 'sophia.chen@unfold.io',
      username: 'sophia_chen',
      name: 'Dr. Sophia Chen',
      passwordHash,
      bio: 'Neuroaesthetics researcher & essayist. Investigating why beauty heals us and how form alters neural pathways.',
      location: 'Boston, MA',
      website: 'https://sophiachen.org',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80',
    },
    {
      email: 'julian.kroll@unfold.io',
      username: 'julian_kroll',
      name: 'Julian Kroll',
      passwordHash,
      bio: 'Sound artist and experimental documentary filmmaker. Listening to the quiet resonant frequencies of cities.',
      location: 'Berlin, Germany',
      website: 'https://juliankroll.audio',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
    }
  ];

  const createdUsers = {};
  for (const u of usersData) {
    const user = await prisma.user.create({ data: u });
    createdUsers[u.username] = user;
    console.log(`  ✓ Created user: @${user.username} (${user.name})`);
  }

  // 2. Create Follow Relationships (16)
  const follows = [
    ['praneel_k', 'elena_rostova'],
    ['praneel_k', 'marcus_vance'],
    ['praneel_k', 'clara_dupont'],
    ['elena_rostova', 'marcus_vance'],
    ['elena_rostova', 'sophia_chen'],
    ['marcus_vance', 'praneel_k'],
    ['marcus_vance', 'clara_dupont'],
    ['marcus_vance', 'arjun_mehta'],
    ['clara_dupont', 'elena_rostova'],
    ['clara_dupont', 'julian_kroll'],
    ['arjun_mehta', 'praneel_k'],
    ['arjun_mehta', 'sophia_chen'],
    ['sophia_chen', 'elena_rostova'],
    ['sophia_chen', 'arjun_mehta'],
    ['julian_kroll', 'marcus_vance'],
    ['julian_kroll', 'praneel_k'],
  ];

  for (const [follower, following] of follows) {
    await prisma.follow.create({
      data: {
        followerId: createdUsers[follower].id,
        followingId: createdUsers[following].id,
      }
    });
  }
  console.log(`  ✓ Created ${follows.length} follow relationships`);

  // 3. Create Editorial Posts (11)
  const postsData = [
    {
      author: 'elena_rostova',
      category: 'Essay',
      content: `The architecture of stillness is rarely built with stones; it is carved out of silence and deliberate proportions.\n\nWhen you step into a 400-year-old courtyard in Kyoto during an autumn drizzle, the sensory hierarchy immediately shifts. You stop consuming visual noise and begin attending to the cadence of drops hitting gravel. We have forgotten how much our minds crave spaces that do not demand our immediate reaction.`,
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&auto=format&fit=crop&q=80',
    },
    {
      author: 'marcus_vance',
      category: 'Thought',
      content: `Good typography isn't just about legibility—it is a tone of voice before a single word is comprehended. A serif typeface slows down your heartbeat; a tall condensed sans-serif pushes urgency. When we design digital social spaces, the type system establishes the unspoken social contract of the room.`,
      imageUrl: null,
    },
    {
      author: 'clara_dupont',
      category: 'Moment',
      content: `6:45 AM at the Belleville overlook. The city was still enveloped in a soft blue haze while the first bakeries were lighting their warm incandescent windows. Some moments exist solely to remind us that life is happening gently everywhere, even when our screens tell us the world is in chaos.`,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&auto=format&fit=crop&q=80',
    },
    {
      author: 'arjun_mehta',
      category: 'Discovery',
      content: `A simple observation on 'infinite scroll': It is fundamentally anti-human because it robs the reader of completion. A book has a last page. A vinyl record has a run-out groove. A conversation has a natural silence. When technology refuses to let an experience conclude, it induces a perpetual subtle anxiety. We need more platforms with an intentional sense of arrival.`,
      imageUrl: null,
    },
    {
      author: 'sophia_chen',
      category: 'Thought',
      content: `Neuroaesthetic research reveals that contemplating an organic curve or harmonic ratio decreases cortisol by up to 18% in under 90 seconds. We are biologically hardwired to respond to natural balance. Beauty is not a luxury; it is a neurological necessity for cognitive equilibrium.`,
      imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&auto=format&fit=crop&q=80',
    },
    {
      author: 'julian_kroll',
      category: 'Moment',
      content: `Recorded the reverberation of the subway tunnel at Hermannplatz at 2:00 AM using an omnidirectional binaural mic. The low 48Hz hum of the ventilation mixed with distant footsteps sounded exactly like a cathedral organ sustaining an unresolved minor ninth. The city is constantly composing its own symphonies if you just stop to listen.`,
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
    },
    {
      author: 'praneel_k',
      category: 'Story',
      content: `Why we built UNFOLD:\n\nSocial networks began as places to connect with minds we admired. Over the last decade, they mutated into hyper-optimized slot machines tuned for dopamine and outrage. We wanted to build something that felt like a quiet Sunday afternoon library—where thoughts are allowed to unfold naturally, where typography is respected, and where humans talk to humans again.`,
      imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1000&auto=format&fit=crop&q=80',
    },
    {
      author: 'elena_rostova',
      category: 'Moment',
      content: `Shadow studies at the atelier this morning. When the morning sun cuts at 32 degrees, the raw concrete column becomes a delicate sundial. The passage of time is the purest material in architecture.`,
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
    },
    {
      author: 'marcus_vance',
      category: 'Discovery',
      content: `Revisiting Emil Ruder’s 1967 manual on typography. His concept of 'Aktivierung des Weißraumes' (activation of white space) remains the most powerful principle in software design. Whitespace is never empty; it is the charged field across which meaning travels.`,
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&auto=format&fit=crop&q=80',
    },
    {
      author: 'clara_dupont',
      category: 'Story',
      content: `Met Monsieur Henri today, who has run a small bookbindery in the 5th arrondissement for 44 years. He showed me how he still hand-marbles endpapers using ox gall and mineral pigments. 'Machines can print faster,' he smiled, 'but a hand-stitched spine remembers the hands that shaped it.' A reminder to cherish tactile craft.`,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&auto=format&fit=crop&q=80',
    },
    {
      author: 'arjun_mehta',
      category: 'Thought',
      content: `What if the metrics we measured weren't 'daily active minutes' or 'retention', but 'clarity gained', 'deep ideas encountered', and 'sense of calm post-session'? The tools we build reflect the values we reward.`,
      imageUrl: null,
    }
  ];

  const createdPosts = [];
  for (const p of postsData) {
    const post = await prisma.post.create({
      data: {
        authorId: createdUsers[p.author].id,
        category: p.category,
        content: p.content,
        imageUrl: p.imageUrl,
        published: true,
      }
    });
    createdPosts.push(post);
  }
  console.log(`  ✓ Created ${createdPosts.length} editorial posts`);

  // 4. Create Thoughtful Comments (7)
  const commentsData = [
    {
      postIndex: 0,
      author: 'marcus_vance',
      content: 'This captures so beautifully what modern software lacks. The Japanese concept of "Ma" (negative space) applied to digital environments is so needed.',
    },
    {
      postIndex: 0,
      author: 'sophia_chen',
      content: 'Fascinatingly, acoustic quietness in natural environments directly stimulates theta brainwave activity, which correlates with associative insights.',
    },
    {
      postIndex: 1,
      author: 'elena_rostova',
      content: 'Couldn’t agree more, Marcus. When typography breathes, the reader feels invited rather than cornered.',
    },
    {
      postIndex: 3,
      author: 'praneel_k',
      content: 'The end-state of an experience is what leaves the lingering emotional imprint. Bringing back intentional conclusions is central to UNFOLD.',
    },
    {
      postIndex: 6,
      author: 'clara_dupont',
      content: 'Thank you for building this space. It already feels like breathing fresh mountain air compared to the algorithmic circus.',
    },
    {
      postIndex: 6,
      author: 'julian_kroll',
      content: 'The typography and pacing here are immaculate. Wonderful vision, Praneel!',
    },
    {
      postIndex: 9,
      author: 'sophia_chen',
      content: 'Tactile memory is so deeply encoded in our somatosensory cortex. Wonderful tribute to Monsieur Henri!',
    }
  ];

  for (const c of commentsData) {
    const comment = await prisma.comment.create({
      data: {
        postId: createdPosts[c.postIndex].id,
        authorId: createdUsers[c.author].id,
        content: c.content,
      }
    });

    const postAuthorId = createdPosts[c.postIndex].authorId;
    if (postAuthorId !== createdUsers[c.author].id) {
      await prisma.notification.create({
        data: {
          type: 'COMMENT',
          recipientId: postAuthorId,
          actorId: createdUsers[c.author].id,
          postId: createdPosts[c.postIndex].id,
          commentId: comment.id,
        }
      });
    }
  }
  console.log(`  ✓ Created ${commentsData.length} thoughtful comments`);

  // 5. Create Likes (16)
  const likesToCreate = [
    { postIndex: 0, user: 'marcus_vance' },
    { postIndex: 0, user: 'praneel_k' },
    { postIndex: 0, user: 'sophia_chen' },
    { postIndex: 1, user: 'elena_rostova' },
    { postIndex: 1, user: 'praneel_k' },
    { postIndex: 2, user: 'julian_kroll' },
    { postIndex: 2, user: 'marcus_vance' },
    { postIndex: 3, user: 'praneel_k' },
    { postIndex: 3, user: 'elena_rostova' },
    { postIndex: 4, user: 'marcus_vance' },
    { postIndex: 4, user: 'arjun_mehta' },
    { postIndex: 6, user: 'elena_rostova' },
    { postIndex: 6, user: 'marcus_vance' },
    { postIndex: 6, user: 'clara_dupont' },
    { postIndex: 6, user: 'sophia_chen' },
    { postIndex: 6, user: 'julian_kroll' },
  ];

  for (const l of likesToCreate) {
    const post = createdPosts[l.postIndex];
    const user = createdUsers[l.user];
    await prisma.like.create({
      data: {
        postId: post.id,
        userId: user.id,
      }
    });

    if (post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: 'LIKE',
          recipientId: post.authorId,
          actorId: user.id,
          postId: post.id,
        }
      });
    }
  }
  console.log(`  ✓ Created ${likesToCreate.length} likes with notifications`);

  // 6. Create Bookmarks (4)
  const bookmarksToCreate = [
    { postIndex: 0, user: 'praneel_k' },
    { postIndex: 4, user: 'praneel_k' },
    { postIndex: 8, user: 'praneel_k' },
    { postIndex: 1, user: 'elena_rostova' },
  ];

  for (const b of bookmarksToCreate) {
    await prisma.bookmark.create({
      data: {
        postId: createdPosts[b.postIndex].id,
        userId: createdUsers[b.user].id,
      }
    });
  }
  console.log(`  ✓ Created ${bookmarksToCreate.length} bookmarks for reading archive`);
}

async function verifyWriteRead() {
  console.log('\n🧪 Step 3: Verifying live Write & Read persistence against Turso...');

  // Test write
  const testPost = await prisma.post.create({
    data: {
      content: 'Live verification test thought created via Turso libSQL client.',
      category: 'Discovery',
      author: {
        connect: { username: 'praneel_k' },
      },
    },
  });

  // Test read
  const fetched = await prisma.post.findUnique({
    where: { id: testPost.id },
    include: { author: true },
  });

  if (!fetched || fetched.content !== testPost.content) {
    throw new Error('Verification read failed: record was not retrieved correctly.');
  }

  console.log('  ✅ Write verified: Record created with ID', testPost.id);
  console.log('  ✅ Read verified: Fetched record author ->', fetched.author.name);

  // Clean up test record
  await prisma.post.delete({ where: { id: testPost.id } });
  console.log('  ✅ Cleanup verified: Temporary test record deleted successfully.');

  const [userCount, postCount, commentCount, likeCount, followCount, bookmarkCount, notifCount] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.like.count(),
    prisma.follow.count(),
    prisma.bookmark.count(),
    prisma.notification.count(),
  ]);

  console.log('\n📊 Turso Production Database Counts:');
  console.log(`  • Users:         ${userCount} (Target: 7)`);
  console.log(`  • Posts:         ${postCount} (Target: 11)`);
  console.log(`  • Comments:      ${commentCount} (Target: 7)`);
  console.log(`  • Likes:         ${likeCount} (Target: 16)`);
  console.log(`  • Follows:       ${followCount} (Target: 16)`);
  console.log(`  • Bookmarks:     ${bookmarkCount} (Target: 4)`);
  console.log(`  • Notifications: ${notifCount} (Target: 23)`);
}

async function main() {
  try {
    await createSchema();
    await seedFullData();
    await verifyWriteRead();
    console.log('\n🎉 TURSO PRODUCTION DATABASE IS FULLY SEEDED & VERIFIED!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Turso sync error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
