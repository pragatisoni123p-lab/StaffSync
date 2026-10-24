import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Plus, Search, Filter, Edit2, Trash2, Power, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

const EmployeeCRUD = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState(null);

  // Modals state
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, employee: null });

  // Add form state
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'Employee',
    department: 'Engineering',
    position: 'Software Engineer',
    salary: 65000,
    phone: '',
    address: '',
  });

  const fetchEmployees = async () => {
    try {
      let query = `?department=${deptFilter}&status=${statusFilter}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(`/employees${query}`);
      if (res.data.success) {
        setEmployees(res.data.employees || []);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [deptFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.post('/employees', newEmp);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Employee "${res.data.employee.name}" added successfully!` });
        setAddModal(false);
        setNewEmp({
          name: '',
          email: '',
          password: 'password123',
          role: 'Employee',
          department: 'Engineering',
          position: 'Software Engineer',
          salary: 65000,
          phone: '',
          address: '',
        });
        fetchEmployees();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to create employee' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const emp = editModal.employee;
      const res = await api.put(`/employees/${emp._id}`, {
        name: emp.name,
        department: emp.department,
        position: emp.position,
        salary: emp.salary,
        status: emp.status,
        role: emp.userId?.role,
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: `Updated record for ${emp.name}!` });
        setEditModal({ isOpen: false, employee: null });
        fetchEmployees();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to update employee' });
    }
  };

  const handleToggleStatus = async (emp) => {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/employees/${emp._id}`, { status: newStatus });
      setMessage({ type: 'success', text: `Employee status changed to ${newStatus}.` });
      fetchEmployees();
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete employee "${name}" and associated login account?`)) return;
    try {
      await api.delete(`/employees/${id}?permanent=true`);
      setMessage({ type: 'success', text: `Employee "${name}" deleted permanently.` });
      fetchEmployees();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={22} style={{ color: '#c084fc' }} /> Employee Directory & Workforce CRUD
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Add, update, deactivate, or manage employee access privileges and records
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddModal(true)}
          className="btn btn-primary"
        >
          <Plus size={16} /> Add New Employee
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: message.type === 'success' ? '#6ee7b7' : '#fca5a5',
          }}
        >
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, or designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748b' }} />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          <div style={{ minWidth: '140px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            Filter
          </button>
        </form>
      </div>

      {/* Employee List Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading directory...</p>
        ) : employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            No employee records match the given filters.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Compensation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{emp.email}</div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td>
                      <span className={`badge ${emp.userId?.role === 'HR' ? 'badge-hr' : emp.userId?.role === 'Manager' ? 'badge-mgr' : 'badge-emp'}`}>
                        {emp.userId?.role || 'Employee'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${emp.status === 'Active' ? 'badge-approved' : 'badge-rejected'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ color: '#34d399' }}>
                      ${(emp.salary || 50000).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setEditModal({ isOpen: true, employee: { ...emp } })}
                          className="btn btn-secondary btn-sm"
                          title="Edit employee record"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(emp)}
                          className="btn btn-secondary btn-sm"
                          title={emp.status === 'Active' ? 'Deactivate employee' : 'Activate employee'}
                          style={{ color: emp.status === 'Active' ? '#f59e0b' : '#10b981' }}
                        >
                          <Power size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(emp._id, emp.name)}
                          className="btn btn-danger btn-sm"
                          title="Delete employee permanently"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {addModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Add New Employee</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
              Create identity credentials and initialize employee record
            </p>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="add-name">Full Name</label>
                <input
                  id="add-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rachel Zane"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="add-email">Email Address</label>
                  <input
                    id="add-email"
                    type="email"
                    className="form-control"
                    placeholder="rachel@company.com"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="add-pass">Default Password</label>
                  <input
                    id="add-pass"
                    type="text"
                    className="form-control"
                    value={newEmp.password}
                    onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="add-role">System Role</label>
                  <select
                    id="add-role"
                    className="form-select"
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="HR">HR Administrator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="add-dept">Department</label>
                  <select
                    id="add-dept"
                    className="form-select"
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="add-pos">Position</label>
                  <input
                    id="add-pos"
                    type="text"
                    className="form-control"
                    value={newEmp.position}
                    onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="add-salary">Annual Salary ($)</label>
                  <input
                    id="add-salary"
                    type="number"
                    className="form-control"
                    value={newEmp.salary}
                    onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Employee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editModal.isOpen && editModal.employee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Edit Employee Profile</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
              Updating records for {editModal.employee.name}
            </p>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-name">Full Name</label>
                <input
                  id="edit-name"
                  type="text"
                  className="form-control"
                  value={editModal.employee.name}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      employee: { ...editModal.employee, name: e.target.value },
                    })
                  }
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-dept">Department</label>
                  <select
                    id="edit-dept"
                    className="form-select"
                    value={editModal.employee.department}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        employee: { ...editModal.employee, department: e.target.value },
                      })
                    }
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-pos">Position</label>
                  <input
                    id="edit-pos"
                    type="text"
                    className="form-control"
                    value={editModal.employee.position}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        employee: { ...editModal.employee, position: e.target.value },
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-salary">Salary ($)</label>
                  <input
                    id="edit-salary"
                    type="number"
                    className="form-control"
                    value={editModal.employee.salary}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        employee: { ...editModal.employee, salary: Number(e.target.value) },
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    className="form-select"
                    value={editModal.employee.status}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        employee: { ...editModal.employee, status: e.target.value },
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, employee: null })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCRUD;
