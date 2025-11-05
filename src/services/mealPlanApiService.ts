import apiClient from './apiClient';

export interface MealPlan {
  id: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  notes?: string;
  isActive: boolean;
  hostelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMealPlanDto {
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateMealPlanDto {
  day?: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  breakfast?: string;
  lunch?: string;
  snacks?: string;
  dinner?: string;
  notes?: string;
  isActive?: boolean;
}

export const mealPlanApiService = {
  /**
   * Get all meal plans for the hostel
   */
  async getAllMealPlans(): Promise<MealPlan[]> {
    try {
      const response = await apiClient.get('/meal-plans');
      // Backend returns { status, result: { items: [], total: number } }
      return response.data.result?.items || [];
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      throw error;
    }
  },

  /**
   * Get weekly meal plan (all 7 days)
   */
  async getWeeklyMealPlan(): Promise<MealPlan[]> {
    try {
      const response = await apiClient.get('/meal-plans/weekly');
      // Backend returns { status, result: { weeklyPlan: [], totalDaysPlanned: number } }
      return response.data.result?.weeklyPlan || [];
    } catch (error) {
      console.error('Error fetching weekly meal plan:', error);
      throw error;
    }
  },

  /**
   * Get meal plan for a specific day
   */
  async getMealPlanByDay(day: string): Promise<MealPlan> {
    try {
      const response = await apiClient.get(`/meal-plans/day/${day}`);
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching meal plan for ${day}:`, error);
      throw error;
    }
  },

  /**
   * Get meal plan by ID
   */
  async getMealPlanById(id: string): Promise<MealPlan> {
    try {
      const response = await apiClient.get(`/meal-plans/${id}`);
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching meal plan ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new meal plan
   */
  async createMealPlan(data: CreateMealPlanDto): Promise<MealPlan> {
    try {
      const response = await apiClient.post('/meal-plans', data);
      return response.data.result;
    } catch (error) {
      console.error('Error creating meal plan:', error);
      throw error;
    }
  },

  /**
   * Create or update weekly meal plan (bulk operation)
   */
  async createWeeklyMealPlan(weeklyData: CreateMealPlanDto[]): Promise<MealPlan[]> {
    try {
      const response = await apiClient.post('/meal-plans/weekly', weeklyData);
      return response.data.result;
    } catch (error) {
      console.error('Error creating weekly meal plan:', error);
      throw error;
    }
  },

  /**
   * Update an existing meal plan
   */
  async updateMealPlan(id: string, data: UpdateMealPlanDto): Promise<MealPlan> {
    try {
      const response = await apiClient.put(`/meal-plans/${id}`, data);
      return response.data.result;
    } catch (error) {
      console.error(`Error updating meal plan ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a meal plan
   */
  async deleteMealPlan(id: string): Promise<void> {
    try {
      await apiClient.delete(`/meal-plans/${id}`);
    } catch (error) {
      console.error(`Error deleting meal plan ${id}:`, error);
      throw error;
    }
  }
};
