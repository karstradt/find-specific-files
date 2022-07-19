import fs from 'fs';
import path from 'path';
import {findFiles} from '../main.js';

const dir = 'sample';
const dirAllRegEx = '**/*';
const dirImmRegEx = '??/*'

const currDirPath = path.resolve(path.dirname("./"));
const startPath = path.resolve(currDirPath + "/test");

const result = findFiles(startPath, "/**/*Spec.js");
//const result = findFiles(startPath, "/**/*first*.js");

console.log(result);
