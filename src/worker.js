import { create } from "twind"
import { virtualSheet, getStyleTag } from "twind/sheets"
import * as colors from 'twind/colors'

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
    const hostname = 'waitlist.do'
    const { user, pathname, rootPath, pathSegments, query } = await env.CTX.fetch(req).then(res => res.json())
    if (rootPath && hostname == 'tailwind.do') return json({ api, gettingStarted, examples, user })
    
    let body
    let mode = 'inline' // By default, we should add a style tag to the head.
  
    if (hostname != 'tailwind.do' && hostname != 'embeds.roled.org') {
      console.log('Running as origin', hostname)
      body = await fetch(req) // pass through to origin to get HTML.
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

      if (!url.includes('.')) {
        // This URL is a Base64 encoded HTML doc.
        url = atob(url)
        body = new Response(url, { headers: { 'content-type': 'text/html; charset=utf-8' }})
      } else {
        body = await fetch(`https://` + url)
      }
    }

    const sheet = virtualSheet()

    const { tw } = create({
      sheet,
      'theme': {
        extend: {
          fontFamily: {
            sans: `'${ theme.font }', sans-serif`,
          },
          colors,
        }
      },
      preflight: {
        // Import our font from Google Fonts.
        '@import': `url('https://fonts.googleapis.com/css?family=${theme.font}:200,400,500,600,700&subset=cyrillic&display=swap')`,
      },
      hash: false,
      darkMode: 'class',
      mode: 'silent'
    })

    await new HTMLRewriter()
      .on("*", { element: elm => tw(Object.fromEntries(elm.attributes).class) })
      .transform(body.clone())
      .text()

    const style = getStyleTag(sheet)

    if (mode === 'css') {
      // remove the <style> tag from the style
      const css = style.replace(/<style.*?>|<\/style>/g, '')

      return new Response(css, {
        headers: {
          'Content-Type': 'text/css'
        }
      })
    } else if (mode === 'inline') {
      return new HTMLRewriter()
        .on('head', { element: head => head.append(style, { html: true }) })
        .transform(body.clone())
    }

    console.log(mode)
    
    return json({ api, data, user })
  }
}
  
const json = obj => new Response(JSON.stringify(obj, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
  