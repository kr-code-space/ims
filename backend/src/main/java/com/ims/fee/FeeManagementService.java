package com.ims.fee;

import com.ims.student.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class FeeManagementService {
    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;

    public FeeManagementService(FeeRepository feeRepository, StudentRepository studentRepository) {
        this.feeRepository = feeRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public FeeDtos.Response create(FeeDtos.CreateRequest request) {
        var student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        if (request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fee amount must be positive");
        }
        FeeRecord record = new FeeRecord();
        record.setStudent(student);
        record.setFeeType(request.feeType().trim());
        record.setAmount(request.amount());
        record.setPaidAmount(BigDecimal.ZERO);
        record.setStatus("PENDING");
        record.setDueDate(request.dueDate());
        return FeeDtos.Response.from(feeRepository.save(record));
    }

    @Transactional
    public FeeDtos.Response recordPayment(Long id, FeeDtos.PaymentRequest request) {
        FeeRecord record = feeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fee record not found"));
        if (request.paidAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment amount must be positive");
        }
        BigDecimal paid = record.getPaidAmount().add(request.paidAmount());
        if (paid.compareTo(record.getAmount()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment exceeds fee amount");
        }
        record.setPaidAmount(paid);
        record.setStatus(paid.compareTo(record.getAmount()) == 0 ? "PAID" : "PARTIAL");
        return FeeDtos.Response.from(feeRepository.save(record));
    }

    @Transactional(readOnly = true)
    public List<FeeDtos.Response> findAll() {
        return feeRepository.findAll().stream().map(FeeDtos.Response::from).toList();
    }

    @Transactional(readOnly = true)
    public List<FeeDtos.Response> studentFees(String username) {
        var student = studentRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student record not found"));
        return feeRepository.findByStudentIdOrderByDueDateAsc(student.getId()).stream()
                .map(FeeDtos.Response::from).toList();
    }
}
