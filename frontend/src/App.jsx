import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ApprovalPage from './pages/admin/ApprovalPage';
import ChildrenPage from './pages/admin/ChildrenPage';
import CaregiversPage from './pages/admin/CaregiversPage';

// Caregiver pages
import CaregiverDashboard from './pages/caregiver/CaregiverDashboard';
import RegisterTime from './pages/caregiver/RegisterTime';
import MyTimeEntries from './pages/caregiver/MyTimeEntries';

export default function App() {
    // Demo: simpel rolle-skift (i produktion ville dette komme fra auth)
    const [userRole, setUserRole] = useState('admin');

    // Demo barnepige ID (i produktion ville dette komme fra auth)
    const caregiverId = 1;

    // Mobilvisning state
    const [isMobileView, setIsMobileView] = useState(false);

    // Anvend mobilvisning klasse på body
    useEffect(() => {
        if (isMobileView) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }, [isMobileView]);

    return (
        <Layout
            userRole={userRole}
            onRoleChange={setUserRole}
            isMobileView={isMobileView}
            onMobileViewChange={setIsMobileView}
        >
            <Routes>
                {/* Root redirect */}
                <Route
                    path="/"
                    element={<Navigate to={userRole === 'admin' ? '/admin' : '/barnepige'} replace />}
                />

                {/* Admin routes */}
                <Route path="/admin" element={<AdminDashboard isMobileView={isMobileView} />} />
                <Route path="/admin/godkendelse" element={<ApprovalPage isMobileView={isMobileView} />} />
                <Route path="/admin/boern" element={<ChildrenPage isMobileView={isMobileView} />} />
                <Route path="/admin/barnepiger" element={<CaregiversPage isMobileView={isMobileView} />} />

                {/* Caregiver routes */}
                <Route path="/barnepige" element={<CaregiverDashboard caregiverId={caregiverId} isMobileView={isMobileView} />} />
                <Route path="/barnepige/registrer" element={<RegisterTime caregiverId={caregiverId} isMobileView={isMobileView} />} />
                <Route path="/barnepige/mine-timer" element={<MyTimeEntries caregiverId={caregiverId} isMobileView={isMobileView} />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}
