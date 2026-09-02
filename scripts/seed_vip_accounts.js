import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93emlpcWR4YnZ5bnJwcnVndndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMzAyMDMsImV4cCI6MjEwMjgwNjIwM30._rrJrh-NLf3t0sQzvmcQL9X3CzZH_nvHGvqOv1ijqeI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const VIP_USERS = [
  {
    name: 'Aryan Patel (Owner)',
    email: 'cyberpatel6001@gmail.com',
    password: 'Shahi@Patel#2026',
    role: 'admin',
    phone: '+91 9409360336'
  },
  {
    name: 'Executive Admin',
    email: 'admin@amantranlink.com',
    password: 'Amantran@Admin#2026',
    role: 'admin',
    phone: '+91 9409360336'
  },
  {
    name: 'Royal VIP Master',
    email: 'vip@amantranlink.com',
    password: 'Royal@VIP#2026',
    role: 'master_vip',
    phone: '+91 9409360336'
  }
];

async function seedVipAccounts() {
  console.log('👑 Seeding 3 Master VIP Accounts in Supabase...\n');

  for (const user of VIP_USERS) {
    try {
      // 1. Try to sign up
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.name,
            role: user.role,
            phone: user.phone
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered') || error.message.includes('already exists')) {
          console.log(`ℹ️ [Existing User] ${user.email} is already registered in Auth.`);
          // Update profile role in profiles table
          await supabase.from('profiles').update({ role: user.role }).eq('email', user.email);
        } else {
          console.warn(`⚠️ [Auth SignUp Notice] ${user.email}: ${error.message}`);
        }
      } else {
        console.log(`✅ [Created VIP User] ${user.email} | Name: ${user.name}`);
        if (data.user?.id) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            updated_at: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error(`❌ Error on ${user.email}:`, err.message);
    }
  }

  console.log('\n👑 Seeding complete!');
}

seedVipAccounts();
