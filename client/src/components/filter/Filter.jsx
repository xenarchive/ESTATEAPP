import "./filter.scss";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    type: searchParams.get("type") || "",
    property: searchParams.get("property") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedroom: searchParams.get("bedroom") || "",
  });

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      city: searchParams.get("city") || "",
      type: searchParams.get("type") || "",
      property: searchParams.get("property") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bedroom: searchParams.get("bedroom") || "",
    });
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build query string with non-empty values
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        params.append(key, value);
      }
    });

    // Navigate to list page with filters
    navigate(`/list?${params.toString()}`);
  };

  // Get current search location for display
  const currentLocation = searchParams.get("city") || "All Locations";

  return (
    <div className="filter">
      <h1>
        Search results for <b>{currentLocation}</b>
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="top">
          <div className="item">
            <label htmlFor="city">Location</label>
            <input
              type="text"
              id="city"
              name="city"
              placeholder="City Location"
              value={filters.city}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="bottom">
          <div className="item">
            <label htmlFor="type">Type</label>
            <select name="type" id="type" value={filters.type} onChange={handleChange}>
              <option value="">any</option>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>
          </div>
          <div className="item">
            <label htmlFor="property">Property</label>
            <select name="property" id="property" value={filters.property} onChange={handleChange}>
              <option value="">any</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="land">Land</option>
            </select>
          </div>
          <div className="item">
            <label htmlFor="minPrice">Min Price</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              placeholder="any"
              value={filters.minPrice}
              onChange={handleChange}
            />
          </div>
          <div className="item">
            <label htmlFor="maxPrice">Max Price</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              placeholder="any"
              value={filters.maxPrice}
              onChange={handleChange}
            />
          </div>
          <div className="item">
            <label htmlFor="bedroom">Bedroom</label>
            <input
              type="number"
              id="bedroom"
              name="bedroom"
              placeholder="any"
              value={filters.bedroom}
              onChange={handleChange}
            />
          </div>
          <button type="submit">
            <img src="/search.png" alt="" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Filter;
