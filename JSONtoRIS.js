const cloneDeep = require('lodash.clonedeep')
const { createWriteStream, readFileSync } = require('fs')

const all_fields = ['TY', 'TI', 'AB', 'A1', 'A2', 'A3', 'A4', 'AD', 'AN', 'AU', 'AV', 'BT', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'CA', 'CN', 'CP', 'CT', 'CY', 'DA', 'DB', 'DO', 'DP', 'ED', 'EP', 'ET', 'ID', 'IS', 'J1', 'J2', 'JA', 'JF', 'JO', 'KW', 'L1', 'L2', 'L3', 'L4', 'LA', 'LB', 'LK', 'M1', 'M2', 'M3', 'N1', 'N2', 'NV', 'OP', 'PB', 'PP', 'PY', 'RI', 'RN', 'RP', 'SE', 'SN', 'SP', 'ST', 'T1', 'T2', 'T3', 'TA', 'TT', 'U1', 'U2', 'U3', 'U4', 'U5', 'UR', 'VL', 'VO', 'Y1', 'Y2', 'ER']


/**
 * 
 * @param {*} inputJson A javascript object which is a list containing objects of each entry
 *      E.g.
 *      [{TY:
 * @param {*} outName The filename that will be written. SHOULD include the .ris filetype
 * @param {*} fieldToRISTagMapping If some (or all) of the keys of your objects are not RIS tags, you can provide a mapping which will convert the
 * key names to the names of the ris tags
 *      e.g {type: 'TY'}
 */
module.exports = function JSONtoRIS(inputJson, outName, fieldToRISTagMapping=null) {
    let json
    if (typeof inputJson === 'object') {
        json = cloneDeep(inputJson)
    }
    else if (typeof inputJson === 'string') {
        // try and parse it as object, if it doesn't work then the string is a file path
        try {
            json = JSON.parse(inputJson)
        }
        catch {
            json = JSON.parse(readFileSync(inputJson))
        }
    }

    // convert to RIS tags
    if (fieldToRISTagMapping) {
        for (const entry of json) {
            for (const [field, value] of Object.entries(entry)) {
                if (field in fieldToRISTagMapping) {
                    entry[fieldToRISTagMapping[field]] = value
                    delete entry[field]
                }
            }
        }
    }

    const output = createWriteStream(`./${outName}`)
    const seenBadCols = new Set()

    // actually write the data to file in RIS format
    for (const entry of json) {
        if (!('TY' in entry)) {
            throw new Error("Your json must have a TY column. See valid TY values at https://en.wikipedia.org/wiki/RIS_(file_format)")
        }
        else {
            writeRISLine('TY', entry.TY) // handle TY separately as it needs to be the first tag in a RIS entry
        }
        for (const [header, value] of Object.entries(entry)) {
            if (header === 'TY') {
                continue // we already handled TY above
            }

            if ((header === 'AU' || header === 'KW') && Array.isArray(value)) { // Authors and keywords can have multiple values.
                for (const item of value) {
                    // Pair each value for author/keyword with its heading, put each on a new line.
                    writeRISLine(header, item)
                }
            }
            else if (all_fields.includes(header)) {
                writeRISLine(header, value) // standard tag that isn't
            }
            else if (!seenBadCols.has(header)) {
                console.log(`WARNING: Column ${header} contained within object that is not a valid RIS tag. See valid RIS tags at https://en.wikipedia.org/wiki/RIS_(file_format)`)
                seenBadCols.add(header)
            }
        }

        output.write('ER  - \n\n') // Puts an empty "ER" (End of Reference) tag at the end of each record, along with an extra new line for readability
    }

    function writeRISLine(tag, value) {
        const line = tag + '  - ' + value + '\n'
        output.write(line)
    }

    output.end()
    console.log(`Successfully written RIS to ${outName}`)
}