const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const explicitAlignmentCss = `
/* ===================================================
   PERFECT SECTION & TEXT ALIGNMENTS
   =================================================== */

.jhr-hero {
  text-align: center;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

.jhr-names {
  text-align: center;
  justify-content: center;
  align-items: center;
  margin-inline: auto;
}

.jhr-title {
  text-align: center;
  margin-inline: auto;
  font-family: var(--font-playfair), Georgia, serif;
}

.jhr-head {
  text-align: center;
  margin-inline: auto;
  max-width: 42rem;
  padding-inline: 1.25rem;
}

.jhr-card {
  text-align: center;
  margin-inline: auto;
}

.jhr-event {
  text-align: center;
}

.jhr-count {
  text-align: center;
  justify-content: center;
}

.jhr-timeline {
  max-width: 42rem;
  margin-inline: auto;
}

.jhr-rsvp-body {
  max-width: 36rem;
  margin-inline: auto;
}

.jhr-foot {
  text-align: center;
}

/* Center all head rules & SVG ornaments */
.jhr svg.mx-auto, .jhr-rule {
  margin-inline: auto !important;
  display: block;
}
`;

css = explicitAlignmentCss + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Added explicit alignment rules to style.css!');
