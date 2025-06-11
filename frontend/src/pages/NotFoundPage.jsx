


const NotFoundPage = () => {
  return (
    <div className='max-w-md w-full bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'>
        <div className="p-8">
            <h1 className='text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
                404 - Page Not Found
            </h1>
            <p className='text-gray-300 mb-6 text-center'>Sorry, the page you are looking for does not exist.</p>
        </div>
    </div>
  );
};

export default NotFoundPage;