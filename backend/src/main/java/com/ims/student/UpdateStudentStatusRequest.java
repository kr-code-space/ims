package com.ims.student;

import jakarta.validation.constraints.NotNull;

public record UpdateStudentStatusRequest(@NotNull Boolean active) {
}
