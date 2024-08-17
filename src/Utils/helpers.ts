import BaseEmbeds from "../embeds/baseEmbeds";
import { LitminerDebug } from "./litminerDebug";

export function fillString(str: string, length: number, char: string = `ㅤ`) {
    let newstr = str;
    while (newstr.length < str.length + length) {
        newstr = newstr + char;
    }
    LitminerDebug.Debug(`\`${newstr.length} = ${str.length + length} ${newstr}\``)
    return newstr;
};

export function createFilledString(oldString: string){
    let filledString = oldString.substring(0,BaseEmbeds.titleLength);
    if (filledString.length < BaseEmbeds.titleLength) {
        filledString = fillString(filledString, BaseEmbeds.titleLength - filledString.length + 3);
    } else{
        filledString = fillString(filledString, 3, `.`);
    }
    return filledString.substring(0,BaseEmbeds.titleLength);
}