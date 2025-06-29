package utils

// Sample Ethiopian Universities
var EthiopianUniversities = []map[string]interface{}{
	{
		"name":        "Addis Ababa University",
		"abbreviation": "AAU",
		"location":    "Addis Ababa",
		"website":     "https://www.aau.edu.et",
		"email_domain": "aau.edu.et",
		"established": 1950,
		"departments": []string{
			"Computer Science",
			"Electrical Engineering",
			"Mechanical Engineering",
			"Civil Engineering",
			"Mathematics",
			"Physics",
			"Chemistry",
			"Biology",
			"Economics",
			"Business Administration",
			"Law",
			"Medicine",
			"Pharmacy",
			"Agriculture",
		},
	},
	{
		"name":        "Adama Science and Technology University",
		"abbreviation": "ASTU",
		"location":    "Adama",
		"website":     "https://www.astu.edu.et",
		"email_domain": "astu.edu.et",
		"established": 1993,
		"departments": []string{
			"Computer Science",
			"Information Technology",
			"Electrical Engineering",
			"Mechanical Engineering",
			"Civil Engineering",
			"Chemical Engineering",
			"Applied Mathematics",
			"Applied Physics",
			"Applied Chemistry",
			"Biotechnology",
		},
	},
	{
		"name":        "Bahir Dar University",
		"abbreviation": "BDU",
		"location":    "Bahir Dar",
		"website":     "https://www.bdu.edu.et",
		"email_domain": "bdu.edu.et",
		"established": 1963,
		"departments": []string{
			"Computer Science",
			"Electrical Engineering",
			"Mechanical Engineering",
			"Civil Engineering",
			"Water Resources Engineering",
			"Textile Engineering",
			"Agriculture",
			"Natural Resources",
			"Economics",
			"Business Administration",
		},
	},
	{
		"name":        "Jimma University",
		"abbreviation": "JU",
		"location":    "Jimma",
		"website":     "https://www.ju.edu.et",
		"email_domain": "ju.edu.et",
		"established": 1983,
		"departments": []string{
			"Computer Science",
			"Electrical Engineering",
			"Mechanical Engineering",
			"Civil Engineering",
			"Biomedical Engineering",
			"Agriculture",
			"Medicine",
			"Pharmacy",
			"Economics",
			"Business Administration",
		},
	},
	{
		"name":        "Mekelle University",
		"abbreviation": "MU",
		"location":    "Mekelle",
		"website":     "https://www.mu.edu.et",
		"email_domain": "mu.edu.et",
		"established": 1991,
		"departments": []string{
			"Computer Science",
			"Electrical Engineering",
			"Mechanical Engineering",
			"Civil Engineering",
			"Mining Engineering",
			"Architecture",
			"Medicine",
			"Pharmacy",
			"Economics",
			"Business Administration",
		},
	},
}

// Sample Courses for different departments
var SampleCourses = []map[string]interface{}{
	// Computer Science Courses
	{"title": "Introduction to Programming", "department": "Computer Science", "code": "CS101"},
	{"title": "Data Structures and Algorithms", "department": "Computer Science", "code": "CS201"},
	{"title": "Database Systems", "department": "Computer Science", "code": "CS301"},
	{"title": "Software Engineering", "department": "Computer Science", "code": "CS401"},
	{"title": "Computer Networks", "department": "Computer Science", "code": "CS402"},
	{"title": "Artificial Intelligence", "department": "Computer Science", "code": "CS403"},
	{"title": "Web Development", "department": "Computer Science", "code": "CS404"},
	{"title": "Mobile Application Development", "department": "Computer Science", "code": "CS405"},
	
	// Electrical Engineering Courses
	{"title": "Circuit Analysis", "department": "Electrical Engineering", "code": "EE101"},
	{"title": "Digital Electronics", "department": "Electrical Engineering", "code": "EE201"},
	{"title": "Electromagnetic Theory", "department": "Electrical Engineering", "code": "EE301"},
	{"title": "Control Systems", "department": "Electrical Engineering", "code": "EE401"},
	{"title": "Power Systems", "department": "Electrical Engineering", "code": "EE402"},
	{"title": "Communication Systems", "department": "Electrical Engineering", "code": "EE403"},
	
	// Mechanical Engineering Courses
	{"title": "Engineering Mechanics", "department": "Mechanical Engineering", "code": "ME101"},
	{"title": "Thermodynamics", "department": "Mechanical Engineering", "code": "ME201"},
	{"title": "Fluid Mechanics", "department": "Mechanical Engineering", "code": "ME301"},
	{"title": "Machine Design", "department": "Mechanical Engineering", "code": "ME401"},
	{"title": "Manufacturing Processes", "department": "Mechanical Engineering", "code": "ME402"},
	
	// Civil Engineering Courses
	{"title": "Engineering Drawing", "department": "Civil Engineering", "code": "CE101"},
	{"title": "Strength of Materials", "department": "Civil Engineering", "code": "CE201"},
	{"title": "Structural Analysis", "department": "Civil Engineering", "code": "CE301"},
	{"title": "Reinforced Concrete Design", "department": "Civil Engineering", "code": "CE401"},
	{"title": "Transportation Engineering", "department": "Civil Engineering", "code": "CE402"},
	{"title": "Water Resources Engineering", "department": "Civil Engineering", "code": "CE403"},
	
	// Mathematics Courses
	{"title": "Calculus I", "department": "Mathematics", "code": "MATH101"},
	{"title": "Calculus II", "department": "Mathematics", "code": "MATH201"},
	{"title": "Linear Algebra", "department": "Mathematics", "code": "MATH301"},
	{"title": "Differential Equations", "department": "Mathematics", "code": "MATH401"},
	{"title": "Numerical Methods", "department": "Mathematics", "code": "MATH402"},
	
	// Physics Courses
	{"title": "General Physics I", "department": "Physics", "code": "PHY101"},
	{"title": "General Physics II", "department": "Physics", "code": "PHY201"},
	{"title": "Modern Physics", "department": "Physics", "code": "PHY301"},
	{"title": "Quantum Mechanics", "department": "Physics", "code": "PHY401"},
	
	// Economics Courses
	{"title": "Principles of Economics", "department": "Economics", "code": "ECON101"},
	{"title": "Microeconomics", "department": "Economics", "code": "ECON201"},
	{"title": "Macroeconomics", "department": "Economics", "code": "ECON301"},
	{"title": "Development Economics", "department": "Economics", "code": "ECON401"},
	
	// Business Administration Courses
	{"title": "Introduction to Business", "department": "Business Administration", "code": "BUS101"},
	{"title": "Principles of Management", "department": "Business Administration", "code": "BUS201"},
	{"title": "Marketing Management", "department": "Business Administration", "code": "BUS301"},
	{"title": "Financial Management", "department": "Business Administration", "code": "BUS401"},
	{"title": "Operations Management", "department": "Business Administration", "code": "BUS402"},
}

// GetUniversityByEmailDomain returns university info based on email domain
func GetUniversityByEmailDomain(email string) map[string]interface{} {
	institution := GetInstitutionFromEmail(email)
	
	for _, university := range EthiopianUniversities {
		if university["email_domain"] == institution {
			return university
		}
	}
	
	return nil
}

// GetCoursesByDepartment returns sample courses for a specific department
func GetCoursesByDepartment(department string) []map[string]interface{} {
	var courses []map[string]interface{}
	
	for _, course := range SampleCourses {
		if course["department"] == department {
			courses = append(courses, course)
		}
	}
	
	return courses
} 