import chromium from '@sparticuz/chromium'
import puppeteer, { Browser, Page } from 'puppeteer-core'
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
      // 监听浏览器控制台的输出
      this.page.on('console', msg => {
        // 过滤掉 LaTeX 相关的日志
        if (!msg.text().includes('LaTeX')) {
          console.log('Browser console:', msg.text()); // 将浏览器控制台的日志打印到 Node.js 控制台          
        }
      });
      if (isNewPage) {
        console.time('page goto')
        await this.page.goto(url, { waitUntil: 'networkidle0' })
        console.timeEnd('page goto')
      }
      console.time('pdf gen')
      // 手写框是否启用, 默认启用
      console.log(`handWriting Enable:${paperData.handWritingEnable}`)
      if(paperData.handWritingEnable != undefined) {
        await this.page.evaluate((handWritingEnable: any) => {
          // @ts-ignore
          setWritingEnable(handWritingEnable)
        }, paperData.handWritingEnable)
      }
      await this.page.evaluate(pdfGenOptions.PageSizeEvaluateFunc)

      await this.page.evaluate((paperData: any) => {
        // @ts-ignore
        setContent(paperData)
      }, paperData)

      // 动态添加懒加载属性
      await this.page.evaluate(() => {
        const images = document.querySelectorAll('img');
        console.log(`images length: ${images.length}`);
        images.forEach(img => {
          img.dataset.src = img.src; // 将真实路径保存到 data-src
          img.src = ''; // 清空 src，初始不加载
        });
      });
      
      // 动态加载图片并实现并发控制
      await this.page.evaluate(async (maxConcurrent: number, retryCount: number, timeout: number) => {
        const images = Array.from(document.querySelectorAll('img'));
        const loadImage = (img: HTMLImageElement) => {
          return new Promise<void>((resolve, reject) => {
            if (img.complete && img.naturalWidth !== 0) {
              resolve();
              return;
            }

            const timer = setTimeout(() => {
              reject(new Error(`Image load timeout: ${img.dataset.src}`));
            }, timeout);

            img.onload = () => {
              clearTimeout(timer);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(timer);
              reject(new Error(`Failed to load image: ${img.dataset.src}`));
            };

            img.src = img.dataset.src || img.src;
          });
        };

        // 并发控制加载图片
        const loadImagesWithConcurrency = async () => {
          for (let i = 0; i < images.length; i += maxConcurrent) {
            const batch = images.slice(i, i + maxConcurrent);
            await Promise.all(
              batch.map(img =>
                loadImage(img).catch(async error => {
                  console.error(error.message);
                  for (let retry = 1; retry <= retryCount; retry++) {
                    try {
                      await loadImage(img);
                      return;
                    } catch (retryError:any) {
                      console.error(`Retry ${retry} failed: ${retryError.message}`);
                    }
                  }
                  throw new Error(`Max retries reached for image: ${img.dataset.src}`);
                })
              )
            );
          }
        };

        await loadImagesWithConcurrency();
      }, 5, 3, 5000); // 并发数量为 5，重试次数为 3，超时时间为 5000ms

      // 检查并重试加载失败的图片
      await this.page.evaluate(async () => {
        await Promise.all(Array.from(document.images).map(async img => {
          if (!img.complete) {
            console.log(`Image failed to load, retrying:${img.src}`);
            img.src = img.src;
          }
        }));
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
