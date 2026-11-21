package com.ims.library;

import jakarta.persistence.*;

@Entity
@Table(name = "library_books")
public class Book {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false) private String title;
    @Column(nullable=false) private String author;
    @Column(nullable=false, unique=true) private String isbn;
    @Column(nullable=false) private int totalCopies;
    @Column(nullable=false) private int availableCopies;
    @Column(nullable=false) private boolean active = true;

    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getTitle(){return title;} public void setTitle(String title){this.title=title;}
    public String getAuthor(){return author;} public void setAuthor(String author){this.author=author;}
    public String getIsbn(){return isbn;} public void setIsbn(String isbn){this.isbn=isbn;}
    public int getTotalCopies(){return totalCopies;} public void setTotalCopies(int totalCopies){this.totalCopies=totalCopies;}
    public int getAvailableCopies(){return availableCopies;} public void setAvailableCopies(int availableCopies){this.availableCopies=availableCopies;}
    public boolean isActive(){return active;} public void setActive(boolean active){this.active=active;}
}
