import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRatingInput = ({ rating = 0, setRating }) => {
  const [hoverPosition, setHoverPosition] = useState(0);
  const [displayRating, setDisplayRating] = useState(0);

  // Inicialización garantizada en 0
  useEffect(() => {
    setDisplayRating(rating);
  }, [rating]);

  const handleStarHover = (event, starIndex) => {
    const starElement = event.currentTarget;
    const rect = starElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const starWidth = rect.width;
    
    const isHalfStar = mouseX < starWidth / 2;
    const newRating = starIndex + (isHalfStar ? 0.5 : 1);
    
    setHoverPosition(newRating);
  };

  const handleStarClick = (event, starIndex) => {
    const starElement = event.currentTarget;
    const rect = starElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const starWidth = rect.width;
    
    const isHalfStar = mouseX < starWidth / 2;
    const newRating = starIndex + (isHalfStar ? 0.5 : 1);
    
    setRating(newRating);
    setDisplayRating(newRating);
  };

  const handleMouseLeave = () => {
    setHoverPosition(0);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      const currentRating = hoverPosition || displayRating;
      
      if (currentRating >= starValue) {
        return (
          <FaStar
            key={index}
            className="text-warning"
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
            onMouseMove={(e) => handleStarHover(e, index)}
            onClick={(e) => handleStarClick(e, index)}
          />
        );
      } else if (currentRating >= index + 0.5) {
        return (
          <FaStarHalfAlt
            key={index}
            className="text-warning"
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
            onMouseMove={(e) => handleStarHover(e, index)}
            onClick={(e) => handleStarClick(e, index)}
          />
        );
      } else {
        return (
          <FaRegStar
            key={index}
            className="text-warning"
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
            onMouseMove={(e) => handleStarHover(e, index)}
            onClick={(e) => handleStarClick(e, index)}
          />
        );
      }
    });
  };

  return (
    <div className="d-flex align-items-center">
      <div 
        className="me-2 d-flex" 
        onMouseLeave={handleMouseLeave}
      >
        {renderStars()}
      </div>
      <span className="text-muted">
        {displayRating.toFixed(1)} / 5.0
      </span>
    </div>
  );
};

export default StarRatingInput;