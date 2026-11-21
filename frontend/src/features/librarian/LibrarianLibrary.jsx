import React, { useEffect, useState, useMemo } from 'react';
import {
  LibraryBig,
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import tableStyles from '../../styles/DataTable.module.css';

export default function LibrarianLibrary({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('catalogue');
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    totalCopies: 1,
  });

  const loadData = async () => {
    try {
      const [bookRes, issueRes] = await Promise.all([
        apiClient.get('/librarian/books'),
        apiClient.get('/librarian/issues'),
      ]);
      setBooks(bookRes.data || []);
      setIssues(issueRes.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load library catalogue.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiClient]);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/librarian/books', {
        ...form,
        totalCopies: Number(form.totalCopies),
      });
      showToast('Book catalogue entry created.', 'success');
      setForm({ title: '', author: '', isbn: '', totalCopies: 1 });
      setAddBookOpen(false);
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not create book record.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBooks = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) =>
      [b.title, b.author, b.isbn].some((v) => v?.toLowerCase().includes(q))
    );
  }, [books, filter]);

  const totalCopiesCount = useMemo(
    () => books.reduce((sum, b) => sum + Number(b.totalCopies || 0), 0),
    [books]
  );
  const availableCopiesCount = useMemo(
    () => books.reduce((sum, b) => sum + Number(b.availableCopies || 0), 0),
    [books]
  );

  return (
    <div>
      <PageHeader
        eyebrow="Circulation & Resources"
        title="Library Catalogue & Book Issues"
        description="Maintain the institutional book catalogue, register copies, inspect circulation records, and track student loans."
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setAddBookOpen(true)}
        >
          <Plus size={18} />
          <span>Add Book to Catalogue</span>
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatCard
          label="Unique Titles"
          value={books.length}
          icon={LibraryBig}
          color="primary"
          subtext="Catalogued books"
        />
        <StatCard
          label="Total Copies"
          value={totalCopiesCount}
          icon={BookOpen}
          color="info"
          subtext="All library physical copies"
        />
        <StatCard
          label="Available Copies"
          value={availableCopiesCount}
          icon={CheckCircle2}
          color="success"
          subtext="Available on shelves"
        />
        <StatCard
          label="Active Loans / Issues"
          value={issues.length}
          icon={Clock}
          color="warning"
          subtext="Circulation records"
        />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '12px',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          onClick={() => { setActiveTab('catalogue'); setFilter(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'catalogue' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'catalogue' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'catalogue' ? 600 : 500,
            fontSize: '0.88rem',
            border: '1px solid',
            borderColor: activeTab === 'catalogue' ? 'var(--primary)' : 'transparent',
            cursor: 'pointer',
          }}
        >
          <BookOpen size={16} />
          <span>Book Catalogue ({books.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('issues'); setFilter(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'issues' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'issues' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'issues' ? 600 : 500,
            fontSize: '0.88rem',
            border: '1px solid',
            borderColor: activeTab === 'issues' ? 'var(--primary)' : 'transparent',
            cursor: 'pointer',
          }}
        >
          <Clock size={16} />
          <span>Active Issues ({issues.length})</span>
        </button>
      </div>

      <div className={tableStyles.container}>
        <div className={tableStyles.toolbar}>
          <div className={tableStyles.summary}>
            <span className={tableStyles.summaryTitle}>
              {activeTab === 'catalogue' ? 'Book Catalogue Register' : 'Book Circulation & Issues'}
            </span>
            <span className={tableStyles.summaryCount}>
              {activeTab === 'catalogue'
                ? `Showing ${filteredBooks.length} of ${books.length} titles`
                : `${issues.length} active issue records`}
            </span>
          </div>

          {activeTab === 'catalogue' && (
            <div className={tableStyles.searchWrapper}>
              <Search size={16} className={tableStyles.searchIcon} />
              <input
                type="text"
                className={tableStyles.searchInput}
                placeholder="Search by title, author, ISBN..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            {activeTab === 'catalogue' ? (
              <>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Available Copies</th>
                    <th>Total Copies</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          <span>Loading library catalogue...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={tableStyles.emptyState}>
                          <LibraryBig size={36} />
                          <span>{books.length ? 'No titles match your search filter.' : 'No books in catalogue. Click "Add Book" above.'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book) => {
                      const isAvailable = book.availableCopies > 0;
                      return (
                        <tr key={book.id}>
                          <td>
                            <span className={tableStyles.cellPrimary}>{book.title}</span>
                          </td>
                          <td>{book.author}</td>
                          <td>
                            <span className="badge badge-primary">{book.isbn}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: isAvailable ? 'var(--success)' : 'var(--danger)' }}>
                              {book.availableCopies} available
                            </span>
                          </td>
                          <td>{book.totalCopies} copies</td>
                          <td>
                            <StatusBadge status={isAvailable ? 'AVAILABLE' : 'OUT_OF_SERVICE'} label={isAvailable ? 'In Stock' : 'Checked Out'} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th>Issue ID</th>
                    <th>Book</th>
                    <th>Student ID</th>
                    <th>Issued At</th>
                    <th>Due Date</th>
                    <th>Return Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={tableStyles.emptyState}>
                          <Clock size={36} />
                          <span>No book circulation issues recorded.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    issues.map((issue) => (
                      <tr key={issue.id}>
                        <td>#{issue.id}</td>
                        <td>
                          <span className={tableStyles.cellPrimary}>Book #{issue.bookId}</span>
                        </td>
                        <td>Student #{issue.studentId}</td>
                        <td>{issue.issuedAt}</td>
                        <td>{issue.dueAt}</td>
                        <td>
                          <StatusBadge status={issue.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>

      {/* Add Book Modal */}
      <Modal
        isOpen={addBookOpen}
        onClose={() => setAddBookOpen(false)}
        title="Add Book to Library Catalogue"
        maxWidth={500}
      >
        <form onSubmit={handleCreateBook} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Book Title *</label>
            <input
              type="text"
              placeholder="e.g. Introduction to Algorithms, 4th Ed"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Author(s) *</label>
            <input
              type="text"
              placeholder="e.g. Thomas H. Cormen, Charles E. Leiserson"
              value={form.author}
              onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>ISBN Code *</label>
              <input
                type="text"
                placeholder="e.g. 9780262046305"
                value={form.isbn}
                onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Total Physical Copies *</label>
              <input
                type="number"
                min="1"
                value={form.totalCopies}
                onChange={(e) => setForm((p) => ({ ...p, totalCopies: e.target.value }))}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setAddBookOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add to Catalogue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
