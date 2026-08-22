import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';
import { WeddingProjectState } from '../types/wedding';

export async function exportClientZip(state: WeddingProjectState) {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#C9A050', '#F4E3B8', '#8C182F', '#FFFFFF'],
  });

  const groom = state.couple.groomEn || 'Dhruv';
  const bride = state.couple.brideEn || 'Shreya';
  const zipFilename = `${groom}_and_${bride}_Wedding_Invitation_Package.zip`;

  const zip = new JSZip();
  const themeFolder = `/templates/${state.theme}-template`;

  try {
    const [htmlRes, cssRes, appRes] = await Promise.all([
      fetch(`${themeFolder}/index.html`).then((r) => r.text()),
      fetch(`${themeFolder}/style.css`).then((r) => r.text()).catch(() => ''),
      fetch(`${themeFolder}/app.js`).then((r) => r.text()).catch(() => ''),
    ]);

    // 🔒 Enterprise Client Code Protection & Anti-Inspect Shield
    const securityScript = `
<script>
  /* 🔒 Protected Standalone Client Invitation */
  (function(){
    document.addEventListener('contextmenu', function(e){ e.preventDefault(); return false; });
    document.addEventListener('keydown', function(e){
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Cmd+Opt+I
      if (
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83)) ||
        (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74))
      ) {
        e.preventDefault();
        return false;
      }
    });
  })();
</script>`;

    // Replace customer details in HTML
    let customHtml = htmlRes;
    customHtml = customHtml.replace(/Dhruv/g, groom);
    customHtml = customHtml.replace(/Shreya/g, bride);
    customHtml = customHtml.replace(/3 December 2024/g, state.couple.weddingDate);
    
    // Inject Protection Shield before closing body
    if (customHtml.includes('</body>')) {
      customHtml = customHtml.replace('</body>', `${securityScript}\n</body>`);
    } else {
      customHtml += securityScript;
    }

    // Build custom config JS (Stripped of proprietary builder logic)
    const customConfig = `/* Royal Vivah Client Configuration */
window.WEDDING_CONFIG = {
  groomName: "${groom}",
  brideName: "${bride}",
  weddingDate: "${state.couple.weddingDate}",
  city: "${state.couple.venueName}",
  venue: "${state.couple.venueName}",
  mapUrl: "${state.couple.mapUrl}",
  mark: "${state.couple.mark}",
  hashtag: "${state.couple.hashtag}",
  groomParents: {
    en: "${state.family.groomParentsEn}",
    hi: "${state.family.groomParentsHi}",
    gu: "${state.family.groomParentsGu}"
  },
  brideParents: {
    en: "${state.family.brideParentsEn}",
    hi: "${state.family.brideParentsHi}",
    gu: "${state.family.brideParentsGu}"
  },
  contacts: [
    { name: "${state.family.rsvp1Name}", phone: "${state.family.rsvp1Phone}" },
    { name: "${state.family.rsvp2Name}", phone: "${state.family.rsvp2Phone}" }
  ],
  events: ${JSON.stringify(state.events)}
};`;

    zip.file('index.html', customHtml);
    if (cssRes) zip.file('style.css', cssRes);
    if (appRes) zip.file('app.js', appRes);
    zip.file('wedding-config.js', customConfig);

    const publicFolder = zip.folder('public');
    
    // Add uploaded MP3
    if (state.media.audioBlob && publicFolder) {
      publicFolder.file('FinalSong.mp3', state.media.audioBlob);
    }

    // Add slot photos
    if (publicFolder) {
      const photosFolder = publicFolder.folder('photos');
      if (photosFolder) {
        Object.entries(state.media.photoSlots || {}).forEach(([slotKey, slot]) => {
          if (slot.file) {
            const ext = slot.file.name.split('.').pop() || 'jpg';
            photosFolder.file(`${slotKey}.${ext}`, slot.file);
          }
        });
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, zipFilename);
  } catch (err) {
    const fallbackZip = new JSZip();
    fallbackZip.file('README.txt', `Wedding Website Package for ${groom} & ${bride}\nTheme: ${state.theme}\nDate: ${state.couple.weddingDate}`);
    const c = await fallbackZip.generateAsync({ type: 'blob' });
    saveAs(c, zipFilename);
  }
}
