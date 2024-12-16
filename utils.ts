
import AdmZip from 'adm-zip'
import { PDFDocument, PageSizes,} from '@pdfme/pdf-lib';
import path from 'path'
import { FilePaperSize } from './dto';
const fs = require('fs')
import fsPromise from 'fs/promises'
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl} from "@aws-sdk/s3-request-presigner";
const accessKeyId = process.env.AWS_ACCESSKEYID ?? ""
const secretAccessKey = process.env.AWS_SECRETACCESSKEY ?? ""
const s3Client = new S3Client({
  region: 'cn-northwest-1',
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
  }
});

export function getGradeStr(gradeType: string) {
  switch (gradeType) {
    case 'GradeOne':
      return '一年级'
    case 'GradeTwo':
      return '二年级'
    case 'GradeThree':
      return '三年级'
    case 'GradeFour':
      return '四年级'
    case 'GradeFive':
      return '五年级'
    case 'GradeSix':
      return '六年级'
    case 'GradeSeven':
      return '七年级'
    case 'GradeEight':
      return '八年级'
    case 'GradeNine':
      return '九年级'
    case 'GradeTen':
      return '高一'
    case 'GradeEleven':
      return '高二'
    case 'GradeTwelve':
      return '高三'
  }
}


export function zipFolder(sourcepath: string) {
  var zip = new AdmZip();
  zip.addLocalFolder(sourcepath)
  zip.writeZip(`${sourcepath}.zip`)
}

export function delDir(p: string) {
  // 读取文件夹中所有文件及文件夹
  const list = fs.readdirSync(p)
  list.forEach((v: any, i: any) => {
    // 拼接路径
    const url = `${p}/${v}`
    // 读取文件信息
    const stats = fs.statSync(url)
    // 判断是文件还是文件夹
    if (stats.isFile()) {
      // 当前为文件，则删除文件
      fs.unlinkSync(url)
    } else {
      // 当前为文件夹，则递归调用自身
      arguments.callee(url)
    }
  })
  // 删除空文件夹
  fs.rmdirSync(p)
}

export async function uploadFile2AwsS3(fileName: string, bucket_name: string, key: string = '') {
  if (fileName == '') {
    return;
  }
  if (key === '') {
    key = path.basename(fileName)
  }
  try {
    const fileDate = await fsPromise.readFile(fileName);
    const command = new PutObjectCommand({
      Bucket: bucket_name,
      Key: key,
      Body: fileDate
    })
    const response = await s3Client.send(command);
   // console.log(response);
    console.log(`upload file ${fileName} ok`)
    return true;
  } catch (err) {
    console.error(`upload file ${fileName} err: ${err}`);
    return false
  }
}

export async function createPresignedUrlWithClient(bucket:string, key:string) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function a4File2A3File(a4file:string, a3FilePath:string) {
  let a3Pdf = await PDFDocument.create();
  const a4FileData = fs.readFileSync(a4file);
  const a4Pdf = await PDFDocument.load(a4FileData);
  const pages = await a3Pdf.copyPages(a4Pdf, a4Pdf.getPageIndices());
  for(const pg of pages) {
    //此处是为了避免出现Can't embed page with missing Contents的错误,参考https://github.com/Hopding/pdf-lib/issues/796
    pg.drawText('')
  }
  const embeddedPages = await a3Pdf.embedPages(pages);
  for(let i = 0; i < embeddedPages.length; i+=2) {
    const added = a3Pdf.addPage([PageSizes.A3[1], PageSizes.A3[0]]);
    added.drawPage(embeddedPages[i], {
      x:0,
      y:0
    })
    if(i+1 === embeddedPages.length) {
      break
    }
    added.drawPage(embeddedPages[i+1], {
      x:PageSizes.A3[1]/2,
      y:0
    })
  }
  const a3Data = await a3Pdf.save();
  fs.writeFileSync(a3FilePath, a3Data);
}

/**
 * A4转A3 或者 B5转B4
 * @param a4file 
 * @param a3FilePath 
 */
export async function file2A3OrB4(sourceFile:string, targetFile:string, targetSize:string) {
  const toSize = targetSize == "A3" ? PageSizes.A3 : PageSizes.B4;
  let a3Pdf = await PDFDocument.create();
  const a4FileData = fs.readFileSync(sourceFile);
  const a4Pdf = await PDFDocument.load(a4FileData);
  const pages = await a3Pdf.copyPages(a4Pdf, a4Pdf.getPageIndices());
  for(const pg of pages) {
    //此处是为了避免出现Can't embed page with missing Contents的错误,参考https://github.com/Hopding/pdf-lib/issues/796
    pg.drawText('')
  }
  const embeddedPages = await a3Pdf.embedPages(pages);
  for(let i = 0; i < embeddedPages.length; i+=2) {
    const added = a3Pdf.addPage([toSize[1], toSize[0]]);
    added.drawPage(embeddedPages[i], {
      x:0,
      y:0
    })
    if(i+1 === embeddedPages.length) {
      break
    }
    added.drawPage(embeddedPages[i+1], {
      x:toSize[1]/2,
      y:0
    })
  }
  const a3Data = await a3Pdf.save();
  fs.writeFileSync(targetFile, a3Data);
}

export function paperSizeStr2Enum(paperSize: string) {
  switch (paperSize) {
    case 'A4':
      return FilePaperSize.A4;
    case 'A3':
      return FilePaperSize.A3;
    case 'B4':
      return FilePaperSize.B4;
    case 'B5':
      return FilePaperSize.B5;
    default:
      return FilePaperSize.A4;
  }
}
// 读取写入文件，用于测试
export async function readFile2String(path: string) {
  return await fsPromise.readFile(path, {
    encoding: 'utf-8'
  })
}
export async function writeStringFile(data: string, path: string) {
  return await fsPromise.writeFile(path, data)
}
