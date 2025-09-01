import express from "express";
import { 
    createEmployee, 
    getEmployees, 
    getEmployeeById, 
    updateEmployee, 
    deleteEmployee, 
    employeeLogin 
} from "../controllers/employee.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Employee login (public route)
router.route('/login').post(employeeLogin);

// Protected admin routes
router.route('/').post(isAuthenticated, createEmployee);
router.route('/').get(isAuthenticated, getEmployees);
router.route('/:id').get(isAuthenticated, getEmployeeById);
router.route('/:id').put(isAuthenticated, updateEmployee);
router.route('/:id').delete(isAuthenticated, deleteEmployee);

export default router;
