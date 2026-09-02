/**
 * 👑 AMANTRANLINK GUEST MANAGEMENT DEMO SEED SCRIPT
 * Creates 22 realistic Indian wedding guest records with varied RSVP statuses,
 * family sizes, meal choices, and valid cryptographic tokens for testing.
 * 
 * Usage:
 *   node scripts/seed_guest_demo_data.mjs [target_wedding_slug]
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function generateSecureGuestToken() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let token = 'gst_';
  for (let i = 0; i < 12; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

const DEMO_GUESTS = [
  // 👑 VIP Guests
  {
    name: 'Dr. Nileshkumar Shah',
    phone: '9825012345',
    email: 'dr.nilesh@shahclinic.in',
    family: 'Shah Family',
    category: 'VIP',
    members: 2,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Attending',
      attendees: 2,
      meal: 'Pure Jain',
      wishes: 'Heartiest congratulations to the royal couple! Wishing lifelong joy and prosperity.'
    }
  },
  {
    name: 'Harshadbhai Patel',
    phone: '9426011223',
    email: 'harshad.patel@suratdiamonds.com',
    family: 'Patel Parivar (Surat)',
    category: 'VIP',
    members: 5,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Attending',
      attendees: 5,
      meal: 'Gujarati Special',
      wishes: 'May Lord Shrinathji shower divine blessings on Dhruv & Shreya on this auspicious vivah.'
    }
  },
  {
    name: 'Justice Ravindra Dave',
    phone: '9879034567',
    email: 'r.dave@judiciary.gov.in',
    family: 'Dave Parivar',
    category: 'VIP',
    members: 2,
    invitation_status: 'sent',
    rsvp: null // Pending
  },

  // 🏡 Family & Close Relatives
  {
    name: 'Mukeshbhai & Bhavnaben Patel',
    phone: '9409360336',
    email: 'mukesh.patel@gmail.com',
    family: 'Patel Parivar (Ahmedabad)',
    category: 'Family',
    members: 4,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Attending',
      attendees: 4,
      meal: 'Pure Jain',
      wishes: 'Looking forward to celebrating all Rasams together! Blessings always.'
    }
  },
  {
    name: 'Pravinbhai Somabhai Prajapati',
    phone: '9824055667',
    email: 'pravin.prajapati@gmail.com',
    family: 'Prajapati Parivar',
    category: 'Family',
    members: 6,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Attending',
      attendees: 6,
      meal: 'Gujarati Special',
      wishes: 'Auspicious congratulations to both families on this joyful union.'
    }
  },
  {
    name: 'Kiranben Arvindbhai Joshi',
    phone: '9898012399',
    email: 'kiran.joshi@outlook.com',
    family: 'Joshi Family',
    category: 'Family',
    members: 3,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Attending',
      attendees: 3,
      meal: 'Standard Veg',
      wishes: 'Warmest blessings and love to the dear bride and groom.'
    }
  },
  {
    name: 'Rameshbhai & Kokilaben Desai',
    phone: '9427044556',
    email: 'ramesh.desai@yahoo.com',
    family: 'Desai Kutumb',
    category: 'Family',
    members: 4,
    invitation_status: 'delivered',
    rsvp: null // Pending
  },
  {
    name: 'Jayendrabhai K. Mehta',
    phone: '9825123488',
    email: 'jkmehta@mehtagroup.com',
    family: 'Mehta Parivar',
    category: 'Relative',
    members: 5,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Attending',
      attendees: 5,
      meal: 'Pure Jain',
      wishes: 'Heartfelt congratulations from entire Mehta Parivar.'
    }
  },
  {
    name: 'Urmilaben Bharatkumar Trivedi',
    phone: '9909012377',
    email: 'urmila.trivedi@gmail.com',
    family: 'Trivedi Parivar (Baroda)',
    category: 'Relative',
    members: 3,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Not Attending',
      attendees: 0,
      meal: 'Standard Veg',
      wishes: 'Due to ongoing medical recovery, we regret missing the ceremony. Sending prayers and love.'
    }
  },
  {
    name: 'Dineshbhai S. Chaudhary',
    phone: '9428077889',
    email: 'dinesh.chaudhary@mehsana.org',
    family: 'Chaudhary Parivar',
    category: 'Relative',
    members: 4,
    invitation_status: 'draft',
    rsvp: null // Pending
  },

  // 👥 Friends & Batchmates
  {
    name: 'Priyanka & Rahul Sharma',
    phone: '9820045612',
    email: 'priyanka.sharma@techcorp.com',
    family: 'Sharma Couple',
    category: 'Friend',
    members: 2,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Attending',
      attendees: 2,
      meal: 'Standard Veg',
      wishes: 'Cannot wait for the Sangeet night and celebrations! Congratulations guys!'
    }
  },
  {
    name: 'Siddharth Verma',
    phone: '9819034521',
    email: 'sid.verma@fintech.io',
    family: null,
    category: 'Friend',
    members: 1,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Attending',
      attendees: 1,
      meal: 'Vegan',
      wishes: 'Cheers to the beginning of a magnificent journey together!'
    }
  },
  {
    name: 'Ananya & Rohan Malhotra',
    phone: '9811098765',
    email: 'ananya.m@designstudio.co',
    family: 'Malhotra Family',
    category: 'Friend',
    members: 2,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Maybe',
      attendees: 2,
      meal: 'Standard Veg',
      wishes: 'Checking international flight schedules; will confirm our arrival shortly.'
    }
  },
  {
    name: 'Karanvir Singh Gill',
    phone: '9872012345',
    email: 'karan.gill@chandigarh.in',
    family: null,
    category: 'Friend',
    members: 1,
    invitation_status: 'sent',
    rsvp: null // Pending
  },
  {
    name: 'Meera Nambiar',
    phone: '9845012389',
    email: 'meera.nambiar@bengaluru.ac.in',
    family: null,
    category: 'Friend',
    members: 1,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Not Attending',
      attendees: 0,
      meal: 'Standard Veg',
      wishes: 'Hearty congratulations Dhruv and Shreya! Best wishes on your wonderful new chapter.'
    }
  },
  {
    name: 'Aditya & Neha Singhania',
    phone: '9830045678',
    email: 'aditya.s@kolkatajute.com',
    family: 'Singhania Family',
    category: 'Friend',
    members: 3,
    invitation_status: 'sent',
    rsvp: null // Pending
  },

  // 💼 Business & Associates
  {
    name: 'Rajiv Agrawal & Associates',
    phone: '9820156789',
    email: 'rajiv@agrawalinfra.com',
    family: 'Agrawal Group',
    category: 'Business',
    members: 2,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Attending',
      attendees: 2,
      meal: 'Pure Jain',
      wishes: 'Our warmest felicitations to the esteemed family on this royal wedding occasion.'
    }
  },
  {
    name: 'Sunilkumar Bansal',
    phone: '9810023456',
    email: 'sbansal@delhitraders.com',
    family: 'Bansal Textiles',
    category: 'Business',
    members: 2,
    invitation_status: 'delivered',
    rsvp: null // Pending
  },
  {
    name: 'Maheshwari & Sons Helpdesk',
    phone: '9425012300',
    email: 'contact@maheshwari.in',
    family: 'Maheshwari Group',
    category: 'Business',
    members: 2,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Not Attending',
      attendees: 0,
      meal: 'Standard Veg',
      wishes: 'Warm greetings and best wishes from the directors and team.'
    }
  },
  {
    name: 'Deepakbhai & Varshaben Soni',
    phone: '9825411229',
    email: 'deepak.soni@jewellers.in',
    family: 'Soni Jewellers Parivar',
    category: 'Business',
    members: 4,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Attending',
      attendees: 4,
      meal: 'Gujarati Special',
      wishes: 'Grand congratulations on the auspicious alliance of two noble families.'
    }
  },
  {
    name: 'Gaurangbhai K. Barot',
    phone: '9427811234',
    email: 'gaurang.barot@gmail.com',
    family: 'Barot Parivar',
    category: 'Relative',
    members: 3,
    invitation_status: 'draft',
    rsvp: null // Pending
  },
  {
    name: 'Tanvi & Anshul Bhatia',
    phone: '9818099887',
    email: 'tanvi.bhatia@gurgaon.co',
    family: 'Bhatia Parivar',
    category: 'Friend',
    members: 2,
    invitation_status: 'viewed',
    rsvp: {
      status: 'Maybe',
      attendees: 2,
      meal: 'Standard Veg',
      wishes: 'Tentatively attending; coordinating baby travel plans.'
    }
  }
];

async function seedDemoGuests() {
  const targetSlug = (process.argv[2] || 'dhruv-shreya').trim().toLowerCase();
  console.log('================================================================');
  console.log(`🏰 SEEDING REALISTIC GUEST & RSVP TEST DATA FOR: [${targetSlug}]`);
  console.log('================================================================\n');

  // 1. Resolve site ID if available
  let weddingSiteId = null;
  const { data: site } = await supabase
    .from('wedding_sites')
    .select('id, slug')
    .or(`slug.eq.${targetSlug},published_url.ilike.%${targetSlug}%`)
    .maybeSingle();

  if (site) {
    weddingSiteId = site.id;
    console.log(`📡 Linked to existing wedding site ID: ${weddingSiteId}`);
  } else {
    console.log(`ℹ️ No existing site row found, storing under wedding_slug: ${targetSlug}`);
  }

  // 2. Clean up previous demo guests for this slug to keep state clean
  console.log(`🧹 Cleaning previous test demo records for [${targetSlug}]...`);
  const { data: existingGuests } = await supabase
    .from('guests')
    .select('id')
    .eq('wedding_slug', targetSlug);

  if (existingGuests && existingGuests.length > 0) {
    const ids = existingGuests.map(g => g.id);
    await supabase.from('rsvps').delete().in('guest_id', ids);
    await supabase.from('guests').delete().in('id', ids);
    console.log(`🗑️ Removed ${existingGuests.length} previous demo rows.`);
  }

  // 3. Insert fresh realistic guest records
  console.log(`\n🌱 Inserting ${DEMO_GUESTS.length} realistic wedding guests...`);
  let insertedCount = 0;
  let attendingCount = 0;
  let notAttendingCount = 0;
  let maybeCount = 0;
  let pendingCount = 0;
  let totalHeadcount = 0;
  let confirmedHeadcount = 0;

  for (let i = 0; i < DEMO_GUESTS.length; i++) {
    const g = DEMO_GUESTS[i];
    const token = generateSecureGuestToken();
    totalHeadcount += g.members;

    const guestPayload = {
      wedding_slug: targetSlug,
      full_name: g.name,
      phone: g.phone,
      email: g.email || null,
      family_name: g.family || null,
      relationship: g.category,
      guest_type: g.category,
      number_of_members: g.members,
      personal_invitation_token: token,
      invitation_status: g.invitation_status,
      viewed_at: g.invitation_status === 'viewed' ? new Date().toISOString() : null,
    };

    if (weddingSiteId) {
      guestPayload.wedding_site_id = weddingSiteId;
    }

    const { data: createdGuest, error: gErr } = await supabase
      .from('guests')
      .insert([guestPayload])
      .select()
      .single();

    if (gErr) {
      console.error(`❌ Failed to insert ${g.name}:`, gErr.message);
      continue;
    }

    insertedCount++;

    // Insert associated RSVP record if guest has responded
    if (g.rsvp && createdGuest) {
      const isAttending = g.rsvp.status === 'Attending';
      if (isAttending) {
        attendingCount++;
        confirmedHeadcount += g.rsvp.attendees;
      } else if (g.rsvp.status === 'Not Attending') {
        notAttendingCount++;
      } else if (g.rsvp.status === 'Maybe') {
        maybeCount++;
      }

      const rsvpPayload = {
        wedding_slug: targetSlug,
        guest_id: createdGuest.id,
        guest_name: g.name,
        guest_phone: g.phone,
        attendance_status: g.rsvp.status,
        attendees_count: isAttending ? g.rsvp.attendees : 0,
        attending: isAttending,
        meal_preference: g.rsvp.meal,
        wishes: g.rsvp.wishes || '',
        responded_at: new Date(Date.now() - (i * 3600000)).toISOString(),
      };

      if (weddingSiteId) {
        rsvpPayload.wedding_site_id = weddingSiteId;
      }

      await supabase.from('rsvps').insert([rsvpPayload]);
    } else {
      pendingCount++;
    }
  }

  console.log('\n================================================================');
  console.log(`🎉 SEED COMPLETE FOR: [${targetSlug}]`);
  console.log(`📊 Summary of Seeded Data:`);
  console.log(`   • Total Guests: ${insertedCount}`);
  console.log(`   • Total Expected Headcount: ${totalHeadcount}`);
  console.log(`   • Confirmed Attending: ${attendingCount} (${confirmedHeadcount} members)`);
  console.log(`   • Pending Responses: ${pendingCount}`);
  console.log(`   • Not Attending: ${notAttendingCount}`);
  console.log(`   • Marked as Maybe: ${maybeCount}`);
  console.log('================================================================\n');
}

seedDemoGuests();
