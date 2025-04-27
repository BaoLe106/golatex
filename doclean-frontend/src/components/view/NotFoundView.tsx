const NotFoundView: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[36rem] text-2xl text-red-500">
      Page not found!
      <a href="/">
        <h1 className="text-lg text-black dark:text-white hover:underline ">
          Go to main page
        </h1>
      </a>
    </div>
  );
};

export default NotFoundView;
