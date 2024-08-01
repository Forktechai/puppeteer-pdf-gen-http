enum FilePurpose {
    None,
    BaseFile,
    AnswerFile,
    FinalFile
}
enum FilePaperSize
{
    A4,
    A3,
    B4,
    B5
}
class GroupFile {
    groupId: string
    url: string
    filePaperSize:FilePaperSize
    filePurpose:FilePurpose
    constructor(groupId: string, url: string, fileSize:FilePaperSize, filePurpose:FilePurpose) {
        this.groupId = groupId
        this.url = url
        this.filePaperSize = fileSize
        this.filePurpose = filePurpose
    }
}
class BoundingBox {
    x: number
    y: number
    w: number
    h: number
    constructor(x: number, y: number, w: number, h: number) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }
}
class PdfGenResult {
    paperFileId:string
    isFail:boolean
    files:GroupFile[]
    firstPage:string = ''
    areas:BoundingBox[]
    questionAreas:QuestionPosition[] = []
    constructor(paperFileId:string, isFail:boolean, files:GroupFile[],areas:BoundingBox[]) {
        this.paperFileId = paperFileId
        this.isFail = isFail
        this.files = files
        this.areas = areas
    }
}

class GroupFileInfo {
    fullName:string
    s3Key:string
    groupId:string
    groupName:string
    constructor(fullName:string, s3Key:string, groupId:string, groupName:string) {
        this.fullName = fullName
        this.s3Key = s3Key
        this.groupId = groupId
        this.groupName = groupName
    }
}

class QuestionPosition {
    questionNumber:number
    deputyQuestionNumber:number = 0
    left:number
    top:number
    width:number
    height:number
    page:number
    side:string
    constructor(questionNumber:number, x:number, y:number, w:number, h:number, page:number, side:string) {
        this.questionNumber = questionNumber
        this.left = x
        this.top = y
        this.width = w
        this.height = h
        this.page = page
        this.side = side
    }
}
class DataSheetResult {
    isFailed:boolean
    recordId:string
    url:string
    constructor(isFailed:boolean, recordId:string, url:string) {
        this.isFailed = isFailed
        this.recordId = recordId
        this.url = url
    }
}
export {GroupFile, BoundingBox, PdfGenResult, GroupFileInfo, QuestionPosition, FilePurpose, DataSheetResult, FilePaperSize}