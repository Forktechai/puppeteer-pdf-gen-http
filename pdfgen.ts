import { Pup, PupWapper } from './puppeteer_aws_lambda'
import fs from 'fs/promises'
import { paperSizeStr2Enum } from './utils.js'
import { Config, PdfGenOptions } from './config.js';
import { v4 as uuidv4 } from 'uuid';


class PdfGen {
  pup: null | Pup
  constructor() {
    this.pup = null
  }

  async init() {
    this.pup = await PupWapper()
  }

  async gen(url: string, paper_data: any, config: Config, isNewPage: boolean) {
    console.log('gen')
    if (!this.pup) {
      return ''
    }
    const baseUrl = config.TMP_PATH;
    const paperSize = paperSizeStr2Enum(paper_data.paperSize)
    let pdfGenOptions: PdfGenOptions = new PdfGenOptions(paperSize);
    pdfGenOptions.init();
    try {
      const pdf = await this.pup.genPdf(url, paper_data, isNewPage, pdfGenOptions)
      if (pdf === '') {
        return ''
      }
      const fileName = `${baseUrl}/${uuidv4()}.pdf`;
      await fs.writeFile(fileName, pdf);
      return fileName
    }
    catch (err: any) {
      console.error(`err: ${err}`)
      console.error(`err: {pdf gen err!!! ${err.message}}`)
      return ''
    }
  }

  async initPage() {
    await this.pup?.initPage()
  }

  async closePage() {
    await this.pup?.closePage();
  }
  async close() {
    await this.pup?.close();
  }
}

export { PdfGen }
