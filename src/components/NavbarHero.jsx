// import React from 'react';
import { Link } from 'react-router-dom';

function NavbarHero() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-200/80 to-blue-200/80 font-sans">
        <header className="absolute top-5 left-5 right-5 flex justify-between items-center w-11/12">
          <div className="text-2xl font-bold">hume</div>
          <nav className="flex gap-5">
            <Link to="/products" className="text-black text-lg">Products</Link>
            <Link to="/research" className="text-black text-lg">Research</Link>
            <Link to="/company" className="text-black text-lg">Company</Link>
            <Link to="/docs" className="text-black text-lg">Docs</Link>
          </nav>
          <div className="flex justify-center gap-8">
            <Link to="/login">
              <button className="login bg-[#353535] px-9 py-4 text-white rounded-xl text-lg">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="signup rounded-xl border border-[#353535] px-9 py-4 hover:bg-black hover:text-white transition ease-in delay-200 text-lg">
                Sign Up
              </button>
            </Link>
          </div>
        </header>

        <div className="text-center text-gray-800">
          <h1 className="text-4xl md:text-5xl font-semibold mb-6">Multimodal AI that gives applications EQ</h1>
          <p className="text-lg md:text-xl mb-10">
            Meet the world’s first voice AI that responds empathically, built to align technology with human well-being.
          </p>
          <div className="flex gap-5 justify-center">
            <button className="relative inline-block cursor-pointer text-inherit p-0 bg-transparent w-48 h-auto group">
              <span className="relative block m-0 w-12 h-12 bg-[#282936] rounded-[1.625rem] transition-all duration-[450ms] ease-[cubic-bezier(0.65, 0, 0.076, 1)] group-hover:w-full">
                <span className="absolute top-0 bottom-0 m-auto w-[1.125rem] h-[0.125rem] left-[0.625rem] bg-none">
                  <span className="absolute top-[-0.29rem] right-[0.0625rem] w-[0.625rem] h-[0.625rem] border-t-[0.125rem] border-r-[0.125rem] border-white transform rotate-45 transition-transform duration-[450ms] ease-[cubic-bezier(0.65, 0, 0.076, 1)] group-hover:translate-x-[1rem]"></span>
                </span>
              </span>
              <span className="absolute top-0 left-0 right-0 bottom-0 p-3 m-0 ml-[1.85rem] text-[#282936] font-bold leading-[1.6] text-center uppercase transition-colors duration-[450ms] ease-[cubic-bezier(0.65, 0, 0.076, 1)] group-hover:text-white">
                Learn More
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NavbarHero;
