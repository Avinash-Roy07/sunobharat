import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROUTES = ['truck', 'salon', 'chai', 'nightdrive', 'bhojpuri', 'punjabi', 'gym', 'rajumistri', 'hindi90s']

const META = {
  truck: {
    title: 'Truck Driver Music – Truck Wala Gana | Suno Bharat',
    desc: 'Truck driver ke safar ka best music. Truck wala gana, truck geet, truck driver song, highway music – free suno Suno Bharat par.',
    keywords: 'truck driver music, truck wala gana, truck geet, truck driver song, truck song hindi, highway music, truck driver playlist, safar ka gana, truck music india, trending truck song, truck driver ke gane, long drive music hindi, suno bharat, gana suno, song suno, trending gana, desi music',
    seo: '<h1>Truck Driver Music – Truck Wala Gana</h1><p>Truck driver ke safar ka best music suno. Truck wala gana, truck geet, truck driver song, highway music, safar ka gana, long drive music, trending truck song – sab kuch free on Suno Bharat. Gana suno, song suno, suno bharat par trending gana.</p>',
  },
  salon: {
    title: 'Salon Music – Barber Shop Gana | Suno Bharat',
    desc: 'Salon aur barber shop ke liye best music playlist. Salon gana, barber music, cutting music – free suno Suno Bharat par.',
    keywords: 'salon music, barber shop music, salon gana, barber gana, cutting music, salon playlist, hindi salon songs, barber music india, suno bharat, gana suno, trending gana, desi music, hindi gana free, apna gana',
    seo: '<h1>Salon Music – Barber Shop Gana</h1><p>Salon aur barber shop ke liye best music. Salon gana, barber gana, cutting music, barber shop playlist – free suno Suno Bharat par. Gana suno, song suno, trending gana.</p>',
  },
  chai: {
    title: 'Chai Adda Music – Chai Wala Gana | Suno Bharat',
    desc: 'Chai ki chusski ke saath best desi music. Chai adda gana, chai wala song, tapri music – free suno Suno Bharat par.',
    keywords: 'chai adda music, chai wala gana, chai song, tapri music, chai pe charcha music, chai adda playlist, desi chai music, chai time songs hindi, suno bharat, gana suno, song suno, trending gana, hindi gana, desi gana',
    seo: '<h1>Chai Adda Music – Chai Wala Gana</h1><p>Chai ki chusski ke saath best desi music. Chai wala gana, tapri music, chai adda playlist, chai time songs – free suno Suno Bharat par. Gana suno, song suno, trending gana.</p>',
  },
  nightdrive: {
    title: 'Night Drive Music – Raat Ka Gana | Suno Bharat',
    desc: 'Raat ki drive ke liye best music. Night drive songs, raat ka gana, lo-fi hindi, midnight music – free suno Suno Bharat par.',
    keywords: 'night drive music, raat ka gana, midnight songs hindi, lo-fi hindi, night drive playlist, raat ki drive music, chill hindi songs, late night music india, raat aur raaste, suno bharat, gana suno, trending gana, song suno, desi music',
    seo: '<h1>Night Drive Music – Raat Ka Gana</h1><p>Raat ki drive ke liye best music. Raat ka gana, lo-fi hindi, midnight songs, night drive playlist, chill hindi songs – free suno Suno Bharat par. Gana suno, song suno, trending gana.</p>',
  },
  bhojpuri: {
    title: 'Bhojpuri Songs – Bhojpuri Gana | Suno Bharat',
    desc: 'Best Bhojpuri songs playlist. Bhojpuri gana, bhojpuri hit songs, bhojpuri dhamaka – free suno Suno Bharat par.',
    keywords: 'bhojpuri songs, bhojpuri gana, bhojpuri hit songs, bhojpuri dhamaka, new bhojpuri song, bhojpuri music, bhojpuri playlist, trending bhojpuri song, bhojpuri gana 2024, bhojpuri superhit, suno bharat, gana suno, song suno, trending gana, desi gana',
    seo: '<h1>Bhojpuri Songs – Bhojpuri Gana</h1><p>Best bhojpuri songs playlist. Bhojpuri gana, bhojpuri dhamaka, trending bhojpuri song, bhojpuri hit songs, new bhojpuri song 2024 – free suno Suno Bharat par. Gana suno, song suno, trending gana.</p>',
  },
  punjabi: {
    title: 'Punjabi Songs – Punjabi Gana | Suno Bharat',
    desc: 'Best Punjabi songs playlist. Punjabi gana, new punjabi song, punjabi hits, punjabi tashan – free suno Suno Bharat par.',
    keywords: 'punjabi songs, punjabi gana, new punjabi song, punjabi hits, punjabi music, punjabi playlist, trending punjabi song, punjabi tashan, punjabi beat, latest punjabi songs, suno bharat, gana suno, song suno, trending gana, desi music',
    seo: '<h1>Punjabi Songs – Punjabi Gana</h1><p>Best punjabi songs playlist. Punjabi gana, new punjabi song, punjabi tashan, punjabi hits, trending punjabi song – free suno Suno Bharat par. Gana suno, song suno, trending gana.</p>',
  },
  gym: {
    title: 'Gym Music – Workout Gana | Suno Bharat',
    desc: 'Gym workout ke liye best music. Gym gana, workout songs, motivation music, gym playlist – free suno Suno Bharat par.',
    keywords: 'gym music, workout music, gym gana, workout songs hindi, gym playlist, motivation music, gym songs india, exercise music, bodybuilding music, gym motivation songs, workout gana, suno bharat, gana suno, song suno, trending gana, desi music',
    seo: '<h1>Gym Music – Workout Gana</h1><p>Gym workout ke liye best music. Gym gana, workout songs hindi, gym motivation songs, exercise music, bodybuilding music – free suno Suno Bharat par. Gana suno, song suno, trending gana.</p>',
  },
  rajumistri: {
    title: 'Raju Mistri Music – Kaam Ka Gana | Suno Bharat',
    desc: 'Kaam karte waqt sunne ka best music. Raju mistri gana, mazdoor music, kaam ka gana – free suno Suno Bharat par.',
    keywords: 'raju mistri music, kaam ka gana, mazdoor music, kaam karte gana, worker music hindi, desi kaam music, mistri gana, hindi work music, suno bharat, gana suno, song suno, trending gana, desi gana, hindi gana free',
    seo: '<h1>Raju Mistri Music – Kaam Ka Gana</h1><p>Kaam karte waqt sunne ka best music. Kaam ka gana, mazdoor music, raju mistri gana, desi kaam music – free suno Suno Bharat par. Gana suno, song suno, trending gana.</p>',
  },
  hindi90s: {
    title: '90s Hindi Songs – Purane Gaane | Suno Bharat',
    desc: '90s ki yaadein taaza karo. 90s hindi songs, purane gaane, old hindi songs, retro music – free suno Suno Bharat par.',
    keywords: '90s hindi songs, purane gaane, old hindi songs, retro hindi music, 90s ke gaane, hindi 90s playlist, purana gana, 90s bollywood songs, classic hindi songs, yaadein wale gaane, 90s superhit, suno bharat, gana suno, song suno, trending gana, desi music',
    seo: '<h1>90s Hindi Songs – Purane Gaane</h1><p>90s ki yaadein taaza karo. Purane gaane, 90s ke gaane, old hindi songs, retro hindi music, 90s bollywood songs, classic hindi songs – free suno Suno Bharat par. Gana suno, song suno, trending gana.</p>',
  },
}

