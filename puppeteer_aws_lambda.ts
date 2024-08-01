import chromium from '@sparticuz/chromium'
import puppeteer, { Browser, Page, Puppeteer, PaperFormat } from 'puppeteer-core'
import { PdfGenOptions } from './config'
class Pup {
  browser: Browser | null
  page: Page | null
  constructor() {
    this.browser = null
    this.page = null
  }
  async init() {
    this.browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
    this.page = await this.browser.newPage()
  }
  async close() {
    if (this.page !== null) this.page.close()
    if (this.browser !== null) this.browser.close()
  }
  async genPdf(url: string, paperData: any, isNewPage: boolean, pdfGenOptions: PdfGenOptions) {
    console.log('puppeteer gen pdf')
    if (this.page === null || this.browser === null) {
      return ''
    }
    try {
      if (isNewPage) {
        console.time('page goto')
        await this.page.goto(url, { waitUntil: 'networkidle0' })
        console.timeEnd('page goto')
      }
      console.time('pdf gen')
      await this.page.evaluate(pdfGenOptions.PageSizeEvaluateFunc)

      await this.page.evaluate((paperData: any) => {
        // @ts-ignore
        setContent(paperData)
      }, paperData)
      await this.page.waitForNetworkIdle({
        idleTime: 1000
      });
      const options = {
        scale: 1,
        displayHeaderFooter: true,
        headerTemplate: `<div style="font-size: 9px; margin-left: 1cm; height: 2cm;"> <div style="width: 1.5cm; height: 1.5cm;"></div> </div> 
            <div style="font-size: 9px; margin-left: 9cm; margin-right: 1cm; margin-top:0px; margin-bottom: auto;"> </div>`,
        footerTemplate: "<div style=\"font-size: 9px; margin: 0 auto;\"> <span class='pageNumber'></span> / <span class='totalPages'></span></div>",
        printBackground: true,
        landscape: pdfGenOptions.landscape,
        preferCSSPageSize: true,
        // format: printA3 ? 'A3' : 'A4',
        width: pdfGenOptions.width,
        height: pdfGenOptions.height,
        margin: {
          top: '3.00cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        },
      }
      const pdf = await this.page.pdf(options as any);
      //this.page.close();
      console.timeEnd('pdf gen')
      return pdf
    }
    catch (err: any) {
      console.error(err);
      console.error(`puppeteer gen pdf err:${err.message}`)
      return '';
    }
  }
}

async function PupWapper() {
  const pup = new Pup()
  await pup.init()
  return pup
}

export { Pup, PupWapper }