const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const SALT_ROUNDS = 12;

const seed = async () => {
  console.log('Seeding Supabase database...');
  
  // 1. Seed Admin
  const email = process.env.ADMIN_EMAIL || 'admin@njdesignstudio.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Check if admin already exists
  const { data: existingAdmin, error: checkAdminErr } = await supabase
    .from('admins')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (checkAdminErr) {
    console.error('Error checking admin presence:', checkAdminErr.message);
  } else if (existingAdmin) {
    console.log('Admin already exists.');
  } else {
    const { error: adminErr } = await supabase
      .from('admins')
      .insert([{ email: email.toLowerCase(), password: hashedPassword }]);
    if (adminErr) console.error('Admin seeding error:', adminErr.message);
    else console.log('Admin seeded successfully.');
  }

  // 2. Seed Team (Principal Architect)
  const { data: existingTeam, error: checkTeamErr } = await supabase
    .from('team_members')
    .select('id')
    .limit(1);

  if (checkTeamErr) {
    console.error('Error checking team members presence:', checkTeamErr.message);
  } else if (existingTeam && existingTeam.length > 0) {
    console.log('Team members already exist.');
  } else {
    const { error: teamErr } = await supabase
      .from('team_members')
      .insert([{
        name: 'Nishant Joseph',
        role: 'Principal Architect',
        bio: 'Principal Architect & Founder',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        order: 0
      }]);
    if (teamErr) console.error('Team seeding error:', teamErr.message);
    else console.log('Team seeded successfully.');
  }
};

seed();
