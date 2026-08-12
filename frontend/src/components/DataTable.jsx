function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'No data found',
}) {
  if (loading) {
    return (
      <div className="py-14 text-center text-gray-500">
        Loading data...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="py-14 text-center text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">

      <table className="w-full">

        <thead>
          <tr className="border-b">

            {columns.map((column) => (
              <th
                key={column.key}
                className="text-left py-4 px-2 font-semibold text-gray-700 whitespace-nowrap"
              >
                {column.label}
              </th>
            ))}

          </tr>
        </thead>

        <tbody>

          {data.map((item, index) => (
            <tr
              key={index}
              className="border-b hover:bg-gray-50 transition-all duration-200"
            >

              {columns.map((column) => (
                <td
                  key={column.key}
                  className="py-4 px-2 text-gray-700 whitespace-nowrap"
                >
                  {column.render
                    ? column.render(item)
                    : item[column.key]}
                </td>
              ))}

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default DataTable;