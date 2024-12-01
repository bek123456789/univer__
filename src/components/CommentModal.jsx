import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const CommentModal = ({ isOpen, onClose, onCommentSubmit, allComments, productId, userEmail }) => {
    const [newComment, setNewComment] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!isOpen) return null;

    // Faqat tegishli post uchun izohlarni filtrlash
    const filteredComments = allComments
        .filter((comment) => comment.post_id === productId)
        .sort((a, b) => new Date(b.time) - new Date(a.time)); // Yangi izohlar tepadan ko'rinishini ta'minlash

    const handleCommentSubmit = async () => {
        if (newComment.trim()) {
            try {
                const response = await axios.post('https://unversty-2.onrender.com/comments', {
                    text: newComment,
                    user_id: userEmail,
                    post_id: productId,
                    time: new Date().toISOString(), // Tashkent vaqti
                });
                onCommentSubmit(response.data); // Yangi izohni yuqoriga qo'shish
                setNewComment(''); // Matn maydonini tozalash
                setErrorMessage(''); // Xatolik xabarini tozalash
            } catch (error) {
                console.error('Izoh yuborishda xatolik yuz berdi:', error);
                setErrorMessage('Izoh yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.');
            }
        } else {
            setErrorMessage('Izoh matnini kiritishingiz kerak.');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCommentSubmit();
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative max-h-[90vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-3xl"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Izohlar</h2>
                <div className="flex-1 overflow-y-auto mb-4">
                    {filteredComments.length === 0 ? (
                        <p className="text-gray-500 text-center">Hozircha hech qanday izoh yo'q.</p>
                    ) : (
                        filteredComments.map((comment) => (
                            <div key={comment._id} className="mb-4 p-4 border-b border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                                    <p className="font-semibold text-sm text-gray-800">{comment.user_id}</p>
                                </div>
                                <p className="mt-2 text-sm text-gray-700">{comment.text}</p>
                                <p className="text-gray-500 text-xs mt-1">{comment.time}</p>
                            </div>
                        ))
                    )}
                </div>
                
                {errorMessage && (
                    <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
                )}

                <div className="mt-4">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Izoh qo'shing..."
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none"
                        rows="4"
                        disabled={loggedInUser.email == "guest@example.com"}

                    />
                    <button
                        onClick={handleCommentSubmit}
                        className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Izohni yuborish
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CommentModal;
