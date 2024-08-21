import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { GoogleLogin,GoogleOAuthProvider } from '@react-oauth/google';

const Signup = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
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
      const response = await fetch('http://127.0.0.1:8000/account/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error Response:', errorData);
        setError(errorData.message || 'Something went wrong. Please try again.');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Network Error:', error);
      setError('Network error occurred. Please try again.');
    }
  };
  const handleGoogleLoginSuccess = (response) => {
    console.log('Google login successful:', response);
    navigate('/login')
    // You can send the response to your backend for further processing
    // navigate('/some-route'); // Redirect after successful login
  }
  
  

  const handleGoogleLoginFailure = (error) => {
    console.error('Google login failed:', error);
    setError('Google login failed. Please try again.');
  };

  return (
    <>
      <div className="main flex justify-center items-center h-screen">
        <form onSubmit={handleSubmit} className="form flex flex-col gap-2 bg-white p-6 w-full max-w-md rounded-2xl font-sans">
          {/* First Name Input */}
          <div className="flex flex-col">
            <label className="text-gray-800 font-semibold">First Name</label>
            <div className="inputForm flex items-center px-3 border border-gray-200 rounded-lg h-12 transition-colors duration-200">
              <input 
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="input ml-3 w-full h-full border-none focus:outline-none" 
                placeholder="Enter your First Name" />
            </div>
          </div>

          {/* Last Name Input */}
          <div className="flex flex-col">
            <label className="text-gray-800 font-semibold">Last Name</label>
            <div className="inputForm flex items-center px-3 border border-gray-200 rounded-lg h-12 transition-colors duration-200">
              <input 
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="input ml-3 w-full h-full border-none focus:outline-none" 
                placeholder="Enter your Last Name" />
            </div>
          </div>

          {/* Email Input */}
          <div className="flex flex-col">
            <label className="text-gray-800 font-semibold">Email</label>
            <div className="inputForm flex items-center px-3 border border-gray-200 rounded-lg h-12 transition-colors duration-200">
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input ml-3 w-full h-full border-none focus:outline-none" 
                placeholder="Enter your Email" />
            </div>
          </div>

          {/* Username Input */}
          <div className="flex flex-col">
            <label className="text-gray-800 font-semibold">Username</label>
            <div className="inputForm flex items-center px-3 border border-gray-200 rounded-lg h-12 transition-colors duration-200">
              <input 
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange} 
                className="input ml-3 w-full h-full border-none focus:outline-none" 
                placeholder="Enter your Username" />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <label className="text-gray-800 font-semibold">Password</label>
            <div className="inputForm flex items-center px-3 border border-gray-200 rounded-lg h-12 transition-colors duration-200">
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input ml-3 w-full h-full border-none focus:outline-none"
                placeholder="Enter your Password" />
            </div>
          </div>

          {/* Submit Button */}
          <button className="button-submit bg-gray-800 text-white font-medium rounded-lg h-12 w-full hover:bg-gray-700 transition-colors duration-200">Sign Up</button>
          
          {/* Sign In Link */}
          <p className="text-center text-gray-700 text-sm">
            Already have an account?{' '}
            <Link to="/login"><span className="text-blue-500 font-medium cursor-pointer">Sign In</span></Link>
          </p>
          
          {/* Google Sign In */}
          <p className="text-center text-gray-700 text-sm">Or With</p>
          <div className="flex flex-col gap-3">
          <GoogleOAuthProvider               clientId="947102050275-qg1hr23jg9ada00jj22gce3e05o5stmk.apps.googleusercontent.com"
          >

            <GoogleLogin

              clientId="947102050275-qg1hr23jg9ada00jj22gce3e05o5stmk.apps.googleusercontent.com"
              buttonText="Login with Google"
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

export default Signup;
