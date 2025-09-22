
import { getEnvironmentConfig } from '../config/environment.ts';

const API_BASE_URL = getEnvironmentConfig().apiBaseUrl;

// Helper function to handle API requests
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data; // API returns data in { status, data } format
  } catch (error) {
    console.error("Student API Request Error:", error);
    throw error;
  }
}

export const studentService = {
  // Get all students with filtering and pagination
  async getStudents(filters = {}) {
    try {
      console.log("👥 Fetching students from API...");
      const queryParams = new URLSearchParams();

      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/students${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const result = await apiRequest(endpoint);
      console.log("✅ Students API response:", result);

      // API may return either an array or an object with { items, pagination }
      const items = Array.isArray(result)
        ? result
        : (result && Array.isArray(result.items) ? result.items : []);
      return items;

    } catch (error) {
      console.error("❌ Error fetching students:", error);
      throw error;
    }
  },

  // Get student by ID
  async getStudentById(studentId) {
    try {
      console.log(`👤 Fetching student ${studentId} from API...`);
      const result = await apiRequest(`/students/${studentId}`);
      console.log("✅ Student fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching student:", error);
      throw error;
    }
  },

  // Create new student
  async createStudent(studentData) {
    try {
      console.log("👤 Creating new student via API...");
      const result = await apiRequest("/students", {
        method: "POST",
        body: JSON.stringify(studentData),
      });
      console.log("✅ Student created successfully");
      return result;
    } catch (error) {
      console.error("❌ Error creating student:", error);
      throw error;
    }
  },

  // Update student
  async updateStudent(studentId, updateData) {
    try {
      console.log(`👤 Updating student ${studentId} via API...`);
      const result = await apiRequest(`/students/${studentId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      console.log("✅ Student updated successfully");
      return result;
    } catch (error) {
      console.error("❌ Error updating student:", error);
      throw error;
    }
  },

  // Delete student
  async deleteStudent(studentId) {
    try {
      console.log(`👤 Deleting student ${studentId} via API...`);
      const result = await apiRequest(`/students/${studentId}`, {
        method: "DELETE",
      });
      console.log("✅ Student deleted successfully");
      return result;
    } catch (error) {
      console.error("❌ Error deleting student:", error);
      throw error;
    }
  },

  // Get student statistics
  async getStudentStats() {
    try {
      console.log("📊 Fetching student statistics from API...");
      const result = await apiRequest("/students/stats");
      console.log("✅ Student stats fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching student stats:", error);
      throw error;
    }
  },

  // Get students with outstanding dues
  async getStudentsWithDues() {
    try {
      console.log("💰 Fetching students with dues from API...");
      const result = await this.getStudents({ hasDues: true });
      return result;
    } catch (error) {
      console.error("❌ Error fetching students with dues:", error);
      throw error;
    }
  },

  // Search students
  async searchStudents(searchTerm) {
    try {
      console.log(`🔍 Searching students by term: ${searchTerm}`);
      const result = await this.getStudents({ search: searchTerm });
      return result;
    } catch (error) {
      console.error("❌ Error searching students:", error);
      throw error;
    }
  },

  // Checkout student
  async checkoutStudent(studentId) {
    try {
      console.log(`🚪 Processing checkout for student ${studentId}...`);
      const result = await apiRequest(`/students/${studentId}/checkout`, {
        method: "POST",
        body: JSON.stringify({ checkoutDate: new Date().toISOString() }),
      });
      console.log("✅ Student checkout processed successfully");
      return result;
    } catch (error) {
      console.error("❌ Error processing student checkout:", error);
      throw error;
    }
  },

  // Get students who are checked out with dues
  async getCheckedOutStudentsWithDues() {
    try {
      console.log("👥 Fetching checked out students with dues...");
      const result = await this.getStudents({ 
        status: 'Checked Out', 
        hasDues: true 
      });
      return result;
    } catch (error) {
      console.error("❌ Error fetching checked out students with dues:", error);
      throw error;
    }
  },

  // Get active students only
  async getActiveStudents() {
    try {
      console.log("👥 Fetching active students...");
      const result = await this.getStudents({ status: 'Active' });
      return result;
    } catch (error) {
      console.error("❌ Error fetching active students:", error);
      throw error;
    }
  },

  // Get inactive students only
  async getInactiveStudents() {
    try {
      console.log("👥 Fetching inactive students...");
      const result = await this.getStudents({ status: 'Inactive' });
      return result;
    } catch (error) {
      console.error("❌ Error fetching inactive students:", error);
      throw error;
    }
  }
};
