package com.ims.library;
import com.ims.student.Student;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name="library_book_issues")
public class BookIssue {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) @JoinColumn(name="book_id") private Book book;
    @ManyToOne(optional=false) @JoinColumn(name="student_id") private Student student;
    @Column(nullable=false) private LocalDate issuedAt;
    @Column(nullable=false) private LocalDate dueAt;
    private LocalDate returnedAt;
    @Column(nullable=false) private String status;

    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public Book getBook(){return book;} public void setBook(Book book){this.book=book;}
    public Student getStudent(){return student;} public void setStudent(Student student){this.student=student;}
    public LocalDate getIssuedAt(){return issuedAt;} public void setIssuedAt(LocalDate issuedAt){this.issuedAt=issuedAt;}
    public LocalDate getDueAt(){return dueAt;} public void setDueAt(LocalDate dueAt){this.dueAt=dueAt;}
    public LocalDate getReturnedAt(){return returnedAt;} public void setReturnedAt(LocalDate returnedAt){this.returnedAt=returnedAt;}
    public String getStatus(){return status;} public void setStatus(String status){this.status=status;}
}
