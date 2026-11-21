package com.ims.controller;

import com.ims.library.Book;
import com.ims.library.BookRepository;
import com.ims.library.BookIssue;
import com.ims.library.BookIssueRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/librarian")
@PreAuthorize("hasRole('LIBRARIAN')")
public class LibrarianController {
    private final BookRepository bookRepository;
    private final BookIssueRepository issueRepository;

    public LibrarianController(BookRepository bookRepository,
                               BookIssueRepository issueRepository) {
        this.bookRepository = bookRepository;
        this.issueRepository = issueRepository;
    }

    @GetMapping("/overview")
    public Map<String, Object> overview() {
        return Map.of(
                "title", "Library Dashboard",
                "summary", "Manage the library catalogue and circulation records.",
                "dataStatus", "Book catalogue and circulation APIs are available."
        );
    }

    @GetMapping("/books")
    public java.util.List<Book> books() {
        return bookRepository.findAll();
    }

    @PostMapping("/books")
    public Book createBook(@RequestBody Book book) {
        if (book.getAvailableCopies() == 0) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        return bookRepository.save(book);
    }

    @GetMapping("/issues")
    public java.util.List<BookIssue> issues() {
        return issueRepository.findAll();
    }
}
