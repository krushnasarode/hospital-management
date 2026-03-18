const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Patient = require('../models/Patient');
const Department = require('../models/Department');
const Room = require('../models/Room');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');
const LabTest = require('../models/LabTest');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany(), Patient.deleteMany(), Department.deleteMany(),
      Room.deleteMany(), Appointment.deleteMany(), Bill.deleteMany(),
      Medicine.deleteMany(), LabTest.deleteMany(),
    ]);
    console.log('Cleared existing data');

    // --- Departments ---
    const departments = await Department.insertMany([
      { name: 'Cardiology', description: 'Heart and vascular diseases', location: 'Block A, Floor 2', phone: '111-001' },
      { name: 'Neurology', description: 'Brain and nervous system', location: 'Block B, Floor 3', phone: '111-002' },
      { name: 'Orthopedics', description: 'Bones, joints and muscles', location: 'Block C, Floor 1', phone: '111-003' },
      { name: 'Pediatrics', description: 'Children healthcare', location: 'Block D, Floor 1', phone: '111-004' },
      { name: 'Emergency', description: 'Emergency and trauma care', location: 'Block A, Floor 0', phone: '911' },
      { name: 'Radiology', description: 'Imaging and diagnostics', location: 'Block B, Floor 1', phone: '111-006' },
    ]);
    console.log('Departments seeded');

    // --- Users ---
    const admin = await User.create({ name: 'Dr. Admin', email: 'admin@hospital.com', password: 'admin123', role: 'Admin', phone: '9000000001', gender: 'Male' });
    const doctors = await User.insertMany([
      { name: 'Dr. Sarah Johnson', email: 'dr.sarah@hospital.com', password: 'doctor123', role: 'Doctor', phone: '9000000002', specialization: 'Cardiologist', department: departments[0]._id, gender: 'Female' },
      { name: 'Dr. Michael Chen', email: 'dr.chen@hospital.com', password: 'doctor123', role: 'Doctor', phone: '9000000003', specialization: 'Neurologist', department: departments[1]._id, gender: 'Male' },
      { name: 'Dr. Emma Wilson', email: 'dr.emma@hospital.com', password: 'doctor123', role: 'Doctor', phone: '9000000004', specialization: 'Orthopedic Surgeon', department: departments[2]._id, gender: 'Female' },
      { name: 'Dr. James Patel', email: 'dr.patel@hospital.com', password: 'doctor123', role: 'Doctor', phone: '9000000005', specialization: 'Pediatrician', department: departments[3]._id, gender: 'Male' },
    ]);
    await User.insertMany([
      { name: 'Nurse Alice Brown', email: 'nurse.alice@hospital.com', password: 'nurse123', role: 'Nurse', phone: '9000000006', department: departments[0]._id, gender: 'Female' },
      { name: 'John Receptionist', email: 'reception@hospital.com', password: 'reception123', role: 'Receptionist', phone: '9000000007', gender: 'Male' },
      { name: 'Mary Pharmacist', email: 'pharmacy@hospital.com', password: 'pharma123', role: 'Pharmacist', phone: '9000000008', gender: 'Female' },
      { name: 'Lab Tech Kevin', email: 'lab@hospital.com', password: 'lab123', role: 'LabTechnician', phone: '9000000009', gender: 'Male' },
    ]);
    // Update department heads
    await Department.findByIdAndUpdate(departments[0]._id, { head: doctors[0]._id });
    await Department.findByIdAndUpdate(departments[1]._id, { head: doctors[1]._id });
    console.log('Users seeded');

    // --- Rooms ---
    const rooms = await Room.insertMany([
      { roomNumber: '101', type: 'General', department: departments[0]._id, floor: 1, capacity: 4, pricePerDay: 1500, status: 'Available', facilities: ['TV', 'AC'] },
      { roomNumber: '102', type: 'Private', department: departments[0]._id, floor: 1, capacity: 1, pricePerDay: 5000, status: 'Available', facilities: ['TV', 'AC', 'Sofa', 'Refrigerator'] },
      { roomNumber: '201', type: 'ICU', department: departments[4]._id, floor: 2, capacity: 2, pricePerDay: 15000, status: 'Available', facilities: ['Ventilator', 'Monitor', '24h Nursing'] },
      { roomNumber: '202', type: 'ICU', department: departments[4]._id, floor: 2, capacity: 2, pricePerDay: 15000, status: 'Occupied', facilities: ['Ventilator', 'Monitor', '24h Nursing'] },
      { roomNumber: '301', type: 'General', department: departments[2]._id, floor: 3, capacity: 6, pricePerDay: 1200, status: 'Available' },
      { roomNumber: 'OT-1', type: 'Operation Theatre', department: departments[2]._id, floor: 1, capacity: 1, pricePerDay: 25000, status: 'Available', facilities: ['Surgical lights', 'Anesthesia machine'] },
    ]);
    console.log('Rooms seeded');

    // --- Patients (Sequential to avoid PID race condition) ---
    const patientData = [
      { firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.k@email.com', phone: '8000000001', dateOfBirth: new Date('1980-05-15'), gender: 'Male', bloodGroup: 'B+', address: { street: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' }, assignedDoctor: doctors[0]._id, status: 'Active', medicalHistory: ['Hypertension', 'Diabetes Type 2'], allergies: ['Penicillin'] },
      { firstName: 'Priya', lastName: 'Sharma', email: 'priya.s@email.com', phone: '8000000002', dateOfBirth: new Date('1992-08-22'), gender: 'Female', bloodGroup: 'A+', address: { street: '456 Link Road', city: 'Delhi', state: 'Delhi', zipCode: '110001' }, assignedDoctor: doctors[1]._id, status: 'Active', medicalHistory: ['Migraine'] },
      { firstName: 'Amit', lastName: 'Patel', email: 'amit.p@email.com', phone: '8000000003', dateOfBirth: new Date('1975-12-10'), gender: 'Male', bloodGroup: 'O+', assignedDoctor: doctors[2]._id, status: 'Active', isAdmitted: true, admissionDate: new Date(), room: rooms[0]._id, medicalHistory: ['Knee replacement history'] },
      { firstName: 'Sunita', lastName: 'Reddy', email: 'sunita.r@email.com', phone: '8000000004', dateOfBirth: new Date('1968-03-30'), gender: 'Female', bloodGroup: 'AB+', assignedDoctor: doctors[0]._id, status: 'Active', medicalHistory: ['Coronary artery disease'] },
      { firstName: 'Vikram', lastName: 'Singh', phone: '8000000005', dateOfBirth: new Date('2010-07-20'), gender: 'Male', bloodGroup: 'A-', assignedDoctor: doctors[3]._id, status: 'Active', medicalHistory: ['Asthma'] },
      { firstName: 'Meera', lastName: 'Nair', email: 'meera.n@email.com', phone: '8000000006', dateOfBirth: new Date('1955-11-05'), gender: 'Female', bloodGroup: 'O-', assignedDoctor: doctors[1]._id, status: 'Critical', isAdmitted: true, admissionDate: new Date(), room: rooms[2]._id, medicalHistory: ['Stroke', 'Parkinson\'s Disease'] },
      { firstName: 'Arjun', lastName: 'Mehta', phone: '8000000007', dateOfBirth: new Date('1988-09-14'), gender: 'Male', bloodGroup: 'B-', assignedDoctor: doctors[2]._id, status: 'Active' },
      { firstName: 'Kavya', lastName: 'Iyer', email: 'kavya.i@email.com', phone: '8000000008', dateOfBirth: new Date('1995-04-25'), gender: 'Female', bloodGroup: 'A+', assignedDoctor: doctors[0]._id, status: 'Discharged', dischargeDate: new Date() },
    ];
    const patients = [];
    for (const p of patientData) {
      patients.push(await Patient.create(p));
    }
    console.log('Patients seeded');

    // --- Appointments ---
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const appointments = await Appointment.insertMany([
      { patient: patients[0]._id, doctor: doctors[0]._id, department: departments[0]._id, date: today, time: '09:00', status: 'Scheduled', type: 'Follow-up', reason: 'Blood pressure checkup', bookedBy: admin._id },
      { patient: patients[1]._id, doctor: doctors[1]._id, department: departments[1]._id, date: today, time: '10:30', status: 'In Progress', type: 'General', reason: 'Severe headache', bookedBy: admin._id },
      { patient: patients[2]._id, doctor: doctors[2]._id, department: departments[2]._id, date: today, time: '11:00', status: 'Completed', type: 'Follow-up', reason: 'Post-surgery checkup', bookedBy: admin._id },
      { patient: patients[3]._id, doctor: doctors[0]._id, department: departments[0]._id, date: tomorrow, time: '09:30', status: 'Confirmed', type: 'Consultation', reason: 'Chest pain consultation', bookedBy: admin._id },
      { patient: patients[4]._id, doctor: doctors[3]._id, department: departments[3]._id, date: tomorrow, time: '14:00', status: 'Scheduled', type: 'General', reason: 'Asthma management', bookedBy: admin._id },
      { patient: patients[6]._id, doctor: doctors[2]._id, department: departments[2]._id, date: yesterday, time: '10:00', status: 'Completed', type: 'General', reason: 'Back pain', bookedBy: admin._id },
      { patient: patients[7]._id, doctor: doctors[0]._id, department: departments[0]._id, date: yesterday, time: '15:00', status: 'Cancelled', type: 'Follow-up', reason: 'Cardiac follow-up', bookedBy: admin._id },
    ]);
    console.log('Appointments seeded');

    // --- Bills (Sequential to avoid INV race condition) ---
    const billData = [
      { patient: patients[0]._id, appointment: appointments[2]._id, items: [{ description: 'Consultation Fee', quantity: 1, unitPrice: 1500 }, { description: 'ECG', quantity: 1, unitPrice: 800 }], subtotal: 2300, tax: 230, totalAmount: 2530, status: 'Paid', paymentMethod: 'Card', paidAt: new Date(), createdBy: admin._id },
      { patient: patients[1]._id, items: [{ description: 'Consultation Fee', quantity: 1, unitPrice: 1200 }, { description: 'MRI Scan', quantity: 1, unitPrice: 8000 }], subtotal: 9200, tax: 920, totalAmount: 10120, status: 'Pending', createdBy: admin._id },
      { patient: patients[2]._id, items: [{ description: 'Surgery Fee', quantity: 1, unitPrice: 50000 }, { description: 'Room Charges (5 days)', quantity: 5, unitPrice: 1500 }, { description: 'Medicines', quantity: 1, unitPrice: 3500 }], subtotal: 61000, tax: 3050, totalAmount: 64050, status: 'Partially Paid', createdBy: admin._id },
      { patient: patients[6]._id, items: [{ description: 'X-Ray', quantity: 1, unitPrice: 600 }, { description: 'Consultation Fee', quantity: 1, unitPrice: 800 }], subtotal: 1400, tax: 0, totalAmount: 1400, status: 'Paid', paymentMethod: 'Cash', paidAt: yesterday, createdBy: admin._id },
      { patient: patients[3]._id, items: [{ description: 'Echocardiogram', quantity: 1, unitPrice: 3500 }, { description: 'Consultation', quantity: 1, unitPrice: 1500 }], subtotal: 5000, tax: 250, totalAmount: 5250, status: 'Pending', createdBy: admin._id },
    ];
    for (const b of billData) {
      await Bill.create(b);
    }
    console.log('Bills seeded');

    // --- Medicines ---
    await Medicine.insertMany([
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Tablet', manufacturer: 'GSK', stock: 500, unit: 'strips', price: 15, expiryDate: new Date('2026-12-31'), reorderLevel: 50 },
      { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Capsule', manufacturer: 'Cipla', stock: 200, unit: 'strips', price: 85, expiryDate: new Date('2026-06-30'), reorderLevel: 30 },
      { name: 'Aspirin 75mg', genericName: 'Acetylsalicylic Acid', category: 'Tablet', manufacturer: 'Bayer', stock: 8, unit: 'strips', price: 25, expiryDate: new Date('2026-09-30'), reorderLevel: 20 },
      { name: 'Insulin Glargine', genericName: 'Insulin', category: 'Injection', manufacturer: 'Sanofi', stock: 50, unit: 'vials', price: 850, expiryDate: new Date('2025-12-31'), reorderLevel: 10 },
      { name: 'Salbutamol Inhaler', genericName: 'Albuterol', category: 'Other', manufacturer: 'AstraZeneca', stock: 5, unit: 'pieces', price: 120, expiryDate: new Date('2026-03-31'), reorderLevel: 10 },
      { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', category: 'Tablet', manufacturer: 'Pfizer', stock: 300, unit: 'strips', price: 45, expiryDate: new Date('2027-01-31'), reorderLevel: 30 },
      { name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Tablet', manufacturer: 'Sun Pharma', stock: 450, unit: 'strips', price: 28, expiryDate: new Date('2027-03-31'), reorderLevel: 50 },
      { name: 'Ondansetron 4mg', genericName: 'Ondansetron', category: 'Tablet', manufacturer: 'Cipla', stock: 12, unit: 'strips', price: 65, expiryDate: new Date('2026-08-31'), reorderLevel: 20 },
    ]);
    console.log('Medicines seeded');

    // --- Lab Tests ---
    await LabTest.insertMany([
      { patient: patients[0]._id, orderedBy: doctors[0]._id, testName: 'Complete Blood Count', category: 'Blood', status: 'Completed', result: 'Normal', normalRange: 'WBC: 4-11K, RBC: 4.5-5.5M, Hb: 12-17g/dL', unit: 'cells/µL', price: 350, completedAt: yesterday },
      { patient: patients[1]._id, orderedBy: doctors[1]._id, testName: 'MRI Brain', category: 'Imaging', status: 'Pending', price: 6000 },
      { patient: patients[2]._id, orderedBy: doctors[2]._id, testName: 'X-Ray Knee', category: 'Imaging', status: 'Completed', result: 'Mild osteoarthritis observed', price: 400, completedAt: yesterday },
      { patient: patients[3]._id, orderedBy: doctors[0]._id, testName: 'Lipid Profile', category: 'Blood', status: 'In Progress', price: 600 },
      { patient: patients[5]._id, orderedBy: doctors[1]._id, testName: 'EEG', category: 'Other', status: 'Pending', price: 1500 },
      { patient: patients[4]._id, orderedBy: doctors[3]._id, testName: 'Pulmonary Function Test', category: 'Other', status: 'Pending', price: 800 },
    ]);
    console.log('Lab Tests seeded');

    console.log('\n✅ Seed complete! Use these credentials:');
    console.log('   Admin    → admin@hospital.com    / admin123');
    console.log('   Doctor   → dr.sarah@hospital.com / doctor123');
    console.log('   Nurse    → nurse.alice@hospital.com / nurse123');
    console.log('   Reception→ reception@hospital.com / reception123');
    console.log('   Pharmacy → pharmacy@hospital.com / pharma123');
    console.log('   Lab Tech → lab@hospital.com       / lab123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    if (err.errors) {
      Object.keys(err.errors).forEach(key => {
        console.error(`- ${key}: ${err.errors[key].message}`);
      });
    }
    process.exit(1);
  }
};

seed();
