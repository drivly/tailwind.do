import { twind, virtual, extract } from '@twind/core'
import presetTailwind from '@twind/preset-tailwind'
import colors from 'tailwindcss/colors'

export const api = {
  icon: '🚀',
  name: 'templates.do',
  description: 'Cloudflare Worker Template',
  url: 'https://templates.do/api',
  type: 'https://apis.do/templates',
  endpoints: {
    listCategories: 'https://templates.do/api',
    getCategory: 'https://templates.do/:type',
  },
  site: 'https://templates.do',
  login: 'https://templates.do/login',
  signup: 'https://templates.do/signup',
  subscribe: 'https://templates.do/subscribe',
  repo: 'https://github.com/drivly/templates.do',
}

export const gettingStarted = [
  `If you don't already have a JSON Viewer Browser Extension, get that first:`,
  `https://extensions.do`,
]

export const examples = {
  listItems: 'https://templates.do/worker',
}

const theme = {
  font: 'Inter'
}

export default {
  fetch: async (req, env) => {
    const { user, hostname, pathname, rootPath, pathSegments, query, method } = await env.CTX.fetch(req.clone()).then(res => res.json())
    if (rootPath && hostname == 'tailwind.do') return json({ api, gettingStarted, examples, user })

    let body
    let mode = 'inline' // By default, we should add a style tag to the head.
    const fetch_start = Date.now()
    let cache_key

    if (method == 'GET') {
  
      if (hostname != 'tailwind.do' && hostname != 'embeds.roled.org') {
        console.log('Running as origin', hostname)
        body = await fetch(req) // pass through to origin to get HTML.
        
        if (!body.headers.get('content-type').includes('text/html')) {
          return body
        }

        cache_key = `https://tailwind.do/${hostname}${pathname}`
      } else {
        if (!pathSegments[0].includes('.')) {
          // This is a theme segment
          // In format of key=value,key=value
          for (const themeSegment of pathSegments.shift().split(',')) {
            const [key, value] = themeSegment.split('=')
            theme[key] = value
          }
        }

        // Get the mode from the path.
        if (['css', 'inline'].includes(pathSegments[0])) {
          mode = pathSegments.shift()
        }

        let url = pathSegments.join('/')

        body = await fetch(`https://` + url)

        cache_key = `https://tailwind.do/${url}`
      }
    } else if (method == 'POST') {
      // Get the mode from the path.
      if (['css', 'inline'].includes(pathSegments[0])) {
        mode = pathSegments.shift()
      }

      body = await req.text()
      
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))

      // Turn hash into a readable format
      console.log(Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''))

      cache_key = `https://tailwind.do/${Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')}`

      body = new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' }})
    }

    const fetch_ms = Date.now() - fetch_start

    const processing_start = Date.now()

    // Race both the body + css extraction AND a cache fetch.
    // But we're only interested in if either is successful.
    // So we need to race, but only for resolved promises, ignoring rejected ones.
    const race = [
      new Promise(async res => {
        const tw = twind(
          {
            'theme': {
              extend: {
                fontFamily: {
                  sans: `'${ theme.font }', sans-serif`,
                },
                colors,
              }
            },
            hash: false,
            darkMode: 'class',
            mode: 'silent',
            presets: [presetTailwind({})]
          },
          virtual()
        )
    
        const { html, css } = extract(await (body.clone()).text(), tw)

        res({
          from: 'tw',
          html,
          css
        })
      }),
      new Promise(async (res, rej) => {
        const cache = caches.default

        const resp = await cache.match(cache_key)

        if (!resp) {
          console.log('Cache miss')
          return rej()
        }

        const { html, css } = await resp.json()

        res({
          from: 'cache',
          html,
          css,
        })
      })
    ]

    const { from, html, css } = await Promise.any(race)

    await new Promise(r => setTimeout(r, 5))

    console.log(
      `Processing took ${(Date.now() - processing_start)}ms`,
    )

    const processing_ms = Date.now() - processing_start

    if (from == 'tw') {
      const cache = caches.default

      const r = new Response(JSON.stringify({ html, css }))

      r.headers.set('Cache-Control', 'max-age=31536000')

      await cache.put(cache_key, r)
    }

    if (mode === 'css') {
      // remove the <style> tag from the style
      return new Response(css, {
        headers: {
          'Content-Type': 'text/css',
          'TW-Fetch-Time': `${fetch_ms}ms`,
          'TW-Processing-Time': `${processing_ms}ms`,
          'TW-Served-From': from,
        }
      })
    } else if (mode === 'inline') {
      const edited_response = new Response(body.body, body)

      edited_response.headers.set('Content-Type', 'text/html')
      edited_response.headers.set('TW-Fetch-Time', `${fetch_ms}ms`)
      edited_response.headers.set('TW-Processing-Time', `${processing_ms}ms`)
      edited_response.headers.set('TW-Served-From', from)

      // Do some basic minification on the CSS file
      const minified_css = css.replace(/\s+/g, ' ').replace(/\/\*.*?\*\//g, '')

      return new HTMLRewriter()
        .on('head', { element: head => head.append(`<style id="tailwind.do">${minified_css}</style>`, { html: true }) })
        .transform(edited_response)
    }

    console.log(mode)
    
    return json({ api, data, user })
  }
}
  
const json = obj => new Response(JSON.stringify(obj, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
  