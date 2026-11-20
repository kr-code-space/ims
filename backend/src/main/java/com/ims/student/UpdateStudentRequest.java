package com.ims.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateStudentRequest(
        @NotBlank @Size(max = 100) String studentNumber,
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @NotBlank @Size(max = 150) String department,
        @NotBlank @Size(max = 50) String year,
        @NotBlank @Size(max = 100) String className
) {
}
