import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeUser } from './reducers/userSlice';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Home from './pages/Home';
import Header from './components/Header';
import DonorForm from './pages/Donate';
import AvailableFoodList from './pages/Avl';
import Fooddetails from './pages/Fooddetails';
import Addfood from './pages/Addfood';
import Managefood from './pages/Managefood';
import UpdateProfile from './pages/UpdateProfile';
import MyRequests from './pages/MyRequests';
import AddNonFood from './pages/AddNonFood';
import AvailableNonFood from './pages/AvailableNonFood';
import NonFoodDetails from './pages/NonFoodDetails';
import MyNonFoodRequests from './pages/MyNonFoodRequests';
// import About from './pages/About';
import UserProfile from './pages/UserProfile';
import ManageNonFood from './pages/ManageNonFood';
import Chats from './pages/Chats';
import OAuthCallback from './pages/OAuthCallback';
import Private from './components/Private';
import Analytics from './pages/Analytics';


const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeUser());
  }, [dispatch]);

  return (
    <>
      <div className='mb-16'>
        <Header/>
      </div>
      <Routes>
        {/* Public Routes */}
        <Route path='/signup' element={<Signup />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/oauth/callback' element={<OAuthCallback />} />
        <Route path='/' element={<Home />} />
        {/* <Route path='/about' element={<About />} /> */}

        {/* Protected Routes */}
        <Route path='/analytics' element={
          <Private>
            <Analytics />
          </Private>
        } />
        <Route path='/avl' element={
          <Private>
            <AvailableFoodList />
          </Private>
        } />
        <Route path='/avlnf' element={
          <Private>
            <AvailableNonFood />
          </Private>
        } />
        <Route path='/donate' element={
          <Private>
            <DonorForm />
          </Private>
        } />
        <Route path='/food-details/:id' element={
          <Private>
            <Fooddetails />
          </Private>
        } />
        <Route path='/nonfood-details/:id' element={
          <Private>
            <NonFoodDetails />
          </Private>
        } />
        <Route path='/addfood' element={
          <Private>
            <Addfood />
          </Private>
        } />
        <Route path='/addnonfood' element={
          <Private>
            <AddNonFood />
          </Private>
        } />
        <Route path='/managefood' element={
          <Private>
            <Managefood />
          </Private>
        } />
        <Route path='/userprofile' element={
          <Private>
            <UserProfile />
          </Private>
        } />
        <Route path='/managenonfood' element={
          <Private>
            <ManageNonFood />
          </Private>
        } />
        <Route path='/update-profile' element={
          <Private>
            <UpdateProfile/>
          </Private>
        } />
        <Route path='/myrequests/:userId' element={
          <Private>
            <MyRequests/>
          </Private>
        } />
        <Route path='/requests-nonfood/:userId' element={
          <Private>
            <MyNonFoodRequests/>
          </Private>
        } />
        <Route path='/chats' element={
          <Private>
            <Chats />
          </Private>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;