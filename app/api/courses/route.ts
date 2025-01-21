import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const DATA_FILE = path.join(process.cwd(), 'data', 'student-data.json');

export async function GET() {
    try {
        const data = await fs.readFile(DATA_FILE);
        const jsonData: {
            "Student ID": string;
            "Student Phone": string;
            "Parent Phone": string;
            Course: string;
            "Class Name": string;
        }[] = JSON.parse(data.toString());

        const courses = [...new Set(jsonData.map(item => item.Course))];
        const classes = [...new Set(jsonData.map(item => item['Class Name']))];

        return NextResponse.json({ courses, classes });
    } catch (error) {
        console.error("Error fetching courses and classes:", error);
        return NextResponse.json({ error: "Failed to fetch courses and classes" }, { status: 500 });
    }
}
