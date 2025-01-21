import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const DATA_FILE = path.join(process.cwd(), 'data', 'student-data.json');

export async function POST(req: NextRequest) {
    try {
        const { studentPhone, parentPhone, course, class: selectedClass } = await req.json();

        const fileData = await fs.readFile(DATA_FILE, 'utf8');
        const processedData: {
            "Student ID": string;
            "Student Phone": string;
            "Parent Phone": string;
            Course: string;
            "Class Name": string;
        }[] = JSON.parse(fileData);

        const matchingStudent = processedData.find((student) => {
            const phoneMatch = student['Student Phone'] === studentPhone && student['Parent Phone'] === parentPhone;
            const courseMatch = course ? student.Course === course : true;
            const classMatch = selectedClass ? student['Class Name'] === selectedClass : true;
            return phoneMatch && courseMatch && classMatch;
        });

        if (matchingStudent) {
            return NextResponse.json({
                studentId: matchingStudent['Student ID'],
                enrolledClass: matchingStudent['Class Name'], // Return full class name
            }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }
    } catch (error: any) {
        console.error('Error searching for student:', error);
        return NextResponse.json({ error: 'Failed to search for student', details: error.message }, { status: 500 });
    }
}
