$base = Join-Path $PSScriptRoot 'data'
if (!(Test-Path $base)) { New-Item -ItemType Directory -Path $base | Out-Null }

# sample courses
$sampleCourses = @'
[
  {"id":"course-1","title":"Intro to Web","description":"HTML, CSS & JS basics","duration":"3 weeks","teacherId":"teacher-1","students":[],"assignments":[]},
  {"id":"course-2","title":"JavaScript Essentials","description":"JS fundamentals and DOM","duration":"4 weeks","teacherId":"teacher-1","students":[],"assignments":[]},
  {"id":"course-3","title":"React Basics","description":"Build UIs with React","duration":"5 weeks","teacherId":"teacher-2","students":[],"assignments":[]}
]
'@

$sampleUsers = @'
[
  {"id":"teacher-1","name":"Teacher One","email":"teacher1@example.com","password":"pass123","role":"Teacher"},
  {"id":"teacher-2","name":"Teacher Two","email":"teacher2@example.com","password":"pass123","role":"Teacher"},
  {"id":"student-1","name":"Student One","email":"student1@example.com","password":"pass123","role":"Student"}
]
'@

Set-Content -Path (Join-Path $base 'courses.json') -Value $sampleCourses -Encoding UTF8
Set-Content -Path (Join-Path $base 'users.json') -Value $sampleUsers -Encoding UTF8
Set-Content -Path (Join-Path $base 'enrollments.json') -Value '[]' -Encoding UTF8

Write-Host "Seeded sample data to $base"
