/**
 * TravelEngine Database Seed Script for Neon
 * 
 * This script connects directly to the Neon PostgreSQL database configured in your .env.local,
 * verifies the connection, and populates the database with a premium, fully-loaded demo account.
 * 
 * Default login credentials:
 * - Email: aria@travelengine.com
 * - Password: password123
 */

const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

// 1. Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove surrounding quotes if any
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('\x1b[31m[ERROR] DATABASE_URL is not set in .env.local\x1b[0m');
  process.exit(1);
}

// Extract host to print in logs
const hostMatch = databaseUrl.match(/@([^/]+)/);
const host = hostMatch ? hostMatch[1] : 'Neon Postgres';

console.log('\x1b[36m============================================================\x1b[0m');
console.log('\x1b[35m             T R A V E L E N G I N E   S E E D E R              \x1b[0m');
console.log('\x1b[36m============================================================\x1b[0m');
console.log(`Connecting to Neon: \x1b[33m${host}\x1b[0m...`);

const sql = neon(databaseUrl);

async function seed() {
  try {
    // 2. Hash password
    console.log('Hashing password for default user...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const userEmail = 'aria@travelengine.com';

    // 3. Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${userEmail} LIMIT 1
    `;

    let userId;
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      console.log(`User \x1b[32m${userEmail}\x1b[0m already exists (ID: ${userId}). Cleaning up old seed data...`);
      
      // Clean up previous seed data for this user to avoid duplication
      await sql`DELETE FROM chat_messages WHERE user_id = ${userId}`;
      await sql`DELETE FROM travel_documents WHERE user_id = ${userId}`;
      
      // Fetch and delete trips + related details
      const userTrips = await sql`SELECT id FROM trips WHERE user_id = ${userId}`;
      for (const trip of userTrips) {
        await sql`DELETE FROM budgets WHERE trip_id = ${trip.id}`;
        await sql`DELETE FROM itinerary_days WHERE trip_id = ${trip.id}`;
        await sql`DELETE FROM trips WHERE id = ${trip.id}`;
      }
    } else {
      // Create user
      console.log(`Creating user \x1b[32m${userEmail}\x1b[0m...`);
      const insertedUser = await sql`
        INSERT INTO users (
          email, 
          name, 
          password_hash, 
          role, 
          avatar_url, 
          preferences
        ) VALUES (
          ${userEmail}, 
          'Aria Traveler', 
          ${passwordHash}, 
          'TRAVELER', 
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
          '{"temperatureUnit":"C","currency":"USD","language":"en"}'::jsonb
        ) RETURNING id
      `;
      userId = insertedUser[0].id;
      console.log(`User created successfully! (ID: ${userId})`);
    }

    // 4. Create Trip
    console.log('Inserting sample trip...');
    const tripTitle = "Aria's Autumn Adventure in Kyoto";
    const insertedTrip = await sql`
      INSERT INTO trips (
        user_id,
        title,
        status,
        origin,
        destination,
        origin_lat,
        origin_lng,
        dest_lat,
        dest_lng,
        start_date,
        end_date,
        num_travelers,
        total_budget,
        estimated_cost,
        currency,
        ai_generated,
        ai_prompt,
        cover_image,
        metadata
      ) VALUES (
        ${userId},
        ${tripTitle},
        'PLANNED',
        'San Francisco, USA',
        'Kyoto, Japan',
        37.7749,
        -122.4194,
        35.0116,
        135.7681,
        '2026-10-15',
        '2026-10-22',
        1,
        3500.00,
        3120.00,
        'USD',
        true,
        '7-day autumn leaves culture and culinary tour of Kyoto with private ryokan and scenic train booking details',
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&h=600',
        '{"interests":["culinary","nature","culture","history"],"autumnLeavesPeak":true}'::jsonb
      ) RETURNING id
    `;
    const tripId = insertedTrip[0].id;
    console.log(`Trip inserted successfully! (ID: ${tripId})`);

    // 5. Create Itinerary Days
    console.log('Inserting itinerary days...');
    const day1 = await sql`
      INSERT INTO itinerary_days (trip_id, day_number, date, title, summary, estimated_cost)
      VALUES (${tripId}, 1, '2026-10-15', 'Arrival & Gion Walk', 'Welcome to Kyoto! Check-in at your traditional Ryokan and explore the historic lantern-lit streets of Gion.', 150.00)
      RETURNING id
    `;
    const day1Id = day1[0].id;

    const day2 = await sql`
      INSERT INTO itinerary_days (trip_id, day_number, date, title, summary, estimated_cost)
      VALUES (${tripId}, 2, '2026-10-16', 'Arashiyama Bamboo & Scenic Train', 'Immerse yourself in nature with Arashiyama Bamboo Grove and the scenic Sagano romantic railway.', 80.00)
      RETURNING id
    `;
    const day2Id = day2[0].id;

    const day3 = await sql`
      INSERT INTO itinerary_days (trip_id, day_number, date, title, summary, estimated_cost)
      VALUES (${tripId}, 3, '2026-10-17', 'Golden Pavilions & Fushimi Gates', 'A cultural journey featuring Kyoto''s most iconic shrines and temples.', 90.00)
      RETURNING id
    `;
    const day3Id = day3[0].id;

    // 6. Create Activities
    console.log('Inserting activities...');
    // Day 1 Activities
    await sql`
      INSERT INTO activities (itinerary_day_id, order_index, type, title, description, location_name, location_lat, location_lng, start_time, end_time, duration_minutes, estimated_cost, currency, booking_status, notes)
      VALUES (
        ${day1Id}, 1, 'ACCOMMODATION', 'Check-in at Kyoto Imperial Ryokan', 
        'Traditional tatami mat room with private hot spring bath (onsen) access and multi-course kaiseki dinner.',
        'Kyoto Imperial Ryokan, Kyoto', 35.0132, 135.7725, '14:00:00', '15:30:00', 90, 0.00, 'USD', 'BOOKED', 
        'Ryokan has been pre-paid. Includes traditional green tea service upon arrival.'
      )
    `;
    await sql`
      INSERT INTO activities (itinerary_day_id, order_index, type, title, description, location_name, location_lat, location_lng, start_time, end_time, duration_minutes, estimated_cost, currency, booking_status, notes)
      VALUES (
        ${day1Id}, 2, 'SIGHTSEEING', 'Evening Walk in Historic Gion', 
        'Walk through Gion district along the Shirakawa canal. Beautiful wooden machiya townhouses and chance to spot geishas.',
        'Gion, Kyoto', 35.0037, 135.7782, '18:00:00', '20:00:00', 120, 0.00, 'USD', 'UNBOOKED', 
        'Free walk. Stop by a local tea house for authentic matcha.'
      )
    `;
    await sql`
      INSERT INTO activities (itinerary_day_id, order_index, type, title, description, location_name, location_lat, location_lng, start_time, end_time, duration_minutes, estimated_cost, currency, booking_status, notes)
      VALUES (
        ${day1Id}, 3, 'RESTAURANT', 'Kaiseki Dinner at Ryokan', 
        '9-course seasonal traditional Japanese culinary art experience prepared by award-winning local chefs.',
        'Kyoto Imperial Ryokan Dining Hall', 35.0132, 135.7725, '20:15:00', '22:00:00', 105, 150.00, 'USD', 'BOOKED', 
        'Seafood and seasonal mushrooms featured.'
      )
    `;

    // Day 2 Activities
    await sql`
      INSERT INTO activities (itinerary_day_id, order_index, type, title, description, location_name, location_lat, location_lng, start_time, end_time, duration_minutes, estimated_cost, currency, booking_status, notes)
      VALUES (
        ${day2Id}, 1, 'NATURE', 'Arashiyama Bamboo Grove Walk', 
        'Early morning walk to beat the crowds through the towering green bamboo stalks. Extremely peaceful.',
        'Arashiyama Bamboo Grove, Kyoto', 35.0156, 135.6715, '07:30:00', '09:30:00', 120, 0.00, 'USD', 'UNBOOKED', 
        'Highly recommended to start early!'
      )
    `;
    await sql`
      INSERT INTO activities (itinerary_day_id, order_index, type, title, description, location_name, location_lat, location_lng, start_time, end_time, duration_minutes, estimated_cost, currency, booking_status, notes)
      VALUES (
        ${day2Id}, 2, 'TRANSIT', 'Sagano Scenic Railway Ride', 
        'A scenic train journey along the beautiful Hozugawa River gorge surrounded by vibrant autumn maple trees.',
        'Saga-Arashiyama Station', 35.0180, 135.6811, '11:00:00', '12:00:00', 60, 25.00, 'USD', 'BOOKED', 
        'Tickets reserved in Car 5 (open-air car).'
      )
    `;

    // Day 3 Activities
    await sql`
      INSERT INTO activities (itinerary_day_id, order_index, type, title, description, location_name, location_lat, location_lng, start_time, end_time, duration_minutes, estimated_cost, currency, booking_status, notes)
      VALUES (
        ${day3Id}, 1, 'CULTURE', 'Kinkaku-ji (Golden Pavilion)', 
        'Zen Buddhist temple covered in brilliant gold leaf. Overlooks a mirror pond with gorgeous reflection gardens.',
        'Kinkaku-ji, Kyoto', 35.0394, 135.7292, '09:00:00', '10:30:00', 90, 15.00, 'USD', 'UNBOOKED', 
        'Entry ticket is 400 JPY. Beautiful postcard views.'
      )
    `;
    await sql`
      INSERT INTO activities (itinerary_day_id, order_index, type, title, description, location_name, location_lat, location_lng, start_time, end_time, duration_minutes, estimated_cost, currency, booking_status, notes)
      VALUES (
        ${day3Id}, 2, 'CULTURE', 'Fushimi Inari Shrine Torii Gates Hike', 
        'Hike up Mount Inari through paths lined with over 10,000 vibrant vermilion Torii gates. Offers amazing city lookouts.',
        'Fushimi Inari Shrine, Kyoto', 34.9671, 135.7727, '15:00:00', '17:30:00', 150, 0.00, 'USD', 'UNBOOKED', 
        'Hike is free. Wear comfortable walking shoes.'
      )
    `;

    // 7. Create Budget & Items
    console.log('Inserting budget and items...');
    const insertedBudget = await sql`
      INSERT INTO budgets (trip_id, total_budget, spent, currency, alert_threshold)
      VALUES (${tripId}, 3500.00, 1425.00, 'USD', 80.00)
      RETURNING id
    `;
    const budgetId = insertedBudget[0].id;

    await sql`
      INSERT INTO budget_items (budget_id, category, description, estimated_cost, actual_cost, is_paid)
      VALUES (${budgetId}, 'ACCOMMODATION', 'Kyoto Imperial Ryokan (7 Nights)', 2000.00, 1400.00, true)
    `;
    await sql`
      INSERT INTO budget_items (budget_id, category, description, estimated_cost, actual_cost, is_paid)
      VALUES (${budgetId}, 'TRANSIT', 'Sagano Scenic Train Ticket', 25.00, 25.00, true)
    `;
    await sql`
      INSERT INTO budget_items (budget_id, category, description, estimated_cost, actual_cost, is_paid)
      VALUES (${budgetId}, 'FOOD', 'Kaiseki Dinner (Day 1)', 150.00, 0.00, false)
    `;
    await sql`
      INSERT INTO budget_items (budget_id, category, description, estimated_cost, actual_cost, is_paid)
      VALUES (${budgetId}, 'CULTURE', 'Kinkaku-ji Entry Fee', 15.00, 0.00, false)
    `;

    // 8. Create Travel Documents
    console.log('Inserting travel documents...');
    await sql`
      INSERT INTO travel_documents (user_id, trip_id, type, title, reference_number, provider, file_type, valid_from, valid_until)
      VALUES (
        ${userId}, ${tripId}, 'ACCOMMODATION', 'Kyoto Imperial Ryokan Confirmation', 
        'RYOKAN-KYOTO-8899', 'Kyoto Imperial Ryokan Group', 'PDF', '2026-10-15', '2026-10-22'
      )
    `;
    await sql`
      INSERT INTO travel_documents (user_id, trip_id, type, title, reference_number, provider, file_type, valid_from, valid_until)
      VALUES (
        ${userId}, ${tripId}, 'TRANSIT', 'Sagano Romantic Scenic Train Ticket', 
        'SAGANO-TRAIN-TKT-55C', 'Sagano Scenic Railway Company', 'PNG', '2026-10-16', '2026-10-16'
      )
    `;

    // 9. Create Chat Messages
    console.log('Inserting chat messages...');
    await sql`
      INSERT INTO chat_messages (user_id, role, content, trip_context)
      VALUES (
        ${userId}, 'assistant', 
        'Welcome to Kyoto, Aria! I have pre-loaded your autumn leaves tour of Kyoto. I will be standing by to help you look up local culinary secrets, coordinate public transport, and adapt your itinerary on the fly. Try asking me for "the best local ramen spots near Arashiyama Bamboo Grove"!',
        ${tripId}
      )
    `;

    console.log('\n\x1b[92m[SUCCESS] Neon Database Seeded Successfully!\x1b[0m');
    console.log('\x1b[36m============================================================\x1b[0m');
    console.log('You can now log in using:');
    console.log('  Email:    \x1b[93maria@travelengine.com\x1b[0m');
    console.log('  Password: \x1b[93mpassword123\x1b[0m');
    console.log('\x1b[36m============================================================\x1b[0m\n');

  } catch (error) {
    console.error('\n\x1b[31m[ERROR] Seeding failed:\x1b[0m', error);
    process.exit(1);
  }
}

seed();
