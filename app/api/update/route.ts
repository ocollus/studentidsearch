import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'student-data.json');
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const API_KEY = process.env.API_KEY;

export async function POST(req: NextRequest) {
  try {
    // Ensure the request is authenticated (e.g., check for a valid API key)
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch data from the Google Apps Script
    const response = await fetch(`${APPS_SCRIPT_URL}?action=processData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mapping: {
          "Student ID": "Student ID",
          "Student Phone": "Student Phone",
          "Parent Phone": "Parent Phone",
          "Course": "Course",
          "Enrolled Class": "Enrolled Class"
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from Apps Script');
    }

    const processedData = await response.json();

    // Ensure the data directory exists
    const dataDirectory = path.dirname(DATA_FILE);
    try {
      await fs.access(dataDirectory);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(dataDirectory, { recursive: true });
      } else {
        throw error;
      }
    }

    // Write the processed data to a JSON file
    await fs.writeFile(DATA_FILE, JSON.stringify(processedData));

    return NextResponse.json({ message: 'Data updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating data:', error);
    return NextResponse.json({ error: 'Failed to update data', details: error.message }, { status: 500 });
  }
}