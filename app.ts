
import { Config, studentCodeBoxBase64 } from './config.js';
import { PdfGen } from './pdfgen.js';
import express from 'express'
import { Backend } from './backend_api.js';
import { genPaper } from './paper_gen.js';
import { Pup } from './puppeteer_aws_lambda.js';
const cors = require('cors')
const bodyParser = require('body-parser')


const config = new Config();
const env = process.env.ENV ?? "prod";
let gaoshouUrl = config.GAOSHOU_URL;


let initialized = false
let gen: PdfGen | undefined = undefined

const localApp = express()
localApp.use(express.static('public'))
localApp.use(express.static('public/paper-template'))
localApp.use(express.static('public/datasheet-template'))
localApp.use(express.static('public/report-template-site'))
localApp.use(express.static('public/consumerwork-predata-template'))
localApp.use(express.static('public/mistake-work-template'))
localApp.listen(3002, () => {
  console.log("server started")
})

const app = express()

const router = express.Router()
router.use(cors())
router.use(bodyParser.json({
  limit: '50mb'
}))
router.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}))

router.get('/test', (req: any, res: any) => {
  res.send('hello, world')
})

router.post('/test', async (req: any, res: any) => {
  console.log(req.body.type);
  //await a4File2A3File('./base.pdf', './a3file.pdf')
  res.send('OK')
})

router.post('/pdf-gen', async (req: any, res: any) => {
  try {
    if (!initialized) {
      gen = new PdfGen()
      await gen.init()
      console.log("pdf_gen init ok...")
      initialized = true
    }
    await gen?.initPage();
    const paperData = req.body;
    paperData.paperSize = "A3"
    const preSignUrl = await genPaper(gen as PdfGen, paperData, config);
    res.send(preSignUrl)
    await gen?.closePage();
  }
  catch (err: any) {
    return "";
  }
})

router.post('/pdf-gen/paperSize/:paperSize', async (req: any, res: any) => {
  let paperSize: string = req.params.paperSize;
  console.log("paperSize:", paperSize);
  try {
    if (!initialized) {
      gen = new PdfGen()
      await gen.init()
      console.log("pdf_gen init ok...")
      initialized = true
    }
    await gen?.initPage();
    const paperData = req.body;
    paperData.paperSize = paperSize;
    paperData.matchStudentMethodType = paperData.matchStudentMethodType ?? "Qrcode";
    const matchStudentMethodType = paperData.matchStudentMethodType ?? "Qrcode";
    if (matchStudentMethodType == "FilledStudentCode") {
      paperData.studentCodeBoxBase64 = studentCodeBoxBase64
    }
    console.log("title:", paperData.title)
    console.log("subTitle:", paperData.subTitle)

    const preSignUrl = await genPaper(gen as PdfGen, paperData, config);
    res.send(preSignUrl)
    await gen?.closePage();
  }
  catch (err: any) {
    return "";
  }
})

// todo: 个人作业的预览 判断模板类型
router.post('/individualWork/:individualWorkId/student/:studentId/preview/paperSize/:paperSize', async (req: any, res: any) => {
  const individualWorkId = req.params.individualWorkId;
  const studentId = req.params.studentId;
  let paperSize: string = req.params.paperSize;
  console.log("individualWorkId:", individualWorkId)
  console.log("studentId", studentId)
  console.log("paperSize", paperSize)
  try {
    if (!initialized) {
      gen = new PdfGen()
      await gen.init()
      console.log("pdf_gen init ok...")
      initialized = true
    }
    await gen?.initPage();
    let backend: Backend = new Backend(gaoshouUrl);
    const studentPara = await backend.getIndividualWorkPara(individualWorkId, studentId);
    let paperData: any;
    paperData.task = "paper";
    paperData.title = req.body.title;
    paperData.subTitle = req.body.title;
    paperData.pointTable = req.body.pointTable;
    paperData.answerSheetBase64 = studentPara.answerSheetBase64;
    paperData.questions = studentPara.questions;
    paperData.paperSize = paperSize;
    const preSignUrl = await genPaper(gen as PdfGen, paperData, config);
    res.send(preSignUrl)
    await gen?.closePage();
  }
  catch (err: any) {
    console.error("individual work preview err: ", err);
    return "";
  }
})

app.use('/', router)
export default app