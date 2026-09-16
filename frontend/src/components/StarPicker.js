import React from 'react'

function StarPicker({value, onChange}) {
    return (
        <div>
            {[1, 2, 3, 4, 5].map((star) => (
                <i
                    key={star}
                    className={star <= value ? 'fas fa-star' : 'far fa-star'}
                    style={{color: '#f8e825', fontSize: '1.5rem', cursor: 'pointer', marginRight: '4px'}}
                    onClick={() => onChange(star)}
                ></i>
            ))}
        </div>
    )
}

export default StarPicker
