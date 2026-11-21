package com.ims.attendance;

import com.ims.academic.AcademicClassRepository;
import com.ims.academic.Enrolment;
import com.ims.academic.EnrolmentRepository;
import com.ims.academic.Subject;
import com.ims.academic.SubjectOfferingRepository;
import com.ims.academic.SubjectRepository;
import com.ims.faculty.Faculty;
import com.ims.faculty.FacultyRepository;
import com.ims.student.Student;
import com.ims.student.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AttendanceManagementService {
    private final AttendanceRecordRepository attendanceRepository;
    private final SubjectOfferingRepository offeringRepository;
    private final SubjectRepository subjectRepository;
    private final AcademicClassRepository classRepository;
    private final EnrolmentRepository enrolmentRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;

    public AttendanceManagementService(AttendanceRecordRepository attendanceRepository,
                                       SubjectOfferingRepository offeringRepository,
                                       SubjectRepository subjectRepository,
                                       AcademicClassRepository classRepository,
                                       EnrolmentRepository enrolmentRepository,
                                       StudentRepository studentRepository,
                                       FacultyRepository facultyRepository) {
        this.attendanceRepository = attendanceRepository;
        this.offeringRepository = offeringRepository;
        this.subjectRepository = subjectRepository;
        this.classRepository = classRepository;
        this.enrolmentRepository = enrolmentRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
    }

    @Transactional(readOnly = true)
    public List<AttendanceDtos.OfferingResponse> facultyOfferings(String username) {
        Faculty faculty = facultyRepository.findByUserUsername(username)
                .orElseThrow(() -> notFound("Faculty record not found"));
        return offeringRepository.findByFacultyIdAndActiveTrue(faculty.getId()).stream()
                .map(offering -> new AttendanceDtos.OfferingResponse(
                        offering.getId(),
                        offering.getAcademicClass().getId(),
                        offering.getAcademicClass().getName(),
                        offering.getSubject().getId(),
                        offering.getSubject().getName()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceDtos.RecordResponse> facultyRecords(String username, Long classId,
                                                               Long subjectId, java.time.LocalDate date) {
        validateFacultyAccess(username, classId, subjectId);
        return attendanceRepository
                .findByAcademicClassIdAndSubjectIdAndDate(classId, subjectId, date)
                .stream()
                .map(AttendanceDtos.RecordResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceDtos.RosterEntry> facultyRoster(String username, Long classId, Long subjectId) {
        validateFacultyAccess(username, classId, subjectId);
        return enrolmentRepository.findByAcademicClassIdAndActiveTrue(classId).stream()
                .map(enrolment -> {
                    Student student = enrolment.getStudent();
                    return new AttendanceDtos.RosterEntry(
                            student.getId(),
                            student.getFirstName() + " " + student.getLastName(),
                            student.getStudentNumber()
                    );
                })
                .toList();
    }

    @Transactional
    public List<AttendanceDtos.RecordResponse> saveRecords(String username,
                                                            AttendanceDtos.RecordRequest request) {
        validateFacultyAccess(username, request.academicClassId(), request.subjectId());
        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> notFound("Subject not found"));
        var academicClass = classRepository.findById(request.academicClassId())
                .orElseThrow(() -> notFound("Academic class not found"));

        List<AttendanceRecord> existing = attendanceRepository
                .findByAcademicClassIdAndSubjectIdAndDate(
                        request.academicClassId(), request.subjectId(), request.date());
        attendanceRepository.deleteAll(existing);

        Map<Long, Student> enrolledStudents = enrolmentRepository
                .findByAcademicClassIdAndActiveTrue(request.academicClassId())
                .stream()
                .map(Enrolment::getStudent)
                .collect(Collectors.toMap(Student::getId, student -> student));

        List<AttendanceRecord> records = request.entries().stream()
                .map(entry -> {
                    Student student = enrolledStudents.get(entry.studentId());
                    if (student == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Student is not actively enrolled in this class");
                    }
                    AttendanceRecord record = new AttendanceRecord();
                    record.setStudent(student);
                    record.setSubject(subject);
                    record.setAcademicClass(academicClass);
                    record.setDate(request.date());
                    record.setPresent(Boolean.TRUE.equals(entry.present()));
                    record.setRemarks(entry.remarks());
                    return record;
                })
                .toList();

        return attendanceRepository.saveAll(records).stream()
                .map(AttendanceDtos.RecordResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceDtos.RecordResponse> studentRecords(String username) {
        Student student = studentRepository.findByUserUsername(username)
                .orElseThrow(() -> notFound("Student record not found"));
        return attendanceRepository.findByStudentIdOrderByDateDesc(student.getId()).stream()
                .map(AttendanceDtos.RecordResponse::from)
                .toList();
    }

    private void validateFacultyAccess(String username, Long classId, Long subjectId) {
        Faculty faculty = facultyRepository.findByUserUsername(username)
                .orElseThrow(() -> notFound("Faculty record not found"));
        boolean assigned = offeringRepository.findByFacultyIdAndActiveTrue(faculty.getId()).stream()
                .anyMatch(offering -> offering.getAcademicClass().getId().equals(classId)
                        && offering.getSubject().getId().equals(subjectId));
        if (!assigned) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not assigned to this class and subject");
        }
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}
