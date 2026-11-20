package com.ims.student;

public record StudentResponse(
        Long id,
        String studentNumber,
        String firstName,
        String lastName,
        String department,
        String year,
        String className,
        boolean active,
        String accountUsername
) {
    public static StudentResponse from(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getStudentNumber(),
                student.getFirstName(),
                student.getLastName(),
                student.getDepartment(),
                student.getYear(),
                student.getClassName(),
                student.isActive(),
                student.getUser() == null ? null : student.getUser().getUsername()
        );
    }
}
