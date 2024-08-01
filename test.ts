import app from './app'
import {readFile2String} from './utils';
import { PdfGen } from './pdfgen';
import {genPaper} from './paper_gen';
import { Config } from './config';
import {PdfGenResult} from './dto';
import { file2A3OrB4 } from './utils';
import fs  from "fs/promises";
let config:Config = new Config();
config.init("local");

app.listen(3000,() =>{
  console.log('express start')
})


async function test() {
    // console.log('test')
    const payload: any = JSON.parse(await readFile2String('test_input.json'))
    console.log(payload.type)
    let paperData: any = JSON.parse(payload.payload)
    let dataSheet: any = JSON.parse(await readFile2String('data_sheet_input.json'))
    try {
      const gen = new PdfGen()
      await gen.init()
      console.log("PdfGen init ok...")
      // if(payload.type == 'TestPaper') {
      //   await genPaper(gen, paperData)
      // }
      // if(payload.type == 'DataSheet') {
      //   await genDataSheet(gen, dadaSheet)
      // }
      await genPaper(gen, paperData, config)
      //console.log(JSON.stringify(result))
    }
    catch (err: any) {
      console.log(err.message)
      const res = new PdfGenResult(paperData.paperFileId, true, [], [])
      console.log(JSON.stringify(res))
    }
  }
  //file2A3OrB4('./base_copy.pdf', './base_copy.pdf', 'A3');
  