import express from "express";
import { 
    createEmployee, 
    getEmployees, 
    getEmployeeById, 
    updateEmployee, 
    deleteEmployee, 
    employeeLogin 
} from "../controllers/employee.controller.js";
import isAdminAuthenticated from "../middlewares/isAdminAuthenticated.js";

const router = express.Router();

// Employee login (public route)
router.route('/login').post(employeeLogin);

// Protected admin routes
router.route('/').post(isAdminAuthenticated, createEmployee);
router.route('/').get(isAdminAuthenticated, getEmployees);
router.route('/:id').get(isAdminAuthenticated, getEmployeeById);
router.route('/:id').put(isAdminAuthenticated, updateEmployee);
router.route('/:id').delete(isAdminAuthenticated, deleteEmployee);

export default router;
