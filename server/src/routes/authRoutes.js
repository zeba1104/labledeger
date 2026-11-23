import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection, updateCollection } from '../models/dbAdapter.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';
import { sendWelcomeCredentialsMail } from '../services/mailService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'labledger_clinical_secret_key_2026_super_secure';

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const users = getCollection('users');
  const targetEmail = email.trim().toLowerCase();
  const user = users.find(u => {
    const userEmail = u.email.toLowerCase();
    if (userEmail === targetEmail) return true;
    // Support dot-insensitive matching for Gmail addresses (e.g. zeba.zaveri57@gmail.com and zebazaveri57@gmail.com)
    if (targetEmail.includes('@gmail.com') && userEmail.includes('@gmail.com')) {
      return targetEmail.replace(/\./g, '') === userEmail.replace(/\./g, '');
    }
    return false;
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials. User not found.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password. Please check your credentials.' });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  logAudit({
    action: 'LOGIN',
    performedBy: user.name,
    performedRole: user.role,
    entityType: 'User',
    entityId: user._id,
    details: `${user.name} (${user.role}) logged into LabLedger`,
    ip: req.ip
  });

  res.json({
    message: 'Login successful',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    }
  });
});


// Register new team member (ADMIN ONLY - PI/Lab Owner assigns Researcher, Technician, or Viewer)
router.post('/register', authenticate, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Scientist name and email address are required.' });
    }

    const users = getCollection('users');
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: `A user with email ${email} is already registered in LabLedger.` });
    }

    const validRoles = ['Admin', 'Researcher', 'Technician', 'Viewer'];
    const userRole = validRoles.includes(role) ? role : 'Researcher';

    // Use provided password or generate secure temporary password
    const rawPassword = password && password.trim().length >= 6 
      ? password.trim() 
      : 'BioLab@' + Math.floor(1000 + Math.random() * 9000);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const newUser = {
      _id: 'USR-' + Date.now().toString(36).toUpperCase(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
      department: department ? department.trim() : 'Laboratory Team',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    updateCollection('users', users);

    // Dispatch Welcome Credentials Email to the newly created user!
    let mailResult = { success: false };
    try {
      mailResult = await sendWelcomeCredentialsMail({
        to: newUser.email,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
        password: rawPassword,
        registeredBy: req.user.name
      });
    } catch (mailErr) {
      console.warn('Mail dispatch caught warning:', mailErr.message);
    }

    // Log in immutable audit trail
    logAudit({
      action: 'REGISTER_USER',
      performedBy: req.user.name,
      performedRole: req.user.role,
      entityType: 'User',
      entityId: newUser._id,
      details: `Admin ${req.user.name} registered new ${userRole} ${newUser.name} (${newUser.email}) and dispatched onboarding credentials email`,
      newData: { name: newUser.name, email: newUser.email, role: userRole, department: newUser.department, emailSent: mailResult.success },
      ip: req.ip
    });

    res.status(201).json({
      message: `Team member ${newUser.name} (${userRole}) registered successfully. Onboarding email dispatched to ${newUser.email}.`,
      mailStatus: mailResult,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        tempPasswordProvided: rawPassword
      }
    });
  } catch (err) {
    console.error('Registration handler fatal error:', err);
    res.status(500).json({ message: 'Internal server error registering team member: ' + err.message });
  }
});

// Get current profile
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// List team users
router.get('/users', authenticate, (req, res) => {
  const users = getCollection('users');
  const safeUsers = users.map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    createdAt: u.createdAt
  }));
  res.json(safeUsers);
});

// Update user role (Admin only)
router.put('/users/:id/role', authenticate, authorizeRoles('Admin'), (req, res) => {
  const { role } = req.body;
  const validRoles = ['Admin', 'Researcher', 'Technician', 'Viewer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  const users = getCollection('users');
  const user = users.find(u => u._id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const oldRole = user.role;
  user.role = role;
  updateCollection('users', users);

  logAudit({
    action: 'UPDATE_ROLE',
    performedBy: req.user.name,
    performedRole: req.user.role,
    entityType: 'User',
    entityId: user._id,
    details: `${req.user.name} changed role for ${user.name} from ${oldRole} to ${role}`,
    oldData: { role: oldRole },
    newData: { role },
    ip: req.ip
  });

  res.json({ message: 'User role updated successfully', user });
});

export default router;
