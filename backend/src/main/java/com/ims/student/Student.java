package com.ims.student;

import com.ims.user.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String studentNumber;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String year;

    @Column(nullable = false)
    private String className;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean active = true;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
    private UserEntity user;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }
}
