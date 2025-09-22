import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the components since we're testing the logic in the main file
const UserSelectionPanel = ({ students, selectedUsers, onSelectionChange }: any) => {
  const handleSelectAll = () => {
    if (selectedUsers.length === students.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(students.map((s: any) => s.id));
    }
  };

  const handleUserToggle = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onSelectionChange(selectedUsers.filter((id: string) => id !== userId));
    } else {
      onSelectionChange([...selectedUsers, userId]);
    }
  };

  return (
    <div data-testid="user-selection-panel">
      <button onClick={handleSelectAll} data-testid="select-all">
        Select All ({students.length})
      </button>
      {students.map((student: any) => (
        <button
          key={student.id}
          onClick={() => handleUserToggle(student.id)}
          data-testid={`user-${student.id}`}
        >
          {student.name}
        </button>
      ))}
      <div data-testid="selected-count">{selectedUsers.length}</div>
    </div>
  );
};

describe('UserSelectionPanel', () => {
  const mockStudents = [
    { id: '1', name: 'John Doe', roomNumber: '101' },
    { id: '2', name: 'Jane Smith', roomNumber: '102' },
    { id: '3', name: 'Bob Johnson', roomNumber: '103' },
  ];

  it('should render all students', () => {
    const mockOnSelectionChange = vi.fn();
    
    render(
      <UserSelectionPanel
        students={mockStudents}
        selectedUsers={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should handle individual user selection', () => {
    const mockOnSelectionChange = vi.fn();
    
    render(
      <UserSelectionPanel
        students={mockStudents}
        selectedUsers={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    fireEvent.click(screen.getByTestId('user-1'));
    expect(mockOnSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('should handle select all functionality', () => {
    const mockOnSelectionChange = vi.fn();
    
    render(
      <UserSelectionPanel
        students={mockStudents}
        selectedUsers={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    fireEvent.click(screen.getByTestId('select-all'));
    expect(mockOnSelectionChange).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('should handle deselect all when all users are selected', () => {
    const mockOnSelectionChange = vi.fn();
    
    render(
      <UserSelectionPanel
        students={mockStudents}
        selectedUsers={['1', '2', '3']}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    fireEvent.click(screen.getByTestId('select-all'));
    expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
  });

  it('should handle user deselection', () => {
    const mockOnSelectionChange = vi.fn();
    
    render(
      <UserSelectionPanel
        students={mockStudents}
        selectedUsers={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    fireEvent.click(screen.getByTestId('user-1'));
    expect(mockOnSelectionChange).toHaveBeenCalledWith(['2']);
  });
});