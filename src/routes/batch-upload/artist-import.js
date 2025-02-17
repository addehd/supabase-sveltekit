const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth'); // for docx parsing
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// extract text from docx file
async function extractTextFromDocx(docxPath) {
    try {
        const result = await mammoth.extractRawText({ path: docxPath });
        return result.value.trim();
    } catch (error) {
        return "Could not read description";
    }
}

// get artist information from directories
async function getArtistInfo() {
    const artists = [];
    
    // get all directories that start with a number
    const dirs = fs.readdirSync('.')
        .filter(d => fs.statSync(d).isDirectory() && /^\d/.test(d))
        .sort();
    
    for (const dirName of dirs) {
        // extract id from directory name
        const idMatch = dirName.match(/^(\d+)/);
        if (!idMatch) continue;
        
        const idNum = parseInt(idMatch[1]);
        
        // get name part after the ID
        const name = dirName.replace(/^\d+/, '');
        
        // find docx file
        const docxFiles = fs.readdirSync(dirName)
            .filter(f => f.endsWith('.docx'));
        if (!docxFiles.length) continue;
        
        const docxPath = path.join(dirName, docxFiles[0]);
        
        // extract artist name from docx filename
        const artistName = path.parse(docxFiles[0]).name;
        
        // get description from docx content
        const description = await extractTextFromDocx(docxPath);
        
        artists.push({
            id: idNum,
            name: name,
            artist_name: artistName,
            description: description
        });
    }
    
    return artists;
}

async function main() {
    // setup csv writer
    const csvWriter = createCsvWriter({
        path: 'artists.csv',
        header: [
            { id: 'id', title: 'id' },
            { id: 'name', title: 'name' },
            { id: 'artist_name', title: 'artist_name' },
            { id: 'description', title: 'description' }
        ]
    });
    
    const artists = await getArtistInfo();
    
    // write to csv
    await csvWriter.writeRecords(artists);
    
    console.log(`Created artists.csv with ${artists.length} entries`);
}

// run main function
main().catch(console.error); 