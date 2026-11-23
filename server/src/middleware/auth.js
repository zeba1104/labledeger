import jwt from 'jsonwebtoken';
import { getCollection } from '../models/dbAdapter.js';

const JWT_SECRET = process.env.JWT_SECRET || 'labledger_clinical_secret_key_2026_super_secure';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = getCollection('users');
    const user = users.find(u => u._id === decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User account not found or deactivated.' });
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // Admin, Researcher, Technician, Viewer
      department: user.department
    };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

// Role restriction middleware: rolesAllowed is an array of roles that CAN perform the action
export function authorizeRoles(...rolesAllowed) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!rolesAllowed.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not authorized to perform this operation.`
      });
    }

    next();
  };
}

// Viewer restriction helper (ensures Viewers can only perform GET read actions)
export function forbidViewer(req, res, next) {
  if (req.user && req.user.role === 'Viewer') {
    return res.status(403).json({
      message: 'Access denied. Viewer/Auditor role is strictly read-only and cannot create, modify, or delete data.'
    });
  }
  next();
}
