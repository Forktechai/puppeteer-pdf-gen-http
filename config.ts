import { FilePaperSize } from "./dto"

class Config {
   GAOSHOU_URL: string
   AWS_BUCKET_NAME: string
   AWS_REGION: string
   AWS_ACCESSKEYID: string
   AWS_SECRETACCESSKEY: string  
   QR_MARGINX = 30
   QR_MARGINY = 60
   QR_WIDTH = 50
   QR_HEIGHT = 50
   TMP_PATH: string
   constructor() {
      this.GAOSHOU_URL = 'https://gaoshouai.com'
      this.AWS_BUCKET_NAME =  process.env.AWS_BUCKET_NAME ?? "gaoshoutest"
      this.AWS_REGION =  'cn-northwest-1'
      this.AWS_ACCESSKEYID =  process.env.AWS_ACCESSKEYID
      this.AWS_SECRETACCESSKEY =  process.env.AWS_SECRETACCESSKEY
      this.TMP_PATH = "/tmp"
   }
   init(env:string) {
      console.log(`config init ${env}`)
      if (env === 'prod') {
         this.GAOSHOU_URL = 'https://gaoshouai.com'
         this.AWS_BUCKET_NAME = 'gaoshoutemp'
      } else if(env == "dev") {
         this.GAOSHOU_URL = 'https://dev.gaoshouai.com'
         this.AWS_BUCKET_NAME = 'gaoshoutempdev'
      } else {
         this.GAOSHOU_URL = "http://localhost:7107"
         this.TMP_PATH = "./tmp"
         this.AWS_BUCKET_NAME = 'gaoshoutempdev'
      } 
    }
}

class PdfGenOptions {
   PaperSize:FilePaperSize
   PageSizeEvaluateFunc:string = 'setA4()'
   landscape:boolean = false
   width:string = '210mm'
   height:string = '297mm'
   constructor(paperSize:FilePaperSize) {
      this.PaperSize = paperSize
   }
   init() {
      if(this.PaperSize == FilePaperSize.A3) { 
         // 按照A4的尺寸生成
         this.landscape = true
         this.width = '210mm'
         this.height = '297mm'
         this.PageSizeEvaluateFunc = 'setA4()'
      }
      if(this.PaperSize == FilePaperSize.A4) {
         this.width = '210mm'
         this.height = '297mm'
         this.PageSizeEvaluateFunc = 'setA4()'
      }
      if(this.PaperSize == FilePaperSize.B4) {  
         // 按照B5的尺寸生成
         this.landscape = true
         this.width = '176mm'
         this.height = '250mm'
         this.PageSizeEvaluateFunc = 'setB5()'
      }
      if(this.PaperSize == FilePaperSize.B5) {
         this.width = '176mm'
         this.height = '250mm'
         this.PageSizeEvaluateFunc = 'setB5()'
      }
   }
}
export {Config, PdfGenOptions}
