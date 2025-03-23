const Forbidden: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[36rem] text-2xl text-red-500">
      Restricted, sorry you don’t have permission to load this page.
      <a href="/">
        <h1 className="text-lg text-black dark:text-white hover:underline ">
          Go to main page
        </h1>
      </a>
    </div>
  );
};

export default Forbidden;
