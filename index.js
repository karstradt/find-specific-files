import fs from 'fs';
import path from 'path';
import {convertWildCardToRegex} from './wildcard/regExGenerator.js';

const argsArr = process.argv;
let filePattern;
let targetDirPathArr;
let masterFilePaths = [];

if(argsArr && argsArr[2]) {
    findFiles(argsArr[1],argsArr[2]);
}

function startTraversal(callerPath, givenDirPath) {
    let pathIdx = 0;
    let signals;
    let constructedPath = callerPath || __dirname;

    while (pathIdx < givenDirPath.length) {
        const pathItem = givenDirPath[pathIdx];
        if (pathItem) {
            signals = determineTypeOfPathItemAndTraverse(constructedPath, pathItem);

            if (signals.break) {
                break;
            }
            if (signals.newPath) {
                constructedPath = signals.newPath
            }
        }
        pathIdx++;
    }
}

function determineTypeOfPathItemAndTraverse(constructedPath, pathItem) {

    if (isTreeTraversal(pathItem)) {
        traverseDeepTree(constructedPath);
        return {
            break: true
        }
    } else if (isPattern(pathItem)) {
        triggerForAllUnderPrevDir(constructedPath, pathItem);

        return {
            break: true
        }
    } else {
        //this is directory
        const newPath = traverseLinear(constructedPath, pathItem);
        return {
            newPath: newPath
        };
    }
}

function isTreeTraversal(pathItem) {
    return (pathItem === "**") ? true : false
}

// pattern could be file or directory
// has to be differentiated later with isDirectory() or isFile()
function isPattern(pathItem) {
    return (pathItem.indexOf('*') > -1 || pathItem.indexOf('?') > -1) ? true : false;
}

function isFilePattern(pathItem) {
    return (new RegExp('/\.[a-z]{2,3}/').test(pathItem)) ? true : false;
}

function traverseDeepTree(dirPath) {
    if (fs.lstatSync(dirPath).isDirectory()) {
        const content = fs.readdirSync(dirPath)
        if (content.length > 0) {
            for (let contentIdx = 0; contentIdx < content.length; contentIdx++) {
                //this works
                traverseDeepTree(path.resolve(dirPath, content[contentIdx]));
            }
        }
    } else if (fs.lstatSync(dirPath).isFile()) {
        if (filePattern) {
            if (filePattern.test(dirPath)) {
                masterFilePaths.push(dirPath);
            }
        }
    }
}

function triggerForAllUnderPrevDir(constructedPath, pathItem) {

    const folderContent = fs.readdirSync(constructedPath);
    const pathItemRegex = convertWildCardToRegex(pathItem);

    for(let i=0; i<folderContent.length; i++) {
        let curItem = folderContent[i];
        let curPath = path.resolve(constructedPath, curItem);

        if(pathItemRegex.test(curPath)) {
            //if it is a file,
            if(fs.lstatSync(curPath).isFile()){
                //just append it with the constructed path and push them in the master file paths
                const filePath = curPath;
                masterFilePaths.push(filePath);
            } else if (fs.lstatSync(curPath).isDirectory()) {
                //if it not a file
                //concat the currentItem to the path
                determineTypeOfPathItemAndTraverse(path.resolve(curPath, '..'), curItem);
            }
        }
    }

    return {
        break: true
    }
}

function traverseLinear(constructedPath, pathItem) {
    const newPath = path.resolve(constructedPath, pathItem);

    if (targetDirPathArr.lastIndexOf(pathItem) === targetDirPathArr.length - 1) {
        masterFilePaths.push(newPath);
    }

    return newPath;
}

export const findFiles = (rootPath, matchPattern) => {
    //console.log(rootPath);

    let callerPath = (rootPath) || process.mainModule.filename;

    if (!fs.lstatSync(callerPath).isDirectory()){
        callerPath = path.resolve(callerPath, '../');
    }

    //split the path with '/'
    targetDirPathArr = matchPattern.split('/');
    const lastItem = targetDirPathArr[targetDirPathArr.length - 1];

    console.log("targetDirPathArr: ", targetDirPathArr);
    console.log("lastItem: ", lastItem);

    if ((lastItem.indexOf('*') > -1 || lastItem.indexOf('?') > -1)) {
        filePattern = convertWildCardToRegex(lastItem);
    }

    startTraversal(callerPath, targetDirPathArr);

    return masterFilePaths;
}