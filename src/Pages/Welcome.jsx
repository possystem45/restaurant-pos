import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiAdminFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import PopupComponent from '../components/PopupComponent';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { InputField } from '../components/InputField';
import logo from '../assets/logo.jpg'

const userTypes = [
        {
            id: 1,
            name: 'Cashier',
            icon: FaUser,
            description: 'Access point-of-sale features and customer transactions',
        },
        {
            id: 2,
            name: 'Admin',
            icon: RiAdminFill,
            description: 'Full system access with management capabilities',
        }
    ];

export default function Welcome() {
    const navigate = useNavigate();
    const [selectedCard, setSelectedCard] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCardClick = (userType) => {
        setSelectedCard(userType);
        setIsPopupOpen(true);
        setPassword('');
        setPasswordError('');
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedCard(null);
        setPassword('');
        setPasswordError('');
        setIsLoading(false);
    };

    const handlePasswordSubmit = async (password) => {
        if (!password.trim()) {
            setPasswordError('Password is required');
            return;
        }

        setIsLoading(true);
        setPasswordError('');

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check password based on selected user type
            const correctPassword = selectedCard.name.toLowerCase(); // 'admin' or 'cashier'
            
            if (password === correctPassword) {
                // Success - close popup and proceed
                handleClosePopup();
                
                // Redirect to appropriate dashboard based on user type
                if (selectedCard.name === 'Admin') {
                    navigate('/admin/dashboard');
                } else if (selectedCard.name === 'Cashier') {
                    navigate('/user/dashboard');
                }
                
            } else {
                setPasswordError(`Invalid password for ${selectedCard.name}`);
            }
        } catch (error) {
            setPasswordError('Authentication failed. Please try again.');
            console.error('Authentication error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const UserCard = ({ userType }) => {
        const IconComponent = userType.icon;
        
        return (
            <div 
                className={`group cursor-pointer p-6 flex flex-col items-center justify-center 
                    w-full max-w-sm h-48 sm:h-56 border-2 rounded-xl transition-all duration-300 
                    transform hover:scale-105 
                    hover:shadow-lg active:scale-95 bg-thirdPartyColor`}
                onClick={() => handleCardClick(userType)}
            >
                <div className={`mb-4 ${userType.color} transition-transform duration-300 group-hover:scale-110`}>
                    <IconComponent size={48} className="sm:w-16 sm:h-16" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center">
                    {userType.name}
                </h3>
                <p className="text-[16px] text-gray-600 text-center mt-2 ">
                    Click to continue
                </p>
            </div>
        );
    };

    return (
        <div className="font-poppins min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-center pt-4 sm:pt-8 pb-4 sm:pb-6 px-4">
                <div className='flex gap-4 sm:gap-6 items-center'>
                    <div className='h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40'>
                        <img src={logo} alt="logo" className='h-full w-full' />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex items-center justify-center min-h-[60vh] px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 w-full max-w-5xl">
                    {userTypes.map((userType) => (
                        <UserCard key={userType.id} userType={userType} />
                    ))}
                </div>
            </div>

            {/* Popup Component */}
            <PopupComponent 
                isOpen={isPopupOpen} 
                onClose={handleClosePopup}
                title={`${selectedCard?.name || ''} Login`}
            >
                {selectedCard && (
                    <div className="text-center">
                        <div className={`mb-4 sm:mb-6 text-primaryColor flex justify-center`}>
                            <selectedCard.icon size={48} className="sm:hidden" />
                            <selectedCard.icon size={64} className="hidden sm:block" />
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed px-2">
                            {selectedCard.description}
                        </p>
                        
                        {/* Password Input */}
                        <div className="mb-4 sm:mb-6">
                            <InputField
                                type="password"
                                placeholder="Enter your password"
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={passwordError}
                                required
                                disabled={isLoading}
                                className="text-sm sm:text-base"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handlePasswordSubmit(password);
                                    }
                                }}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <PrimaryButton 
                                onClick={() => handlePasswordSubmit(password)}
                                disabled={isLoading || !password.trim()}
                                className="flex-1 text-sm sm:text-base py-2.5 sm:py-3"
                            >
                                {isLoading ? 'Authenticating...' : 'Enter Password'}
                            </PrimaryButton>
                            <SecondaryButton 
                                onClick={handleClosePopup}
                                disabled={isLoading}
                                className="flex-1 text-sm sm:text-base py-2.5 sm:py-3"
                            >
                                Cancel
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </PopupComponent>
        </div>
    );
}
