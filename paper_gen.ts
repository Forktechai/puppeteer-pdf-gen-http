import { PdfGen } from "./pdfgen";
import { Config } from "./config";
import path from 'path'
import { uploadFile2AwsS3, file2A3OrB4, createPresignedUrlWithClient } from "./utils";
import fs from 'fs/promises';

let pdf_template_url = "http://localhost:3002/paper-template";
let mistake_template_url = "http://localhost:3002/mistake-work-template"

export async function genPaper(gen: PdfGen, paperData: any, config: Config) {
  let url = pdf_template_url;
  if (paperData.workType == 'MistakeQuestion') {
    url = mistake_template_url
  }

  console.log('start to gen TestPaper')
  console.log('url:', url)
  let paperFile = '';
  const baseUrl = config.TMP_PATH;
  try {
    paperData.task = 'paper';
    paperFile = await gen.gen(url, paperData, config, true);
    console.log("paperFile:", paperFile);
    if (paperFile == '') {
      return '';
    }
    const paperFileKey = `preview/${path.basename(paperFile)}`;
    if (paperData.paperSize == "A3" || paperData.paperSize == "B4") {
      await file2A3OrB4(paperFile, paperFile, paperData.paperSize);
    }
    await uploadFile2AwsS3(paperFile, config.AWS_BUCKET_NAME, paperFileKey);
    const baseUrl = `https://${config.AWS_BUCKET_NAME}.s3.cn-northwest-1.amazonaws.com.cn`;
    const pdfUrl = `${baseUrl}/${paperFileKey}`;
    // const presignedUrl = await createPresignedUrlWithClient(config.AWS_BUCKET_NAME, paperFileKey);
    return pdfUrl;
  }
  catch (err: any) {
    console.error(err.message);
    console.error('genFile err');
    return "";
  }
  finally {
    fs.access(paperFile, fs.constants.F_OK)
      .then(async () => await fs.unlink(paperFile))
      .catch(() => console.error('err, one_paper_name is not exist'))
  }
}