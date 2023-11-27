import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider} from 'react-router-dom'
import store from './store'
import { Provider } from 'react-redux'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import PrivateRoute from './components/PrivateRoute.jsx'
import HomeScreen from './screens/HomeScreen.jsx'
import RegisterScreen from './screens/RegisterScreen.jsx'
import ProfileScreen from './screens/ProfileScreen.jsx'
import RequestScreen from './screens/RequestScreen'
import EventScreen from './screens/EventScreen'
import OAuthScreen from './screens/OAuthScreen'
import RequestQueueScreen from './screens/RequestQueueScreen'
import LogoutScreen from './screens/LogoutScreen.jsx'

{/* ALL ROUTES LIVES HERE */}
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path = '/' element= {<App />}>
      <Route path = '/' element={<HomeScreen />} index={true}/>
      <Route path = '/*' element={<HomeScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      <Route path='/oauth' element={<OAuthScreen />} />
      <Route path='/logout' element={<LogoutScreen />} />
      {/* CONTROLED/PRIVATE routes */}
      <Route path='' element={<PrivateRoute />}>
        <Route path='/profile' element={<ProfileScreen />} />
        <Route path='/request' element={<RequestScreen />} />
        <Route path='/event' element={<EventScreen />} />
        <Route path='/queue' element={<RequestQueueScreen />} />
      </Route>
    </Route>
  ))
  
ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={(store)}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
)
  