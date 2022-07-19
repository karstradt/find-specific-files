
export const convertWildCardToRegex = (wildcardStr) => {
        let updateStr = wildcardStr;
        const asterixRegEx = getRegExForSymbol('*');
        const questionRegEx = getRegExForSymbol('?');

        updateStr = updateStr.replace(/\*/g, asterixRegEx);
        updateStr = updateStr.replace(/\?/g, questionRegEx);

        return new RegExp(updateStr);
    }

const getRegExForSymbol = (symbol) => {
    let requiredRegEx = '';

    switch (symbol) {
        case '*':
        case '**': {
            requiredRegEx = '(([a-zA-Z0-9])*)';
            break;
        }
        case '?': {
            requiredRegEx = '([a-zA-Z0-9]{1})';
            break;
        }
    }

    return requiredRegEx;
}
