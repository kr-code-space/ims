package com.ims.faculty;

import com.ims.user.UserEntity;
import com.ims.user.UserPermission;
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
public class FacultyManagementService {
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public FacultyManagementService(FacultyRepository facultyRepository,
                                    UserRepository userRepository,
                                    PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<FacultyDtos.Response> findAll() {
        return facultyRepository.findAll(Sort.by(Sort.Direction.ASC, "employeeNumber"))
                .stream()
                .map(FacultyDtos.Response::from)
                .toList();
    }

    @Transactional
    public FacultyDtos.Response create(FacultyDtos.CreateRequest request) {
        String employeeNumber = request.employeeNumber().trim();
        if (facultyRepository.existsByEmployeeNumber(employeeNumber)) {
            throw conflict("Employee number is already in use");
        }

        String username = trimToNull(request.username());
        String password = trimToNull(request.password());
        String email = trimToNull(request.email());
        boolean hasAccountDetails = username != null || password != null || email != null;
        UserEntity user = null;

        if (hasAccountDetails) {
            if (username == null || password == null || email == null) {
                throw badRequest("Username, password, and email are all required to create a faculty login");
            }
            if (password.length() < 12 || password.length() > 72) {
                throw badRequest("Faculty login passwords must be between 12 and 72 characters");
            }
            if (userRepository.existsByUsername(username)) {
                throw conflict("Username is already in use");
            }
            user = new UserEntity();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(UserRole.FACULTY);
            user.setPermissions(Boolean.TRUE.equals(request.labAccess())
                    ? Set.of(UserPermission.LAB_ACCESS)
                    : Set.of());
            user.setEnabled(true);
            user.setFirstName(request.firstName().trim());
            user.setLastName(request.lastName().trim());
            user.setEmail(email);
            user = userRepository.save(user);
        }

        Faculty faculty = new Faculty();
        faculty.setEmployeeNumber(employeeNumber);
        faculty.setFirstName(request.firstName().trim());
        faculty.setLastName(request.lastName().trim());
        faculty.setDepartment(request.department().trim());
        faculty.setDesignation(request.designation().trim());
        faculty.setActive(true);
        faculty.setUser(user);
        return FacultyDtos.Response.from(facultyRepository.save(faculty));
    }

    @Transactional
    public FacultyDtos.Response update(Long id, FacultyDtos.UpdateRequest request) {
        Faculty faculty = find(id);
        String employeeNumber = request.employeeNumber().trim();
        if (!faculty.getEmployeeNumber().equals(employeeNumber)
                && facultyRepository.existsByEmployeeNumberAndIdNot(employeeNumber, id)) {
            throw conflict("Employee number is already in use");
        }
        faculty.setEmployeeNumber(employeeNumber);
        faculty.setFirstName(request.firstName().trim());
        faculty.setLastName(request.lastName().trim());
        faculty.setDepartment(request.department().trim());
        faculty.setDesignation(request.designation().trim());
        if (faculty.getUser() != null) {
            faculty.getUser().setFirstName(faculty.getFirstName());
            faculty.getUser().setLastName(faculty.getLastName());
        }
        return FacultyDtos.Response.from(facultyRepository.save(faculty));
    }

    @Transactional
    public FacultyDtos.Response updateStatus(Long id, boolean active) {
        Faculty faculty = find(id);
        faculty.setActive(active);
        if (faculty.getUser() != null) {
            faculty.getUser().setEnabled(active);
        }
        return FacultyDtos.Response.from(facultyRepository.save(faculty));
    }

    private Faculty find(Long id) {
        return facultyRepository.findById(id)
                .orElseThrow(() -> notFound("Faculty not found"));
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}
