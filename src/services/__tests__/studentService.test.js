import { describe, it, expect, beforeEach } from 'vitest'
import { studentService } from '../studentService.js'

describe('studentService', () => {
  describe('createStudent', () => {
    it('should create a new student with generated ID', async () => {
      const studentData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        course: 'Computer Science',
        year: '2nd Year'
      }

      const student = await studentService.createStudent(studentData)

      expect(student).toMatchObject(studentData)
      expect(student.id).toBeDefined()
      expect(typeof student.id).toBe('string')
      expect(student.status).toBe('Active')
      expect(student.balance || student.currentBalance || 0).toBe(0)
    })

    it('should handle missing optional fields', async () => {
      const basicData = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      }

      const student = await studentService.createStudent(basicData)
      
      expect(student.name).toBe('Jane Doe')
      expect(student.email).toBe('jane@example.com')
      expect(student.status).toBe('Active')
    })
  })

  describe('getStudents', () => {
    it('should return array of students', async () => {
      const students = await studentService.getStudents()
      expect(Array.isArray(students)).toBe(true)
    })
  })

  describe('getStudentById', () => {
    it('should return student when ID exists', async () => {
      const newStudent = await studentService.createStudent({ 
        name: 'Test Student', 
        email: 'test@example.com' 
      })
      
      const foundStudent = await studentService.getStudentById(newStudent.id)

      expect(foundStudent).toBeTruthy()
      expect(foundStudent.name).toBe('Test Student')
    })

    it('should throw error when ID does not exist', async () => {
      await expect(studentService.getStudentById('NONEXISTENT')).rejects.toThrow('Student not found')
    })
  })
})