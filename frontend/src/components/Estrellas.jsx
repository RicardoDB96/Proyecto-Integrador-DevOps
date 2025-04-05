import React from "react";
import PropTypes from "prop-types";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating = 0, size = 16 }) => {
  const starStyle = { fontSize: `${size}px` }; // Estilo dinámico

  return (
    <div>
      {Array(Math.floor(rating)).fill().map((_, i) => (
        <FaStar key={`full-${i}`} className="text-warning" style={starStyle} />
      ))}
      {rating % 1 >= 0.5 && <FaStarHalfAlt className="text-warning" style={starStyle} />}
      {Array(5 - Math.ceil(rating)).fill().map((_, i) => (
        <FaRegStar key={`empty-${i}`} className="text-warning" style={starStyle} />
      ))}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number,
  size: PropTypes.number // Nueva prop para el tamaño
};

export default StarRating;