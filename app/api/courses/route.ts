import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const DATA_FILE = path.join(process.cwd(), 'data', 'student-data.json');

export async function GET() {
  try {
    const fileData = await fs.readFile(DATA_FILE, 'utf8');
    const processedData: any[] = JSON.parse(fileData);

    const courses = [...new Set(processedData.map(item => item.Course))];
    const classesByCourse = processedData.reduce((acc, item) => {
        if (!acc[item.Course]) {
            acc[item.Course] = [];
        }
        acc[item.Course].push(item['Enrolled Class']);
        return acc;
    }, {});

    return NextResponse.json({ courses, classesByCourse }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching courses and classes:', error);
    return NextResponse.json({ error: 'Failed to fetch courses and classes', details: error.message }, { status: 500 });
  }
}
