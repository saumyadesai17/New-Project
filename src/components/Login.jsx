import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
        const response = await fetch('http://127.0.0.1:8000/account/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: formData.username.trim(),
                password: formData.password,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.data.access);
            localStorage.setItem('username', data.data.username);
            navigate('/chatbot'); // Redirect after successful login
        } else {
            const data = await response.json();
            console.log(data); // Log the error response for debugging
            setError(data.message || 'Something went wrong. Please try again.');
        }
    } catch (error) {
        setError('Failed to connect to the server. Please try again later.');
    }
};



  const handleGoogleLoginSuccess = () => {
    const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  
    const scope = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');
  
    const params = {
      response_type: 'code',
      client_id: '947102050275-qg1hr23jg9ada00jj22gce3e05o5stmk.apps.googleusercontent.com',
      redirect_uri: 'http://127.0.0.1:8000/account/login/google/',
      prompt: 'select_account',
      access_type: 'offline',
      scope
    };
  
    const urlParams = new URLSearchParams(params).toString();
    window.location = `${GOOGLE_AUTH_URL}?${urlParams}`;
  };
  

  const handleGoogleLoginFailure = (error) => {
    console.error('Google login failed:', error);
    setError('Google login failed. Please try again.');
  };

  return (
    <>
      <div className="main flex justify-center items-center h-screen">
        <form onSubmit={handleSubmit} className="form flex flex-col gap-4 bg-white p-8 w-full max-w-md rounded-2xl font-sans">
          <div className="flex flex-col">
            <label className="text-gray-800 font-semibold">Username</label>
            <div className="inputForm flex items-center px-3 border border-gray-200 rounded-lg h-12 transition-colors duration-200">
              <svg className="w-5 h-5" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <g id="Layer_3">
                  <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
                </g>
              </svg>
              <input 
                name="username"
                value={formData.username}
                onChange={handleChange}
                type="text" 
                className="input ml-3 w-full h-full border-none focus:outline-none" 
                placeholder="Enter your Username" 
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-800 font-semibold">Password</label>
            <div className="inputForm flex items-center px-3 border border-gray-200 rounded-lg h-12 transition-colors duration-200">
              <svg className="w-5 h-5" viewBox="-64 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
                <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
              </svg>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input ml-3 w-full h-full border-none focus:outline-none" 
                placeholder="Enter your Password" 
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500" />
              <label className="text-gray-700 text-sm font-medium">Remember me</label>
            </div>
            <span className="text-blue-500 text-sm font-medium cursor-pointer">Forgot password?</span>
          </div>

          <button className="button-submit bg-gray-800 text-white font-medium rounded-lg h-12 w-full hover:bg-gray-700 transition-colors duration-200">Sign In</button>
          <p className="text-center text-gray-700 text-sm">
            Don't have an account?{' '}
            <Link to="/signup"><span className="text-blue-500 font-medium cursor-pointer">Sign Up</span></Link>
          </p>

          <p className="text-center text-gray-700 text-sm">Or With</p>

          <div className="flex flex-col gap-3">
            <GoogleOAuthProvider clientId="947102050275-qg1hr23jg9ada00jj22gce3e05o5stmk.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onFailure={handleGoogleLoginFailure}
                cookiePolicy={'single_host_origin'}
                className="btn flex justify-center items-center gap-2 border border-gray-200 rounded-lg h-12 w-full hover:border-blue-500 transition-colors duration-200"
              />
            </GoogleOAuthProvider>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
