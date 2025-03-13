const Select = ({ value, onChange, options, className = "" }) => {
    return (
      <select
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded focus:ring focus:ring-blue-200 focus:outline-none ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };
  
  export default Select;
  