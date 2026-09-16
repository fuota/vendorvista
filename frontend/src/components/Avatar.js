import React from 'react'
import { Image } from 'react-bootstrap'

function Avatar({src, size = 90}) {
    if (src) {
        return <Image src={src} roundedCircle style={{width: size, height: size, objectFit: 'cover'}} />
    }
    return (
        <div
            className='rounded-circle d-flex align-items-center justify-content-center bg-light border'
            style={{width: size, height: size}}
        >
            <i className='fa-solid fa-user' style={{fontSize: size * 0.5, color: '#adb5bd'}}></i>
        </div>
    )
}

export default Avatar
