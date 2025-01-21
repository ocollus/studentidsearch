// /api/search.js
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'student-data.json'); // Path to your data file

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
    try {
      const { studentPhone, parentPhone, course, class: selectedClass } = await req.json();

      // Read and parse the student data from the JSON file
      const fileData = await fs.readFile(DATA_FILE, 'utf8');
      const processedData: any[] = JSON.parse(fileData);

      // Search logic (updated to filter by course and class)
      const matchingStudent = processedData.find((student: any) => {
        const matchPhone = student['Student Phone'] === studentPhone && student['Parent Phone'] === parentPhone;
        const matchCourse = course ? student['Course'] === course : true;
        const matchClass = selectedClass ? student['Enrolled Class'] === selectedClass : true;
        return matchPhone && matchCourse && matchClass;
      });

      if (matchingStudent) {
        return NextResponse.json({
          id: matchingStudent['Student ID'],
          enrolledClasses: matchingStudent['Enrolled Class'],
        }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }
    } catch (error: any) {
      console.error('Error searching for student:', error);
      return NextResponse.json({ error: 'Failed to search for student', details: error.message }, { status: 500 });
    }
}
