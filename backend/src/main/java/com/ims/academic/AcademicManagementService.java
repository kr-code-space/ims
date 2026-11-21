package com.ims.academic;

import com.ims.faculty.Faculty;
import com.ims.faculty.FacultyRepository;
import com.ims.student.Student;
import com.ims.student.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AcademicManagementService {
    private final DepartmentRepository departmentRepository;
    private final AcademicTermRepository termRepository;
    private final AcademicClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final EnrolmentRepository enrolmentRepository;
    private final SubjectOfferingRepository offeringRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;

    public AcademicManagementService(
            DepartmentRepository departmentRepository,
            AcademicTermRepository termRepository,
            AcademicClassRepository classRepository,
            SubjectRepository subjectRepository,
            EnrolmentRepository enrolmentRepository,
            SubjectOfferingRepository offeringRepository,
            StudentRepository studentRepository,
            FacultyRepository facultyRepository
    ) {
        this.departmentRepository = departmentRepository;
        this.termRepository = termRepository;
        this.classRepository = classRepository;
        this.subjectRepository = subjectRepository;
        this.enrolmentRepository = enrolmentRepository;
        this.offeringRepository = offeringRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
    }

    @Transactional(readOnly = true)
    public AcademicDtos.AcademicOverview overview() {
        return new AcademicDtos.AcademicOverview(
                departmentRepository.findAll().stream().map(AcademicDtos.DepartmentResponse::from).toList(),
                termRepository.findAll().stream().map(AcademicDtos.TermResponse::from).toList(),
                classRepository.findAll().stream().map(AcademicDtos.ClassResponse::from).toList(),
                subjectRepository.findAll().stream().map(AcademicDtos.SubjectResponse::from).toList(),
                enrolmentRepository.findAll().stream().map(AcademicDtos.EnrolmentResponse::from).toList(),
                offeringRepository.findAll().stream().map(AcademicDtos.OfferingResponse::from).toList()
        );
    }

    @Transactional
    public AcademicDtos.DepartmentResponse createDepartment(AcademicDtos.DepartmentRequest request) {
        if (departmentRepository.existsByCode(request.code().trim()) || departmentRepository.existsByName(request.name().trim())) {
            throw conflict("Department code or name already exists");
        }
        Department department = new Department();
        department.setCode(request.code().trim());
        department.setName(request.name().trim());
        department.setActive(request.active() == null || request.active());
        return AcademicDtos.DepartmentResponse.from(departmentRepository.save(department));
    }

    @Transactional
    public AcademicDtos.TermResponse createTerm(AcademicDtos.TermRequest request) {
        if (!request.startDate().isBefore(request.endDate())) {
            throw badRequest("Term start date must be before end date");
        }
        if (termRepository.existsByName(request.name().trim())) throw conflict("Academic term name already exists");
        AcademicTerm term = new AcademicTerm();
        term.setName(request.name().trim());
        term.setStartDate(request.startDate());
        term.setEndDate(request.endDate());
        term.setActive(request.active() == null || request.active());
        return AcademicDtos.TermResponse.from(termRepository.save(term));
    }

    @Transactional
    public AcademicDtos.ClassResponse createClass(AcademicDtos.ClassRequest request) {
        if (classRepository.existsByCode(request.code().trim())) throw conflict("Class code already exists");
        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> notFound("Department not found"));
        AcademicTerm term = termRepository.findById(request.termId())
                .orElseThrow(() -> notFound("Academic term not found"));
        Student cr = request.crStudentId() == null ? null : studentRepository.findById(request.crStudentId())
                .orElseThrow(() -> notFound("CR student not found"));
        AcademicClass academicClass = new AcademicClass();
        academicClass.setCode(request.code().trim());
        academicClass.setName(request.name().trim());
        academicClass.setDepartment(department);
        academicClass.setTerm(term);
        academicClass.setCrStudent(cr);
        academicClass.setActive(request.active() == null || request.active());
        return AcademicDtos.ClassResponse.from(classRepository.save(academicClass));
    }

    @Transactional
    public AcademicDtos.SubjectResponse createSubject(AcademicDtos.SubjectRequest request) {
        Subject subject = new Subject();
        subject.setCode(request.code().trim());
        subject.setName(request.name().trim());
        subject.setDepartment(request.department().trim());
        subject.setCredits(request.credits());
        subject.setSemester(request.semester().trim());
        if (subject.getCredits() < 1) throw badRequest("Credits must be at least 1");
        return AcademicDtos.SubjectResponse.from(subjectRepository.save(subject));
    }

    @Transactional
    public AcademicDtos.EnrolmentResponse createEnrolment(AcademicDtos.EnrolmentRequest request) {
        if (enrolmentRepository.existsByStudentIdAndAcademicClassId(request.studentId(), request.academicClassId())) {
            throw conflict("Student is already enrolled in this class");
        }
        Student student = studentRepository.findById(request.studentId()).orElseThrow(() -> notFound("Student not found"));
        AcademicClass academicClass = classRepository.findById(request.academicClassId())
                .orElseThrow(() -> notFound("Academic class not found"));
        Enrolment enrolment = new Enrolment();
        enrolment.setStudent(student);
        enrolment.setAcademicClass(academicClass);
        enrolment.setActive(request.active() == null || request.active());
        return AcademicDtos.EnrolmentResponse.from(enrolmentRepository.save(enrolment));
    }

    @Transactional
    public AcademicDtos.OfferingResponse createOffering(AcademicDtos.OfferingRequest request) {
        if (offeringRepository.existsBySubjectIdAndAcademicClassId(request.subjectId(), request.academicClassId())) {
            throw conflict("Subject is already offered in this class");
        }
        Subject subject = subjectRepository.findById(request.subjectId()).orElseThrow(() -> notFound("Subject not found"));
        AcademicClass academicClass = classRepository.findById(request.academicClassId())
                .orElseThrow(() -> notFound("Academic class not found"));
        Faculty faculty = request.facultyId() == null ? null : facultyRepository.findById(request.facultyId())
                .orElseThrow(() -> notFound("Faculty not found"));
        SubjectOffering offering = new SubjectOffering();
        offering.setSubject(subject);
        offering.setAcademicClass(academicClass);
        offering.setFaculty(faculty);
        offering.setActive(request.active() == null || request.active());
        return AcademicDtos.OfferingResponse.from(offeringRepository.save(offering));
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
