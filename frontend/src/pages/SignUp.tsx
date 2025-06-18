import { useState } from 'react';
import '@/assets/css/SignIn.css';
import { motion } from 'framer-motion';
import Logo from '@/assets/logo.webp';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Lock1, Sms, UserEdit, Calendar } from 'iconsax-react';
import { base_url } from '@/config'
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useRef } from 'react';

function SignUp() {

    const navigate =  useNavigate();
    const dateInputRef = useRef(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.dismiss();
            toast.error("Passwords do not match");
            return;
        }


        try {
            const response = await fetch(`${base_url}/user/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();

                if (errorData?.password) {
                    toast.dismiss();
                    toast.error(errorData.password[0]);
                    return;
                }
            
                if (errorData?.username) {
                    const originalMessage = errorData.username[0];
            
                    // Check if it's the "already exists" error and customize it
                    if (originalMessage.toLowerCase().includes("already exists")) {
                        toast.dismiss();
                        toast.error("Username is already taken.", );
                    }
                    
                } else {
                    throw new Error("Sign Up Failed");
                }

                // Catch-all error
                toast.dismiss();
                toast.error("Sign Up Failed");
                return;
            }

            navigate('/');
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error("Error:", err.message);
            } else {
                console.error("An unknown error occurred");
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Framer Motion animation configuration
    const containerVariants = {
        hidden: { opacity: 0, x: -100 },
        visible: { opacity: 1, x: 0, transition: { duration: 1.5 } },
    };

    return (
        <div className="flex items-center justify-center w-full min-h-screen SignIn">
            {/* Animated container */}
            <motion.div
                className="md:min-w-[540px] min-h-[540px] bg-[#CCE5FE] rounded-xl shadow-md p-8 flex flex-col items-center gap-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <img src={Logo} alt="Logo" className="max-h-[62px] max-w-[61px]" />
                <div>
                    <h1 className="flex mb-5 text-2xl font-bold justify-center">Register</h1>
                    <form onSubmit={handleSubmit} className="min-w-[300px] flex flex-col gap-4">
                        <div className="relative w-full">
                            <UserEdit
                                size="18"
                                color="#FCA5CD"
                                className="absolute transform -translate-y-1/2 left-3 top-1/2"
                            />
                            <Input
                                className="pl-9 h-[51px] bg-white rounded-[5px] placeholder:text-md placeholder:text-[#4E4E53] border-[#000000]"
                                id="firstName"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="relative w-full">
                            <UserEdit
                                size="18"
                                color="#61C8E4"
                                className="absolute transform -translate-y-1/2 left-3 top-1/2"
                            />
                            <Input
                                className="pl-9 h-[51px] bg-white rounded-[5px] placeholder:text-md placeholder:text-[#4E4E53] border-[#000000]"
                                id="lastName"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <Toaster reverseOrder={false} />

                        <div className="relative w-full">
                            <Calendar
                                size="18"
                                color="#7582FA"
                                className="absolute transform -translate-y-1/2 left-3 top-1/2 cursor-pointer"
                            />
                            <input
                                ref={dateInputRef}
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                placeholder="Date of Birth"
                                className="pl-9 pr-3 h-[51px] w-full bg-white rounded-[5px] placeholder:text-md placeholder:text-[#4E4E53] border border-[#000000]"
                                required
                            />
                        </div>

                        <div className="relative w-full">
                            <User
                                size="18"
                                color="#7582FA"
                                className="absolute transform -translate-y-1/2 left-3 top-1/2"
                            />
                            <Input
                                className="pl-9 h-[51px] bg-white rounded-[5px] placeholder:text-md placeholder:text-[#4E4E53] border-[#000000]"
                                id="username"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="relative w-full">
                            <Sms
                                size="18"
                                color="#7582FA"
                                className="absolute transform -translate-y-1/2 left-3 top-1/2"
                            />
                            <Input
                                className="pl-9 h-[51px] bg-white rounded-[5px] placeholder:text-md placeholder:text-[#4E4E53] border-[#000000]"
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="relative w-full">
                            <Lock1
                                size="18"
                                color="#FABA6C"
                                className="absolute transform -translate-y-1/2 left-3 top-1/2"
                            />
                            <Input
                                type="password"
                                className="pl-9 h-[51px] bg-white rounded-[5px] placeholder:text-md placeholder:text-[#4E4E53] border-[#000000]"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                            />
                        </div>

                        <div className="relative w-full">
                            <Lock1
                                size="18"
                                color="#FABA6C"
                                className="absolute transform -translate-y-1/2 left-3 top-1/2"
                            />
                            <Input
                                type="password"
                                className="pl-9 h-[51px] bg-white rounded-[5px] placeholder:text-md placeholder:text-[#4E4E53] border-[#000000]"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full bg-[#7BDFF2] min-h-[51px] rounded-[5px] mt-5">
                            <p className="text-md font-bold text-[#4E4E53]">Sign Up</p>
                        </Button>
                        <div className="flex justify-center gap-2 mt-3">
                            <p>Already have an account?</p>
                            <a href="/" className="text-[#1600DD]">
                                Sign In
                            </a>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default SignUp;