const fs = require('fs');

const templates = [
  'rajmahal-template',
  'royaldawn-template',
  'jharokha-template',
  'mayura-template',
  'jodi-template',
  'dak-template',
  'ivory-template',
];

console.log('=== AUDITING ALL 7 TEMPLATES FOR RSVP COMPATIBILITY ===\n');

templates.forEach((t) => {
  const p = `public/templates/${t}/index.html`;
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    const hasSharedRsvp = content.includes('shared-rsvp.js');
    const hasRsvpSection = content.includes('id="rsvp"');
    const hasRsvpForm = content.includes('data-shahi-rsvp="true"') || content.includes('class="shahi-rsvp-form"') || content.includes('class="rjm-rsvp-form"');
    const hasSuccessCard = content.includes('rsvp-success-card');
    const hasNameField = content.includes('name="guest_name"');
    const hasPhoneField = content.includes('name="guest_phone"');
    const hasAttendingField = content.includes('name="attending"');
    const hasHeadcountField = content.includes('name="attendees_count"');
    const hasWishesField = content.includes('name="wishes"');

    console.log(`[${t}]`);
    console.log(`  - File Size: ${content.length} bytes`);
    console.log(`  - Has shared-rsvp.js script: ${hasSharedRsvp}`);
    console.log(`  - Has #rsvp section: ${hasRsvpSection}`);
    console.log(`  - Has RSVP form: ${hasRsvpForm}`);
    console.log(`  - Has Success card: ${hasSuccessCard}`);
    console.log(`  - Fields: Name (${hasNameField}), Phone (${hasPhoneField}), Attending (${hasAttendingField}), Headcount (${hasHeadcountField}), Wishes (${hasWishesField})`);
    console.log('');
  } else {
    console.log(`[${t}] NOT FOUND at ${p}\n`);
  }
});
