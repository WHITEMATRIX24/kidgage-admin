import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import './AddBannerForm.css';

function AddBannerForm() {
    const initialBannerState = {
        title: '',
        image: null, // File object for the image
        bookingLink: ''
    };

    const [banner, setBanner] = useState(initialBannerState);
    const [showForm, setShowForm] = useState(true);
    const [fileName, setFileName] = useState('No file chosen');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setBanner((prev) => ({ ...prev, image: file })); // Set file object
            setFileName(file.name);
        } else {
            setFileName('No file chosen');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBanner((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', banner.title);
        formData.append('image', banner.image); // Append the file object
        formData.append('bookingLink', banner.bookingLink);

        try {
            const response = await axios.post('https://kidgage-adminbackend.onrender.com/api/banners/addbanner', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Set the content type to multipart/form-data
                }
            });
            console.log('Banner added successfully', response.data);
            setBanner(initialBannerState);
            setFileName('No file chosen');
            setSuccess('Banner added successfully!');
            setError('');
        } catch (error) {
            console.error('Error adding banner', error);
            setError(error.response ? error.response.data.message : 'An error occurred. Please try again later.');
            setSuccess('');
        }
    };

    const toggleFormVisibility = () => {
        setShowForm(!showForm);
    };

    return (
        <div className="add-course-form-container">
            <div className="add-course-form-header" onClick={toggleFormVisibility}>
                <h2>Add Banner</h2>
                <FaChevronDown className={`dropdown-icon ${showForm ? 'open' : ''}`} />
            </div>
            {showForm && (
                <form className="add-course-form" onSubmit={handleSubmit}>
                    <div className='side-by-side'>
                        <div className="form-group">
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Enter Banner Title"
                            value={banner.title}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group file-upload-container">
                        <label htmlFor="file-upload">Banner Image<br></br><span style={{ fontSize: '.8rem', color: 'grey' }}>[ size: 1045 X 275 ]</span></label>
                        <input
                            type="file"
                            id="file-upload"
                            name="file"
                            onChange={handleFileChange}
                        />
                        
                    </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="bookingLink">Booking Link</label>
                        <input
                            type="text"
                            id="bookingLink"
                            name="bookingLink"
                            placeholder="Enter Booking Link"
                            value={banner.bookingLink}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" className="add-time-slot-btn">Add Banner</button>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                </form>
            )}
        </div>
    );
}

export default AddBannerForm;
