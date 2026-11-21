package com.ims.fee;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FeeDtos {
    public record CreateRequest(@NotNull Long studentId,
                                @NotBlank String feeType,
                                @NotNull BigDecimal amount,
                                @NotNull LocalDate dueDate) {}

    public record PaymentRequest(@NotNull BigDecimal paidAmount) {}

    public record Response(Long id, Long studentId, String studentName, String feeType,
                           BigDecimal amount, BigDecimal paidAmount, String status, LocalDate dueDate) {
        public static Response from(FeeRecord record) {
            var student = record.getStudent();
            return new Response(record.getId(), student.getId(),
                    student.getFirstName() + " " + student.getLastName(),
                    record.getFeeType(), record.getAmount(), record.getPaidAmount(),
                    record.getStatus(), record.getDueDate());
        }
    }
}
