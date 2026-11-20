package com.ims.student;

import com.ims.user.UserEntity;
import com.ims.user.UserRepository;
import com.ims.user.UserRole;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@Service
public class StudentManagementService {
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentManagementService(
            StudentRepository studentRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> findAll() {
        return studentRepository.findAll(Sort.by(Sort.Direction.ASC, "studentNumber"))
                .stream()
                .map(StudentResponse::from)
                .toList();
    }

    @Transactional
    public StudentResponse create(CreateStudentRequest request) {
        String studentNumber = request.studentNumber().trim();
        if (studentRepository.existsByStudentNumber(studentNumber)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student number is already in use");
        }

        String username = trimToNull(request.username());
        String password = trimToNull(request.password());
        String email = trimToNull(request.email());
        boolean hasAccountDetails = username != null || password != null || email != null;
        UserEntity user = null;

        if (hasAccountDetails) {
            if (username == null || password == null || email == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Username, password, and email are all required to create a student login"
                );
            }
            if (password.length() < 12 || password.length() > 72) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Student login passwords must be between 12 and 72 characters"
                );
            }
            if (userRepository.existsByUsername(username)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already in use");
            }

            user = new UserEntity();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(UserRole.STUDENT);
            user.setPermissions(Set.of());
            user.setEnabled(true);
            user.setFirstName(request.firstName().trim());
            user.setLastName(request.lastName().trim());
            user.setEmail(email);
            user = userRepository.save(user);
        }

        Student student = new Student();
        student.setStudentNumber(studentNumber);
        student.setFirstName(request.firstName().trim());
        student.setLastName(request.lastName().trim());
        student.setDepartment(request.department().trim());
        student.setYear(request.year().trim());
        student.setClassName(request.className().trim());
        student.setActive(true);
        student.setUser(user);
        return StudentResponse.from(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse update(Long id, UpdateStudentRequest request) {
        Student student = findStudent(id);
        String studentNumber = request.studentNumber().trim();
        if (!student.getStudentNumber().equals(studentNumber)
                && studentRepository.existsByStudentNumberAndIdNot(studentNumber, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student number is already in use");
        }

        student.setStudentNumber(studentNumber);
        student.setFirstName(request.firstName().trim());
        student.setLastName(request.lastName().trim());
        student.setDepartment(request.department().trim());
        student.setYear(request.year().trim());
        student.setClassName(request.className().trim());

        if (student.getUser() != null) {
            student.getUser().setFirstName(student.getFirstName());
            student.getUser().setLastName(student.getLastName());
        }

        return StudentResponse.from(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse updateStatus(Long id, boolean active) {
        Student student = findStudent(id);
        student.setActive(active);
        if (student.getUser() != null) {
            student.getUser().setEnabled(active);
        }
        return StudentResponse.from(studentRepository.save(student));
    }

    private Student findStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