function prerenderPlugin() {
  return {
    name: 'prerender-routes',
    closeBundle() {
      const template = readFileSync(resolve('dist/index.html'), 'utf-8')
      ROUTES.forEach(route => {
        const m = META[route]
        const seoBlock = `<div style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">${m.seo}</div>`
        const html = template
          .replace(/<title>.*?<\/title>/, `<title>${m.title}</title>`)
          .replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${m.desc}"`)
          .replace(/<meta name="keywords" content=".*?"/, `<meta name="keywords" content="${m.keywords}"`)
          .replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${m.title}"`)
          .replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${m.desc}"`)
          .replace(/<meta property="og:url" content=".*?"/, `<meta property="og:url" content="https://www.sunobharat.online/${route}"`)
          .replace(/<link rel="canonical" href=".*?"/, `<link rel="canonical" href="https://www.sunobharat.online/${route}"`)
          .replace('<div id="root"></div>', `<div id="root"></div>${seoBlock}`)
        mkdirSync(resolve(`dist/${route}`), { recursive: true })
        writeFileSync(resolve(`dist/${route}/index.html`), html)
      })
      console.log('✅ Pre-rendered', ROUTES.length, 'routes with full keywords')
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), prerenderPlugin()],
  server: { historyApiFallback: true },
})
