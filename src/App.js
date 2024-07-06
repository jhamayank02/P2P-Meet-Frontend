import { Routes, Route, HashRouter } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import './App.css';
import Register from './pages/Register';
import Homepage from './pages/Homepage';
import NavBar from './components/NavBar';
import NewMeetingForm from './pages/NewMeetingForm';
import Meeting from './pages/Meeting';
import Home from './components/Home';
import { SocketProvider } from './context/SocketContextProvider';

function App() {
  return (
    <div className="App">
      <ToastContainer />
      <HashRouter>
        <Routes>
          <Route exact path='/' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/home' element={<Home />}>
            <Route index element={<Homepage />} />
            <Route path='new-meeting' element={<NewMeetingForm />} />
          </Route>
          <Route path='/join-meeting' element={<SocketProvider><Meeting /></SocketProvider>} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
