import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'

const Home = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500'>
      <Navbar />
      <Header />
    </div>
  );
}

export default Home
