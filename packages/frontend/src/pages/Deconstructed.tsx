import React from 'react'

const Deconstructed: React.FC = () => {
    // The imported deconstructed site will be copied into /public/deconstructed_site
    // Adjust path if your deconstructed site has a different root index.
    const url = '/deconstructed_site/index/index.html'

    return (
        <div style={{ height: '100vh' }}>
            <iframe
                title="Deconstructed Preview"
                src={url}
                style={{ width: '100%', height: '100%', border: 'none' }}
            />
        </div>
    )
}

export default Deconstructed
