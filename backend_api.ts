import axios from "axios";
class Backend {
    url:string;
    constructor(url:string) {
        this.url = url;
    }
    // 需要包括学生信息：学生姓名，学生班级， 学生年级， 学号。
    // 需要包括试卷信息：题目信息，标题，副标题，题目信息
    async getIndividualWorkPara(workId:string, studentId:string) {
        const url = `${this.url}/v1/individualWorks/${workId}/students/${studentId}/individual-file-para`;
        const para = await axios.get(url);
        return para.data;
    }
}
export {Backend}