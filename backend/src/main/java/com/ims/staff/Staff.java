package com.ims.staff;
import jakarta.persistence.*;

@Entity
@Table(name="staff")
public class Staff {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, unique=true) private String employeeNumber;
    @Column(nullable=false) private String firstName;
    @Column(nullable=false) private String lastName;
    @Column(nullable=false) private String department;
    @Column(nullable=false) private String designation;
    @Column(nullable=false) private boolean active=true;

    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getEmployeeNumber(){return employeeNumber;} public void setEmployeeNumber(String employeeNumber){this.employeeNumber=employeeNumber;}
    public String getFirstName(){return firstName;} public void setFirstName(String firstName){this.firstName=firstName;}
    public String getLastName(){return lastName;} public void setLastName(String lastName){this.lastName=lastName;}
    public String getDepartment(){return department;} public void setDepartment(String department){this.department=department;}
    public String getDesignation(){return designation;} public void setDesignation(String designation){this.designation=designation;}
    public boolean isActive(){return active;} public void setActive(boolean active){this.active=active;}
}
