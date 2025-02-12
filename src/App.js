import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './pages/homepage';
import Mainlayout from './layouts/mainlayout';
import Loginpage from './pages/loginpage';
import Registerpage from './pages/registerpage';
import SAdminDashboard from './pages/sadmindaskboard';
import AdminDashboard from './pages/admindashboard';
import UserDashboard from './pages/practiceuserdashboard';
import Dashboard from './pages/dashboard';
import PrivateRoute from './utils/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import Unauth from './pages/404unauth';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Mainlayout />}>
            <Route path='/' element={<Homepage />} />
            {/* <Route path='/dashboard-sa' element={<PrivateRoute><SAdminDashboard /></PrivateRoute>} />
            <Route path='/dashboard-a' element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path='/dashboard-pu' element={<PrivateRoute><UserDashboard /></PrivateRoute>} /> */}
            <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          </Route>
          <Route path='/unauth' element={<Unauth />} />
          <Route path='/login' element={<Loginpage />} />
          <Route path='/register' element={<Registerpage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


// import './App.css';
// import { BrowserRouter, Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
// import Homepage from './pages/homepage';
// import Mainlayout from './layouts/mainlayout';
// import Loginpage from './pages/loginpage';
// import Registerpage from './pages/registerpage';
// import SAdminDashboard from './pages/sadmindaskboard';
// import AdminDashboard from './pages/admindashboard';
// import UserDashboard from './pages/practiceuserdashboard';
// import PrivateRoute from './utils/PrivateRoute';
// import { AuthProvider } from './context/AuthContext';

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <>
//       <Route path='/' element={<Mainlayout />}>
//         <Route path='/' element={<Homepage />} />
//         <Route path='/dashboard-sa' element={<PrivateRoute><SAdminDashboard /></PrivateRoute>} />
//         <Route path='/dashboard-a' element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
//         <Route path='/dashboard-pu' element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
//       </Route>
//       <Route path='/login' element={<Loginpage />} />
//       <Route path='/register' element={<Registerpage />} />
//     </>
//   )
// )

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <RouterProvider router={router} />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;


