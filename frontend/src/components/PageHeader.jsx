function PageHeader({ title, description, actionButton }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>

        <p className="text-gray-500 mt-2">{description}</p>
      </div>

      {actionButton}
    </div>
  );
}

export default PageHeader;
