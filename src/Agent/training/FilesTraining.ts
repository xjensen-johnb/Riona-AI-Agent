import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import textract from 'textract';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

export type SupportedFileType = 'pdf' | 'doc' | 'docx' | 'csv' | 'txt';

export async function parseFile(fileBuffer: Buffer, fileType: SupportedFileType): Promise<string> {
    let content = '';

    if (fileType === 'pdf') {
        const data = await pdfParse(fileBuffer);
        content = data.text;
    } else if (fileType === 'docx') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        content = result.value;
    } else if (fileType === 'doc') {
        content = await new Promise<string>((resolve, reject) => {
            textract.fromBufferWithMime('application/msword', fileBuffer, (error, text) => {
                if (error) reject(error);
                else resolve(text);
            });
        });
    } else if (fileType === 'csv') {
        content = await new Promise<string>((resolve, reject) => {
            const results: string[] = [];
            Readable.from(fileBuffer)
                .pipe(csvParser())
                .on('data', (data) => results.push(JSON.stringify(data)))
                .on('end', () => resolve(results.join('\n')))
                .on('error', (err) => reject(err));
        });
    } else if (fileType === 'txt') {
        content = fileBuffer.toString('utf8');
    } else {
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    return content;
}






async function testParse() {
    try {
        // Define the file path and type
        const filePath = path.join(__dirname, 'test.txt'); 
        const fileType: SupportedFileType = 'txt'; // Change to match your test file's format

        // Read the file into a buffer
        const fileBuffer = fs.readFileSync(filePath);

        // Call the parseFile function
        const content = await parseFile(fileBuffer, fileType);
        console.log('Parsed Content:', content);
    } catch (error) {
        console.error('Error parsing file:', error);
    }
}

// Execute the test function
testParse();