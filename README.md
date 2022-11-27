# ⛅ Tailwind.do - Tailwind-on-demand

Generates CSS based on Tailwind classes used in your HTML, all without needing to setup a build step.

### Setting up
All you need to do is send a request to our API with the URL you want us to scan, and we'll send back a already setup HTML doc with your classes inlined. You can also request a CSS file as well.

Tailwind.do also supports headless mode, which will return your site's HTML with the classes inlined as if it was built natively. This is great for improving Lighthouse scores and development experience without needing to invest heavily into tooling. All you need to do is run this Worker infront of website and it will automagically detect and generate the needed CSS.

![](https://nyc3.digitaloceanspaces.com/cerulean/screenshots/2022/11/firefox_LwtOlXVlIz.png)

### GET /:themeSettings/:mode/:url
### GET /:url
This is the main route for Tailwind.do. All parameters are optional other than URL.

##### Parameters
- `themeSettings` - A comma-separated list of theme settings to use. Right now, you can only change `font` to be anything Google Fonts supports. This will change the font used by Tailwind. For example, `font=Roboto` will use Roboto as the font.

- `mode` - The mode to use. This can be either `css` or `inline` (default).

- `url` - The URL to scan for Tailwind classes. Must be a valid URL without the prefix `http://` or `https://`. For example, `tailwind.do/inline/tailwindcss.com/docs/installation` will scan the page, and inline the Tailwind classes generated. Change `inline` to `css` to get a CSS file instead.

## [Drivly Open](https://driv.ly/open) - [Accelerating Innovation through Open Source](https://blog.driv.ly/accelerating-innovation-through-open-source)

Our [Drivly Open Philosophy](https://philosophy.do) has these key principles:

1. [Build in Public](https://driv.ly/open/build-in-public)
2. [Create Amazing Developer Experiences](https://driv.ly/open/amazing-developer-experiences)
3. [Everything Must Have an API](https://driv.ly/open/everything-must-have-an-api)
4. [Communicate through APIs not Meetings](https://driv.ly/open/communicate-through-apis-not-meetings)
5. [APIs Should Do One Thing, and Do It Well](https://driv.ly/open/apis-do-one-thing)


##  🚀 We're Hiring!

[Driv.ly](https://driv.ly) is [deconstructing the monolithic physical dealership](https://blog.driv.ly/deconstructing-the-monolithic-physical-dealership) into [simple APIs to buy and sell cars online](https://driv.ly), and we're funded by some of the [biggest names](https://twitter.com/TurnerNovak) in [automotive](https://fontinalis.com/team/#bill-ford) and [finance & insurance](https://www.detroit.vc)

Our entire infrastructure is built with [Cloudflare Workers](https://workers.do), [Durable Objects](https://durable.objects.do), [KV](https://kv.cf), [PubSub](https://pubsub.do), [R2](https://r2.do.cf), [Pages](https://pages.do), etc.  [If you love the Cloudflare Workers ecosystem as much as we do](https://driv.ly/loves/workers), we'd love to have you [join our team](https://careers.do/apply)!


