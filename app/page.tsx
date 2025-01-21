"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components


export default function StudentIDSearch() {
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [searchResult, setSearchResult] = useState<{ studentId: string; enrolledClass: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(true); // Add showFilter state

  useEffect(() => {
    const fetchCoursesAndClasses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) {
          throw new Error(`Error fetching courses and classes: ${response.status}`);
        }
        const data = await response.json();
        setCourses(data.courses);
        setClasses(data.classes);
      } catch (error: any) {
        setError(`Failed to fetch courses and classes: ${error.message}`);
      }
    };

    fetchCoursesAndClasses();
  }, []);

  const handleSearch = async () => {
    setError(null);
    setSearchResult(null);
    console.log("Searching with:", { studentPhone, parentPhone, selectedCourse, selectedClass });

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentPhone, parentPhone, course: selectedCourse, class: selectedClass }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || `Search failed: ${response.status}`);
        return;
      }

      const data = await response.json();
      setSearchResult(data);
    } catch (error: any) {
      setError(`An unexpected error occurred during the search: ${error.message}`);
    }
  };

  const handleCourseSelect = (course: string) => {
    setSelectedCourse(course === selectedCourse ? "" : course); 
    console.log("Course selected:", selectedCourse);
  };

  const handleClassSelect = (className: string) => {
    setSelectedClass(className === selectedClass ? "" : className); 
    console.log("Class selected:", selectedClass);
  };

  const filteredClasses = selectedCourse
    ? classes.filter((className) => className.includes(selectedCourse))
    : classes;

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Student ID Search</h1>
      <div className="space-y-4 mb-6">
        <Input placeholder="Student Phone" value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)} />
        <Input placeholder="Parent Phone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filter</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleFilter}>
                    {showFilter ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle filter visibility.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        {showFilter && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3>Course</h3>
                <div className="grid grid-cols-4 gap-2">
                  {courses.map((course) => (
                    <Button key={course} variant={selectedCourse === course ? "default" : "outline"} onClick={() => handleCourseSelect(course)}>
                      {course}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h3>Class</h3>
                <div className="grid grid-cols-4 gap-2">
                  {filteredClasses.map((className) => (
                    <Button key={className} variant={selectedClass === className ? "default" : "outline"} onClick={() => handleClassSelect(className)}>
                      {className}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      <Button onClick={handleSearch}>Search</Button>
      {searchResult && (
        <Card className="mt-6">
          <CardContent>
            <p className="pt-6">
              <strong>Student ID:</strong> {searchResult.studentId}
            </p>
            <p>
              <strong>Enrolled Class:</strong> {searchResult.enrolledClass}
            </p>
          </CardContent>
        </Card>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
