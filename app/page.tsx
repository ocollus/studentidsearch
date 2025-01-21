"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function StudentIDSearch() {
  const [studentPhone, setStudentPhone] = useState("")
  const [parentPhone, setParentPhone] = useState("")
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [courses, setCourses] = useState<string[]>([]);
    const [classes, setClasses] = useState<Record<string, string[]>>({});
  const [searchResult, setSearchResult] = useState<{ studentId: string; enrolledClass: string } | null>(null)
  const [error, setError] = useState<string | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [classError, setClassError] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(true)

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('/api/courses');
                if (response.ok) {
                    const data = await response.json();
                    setCourses(data.courses);
                    setClasses(data.classesByCourse);
                } else {
                    setError('Failed to fetch courses and classes.');
                }
            } catch (error) {
                setError('Error fetching courses and classes.');
            }
        };

        fetchCourses();
    }, []);

  const handleSearch = async () => {
    setError("")
    setCourseError("")
    setClassError("")
    setSearchResult(null)

    if (selectedClass && !selectedCourse) {
      setCourseError("Please select a course before selecting a class.")
      return
    }

    if (selectedClass && !classes[selectedCourse].includes(selectedClass)) {
      setClassError("Selected class does not belong to the selected course.")
      return
    }

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentPhone,
          parentPhone,
          course: selectedCourse,
          class: selectedClass,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSearchResult(data)
      } else {
        setError(data.message || "Student not found.")
      }
    } catch (error) {
      setError("An error occurred while searching. Please try again.")
    }
  }

  const toggleFilter = () => {
    setShowFilter(!showFilter)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Student ID Search</h1>

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
                  <p>
                    Filtering by course and class is optional. Selecting a course will show classes for that course.
                    Selecting a class will further filter the search results.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        {showFilter && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Select a Course (Optional)</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {courses.map((course) => (
                    <Button
                      key={course}
                      variant={selectedCourse === course ? "default" : "outline"}
                      onClick={() => {
                        if (selectedCourse === course) {
                          setSelectedCourse("")
                          setSelectedClass("")
                        } else {
                          setSelectedCourse(course)
                          setSelectedClass("")
                        }
                      }}
                    >
                      {course}
                    </Button>
                  ))}
                </div>
              </div>
              {selectedCourse && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Select a Class (Optional)</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {classes && selectedCourse && classes[selectedCourse] && classes[selectedCourse].map((className: string) => (
                      <Button
                        key={className}
                        variant={selectedClass === className ? "default" : "outline"}
                        onClick={() => setSelectedClass(selectedClass === className ? "" : className)}
                      >
                        {className}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <Button onClick={handleSearch} className="w-full mb-4">
        Search
      </Button>

      {searchResult && (
        <Card>
          <CardContent className="pt-6">
            <p>
              <strong>Student ID:</strong> {searchResult.studentId}
            </p>
            <p>
              <strong>Enrolled Class:</strong> {searchResult.enrolledClass}
            </p>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-red-500">{error}</p>}
      {courseError && <p className="text-red-500 mt-2">{courseError}</p>}
      {classError && <p className="text-red-500 mt-2">{classError}</p>}
    </div>
  )
}
